import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PublicCategoriesService } from './public-categories.service';
import { PublicCategoryDto } from '../dto/public-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Permission } from '../../auth/permissions/permissions.enum';

@ApiTags('Categories')
@Controller('public/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PublicCategoriesController {
  constructor(
    private readonly publicCategoriesService: PublicCategoriesService,
  ) {}

  @Get()
  @Permissions(Permission.CATEGORY_READ)
  @ApiOperation({ summary: 'Get all active categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories (id, name, slug, description)',
    type: [PublicCategoryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(): Promise<PublicCategoryDto[]> {
    return this.publicCategoriesService.findAll();
  }
}
