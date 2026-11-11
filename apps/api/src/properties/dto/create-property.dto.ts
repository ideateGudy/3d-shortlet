import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  tagLine!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNumber()
  @Min(1)
  bedrooms!: number;

  @IsNumber()
  @Min(1)
  bathrooms!: number;

  @IsNumber()
  @Min(1)
  maxGuests!: number;

  @IsNumber()
  @Min(0)
  pricePerNight!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cleaningFee?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  minNights?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxNights?: number;

  @IsString()
  @IsOptional()
  rules?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdatePropertyDto extends CreatePropertyDto {}
