import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics'
  })
  name: string;

  @ApiProperty({
    description: 'Category slug',
    example: 'electronics'
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description'
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional category information'
  })
  info?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Parent category ID'
  })
  parentId?: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Sort order',
    example: 0
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Parent category',
    type: () => CategoryResponseDto
  })
  parent?: CategoryResponseDto;

  @ApiPropertyOptional({
    description: 'Child categories',
    type: [CategoryResponseDto]
  })
  children?: CategoryResponseDto[];

  @ApiPropertyOptional({
    description: 'Number of products in this category',
    example: 25
  })
  productCount?: number;
}
