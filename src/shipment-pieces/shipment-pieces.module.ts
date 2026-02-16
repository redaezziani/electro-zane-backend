import { Module } from '@nestjs/common';
import { ShipmentPiecesService } from './shipment-pieces.service';
import { ShipmentPiecesController } from './shipment-pieces.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ShipmentPiecesController],
  providers: [ShipmentPiecesService, PrismaService],
  exports: [ShipmentPiecesService],
})
export class ShipmentPiecesModule {}
