import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHoldDto } from './dto/create-hold.dto';
import { BookingStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(propertyId: string, month: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Parse month YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10); // 1-indexed

    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 0)); // last day of month

    // Active bookings intersecting this month
    const now = new Date();
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        OR: [
          { status: BookingStatus.CONFIRMED },
          {
            status: BookingStatus.PENDING,
            holdExpiresAt: { gt: now },
          },
        ],
        checkIn: { lte: endDate },
        checkOut: { gt: startDate },
      },
    });

    // Blocked dates intersecting this month
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        propertyId,
        startDate: { lte: endDate },
        endDate: { gt: startDate },
      },
    });

    const days: { date: string; status: 'available' | 'booked' | 'held' | 'blocked' | 'past'; price: number }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    const daysInMonth = endDate.getUTCDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(Date.UTC(year, monthNum - 1, d));
      const dateStr = dayDate.toISOString().split('T')[0];

      let status: 'available' | 'booked' | 'held' | 'blocked' | 'past' = 'available';

      if (dateStr < todayStr) {
        status = 'past';
      } else {
        // Check blocks first
        const isBlocked = blockedDates.some((b) => {
          const bStart = b.startDate.toISOString().split('T')[0];
          const bEnd = b.endDate.toISOString().split('T')[0];
          return dateStr >= bStart && dateStr < bEnd;
        });

        if (isBlocked) {
          status = 'blocked';
        } else {
          // Check bookings (remember [checkIn, checkOut) half-open)
          for (const b of bookings) {
            const bStart = b.checkIn.toISOString().split('T')[0];
            const bEnd = b.checkOut.toISOString().split('T')[0];
            if (dateStr >= bStart && dateStr < bEnd) {
              status = b.status === BookingStatus.CONFIRMED ? 'booked' : 'held';
              break;
            }
          }
        }
      }

      days.push({
        date: dateStr,
        status,
        price: property.pricePerNight,
      });
    }

    return {
      propertyId,
      month,
      days,
    };
  }

  async createHold(dto: CreateHoldDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Validate dates
    const checkInDate = new Date(dto.checkIn);
    const checkOutDate = new Date(dto.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (checkInDate < today) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.round(diffTime / (1000 * 3600 * 24));

    if (nights < property.minNights) {
      throw new BadRequestException(`Minimum stay is ${property.minNights} nights`);
    }

    if (nights > property.maxNights) {
      throw new BadRequestException(`Maximum stay is ${property.maxNights} nights`);
    }

    const totalGuests = Number(dto.adults) + (Number(dto.children) || 0);
    if (totalGuests > property.maxGuests) {
      throw new BadRequestException(`Maximum capacity is ${property.maxGuests} guests`);
    }

    const totalPrice = nights * property.pricePerNight + property.cleaningFee;
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes hold

    // Execute in transaction to verify blocked dates & let exclusion constraint guard bookings
    return this.prisma.$transaction(async (tx) => {
      // 1. Check blocked dates conflict
      const blockConflict = await tx.blockedDate.findFirst({
        where: {
          propertyId: property.id,
          startDate: { lt: checkOutDate },
          endDate: { gt: checkInDate },
        },
      });

      if (blockConflict) {
        throw new ConflictException('Selected dates overlap with maintenance or owner stay');
      }

      // 2. Insert booking (protected by Postgres exclusion constraint or explicit overlap check)
      try {
        const booking = await tx.booking.create({
          data: {
            propertyId: property.id,
            guestName: dto.guestName,
            guestEmail: dto.guestEmail,
            guestPhone: dto.guestPhone,
            adults: dto.adults,
            children: dto.children || 0,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            status: BookingStatus.PENDING,
            totalPrice,
            cleaningFee: property.cleaningFee,
            nights,
            holdExpiresAt,
            notes: dto.notes,
          },
        });
        return booking;
      } catch (err: any) {
        // Postgres error code 23P01 is exclusion_violation
        if (err.code === '23P01' || err.message?.includes('no_overlapping_bookings')) {
          throw new ConflictException('The selected dates are no longer available. Please choose another date range.');
        }
        throw err;
      }
    });
  }

  async confirmBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return booking;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('This booking has been cancelled');
    }

    const now = new Date();
    if (booking.holdExpiresAt && booking.holdExpiresAt < now) {
      // Hold expired
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
      throw new ConflictException('Reservation hold has expired. Please select dates again.');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        holdExpiresAt: null,
      },
    });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }

  // Hold expiry worker running every 1 minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleHoldExpirations() {
    const now = new Date();
    const expired = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        holdExpiresAt: { lte: now },
      },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    if (expired.count > 0) {
      console.log(`[Cron] Expired ${expired.count} pending reservation holds.`);
    }
  }
}
