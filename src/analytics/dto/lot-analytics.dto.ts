import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class LotAnalyticsQueryDto {
  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  period?: number;
}

export class LotAnalyticsDto {
  @ApiProperty({ example: 45, description: 'Total lots in period' })
  totalLots: number;

  @ApiProperty({ example: 12, description: 'Pending lots' })
  pendingLots: number;

  @ApiProperty({ example: 8, description: 'Lots in transit' })
  inTransitLots: number;

  @ApiProperty({ example: 15, description: 'Arrived lots' })
  arrivedLots: number;

  @ApiProperty({ example: 10, description: 'Completed lots' })
  completedLots: number;

  @ApiProperty({ example: 250000, description: 'Total value of lots' })
  totalLotValue: number;

  @ApiProperty({ example: 5420, description: 'Total quantity expected' })
  totalQuantityExpected: number;

  @ApiProperty({ example: 5380, description: 'Total quantity received' })
  totalQuantityReceived: number;

  @ApiProperty({ example: 98.5, description: 'Fulfillment rate percentage' })
  fulfillmentRate: number;

  @ApiProperty({ example: 40, description: 'Items damaged during shipping' })
  damagedItems: number;

  @ApiProperty({ example: 2.5, description: 'Average days to arrival' })
  averageDaysToArrival: number;
}
