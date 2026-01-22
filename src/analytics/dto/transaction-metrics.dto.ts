import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionMetricsQueryDto {
  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  period?: number;
}

export class TransactionMetricsDto {
  @ApiProperty({ example: 325.50, description: 'Average order value' })
  averageOrderValue: number;

  @ApiProperty({ example: 3.5, description: 'Average items per order' })
  averageItemsPerOrder: number;

  @ApiProperty({ example: 12, description: 'Average orders per day' })
  averageOrdersPerDay: number;

  @ApiProperty({ example: 450, description: 'Total orders in period' })
  totalOrders: number;

  @ApiProperty({ example: 146475, description: 'Total revenue in period' })
  totalRevenue: number;

  @ApiProperty({ example: 1575, description: 'Total items sold in period' })
  totalItemsSold: number;

  @ApiProperty({ example: 92.50, description: 'Median order value' })
  medianOrderValue: number;
}
