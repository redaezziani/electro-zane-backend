import { Module } from '@nestjs/common';
import { CategoriesService } from './private/categories.service';
import { CategoriesController } from './private/categories.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PublicCategoriesController } from './public/public-categories.controller';
import { PublicCategoriesService } from './public/public-categories.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController, PublicCategoriesController],
  providers: [CategoriesService, PublicCategoriesService, PrismaService],
  exports: [CategoriesService, PublicCategoriesService],
})
export class CategoriesModule {}
