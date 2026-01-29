import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BestSellingProductsQueryDto {
  @ApiProperty({
    description: 'Number of days to analyze (default: 30)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  period?: number;

  @ApiProperty({
    description: 'Number of top products to return (default: 10)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}

export class BestSellingProductDto {
  @ApiProperty({ description: 'Product ID', example: 'prod-123' })
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro Max' })
  productName: string;

  @ApiProperty({ description: 'Total units sold', example: 245 })
  unitsSold: number;

  @ApiProperty({ description: 'Total revenue generated', example: 318350.55 })
  totalRevenue: number;

  @ApiProperty({ description: 'Number of orders containing this product', example: 187 })
  ordersCount: number;

  @ApiProperty({ description: 'Average price per unit', example: 1299.00 })
  averagePrice: number;

  @ApiProperty({ description: 'Current stock level across all variants', example: 42 })
  currentStock: number;

  @ApiProperty({ description: 'Product cover image URL', example: 'https://...' })
  coverImage: string | null;

  @ApiProperty({ description: 'Stock status: OK, LOW, OUT_OF_STOCK', example: 'OK' })
  stockStatus: string;

  @ApiProperty({ description: 'Days until stock runs out at current rate', example: 12.5 })
  daysUntilStockout: number | null;
}
