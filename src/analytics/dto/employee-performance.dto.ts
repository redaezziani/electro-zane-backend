import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeePerformanceQueryDto {
  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  period?: number;
}

export class EmployeePerformanceDto {
  @ApiProperty({ example: 'uuid-123' })
  employeeId: string;

  @ApiProperty({ example: 'Ahmed Hassan' })
  employeeName: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  employeeEmail: string;

  @ApiProperty({ example: 156, description: 'Orders created by this employee' })
  ordersCreated: number;

  @ApiProperty({ example: 142, description: 'Orders confirmed by this employee' })
  ordersConfirmed: number;

  @ApiProperty({ example: 45000, description: 'Total revenue from orders created' })
  revenueCreated: number;

  @ApiProperty({ example: 42000, description: 'Total revenue from orders confirmed' })
  revenueConfirmed: number;

  @ApiProperty({ example: 288, description: 'Average order value (created)' })
  averageOrderValue: number;

  @ApiProperty({ example: 296, description: 'Average order value (confirmed)' })
  averageConfirmedOrderValue: number;
}
