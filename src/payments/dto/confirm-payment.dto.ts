
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsBoolean, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// method: string, transactionId: string
export class ConfirmPaymentDto {
  @ApiProperty ({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  method: string;
  
  @ApiProperty ({ description: 'Transaction ID from the payment gateway' })
  @IsNotEmpty()
  transactionId: string;
}