// analytics-top-products-metrics-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer'; 

export class AnalyticsTopProductsMetricsQueryDto {
  @ApiPropertyOptional({ description: 'Period in days', default: 30 })
  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  period?: number;
}
