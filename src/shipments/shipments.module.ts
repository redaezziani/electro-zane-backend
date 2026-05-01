import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { LotArrivalsModule } from '../lot-arrivals/lot-arrivals.module';

@Module({
  imports: [AuthModule, LotArrivalsModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, PrismaService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
