import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMethodQueryDto {
  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  period?: number;
}

export class PaymentMethodBreakdownDto {
  @ApiProperty({ example: 'CASH' })
  method: string;

  @ApiProperty({ example: 45000 })
  totalAmount: number;

  @ApiProperty({ example: 120 })
  transactionCount: number;

  @ApiProperty({ example: 65.5 })
  percentage: number;

  @ApiProperty({ example: 375 })
  averageTransaction: number;
}
