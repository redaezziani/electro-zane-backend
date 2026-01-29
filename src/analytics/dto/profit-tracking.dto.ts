import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProfitTrackingQueryDto {
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
}

export class DailyProfitDto {
  @ApiProperty({ description: 'Date', example: '2026-01-29' })
  date: string;

  @ApiProperty({ description: 'Total revenue for the day', example: 15420.50 })
  revenue: number;

  @ApiProperty({ description: 'Estimated cost of goods sold', example: 9850.00 })
  costOfGoods: number;

  @ApiProperty({ description: 'Gross profit (revenue - cost)', example: 5570.50 })
  grossProfit: number;

  @ApiProperty({ description: 'Profit margin percentage', example: 36.14 })
  profitMargin: number;

  @ApiProperty({ description: 'Number of orders', example: 42 })
  ordersCount: number;
}

export class ProfitSummaryDto {
  @ApiProperty({ description: 'Total revenue for period', example: 462615.00 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total cost of goods for period', example: 295500.00 })
  totalCost: number;

  @ApiProperty({ description: 'Total gross profit for period', example: 167115.00 })
  totalProfit: number;

  @ApiProperty({ description: 'Average profit margin percentage', example: 36.14 })
  averageProfitMargin: number;

  @ApiProperty({ description: 'Daily profit breakdown', type: [DailyProfitDto] })
  dailyBreakdown: DailyProfitDto[];

  @ApiProperty({ description: 'Best performing day', type: DailyProfitDto })
  bestDay: DailyProfitDto;

  @ApiProperty({ description: 'Worst performing day', type: DailyProfitDto })
  worstDay: DailyProfitDto;
}
