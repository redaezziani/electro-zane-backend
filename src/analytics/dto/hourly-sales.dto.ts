import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class HourlySalesQueryDto {
  @ApiProperty({ required: false, default: 7, description: 'Period in days' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  period?: number;
}

export class HourlySalesDto {
  @ApiProperty({ example: 9, description: 'Hour of day (0-23)' })
  hour: number;

  @ApiProperty({ example: 15, description: 'Total orders in this hour' })
  orders: number;

  @ApiProperty({ example: 4500, description: 'Total revenue in this hour' })
  revenue: number;

  @ApiProperty({ example: 45, description: 'Total items sold in this hour' })
  itemsSold: number;

  @ApiProperty({ example: 300, description: 'Average order value in this hour' })
  averageOrderValue: number;
}
