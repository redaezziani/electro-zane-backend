import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class LowStockAlertsQueryDto {
  @ApiProperty({
    description: 'Minimum stock threshold to consider (default: from SKU lowStockAlert)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  threshold?: number;
}

export class LowStockAlertDto {
  @ApiProperty({ description: 'SKU ID', example: 'abc-123' })
  skuId: string;

  @ApiProperty({ description: 'SKU code', example: 'PHONE-IPH15-128-BLK' })
  sku: string;

  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro Max' })
  productName: string;

  @ApiProperty({ description: 'Variant name', example: '128GB - Black' })
  variantName: string | null;

  @ApiProperty({ description: 'Current stock level', example: 3 })
  currentStock: number;

  @ApiProperty({ description: 'Low stock alert threshold', example: 5 })
  lowStockAlert: number;

  @ApiProperty({ description: 'Price per unit', example: 1299.99 })
  price: number;

  @ApiProperty({ description: 'Cover image URL', example: 'https://...' })
  coverImage: string | null;

  @ApiProperty({ description: 'How critical is this alert (percentage below threshold)', example: 40 })
  alertSeverity: number;
}
