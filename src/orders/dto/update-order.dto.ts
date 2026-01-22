import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemDto } from './create-order.dto';

export class UpdateOrderDto {
  // Customer Information
  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone number' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Customer email address' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer address object', type: Object })
  @IsOptional()
  customerAddress?: Record<string, any>;

  // Order Items
  @ApiPropertyOptional({
    description:
      'List of items in the order (will replace existing items if provided)',
    type: [OrderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  // Delivery Information
  @ApiPropertyOptional({ description: 'Delivery latitude', example: 40.7128 })
  @IsOptional()
  @IsNumber()
  deliveryLat?: number;

  @ApiPropertyOptional({ description: 'Delivery longitude', example: -74.006 })
  @IsOptional()
  @IsNumber()
  deliveryLng?: number;

  @ApiPropertyOptional({
    description: 'Delivery place description',
    example: 'Warehouse 5',
  })
  @IsOptional()
  @IsString()
  deliveryPlace?: string;

  @ApiPropertyOptional({ description: 'Tracking number for the order' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  // Additional Information
  @ApiPropertyOptional({ description: 'Additional notes for the order' })
  @IsOptional()
  @IsString()
  notes?: string;

  // Order Status
  @ApiPropertyOptional({
    description: 'Order status',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({
    description: 'Language for PDF invoice generation (en, ar, es, fr)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
