import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShipmentPieceDto {
  @ApiProperty({
    example: 'uuid-of-shipment',
    description: 'ID of the shipment',
  })
  @IsNotEmpty()
  @IsUUID()
  shipmentId: string;

  @ApiProperty({
    example: 'uuid-of-lot-piece',
    description: 'ID of the lot piece to add to shipment',
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

export class UpdateShipmentPieceDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Quantity of this piece being shipped',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantityShipped?: number;

  @ApiPropertyOptional({
    example: 'Updated notes',
    description: 'Notes for this specific piece',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
