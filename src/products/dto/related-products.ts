import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RelatedProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of related products (default 6, max 50)',
    example: 6,
  })
  @IsOptional()
  @Type(() => Number) 
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 6; 
}
