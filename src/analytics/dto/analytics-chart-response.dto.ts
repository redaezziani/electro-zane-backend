import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsChartDataDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ description: 'Total orders placed on this date' })
  orders: number;

  @ApiProperty({ description: 'Total revenue on this date' })
  revenue: number;

  @ApiProperty({ description: 'Total products sold on this date' })
  products: number;
}
