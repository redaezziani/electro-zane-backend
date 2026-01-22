import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Period in days',
    default: 30,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  period?: number = 30;
}

export class AnalyticsCardDto {
  @ApiPropertyOptional({ description: 'Title of the card' })
  title: string;

  @ApiPropertyOptional({ description: 'Count or value to display' })
  count: number;

  @ApiPropertyOptional({
    description: 'Growth percentage compared to previous period',
  })
  growth: number;

  @ApiPropertyOptional({
    description: 'Short description or explanation for the card',
  })
  description?: string;
}
