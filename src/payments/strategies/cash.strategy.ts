// src/payment/strategies/cash.strategy.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStrategy } from './payment-strategy.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class CashPaymentStrategy implements PaymentStrategy {
  method = 'CASH';

  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        processedById: dto.processedById ?? null,
        method: 'CASH',
        amount: dto.amount,
        currency: dto.currency,
        status: 'COMPLETED', // Mark as COMPLETED since moderator is placing order
        provider: 'cash',
      },
    });
  }
}
