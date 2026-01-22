import { Module } from '@nestjs/common';
import { LotArrivalsService } from './lot-arrivals.service';
import { LotArrivalsController } from './lot-arrivals.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LotArrivalsController],
  providers: [LotArrivalsService, PrismaService],
  exports: [LotArrivalsService],
})
export class LotArrivalsModule {}
