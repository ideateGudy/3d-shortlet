import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async getBlocksForProperty(propertyId: string) {
    return this.prisma.blockedDate.findMany({
      where: { propertyId },
      orderBy: { startDate: 'asc' },
    });
  }

  async createBlock(dto: CreateBlockDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new ConflictException('End date must be after start date');
    }

    // Check if there are active bookings overlapping this block
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        propertyId: dto.propertyId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        checkIn: { lt: endDate },
        checkOut: { gt: startDate },
      },
    });

    if (activeBooking) {
      throw new ConflictException(
        `Cannot block dates: an active reservation (${activeBooking.status}) exists in this interval`
      );
    }

    return this.prisma.blockedDate.create({
      data: {
        propertyId: dto.propertyId,
        startDate,
        endDate,
        reason: dto.reason,
      },
    });
  }

  async deleteBlock(id: string) {
    const block = await this.prisma.blockedDate.findUnique({ where: { id } });
    if (!block) {
      throw new NotFoundException('Block not found');
    }
    await this.prisma.blockedDate.delete({ where: { id } });
    return { success: true };
  }
}
