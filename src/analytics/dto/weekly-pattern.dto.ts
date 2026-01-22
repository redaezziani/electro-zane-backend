import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class WeeklyPatternQueryDto {
  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  period?: number;
}

export class WeeklyPatternDto {
  @ApiProperty({ example: 'Monday', description: 'Day of week' })
  dayOfWeek: string;

  @ApiProperty({ example: 1, description: 'Day number (0=Sunday, 1=Monday, etc.)' })
  dayNumber: number;

  @ApiProperty({ example: 85, description: 'Total orders on this day' })
  orders: number;

  @ApiProperty({ example: 25600, description: 'Total revenue on this day' })
  revenue: number;

  @ApiProperty({ example: 265, description: 'Total items sold on this day' })
  itemsSold: number;

  @ApiProperty({ example: 301, description: 'Average order value on this day' })
  averageOrderValue: number;
}
