import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentEvent {
  constructor(private prisma: PrismaService) {}

  @OnEvent('payment.updated')
  async handlePaymentUpdated(payload: {
    transactionId: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
  }) {
    const { transactionId, status } = payload;

    // Fetch payment
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });
    if (!payment) return;

    // Fetch order with items and SKU info
    const order = await this.prisma.order.findUnique({
      where: { id: payment.orderId },
      include: {
        items: {
          include: {
            sku: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
    if (!order) return;

    // Update order status based on payment
    if (status === 'COMPLETED' && order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'COMPLETED', status: 'PROCESSING' },
      });
    } else if (status === 'FAILED' && order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    }

    // Email functionality removed - no longer sending emails
  }
}
