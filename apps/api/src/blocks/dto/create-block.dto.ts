import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';
import { BlockReason } from '@prisma/client';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be formatted as YYYY-MM-DD' })
  startDate!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be formatted as YYYY-MM-DD' })
  endDate!: string;

  @IsEnum(BlockReason)
  reason: BlockReason = BlockReason.MAINTENANCE;
}
