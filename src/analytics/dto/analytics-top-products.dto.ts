// analytics-top-products.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TopProductsDto {
  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Total quantity ordered' })
  totalOrdered: number;
}
