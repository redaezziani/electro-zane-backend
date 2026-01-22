import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PieceDetailDto {
  @ApiProperty({ example: 'iPhone 14 Pro', description: 'Name of the piece/item' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 5, description: 'Quantity of this specific piece' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'new', description: 'Status of the piece (new, used, damaged, etc.)' })
  @IsNotEmpty()
  @IsString()
  status: string;
}

export class CreateLotDetailDto {
  @ApiProperty({ description: 'Lot UUID this detail belongs to' })
  @IsNotEmpty()
  @IsUUID()
  lotId: string;

  @ApiProperty({ example: 10, description: 'Total quantity in this detail entry' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 299.99, description: 'Price for this detail entry' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @ApiProperty({ example: 'FedEx', description: 'Shipping company name' })
  @IsNotEmpty()
  @IsString()
  shippingCompany: string;

  @ApiProperty({ example: 'Los Angeles', description: 'Shipping company city' })
  @IsNotEmpty()
  @IsString()
  shippingCompanyCity: string;

  @ApiProperty({
    type: [PieceDetailDto],
    description: 'Array of piece details (name, quantity, status)',
    example: [
      { name: 'iPhone 14 Pro', quantity: 5, status: 'new' },
      { name: 'Samsung Galaxy S23', quantity: 3, status: 'new' }
    ]
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDetailDto)
  pieceDetails: PieceDetailDto[];

  @ApiPropertyOptional({ example: 'Handle with care', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLotDetailDto {
  @ApiPropertyOptional({ example: 10, description: 'Total quantity in this detail entry' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 299.99, description: 'Price for this detail entry' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'FedEx', description: 'Shipping company name' })
  @IsOptional()
  @IsString()
  shippingCompany?: string;

  @ApiPropertyOptional({ example: 'Los Angeles', description: 'Shipping company city' })
  @IsOptional()
  @IsString()
  shippingCompanyCity?: string;

  @ApiPropertyOptional({
    type: [PieceDetailDto],
    description: 'Array of piece details (name, quantity, status)'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDetailDto)
  pieceDetails?: PieceDetailDto[];

  @ApiPropertyOptional({ example: 'Updated notes', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
