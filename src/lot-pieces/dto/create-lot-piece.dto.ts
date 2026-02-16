import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PieceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateLotPieceDto {
  @ApiProperty({
    example: 'uuid-of-lot',
    description: 'ID of the lot this piece belongs to',
  })
  @IsNotEmpty()
  @IsUUID()
  lotId: string;

  @ApiProperty({
    example: 'S22 Ultra 256GB',
    description: 'Name/description of the piece',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 10, description: 'Quantity of this piece' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 500.0,
    description: 'Price per unit',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    enum: PieceStatus,
    example: PieceStatus.NEW,
    description: 'Status of the piece',
  })
  @IsOptional()
  @IsEnum(PieceStatus)
  status?: PieceStatus;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'UI color coding (optional)',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    example: 'High priority items',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: { customField: 'value' },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: any;
}

export class UpdateLotPieceDto {
  @ApiPropertyOptional({
    example: 'S22 Ultra 512GB',
    description: 'Name/description of the piece',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 15, description: 'Quantity of this piece' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    example: 550.0,
    description: 'Price per unit',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({
    enum: PieceStatus,
    example: PieceStatus.SHIPPED,
    description: 'Status of the piece',
  })
  @IsOptional()
  @IsEnum(PieceStatus)
  status?: PieceStatus;

  @ApiPropertyOptional({
    example: '#00FF00',
    description: 'UI color coding (optional)',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    example: 'Updated notes',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: { customField: 'updated value' },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: any;
}
