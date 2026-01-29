import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DailyCashSummaryQueryDto {
  @ApiProperty({
    description: 'Number of days to look back (default: 1 for today)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  period?: number;
}

export class DailyCashSummaryDto {
  @ApiProperty({ description: 'Date of the summary', example: '2026-01-29' })
  date: string;

  @ApiProperty({ description: 'Total cash received today', example: 15420.50 })
  totalCash: number;

  @ApiProperty({ description: 'Number of orders completed today', example: 42 })
  ordersCount: number;

  @ApiProperty({ description: 'Average order value', example: 367.15 })
  averageOrderValue: number;

  @ApiProperty({ description: 'Cash from completed payments', example: 15420.50 })
  completedPayments: number;

  @ApiProperty({ description: 'Cash from pending payments', example: 1250.00 })
  pendingPayments: number;

  @ApiProperty({ description: 'Number of items sold today', example: 128 })
  itemsSold: number;
}
