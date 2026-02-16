import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, PrismaService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
