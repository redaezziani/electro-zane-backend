import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LotStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateLotDto {
  @ApiProperty({ example: 1500.50, description: 'Total price of the lot' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalPrice: number;

  @ApiProperty({ example: 100, description: 'Total quantity of items in the lot' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  totalQuantity: number;

  @ApiProperty({ example: 'DHL Express', description: 'Shipping company name' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'New York', description: 'Shipping company city' })
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
  @ApiPropertyOptional({ example: 1500.50, description: 'Total price of the lot' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional({ example: 100, description: 'Total quantity of items in the lot' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  totalQuantity?: number;

  @ApiPropertyOptional({ example: 'DHL Express', description: 'Shipping company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Shipping company city' })
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
