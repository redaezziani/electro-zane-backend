import { ApiProperty } from '@nestjs/swagger';

export class InventoryAnalyticsDto {
  @ApiProperty({ example: 25, description: 'Number of products with low stock' })
  lowStockCount: number;

  @ApiProperty({ example: 8, description: 'Number of out of stock products' })
  outOfStockCount: number;

  @ApiProperty({ example: 1250000, description: 'Total inventory value' })
  totalInventoryValue: number;

  @ApiProperty({ example: 5420, description: 'Total units in stock' })
  totalUnitsInStock: number;

  @ApiProperty({ example: 325, description: 'Total active SKUs' })
  totalActiveSKUs: number;

  @ApiProperty({ example: 15, description: 'Products nearing reorder point' })
  nearingReorderPoint: number;
}

export class LowStockProductDto {
  @ApiProperty({ example: 'uuid-123' })
  skuId: string;

  @ApiProperty({ example: 'SKU-001' })
  sku: string;

  @ApiProperty({ example: 'Product Name' })
  productName: string;

  @ApiProperty({ example: 'Variant Name' })
  variantName: string;

  @ApiProperty({ example: 3 })
  currentStock: number;

  @ApiProperty({ example: 5 })
  lowStockAlert: number;

  @ApiProperty({ example: 150 })
  price: number;
}
