import { IsString, IsNotEmpty, IsEmail, IsNumber, Min, IsOptional, Matches } from 'class-validator';

export class CreateHoldDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn must be formatted as YYYY-MM-DD' })
  checkIn!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut must be formatted as YYYY-MM-DD' })
  checkOut!: string;

  @IsNumber()
  @Min(1)
  adults!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  children: number = 0;

  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @IsString()
  @IsNotEmpty()
  guestPhone!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ConfirmBookingDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;
}
