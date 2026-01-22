// analytics-top-products-metrics.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TopProductsMetricsDto {
  @ApiProperty({ description: 'Product name' })
  label: string;

  @ApiProperty({ description: 'Total quantity ordered' })
  totalOrdered: number;

  @ApiProperty({ description: 'Total revenue generated' })
  totalRevenue: number;
}
