import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  CreateProductWithVariantsDto,
  CreateProductVariantDto,
  CreateProductSKUDto,
  UpdateProductDto,
  UpdateProductSKUDto,
} from './dto/create-product.dto';
import { ProductQueryDto } from './dto/query.dto';
import {
  ProductResponseDto,
  PaginatedProductsResponseDto,
  ProductVariantResponseDto,
  ProductSKUResponseDto,
} from './dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';
import { PaginatedPublicProductsResponseDto, PublicProductDetailDto, PublicProductQueryDto } from './dto/public-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.PRODUCT_CREATE)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('coverImage'),
    FilesInterceptor('additionalImages', 10),
  )
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with optional image files',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Product name',
          example: 'Wireless Bluetooth Headphones',
        },
        slug: {
          type: 'string',
          description: 'Product URL slug (optional)',
          example: 'wireless-bluetooth-headphones',
        },
        description: {
          type: 'string',
          description: 'Product description',
          example: 'High-quality wireless headphones...',
        },
        shortDesc: {
          type: 'string',
          description: 'Short description',
          example: 'Premium wireless headphones',
        },
        isActive: {
          type: 'boolean',
          description: 'Whether product is active',
          default: true,
        },
        isFeatured: {
          type: 'boolean',
          description: 'Whether product is featured',
          default: false,
        },
        metaTitle: {
          type: 'string',
          description: 'SEO meta title',
        },
        metaDesc: {
          type: 'string',
          description: 'SEO meta description',
        },
        sortOrder: {
          type: 'number',
          description: 'Sort order',
          default: 0,
        },
        categoryIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Category IDs',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file (optional)',
        },
        additionalImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Additional image files (optional)',
        },
        imageFolder: {
          type: 'string',
          description: 'Image upload folder',
          example: 'products',
          default: 'products',
        },
        imageTags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Image tags',
          example: ['product', 'electronics'],
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() coverImage?: Express.Multer.File,
    @UploadedFiles() additionalImages?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    return this.productsService.create(
      createProductDto,
      coverImage,
      additionalImages,
    );
  }

  @Post('with-variants')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.PRODUCT_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product with variants' })
  @ApiResponse({
    status: 201,
    description: 'Product with variants created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createWithVariants(
    @Body() createProductDto: CreateProductWithVariantsDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.createWithVariants(createProductDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PRODUCT_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedProductsResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'categorySlug',
    required: false,
    description: 'Filter by category slug',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Filter by featured status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    description: 'Filter by stock availability',
    type: Boolean,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'sortOrder'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'includeVariants',
    required: false,
    description: 'Include variants in response',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeSKUs',
    required: false,
    description: 'Include SKUs in response',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeCategories',
    required: false,
    description: 'Include categories in response',
    type: Boolean,
  })
  @ApiQuery({
    name: 'includeImages',
    required: false,
    description: 'Include images in response',
    type: Boolean,
  })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PRODUCT_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PRODUCT_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    example: 'wireless-bluetooth-headphones',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<ProductResponseDto> {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('coverImage'),
    FilesInterceptor('additionalImages', 10),
  )
  @ApiOperation({ summary: 'Update a product' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Product update data with optional image files',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        slug: { type: 'string', description: 'Product URL slug' },
        description: { type: 'string', description: 'Product description' },
        shortDesc: { type: 'string', description: 'Short description' },
        isActive: { type: 'boolean', description: 'Whether product is active' },
        isFeatured: { type: 'boolean', description: 'Whether product is featured' },
        metaTitle: { type: 'string', description: 'SEO meta title' },
        metaDesc: { type: 'string', description: 'SEO meta description' },
        sortOrder: { type: 'number', description: 'Sort order' },
        categoryIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Category IDs',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file (optional)',
        },
        additionalImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Additional image files (optional)',
        },
        imageFolder: {
          type: 'string',
          description: 'Image upload folder',
          example: 'products',
          default: 'products',
        },
        imageTags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Image tags',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() coverImage?: Express.Multer.File,
    @UploadedFiles() additionalImages?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    return this.productsService.update(
      id,
      updateProductDto,
      coverImage,
      additionalImages,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.PRODUCT_DELETE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  // Variant endpoints
  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a variant to a product' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Variant created successfully',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    return this.productsService.addVariant(productId, createVariantDto);
  }

  @Patch('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiParam({
    name: 'variantId',
    description: 'Variant UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Variant updated successfully',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Variant not found',
  })
  async updateVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: Partial<CreateProductVariantDto>,
  ): Promise<ProductVariantResponseDto> {
    return this.productsService.updateVariant(variantId, updateVariantDto);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product variant (soft delete)' })
  @ApiParam({
    name: 'variantId',
    description: 'Variant UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Variant deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Variant not found',
  })
  async removeVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<void> {
    return this.productsService.removeVariant(variantId);
  }

  // SKU endpoints
  @Post('variants/:variantId/skus')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Add a SKU to a variant' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'SKU data with optional image files',
    schema: {
      type: 'object',
      properties: {
        sku: { type: 'string', example: 'WBH-001-LG-BLK' },
        barcode: { type: 'string', example: '1234567890123' },
        price: { type: 'number', example: 199.99 },
        stock: { type: 'number', example: 10 },
        lowStockAlert: { type: 'number', example: 5 },
        weight: { type: 'number', example: 250 },
        dimensions: {
          type: 'object',
          example: { length: 20, width: 15, height: 8 },
        },
        coverImage: {
          type: 'string',
          example: 'https://example.com/image.jpg',
        },
        isActive: { type: 'boolean', example: true },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'SKU image files (optional)',
        },
      },
      required: ['sku', 'price'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'SKU created successfully',
    type: ProductSKUResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  @ApiResponse({ status: 409, description: 'SKU or barcode already exists' })
  async addSKU(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() createSKUDto: CreateProductSKUDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ProductSKUResponseDto> {
    return this.productsService.addSKU(variantId, createSKUDto, images);
  }

  @Patch('skus/:skuId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Update a product SKU' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'SKU update data with optional image files',
    schema: {
      type: 'object',
      properties: {
        sku: { type: 'string', example: 'WBH-001-LG-BLK' },
        barcode: { type: 'string', example: '1234567890123' },
        price: { type: 'number', example: 199.99 },
        stock: { type: 'number', example: 10 },
        lowStockAlert: { type: 'number', example: 5 },
        weight: { type: 'number', example: 250 },
        dimensions: {
          type: 'object',
          example: { length: 20, width: 15, height: 8 },
        },
        coverImage: {
          type: 'string',
          example: 'https://example.com/image.jpg',
        },
        isActive: { type: 'boolean', example: true },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'SKU image files (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'SKU updated successfully',
    type: ProductSKUResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'SKU not found' })
  @ApiResponse({ status: 409, description: 'SKU or barcode already exists' })
  async updateSKU(
    @Param('skuId', ParseUUIDPipe) skuId: string,
    @Body() updateSKUDto: UpdateProductSKUDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ProductSKUResponseDto> {
    return this.productsService.updateSKU(skuId, updateSKUDto, images);
  }

  @Delete('skus/:skuId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product SKU (soft delete)' })
  @ApiParam({
    name: 'skuId',
    description: 'SKU UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'SKU deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'SKU not found',
  })
  async removeSKU(@Param('skuId', ParseUUIDPipe) skuId: string): Promise<void> {
    return this.productsService.removeSKU(skuId);
  }

  @Delete('skus/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a single SKU image' })
  @ApiParam({
    name: 'imageId',
    description: 'SKU image UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'SKU image deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'SKU image not found' })
  async removeSKUImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.productsService.removeSKUImage(imageId);
  }

  // fix

}
