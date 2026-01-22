import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';

export class ImageUploadDto {
  @ApiPropertyOptional({
    description: 'Folder to upload the image to',
    example: 'products'
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Custom filename for the image',
    example: 'product-hero-image'
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Tags for the image',
    type: [String],
    example: ['product', 'electronics']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ImageTransformationDto {
  @ApiPropertyOptional({
    description: 'Image height in pixels',
    example: 400
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(4000)
  height?: number;

  @ApiPropertyOptional({
    description: 'Image width in pixels',
    example: 400
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(4000)
  width?: number;

  @ApiPropertyOptional({
    description: 'Image quality (1-100)',
    example: 80
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Output format',
    example: 'webp',
    enum: ['jpg', 'jpeg', 'png', 'webp', 'gif']
  })
  @IsOptional()
  @IsString()
  format?: string;
}

export class ImageResponseDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'http://localhost:5000/images/products/product-image.jpg'
  })
  url: string;

  @ApiProperty({
    description: 'Thumbnail URL',
    example: 'http://localhost:5000/images/products/product-image.jpg'
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: 'File ID for deletion',
    example: 'product-image.jpg'
  })
  fileId: string;

  @ApiProperty({
    description: 'File name',
    example: 'product-image.jpg'
  })
  name: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000
  })
  size: number;

  @ApiProperty({
    description: 'File path in local storage',
    example: '/images/products/product-image.jpg'
  })
  filePath: string;
}
