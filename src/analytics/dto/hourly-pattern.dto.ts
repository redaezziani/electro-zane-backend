import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class HourlyPatternQueryDto {
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

export class HourlyPatternDto {
  @ApiProperty({ description: 'Hour of day (0-23)', example: 14 })
  hour: number;

  @ApiProperty({ description: 'Hour label (e.g., "2:00 PM")', example: '2:00 PM' })
  hourLabel: string;

  @ApiProperty({ description: 'Average orders per hour', example: 8.5 })
  averageOrders: number;

  @ApiProperty({ description: 'Total orders in this hour across period', example: 255 })
  totalOrders: number;

  @ApiProperty({ description: 'Average revenue per hour', example: 3214.75 })
  averageRevenue: number;

  @ApiProperty({ description: 'Total revenue in this hour across period', example: 96442.50 })
  totalRevenue: number;

  @ApiProperty({ description: 'Average items sold per hour', example: 24.3 })
  averageItemsSold: number;

  @ApiProperty({ description: 'Peak indicator (true if in top 25%)', example: true })
  isPeakHour: boolean;
}

export class HourlyPatternSummaryDto {
  @ApiProperty({ description: 'Hourly breakdown', type: [HourlyPatternDto] })
  hourlyData: HourlyPatternDto[];

  @ApiProperty({ description: 'Busiest hour of the day', type: HourlyPatternDto })
  busiestHour: HourlyPatternDto;

  @ApiProperty({ description: 'Slowest hour of the day', type: HourlyPatternDto })
  slowestHour: HourlyPatternDto;

  @ApiProperty({ description: 'Peak hours (top 25%)', type: [HourlyPatternDto] })
  peakHours: HourlyPatternDto[];

  @ApiProperty({ description: 'Number of days analyzed', example: 30 })
  daysAnalyzed: number;
}
