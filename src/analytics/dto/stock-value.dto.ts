import { ApiProperty } from '@nestjs/swagger';

export class StockValueByProductDto {
  @ApiProperty({ description: 'Product ID', example: 'prod-123' })
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro Max' })
  productName: string;

  @ApiProperty({ description: 'Total units in stock across all variants', example: 42 })
  totalStock: number;

  @ApiProperty({ description: 'Average price per unit', example: 1299.00 })
  averagePrice: number;

  @ApiProperty({ description: 'Total value of stock for this product', example: 54558.00 })
  stockValue: number;

  @ApiProperty({ description: 'Number of variants', example: 4 })
  variantsCount: number;

  @ApiProperty({ description: 'Product cover image', example: 'https://...' })
  coverImage: string | null;
}

export class StockValueByCategoryDto {
  @ApiProperty({ description: 'Category ID', example: 'cat-123' })
  categoryId: string;

  @ApiProperty({ description: 'Category name', example: 'Smartphones' })
  categoryName: string;

  @ApiProperty({ description: 'Total units in stock', example: 387 })
  totalStock: number;

  @ApiProperty({ description: 'Total value of stock in category', example: 458765.00 })
  stockValue: number;

  @ApiProperty({ description: 'Number of products in category', example: 23 })
  productsCount: number;

  @ApiProperty({ description: 'Percentage of total inventory value', example: 68.5 })
  percentageOfTotal: number;
}

export class StockValueSummaryDto {
  @ApiProperty({ description: 'Total value of all inventory', example: 669850.00 })
  totalStockValue: number;

  @ApiProperty({ description: 'Total number of units in stock', example: 1247 })
  totalUnits: number;

  @ApiProperty({ description: 'Number of unique products', example: 87 })
  uniqueProducts: number;

  @ApiProperty({ description: 'Number of unique SKUs', example: 342 })
  uniqueSkus: number;

  @ApiProperty({ description: 'Average value per SKU', example: 1958.48 })
  averageValuePerSku: number;

  @ApiProperty({ description: 'Value of low stock items (below alert threshold)', example: 45230.00 })
  lowStockValue: number;

  @ApiProperty({ description: 'Value of out of stock items', example: 0 })
  outOfStockValue: number;

  @ApiProperty({ description: 'Stock value by category', type: [StockValueByCategoryDto] })
  byCategory: StockValueByCategoryDto[];

  @ApiProperty({ description: 'Top 10 products by stock value', type: [StockValueByProductDto] })
  topProducts: StockValueByProductDto[];
}
