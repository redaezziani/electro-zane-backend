import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @ApiProperty({ description: 'SKU ID of the product' })
  @IsString()
  skuId: string;

  @ApiProperty({ description: 'Quantity of this SKU', example: 1 })
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  // Customer Information
  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890' })
  @IsString()
  customerPhone: string;

  @ApiPropertyOptional({ description: 'Customer email address' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: 'Customer address object',
    type: Object,
    example: { street: '123 Main St', city: 'New York', zip: '10001' }
  })
  @IsOptional()
  customerAddress?: Record<string, any>;

  // Order Items
  @ApiProperty({
    description: 'List of items in the order',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // Delivery Information (optional for delivery orders)
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

  @ApiProperty({
    description: 'Payment method: CASH',
    default: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod, { message: 'method must be CASH' })
  method: PaymentMethod = PaymentMethod.CASH;

  @ApiPropertyOptional({
    description: 'Language for PDF invoice generation (en, ar, es, fr)',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
