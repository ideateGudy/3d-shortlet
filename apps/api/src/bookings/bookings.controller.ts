import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateHoldDto, ConfirmBookingDto } from './dto/create-hold.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingStatus, Role } from '@prisma/client';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('properties/:id/availability')
  async getAvailability(
    @Param('id') propertyId: string,
    @Query('month') month: string
  ) {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    return this.bookingsService.getAvailability(propertyId, targetMonth);
  }

  @Post('bookings/hold')
  async createHold(@Body() dto: CreateHoldDto) {
    return this.bookingsService.createHold(dto);
  }

  @Post('bookings/confirm')
  async confirmBooking(@Body() dto: ConfirmBookingDto) {
    return this.bookingsService.confirmBooking(dto.bookingId);
  }

  // Admin management
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('bookings')
  async getAllBookings() {
    return this.bookingsService.getAllBookings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('bookings/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus
  ) {
    return this.bookingsService.updateBookingStatus(id, status);
  }
}
