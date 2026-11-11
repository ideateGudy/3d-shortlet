import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray } from 'class-validator';
import { SectionType } from '@prisma/client';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;

  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  initialYaw?: number;

  @IsNumber()
  @IsOptional()
  initialPitch?: number;

  @IsArray()
  @IsOptional()
  hotspots?: any[];
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  initialYaw?: number;

  @IsNumber()
  @IsOptional()
  initialPitch?: number;

  @IsArray()
  @IsOptional()
  hotspots?: any[];
}
