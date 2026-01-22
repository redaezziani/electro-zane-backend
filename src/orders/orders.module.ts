import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PdfService } from 'src/common/services/pdf.service';
import { PaymentsModule } from 'src/payments/payments.module';
import { ActivityLoggerService } from '../common/logger/activity-logger.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PaymentsModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, PdfService, ActivityLoggerService],
  exports: [OrdersService],
})
export class OrdersModule {}
