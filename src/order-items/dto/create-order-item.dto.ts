import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsUUID, IsDecimal } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsUUID()
  skuId: string;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty()
  @IsDecimal()
  unitPrice: any; // Prisma Decimal

  @ApiProperty()
  @IsDecimal()
  totalPrice: any;

  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  skuCode: string;
}
