// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from './payments.service';
import { CashPaymentStrategy } from './strategies/cash.strategy';
import { PaymentController } from './payments.controller';
import { PaymentEvent } from './payments.event';
import { EmailService } from 'src/common/services/email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    PrismaService,
    CashPaymentStrategy,
    EmailService,
    {
      provide: PaymentService,
      useFactory: (cash: CashPaymentStrategy, prisma: PrismaService) => {
        return new PaymentService(cash, prisma);
      },
      inject: [CashPaymentStrategy, PrismaService],
    },
    PaymentEvent
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentsModule {}
