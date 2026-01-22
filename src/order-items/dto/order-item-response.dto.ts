import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  orderId: string;
  @ApiProperty()
  orderNumber?: string;
  @ApiProperty()
  skuId: string;
  @ApiProperty()
  skuCode: string;
  @ApiProperty()
  productName: string;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  unitPrice: number;
  @ApiProperty()
  totalPrice: number;
}
