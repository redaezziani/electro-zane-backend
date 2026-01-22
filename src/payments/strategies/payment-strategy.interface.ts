// src/payment/strategies/payment-strategy.interface.ts
import { Payment } from '@prisma/client';
import { CreatePaymentDto } from '../dto/create-payment.dto';

export interface PaymentStrategy {
  method: string; // "CASH"
  create(dto: CreatePaymentDto): Promise<Payment>;
}
