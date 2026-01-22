import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category URL slug (will be auto-generated if not provided)',
    example: 'electronics'
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices and accessories'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional category information as JSON',
    example: { "icon": "electronics", "color": "#1976d2" }
  })
  @IsOptional()
  info?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Parent category ID for nested categories'
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for displaying categories',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Category description'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional category information as JSON'
  })
  @IsOptional()
  info?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Parent category ID'
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order'
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
