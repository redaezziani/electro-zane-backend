import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrivalStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class PieceDetailDto {
  @ApiPropertyOptional({
    example: 'iPhone 14 Pro',
    description: 'Name of the piece/item',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Expected quantity of this specific piece',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityExpected?: number;

  @ApiPropertyOptional({
    example: 9,
    description: 'Actual quantity received',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityReceived?: number;

  @ApiPropertyOptional({
    example: 'damaged',
    description: 'Status of the piece (new, damaged, missing, etc.)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: '1 unit damaged',
    description: 'Notes about this piece',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLotArrivalDto {
  @ApiProperty({
    example: 'uuid-of-shipment',
    description: 'ID of the shipment that arrived',
  })
  @IsNotEmpty()
  @IsUUID()
  shipmentId: string;

  @ApiProperty({
    example: 20,
    description: 'Total quantity received',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: 5000.0,
    description: 'Total value of arrival',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalValue: number;

  @ApiProperty({
    example: 'DHL Express',
    description: 'Shipping company name',
  })
  @IsNotEmpty()
  @IsString()
  shippingCompany: string;

  @ApiProperty({
    example: 'Los Angeles',
    description: 'Shipping company city',
  })
  @IsNotEmpty()
  @IsString()
  shippingCompanyCity: string;

  @ApiProperty({
    type: [PieceDetailDto],
    description: 'Detailed breakdown of pieces',
    example: [
      {
        name: 'S22 Ultra 256GB',
        quantityExpected: 10,
        quantityReceived: 9,
        status: 'damaged',
        notes: '1 unit damaged',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDetailDto)
  pieceDetails: PieceDetailDto[];

  @ApiPropertyOptional({
    enum: ArrivalStatus,
    example: ArrivalStatus.PENDING,
    description: 'Arrival verification status',
  })
  @IsOptional()
  @IsEnum(ArrivalStatus)
  status?: ArrivalStatus;

  @ApiPropertyOptional({
    example: 'Shipment arrived in good condition',
    description: 'Notes about the arrival',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-admin-user',
    description: 'ID of admin who verified',
  })
  @IsOptional()
  @IsString()
  verifiedBy?: string;
}

export class UpdateLotArrivalDto {
  @ApiPropertyOptional({
    example: 18,
    description: 'Actual total quantity received',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    example: 4500.0,
    description: 'Total value of arrival',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalValue?: number;

  @ApiPropertyOptional({
    example: 'FedEx',
    description: 'Shipping company name',
  })
  @IsOptional()
  @IsString()
  shippingCompany?: string;

  @ApiPropertyOptional({
    example: 'Los Angeles',
    description: 'Shipping company city',
  })
  @IsOptional()
  @IsString()
  shippingCompanyCity?: string;

  @ApiPropertyOptional({
    type: [PieceDetailDto],
    description: 'Updated piece details with actual status',
    example: [
      {
        name: 'S22 Ultra 256GB',
        quantityExpected: 10,
        quantityReceived: 9,
        status: 'damaged',
        notes: '1 unit damaged',
      },
      {
        name: 'iPhone 14 Pro',
        quantityExpected: 10,
        quantityReceived: 10,
        status: 'verified',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDetailDto)
  pieceDetails?: PieceDetailDto[];

  @ApiPropertyOptional({
    enum: ArrivalStatus,
    example: ArrivalStatus.VERIFIED,
    description: 'Arrival verification status',
  })
  @IsOptional()
  @IsEnum(ArrivalStatus)
  status?: ArrivalStatus;

  @ApiPropertyOptional({
    example: '2 items damaged during shipping',
    description: 'Notes about discrepancies or issues',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-admin-user',
    description: 'ID of admin who verified',
  })
  @IsOptional()
  @IsString()
  verifiedBy?: string;
}
