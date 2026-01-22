// src/barcode/barcode.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BarcodeService } from './barcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';

@ApiTags('Barcode')
@Controller('barcode')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Get('generate')
  @Permissions(Permission.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Generate SKU with barcode' })
  @ApiQuery({ name: 'prefix', required: false, description: 'Optional prefix for SKU' })
  @ApiResponse({ status: 200, description: 'SKU and barcode generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  generate(@Query('prefix') prefix?: string) {
    return this.barcodeService.generateSKUWithBarcode(prefix);
  }
}
