import { Module } from '@nestjs/common';
import { LotDetailsService } from './lot-details.service';
import { LotDetailsController } from './lot-details.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LotDetailsController],
  providers: [LotDetailsService, PrismaService],
  exports: [LotDetailsService],
})
export class LotDetailsModule {}
