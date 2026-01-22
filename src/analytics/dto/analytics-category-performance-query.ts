// src/analytics/dto/analytics-top-products-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsCategoryPerformanceQueryDto {
  @ApiPropertyOptional({ description: 'Period in days', default: 30 })
    @IsOptional()
    @Type(() => Number) 
    @IsInt()
    @Min(1)
    period?: number;
}






class CategoryMetrics {
  @ApiProperty({ description: 'Total number of orders for this category' })
  totalOrders: number;

  @ApiProperty({ description: 'Total revenue for this category' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total number of products sold for this category' })
  totalProducts: number;
}

export class DailyCategoryPerformanceDto {
  @ApiProperty({ example: '2025-09-24', description: 'The date for the data point' })
  date: string;

  [key: string]: CategoryMetrics | string; // The type is string because of the 'date' property.
}