// src/analytics/dto/analytics-top-products-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class AnalyticsTopProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Period in days for top products (default 30)',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  period?: number;
}
