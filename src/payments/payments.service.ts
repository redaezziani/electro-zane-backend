// src/payment/payment.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentStrategy } from './strategies/payment-strategy.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private cashStrategy: PaymentStrategy,
    private prisma: PrismaService,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    return this.cashStrategy.create(dto);
  }

  async confirmPayment(method: string, transactionId: string): Promise<Payment> {
    // Find the payment first to validate it exists
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with transaction ID "${transactionId}" not found`,
      );
    }

    // Check if payment is already completed
    if (payment.status === 'COMPLETED') {
      throw new BadRequestException(
        `Payment with transaction ID "${transactionId}" is already completed`,
      );
    }

    // Check if payment is in a failed state
    if (payment.status === 'FAILED' || payment.status === 'CANCELLED') {
      throw new BadRequestException(
        `Cannot confirm payment with status "${payment.status}"`,
      );
    }

    // Validate payment method matches
    if (payment.method !== method) {
      throw new BadRequestException(
        `Payment method mismatch. Expected "${payment.method}", got "${method}"`,
      );
    }

    // Update payment status to completed
    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
      },
    });
  }
}
