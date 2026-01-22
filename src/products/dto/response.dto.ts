import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/response.dto';

export class ProductSKUImageResponseDto {
  @ApiProperty({
    description: 'Image ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/images/product-1.jpg'
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Alt text for the image',
    example: 'Wireless headphones front view'
  })
  altText?: string;

  @ApiProperty({
    description: 'Image position/order',
    example: 0
  })
  position: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;
}

export class ProductSKUResponseDto {
  @ApiProperty({
    description: 'SKU ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'SKU code',
    example: 'WBH-001-LG-BLK'
  })
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '1234567890123'
  })
  barcode?: string;

  @ApiProperty({
    description: 'Product price',
    example: 199.99
  })
  price: number;

  @ApiProperty({
    description: 'Current stock',
    example: 50
  })
  stock: number;

  @ApiProperty({
    description: 'Low stock alert threshold',
    example: 5
  })
  lowStockAlert: number;

  @ApiPropertyOptional({
    description: 'Weight in grams',
    example: 250
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions'
  })
  dimensions?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'SKU cover image URL'
  })
  coverImage?: string;

  @ApiProperty({
    description: 'Whether the SKU is active',
    example: true
  })
  isActive: boolean;

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
    description: 'SKU images',
    type: [ProductSKUImageResponseDto]
  })
  images?: ProductSKUImageResponseDto[];
}

export class ProductVariantResponseDto {
  @ApiProperty({
    description: 'Variant ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Variant name',
    example: 'Large - Black'
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Variant attributes'
  })
  attributes?: Record<string, any>;

  @ApiProperty({
    description: 'Whether the variant is active',
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
    description: 'Product SKUs for this variant',
    type: [ProductSKUResponseDto]
  })
  skus?: ProductSKUResponseDto[];
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones'
  })
  name: string;

  @ApiProperty({
    description: 'Product slug',
    example: 'wireless-bluetooth-headphones'
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Product description'
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Short description'
  })
  shortDesc?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL'
  })
  coverImage?: string;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the product is featured',
    example: false
  })
  isFeatured: boolean;

  @ApiPropertyOptional({
    description: 'SEO meta title'
  })
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description'
  })
  metaDesc?: string;

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
    description: 'Product variants',
    type: [ProductVariantResponseDto]
  })
  variants?: ProductVariantResponseDto[];

  @ApiPropertyOptional({
    description: 'Product categories',
    type: [CategoryResponseDto]
  })
  categories?: CategoryResponseDto[];
}

export class PaginatedProductsResponseDto {
  @ApiProperty({
    description: 'Array of products',
    type: [ProductResponseDto]
  })
  data: ProductResponseDto[];

  @ApiProperty({
    description: 'Total number of products',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  hasPrev: boolean;
}
