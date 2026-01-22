import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductSKUResponseDto } from '../../products/dto/response.dto';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order Item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'SKU ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  skuId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 99.99 })
  unitPrice: number;

  @ApiProperty({ description: 'Total price', example: 199.98 })
  totalPrice: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones',
  })
  productName: string;

  @ApiProperty({ description: 'SKU code', example: 'WBH-001-LG-BLK' })
  skuCode: string;

  @ApiPropertyOptional({
    description: 'SKU details',
    type: ProductSKUResponseDto,
  })
  sku?: ProductSKUResponseDto;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ description: 'Order number', example: 'ORD-20250916-0001' })
  orderNumber: string;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({ description: 'Order status', example: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'Payment status', example: 'PENDING' })
  paymentStatus: string;

  @ApiProperty({ description: 'Subtotal', example: 199.98 })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount', example: 10.0 })
  taxAmount: number;

  @ApiProperty({ description: 'Shipping amount', example: 5.0 })
  shippingAmount: number;

  @ApiProperty({ description: 'Discount amount', example: 0.0 })
  discountAmount: number;

  @ApiProperty({ description: 'Total amount', example: 214.98 })
  totalAmount: number;

  @ApiProperty({ description: 'Currency', example: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Shipping name', example: 'John Doe' })
  shippingName: string;

  @ApiProperty({ description: 'Shipping email', example: 'john@example.com' })
  shippingEmail: string;

  @ApiPropertyOptional({
    description: 'Shipping phone',
    example: '+1234567890',
  })
  shippingPhone?: string;

  @ApiProperty({ description: 'Shipping address', type: Object })
  shippingAddress: Record<string, any>;

  @ApiPropertyOptional({ description: 'Billing name', example: 'John Doe' })
  billingName?: string;

  @ApiPropertyOptional({
    description: 'Billing email',
    example: 'john@example.com',
  })
  billingEmail?: string;

  @ApiPropertyOptional({ description: 'Billing address', type: Object })
  billingAddress?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Leave at the front door.',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Tracking number',
    example: 'TRACK123456',
  })
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Shipped at',
    example: '2025-09-16T10:30:00Z',
  })
  shippedAt?: Date;

  @ApiPropertyOptional({
    description: 'Delivered at',
    example: '2025-09-17T15:00:00Z',
  })
  deliveredAt?: Date;

  @ApiProperty({ description: 'Created at', example: '2025-09-16T09:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-09-16T09:30:00Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Order items', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ description: 'Array of orders', type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ description: 'Total number of orders', example: 150 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 15 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}
