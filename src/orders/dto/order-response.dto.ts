import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'SKU ID of the product' })
  skuId: string;

  @ApiProperty({ description: 'Product name snapshot' })
  productName: string;

  @ApiProperty({ description: 'SKU code snapshot' })
  skuCode: string;

  @ApiProperty({ description: 'Quantity ordered', example: 1 })
  quantity: number;

  @ApiProperty({ description: 'Price per unit', example: 10.99 })
  unitPrice: number;

  @ApiProperty({ description: 'Total price for this item', example: 21.98 })
  totalPrice: number;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Unique order number' })
  orderNumber: string;

  @ApiPropertyOptional({ description: 'Admin user ID who created the order' })
  createdById?: string;

  @ApiPropertyOptional({ description: 'Admin user ID who confirmed the order' })
  confirmedById?: string;

  @ApiPropertyOptional({ description: 'Admin user who confirmed the order' })
  confirmedBy?: { id: string; name: string; email: string };

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Subtotal amount', example: 50.0 })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount', example: 5.0 })
  taxAmount: number;

  @ApiProperty({ description: 'Shipping amount', example: 10.0 })
  shippingAmount: number;

  @ApiProperty({ description: 'Discount amount', example: 0.0 })
  discountAmount: number;

  @ApiProperty({ description: 'Total amount to pay', example: 65.0 })
  totalAmount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ description: 'Invoice URL if available' })
  invoiceUrl?: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiProperty({ description: 'Customer phone number' })
  customerPhone: string;

  @ApiPropertyOptional({ description: 'Customer email address' })
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer address object', type: Object })
  customerAddress?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Delivery latitude coordinate',
    example: 40.7128,
  })
  deliveryLat?: number;

  @ApiPropertyOptional({
    description: 'Delivery longitude coordinate',
    example: -74.006,
  })
  deliveryLng?: number;

  @ApiPropertyOptional({ description: 'Delivery place description' })
  deliveryPlace?: string;

  @ApiPropertyOptional({ description: 'Tracking number for the shipment' })
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Shipped at timestamp' })
  shippedAt?: Date;

  @ApiPropertyOptional({ description: 'Delivered at timestamp' })
  deliveredAt?: Date;

  @ApiPropertyOptional({ description: 'Confirmed at timestamp' })
  confirmedAt?: Date;

  @ApiPropertyOptional({ description: 'Additional notes for the order' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Language for PDF invoice (en, ar, es, fr)',
    example: 'en',
  })
  language?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'List of items in the order',
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];
}
