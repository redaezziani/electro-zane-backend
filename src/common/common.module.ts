// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { LocalStorageService } from './services/local-storage.service';
import { PdfService } from './services/pdf.service';
import { UploadController } from './controllers/upload.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [LocalStorageService, PdfService],
  exports: [LocalStorageService, PdfService],
})
export class CommonModule {}
