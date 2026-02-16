import { Module } from '@nestjs/common';
import { LotPiecesService } from './lot-pieces.service';
import { LotPiecesController } from './lot-pieces.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LotPiecesController],
  providers: [LotPiecesService, PrismaService],
  exports: [LotPiecesService],
})
export class LotPiecesModule {}
