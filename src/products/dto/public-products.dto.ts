// Add these DTOs to your existing response.dto.ts file

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class PublicProductSummaryDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product slug' })
  slug: string;

  @ApiProperty({ description: 'Short description', nullable: true })
  shortDesc?: string;

  @ApiProperty({ description: 'Cover image URL', nullable: true })
  coverImage?: string;

  @ApiProperty({ description: 'Whether product is featured' })
  isFeatured: boolean;

  @ApiProperty({ description: 'Starting price (lowest SKU price)' })
  startingPrice: number;

  @ApiProperty({
    description: 'Compare price (original price)',
    nullable: true,
  })
  comparePrice?: number;

  @ApiProperty({ description: 'Whether product is in stock' })
  inStock: boolean;

  @ApiProperty({ description: 'Product categories' })
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  // 👇 NEW: Lightweight variants + SKUs for cart
  @ApiProperty({ description: 'Variants with SKUs (light version)' })
  variants: Array<{
    id: string;
    name: string;
    skus: Array<{
      id: string;
      sku: string;
      price: number;
      comparePrice?: number;
      stock: number;
    }>;
  }>;
}




export class PaginatedPublicProductsResponseDto {
  @ApiProperty({ type: [PublicProductSummaryDto] })
  data: PublicProductSummaryDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      total: { type: 'number', description: 'Total number of products' },
      page: { type: 'number', description: 'Current page' },
      limit: { type: 'number', description: 'Items per page' },
      totalPages: { type: 'number', description: 'Total number of pages' },
      hasNextPage: { type: 'boolean', description: 'Whether there is a next page' },
      hasPrevPage: { type: 'boolean', description: 'Whether there is a previous page' },
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PublicProductDetailDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product slug' })
  slug: string;

  @ApiProperty({ description: 'Product description', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Short description', nullable: true })
  shortDesc?: string;

  @ApiProperty({ description: 'Cover image URL', nullable: true })
  coverImage?: string;

  @ApiProperty({ description: 'Whether product is featured' })
  isFeatured: boolean;

  @ApiProperty({ description: 'SEO meta title', nullable: true })
  metaTitle?: string;

  @ApiProperty({ description: 'SEO meta description', nullable: true })
  metaDesc?: string;

  @ApiProperty({ description: 'Product categories' })
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  @ApiProperty({ description: 'Product variants with SKUs' })
  variants: Array<{
    id: string;
    name: string;
    attributes: any;
    skus: Array<{
      id: string;
      sku: string;
      price: number;
      comparePrice?: number;
      stock: number;
      weight?: number;
      dimensions?: any;
      coverImage?: string;
      images: Array<{
        id: string;
        url: string;
        altText?: string;
        position: number;
      }>;
      isActive: boolean;
    }>;
    isActive: boolean;
  }>;

  @ApiProperty({ description: 'Starting price (lowest SKU price)' })
  startingPrice: number;

  @ApiProperty({ description: 'Price range' })
  priceRange: {
    min: number;
    max: number;
  };

  @ApiProperty({ description: 'Whether product is in stock' })
  inStock: boolean;

  @ApiProperty({ description: 'Total stock count' })
  totalStock: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

// Add this DTO to your query.dto.ts file

export class PublicProductQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 12,
    minimum: 1,
    maximum: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({
    description: 'Search term for product name or description'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category slug'
  })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Filter by featured status',
    type: Boolean
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum price filter'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by stock availability',
    type: Boolean,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  inStock?: boolean = true;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['name', 'price', 'createdAt', 'featured'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsEnum(['name', 'price', 'createdAt', 'featured'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}

export interface ProductDetailsDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  coverImage?: string;
  isFeatured: boolean;
  metaTitle?: string;
  metaDesc?: string;

  categories: {
    id: string;
    name: string;
    slug: string;
  }[];

  variants: {
    id: string;
    name: string;
    attributes: Record<string, any>; // from ProductVariant.attributes
    skus: {
      id: string;
      sku: string;
      price: number;
      stock: number;
      dimensions: Record<string, any>; // from ProductSKU.dimensions
      coverImage?: string;
      images: string[];
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];

  startingPrice: number;
  priceRange?: [number, number];
  inStock: boolean;
  totalStock: number;
  avgRating: number;

  createdAt: Date;
  updatedAt: Date;
}
