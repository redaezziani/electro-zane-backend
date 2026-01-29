import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WeeklyTrendsQueryDto {
  @ApiProperty({
    description: 'Number of weeks to analyze (default: 12)',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  weeks?: number;
}

export class WeeklyTrendDataDto {
  @ApiProperty({ description: 'Week number', example: 4 })
  weekNumber: number;

  @ApiProperty({ description: 'Week label (e.g., "Jan 22-28")', example: 'Jan 22-28' })
  weekLabel: string;

  @ApiProperty({ description: 'Start date of week', example: '2026-01-22' })
  startDate: string;

  @ApiProperty({ description: 'End date of week', example: '2026-01-28' })
  endDate: string;

  @ApiProperty({ description: 'Total orders for the week', example: 187 })
  ordersCount: number;

  @ApiProperty({ description: 'Total revenue for the week', example: 67845.50 })
  revenue: number;

  @ApiProperty({ description: 'Total items sold for the week', example: 542 })
  itemsSold: number;

  @ApiProperty({ description: 'Average order value', example: 362.89 })
  averageOrderValue: number;

  @ApiProperty({ description: 'Number of unique customers', example: 156 })
  uniqueCustomers: number;

  @ApiProperty({ description: 'Week-over-week revenue growth percentage', example: 8.5 })
  revenueGrowth: number;

  @ApiProperty({ description: 'Week-over-week orders growth percentage', example: 5.2 })
  ordersGrowth: number;
}

export class WeeklyTrendsSummaryDto {
  @ApiProperty({ description: 'Weekly breakdown', type: [WeeklyTrendDataDto] })
  weeklyData: WeeklyTrendDataDto[];

  @ApiProperty({ description: 'Average weekly revenue', example: 64523.75 })
  averageWeeklyRevenue: number;

  @ApiProperty({ description: 'Average weekly orders', example: 178.5 })
  averageWeeklyOrders: number;

  @ApiProperty({ description: 'Best performing week', type: WeeklyTrendDataDto })
  bestWeek: WeeklyTrendDataDto;

  @ApiProperty({ description: 'Worst performing week', type: WeeklyTrendDataDto })
  worstWeek: WeeklyTrendDataDto;

  @ApiProperty({ description: 'Overall trend direction: GROWING, DECLINING, STABLE', example: 'GROWING' })
  trendDirection: string;

  @ApiProperty({ description: 'Overall growth rate percentage', example: 12.3 })
  overallGrowthRate: number;

  @ApiProperty({ description: 'Number of weeks analyzed', example: 12 })
  weeksAnalyzed: number;
}
