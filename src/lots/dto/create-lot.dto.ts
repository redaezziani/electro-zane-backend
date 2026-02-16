import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LotStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateLotDto {
  @ApiProperty({ example: 'Supplier Inc', description: 'Supplier company name' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'New York', description: 'Supplier company city' })
  @IsNotEmpty()
  @IsString()
  companyCity: string;

  @ApiPropertyOptional({ example: 'Urgent delivery', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: LotStatus, example: LotStatus.PENDING, description: 'Lot status' })
  @IsOptional()
  @IsEnum(LotStatus)
  status?: LotStatus;
}

export class UpdateLotDto {
  @ApiPropertyOptional({ example: 'Supplier Inc', description: 'Supplier company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Supplier company city' })
  @IsOptional()
  @IsString()
  companyCity?: string;

  @ApiPropertyOptional({ example: 'Updated notes', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: LotStatus, example: LotStatus.IN_TRANSIT, description: 'Lot status' })
  @IsOptional()
  @IsEnum(LotStatus)
  status?: LotStatus;
}
