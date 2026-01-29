import { IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrivalStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class PieceDetailDto {
  @ApiPropertyOptional({ example: 'iPhone 14 Pro', description: 'Name of the piece/item' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 5, description: 'Quantity of this specific piece' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 'damaged', description: 'Status of the piece (new, damaged, missing, etc.)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '#3b82f6', description: 'Color code for this piece' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateLotArrivalDto {
  @ApiPropertyOptional({ example: 10, description: 'Actual quantity received' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 299.99, description: 'Price' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'FedEx', description: 'Shipping company name' })
  @IsOptional()
  @IsString()
  shippingCompany?: string;

  @ApiPropertyOptional({ example: 'Los Angeles', description: 'Shipping company city' })
  @IsOptional()
  @IsString()
  shippingCompanyCity?: string;

  @ApiPropertyOptional({
    type: [PieceDetailDto],
    description: 'Updated piece details with actual status',
    example: [
      { name: 'iPhone 14 Pro', quantity: 4, status: 'damaged' },
      { name: 'Samsung Galaxy S23', quantity: 3, status: 'verified' }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDetailDto)
  pieceDetails?: PieceDetailDto[];

  @ApiPropertyOptional({
    enum: ArrivalStatus,
    example: ArrivalStatus.VERIFIED,
    description: 'Arrival verification status'
  })
  @IsOptional()
  @IsEnum(ArrivalStatus)
  status?: ArrivalStatus;

  @ApiPropertyOptional({
    example: '2 items damaged during shipping',
    description: 'Notes about discrepancies or issues'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '#3b82f6', description: 'Color code for quantity field' })
  @IsOptional()
  @IsString()
  quantityColor?: string;

  @ApiPropertyOptional({ example: '#10b981', description: 'Color code for price field' })
  @IsOptional()
  @IsString()
  priceColor?: string;

  @ApiPropertyOptional({ example: '#f59e0b', description: 'Color code for shipping company field' })
  @IsOptional()
  @IsString()
  shippingCompanyColor?: string;

  @ApiPropertyOptional({ example: '#8b5cf6', description: 'Color code for shipping city field' })
  @IsOptional()
  @IsString()
  shippingCityColor?: string;
}
