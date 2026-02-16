import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class ShipmentPieceInput {
  @ApiProperty({
    example: 'uuid-of-lot-piece',
    description: 'ID of the lot piece to include in shipment',
  })
  @IsNotEmpty()
  @IsUUID()
  lotPieceId: string;

  @ApiProperty({
    example: 5,
    description: 'Quantity of this piece being shipped',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantityShipped: number;

  @ApiPropertyOptional({
    example: 'Handle with care',
    description: 'Notes for this specific piece',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateShipmentDto {
  @ApiProperty({
    example: 'DHL Express',
    description: 'Shipping company name',
  })
  @IsNotEmpty()
  @IsString()
  shippingCompany: string;

  @ApiProperty({
    example: 'New York',
    description: 'Shipping company city',
  })
  @IsNotEmpty()
  @IsString()
  shippingCompanyCity: string;

  @ApiPropertyOptional({
    example: 'TRACK123456',
    description: 'Tracking number',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: '2024-03-01T10:00:00Z',
    description: 'Estimated arrival date',
  })
  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;

  @ApiPropertyOptional({
    example: 'Urgent shipment',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: ShipmentStatus,
    example: ShipmentStatus.PENDING,
    description: 'Shipment status',
  })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @ApiProperty({
    type: [ShipmentPieceInput],
    description: 'Pieces to include in this shipment',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentPieceInput)
  pieces: ShipmentPieceInput[];
}

export class UpdateShipmentDto {
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
    example: 'TRACK789012',
    description: 'Tracking number',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: '2024-03-05T15:00:00Z',
    description: 'Estimated arrival date',
  })
  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;

  @ApiPropertyOptional({
    example: '2024-03-04T12:00:00Z',
    description: 'Actual arrival date',
  })
  @IsOptional()
  @IsDateString()
  actualArrival?: string;

  @ApiPropertyOptional({
    example: 'Updated notes',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: ShipmentStatus,
    example: ShipmentStatus.IN_TRANSIT,
    description: 'Shipment status',
  })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;
}
