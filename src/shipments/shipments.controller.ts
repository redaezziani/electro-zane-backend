import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
} from './dto/create-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Shipments')
@Controller('shipments')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_CREATE)
  @ApiOperation({ summary: 'Create a new shipment with pieces from multiple lots' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or insufficient quantity' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get all shipments with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'PENDING' })
  @ApiResponse({ status: 200, description: 'Shipments retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;
    const where = status ? { status: status as any } : undefined;

    return this.shipmentsService.findAll({ skip, take, where });
  }

  @Get(':id')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get a shipment by ID' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Get('shipmentId/:shipmentId')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get a shipment by human-readable shipmentId' })
  @ApiParam({ name: 'shipmentId', description: 'Human-readable shipment ID (1, 2, 3...)' })
  @ApiResponse({ status: 200, description: 'Shipment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async findByShipmentId(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    return this.shipmentsService.findByShipmentId(shipmentId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_UPDATE)
  @ApiOperation({ summary: 'Update a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(id, updateShipmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.LOT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shipment (soft delete)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 204, description: 'Shipment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.remove(id);
  }
}
