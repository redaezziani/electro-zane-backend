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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShipmentPiecesService } from './shipment-pieces.service';
import {
  CreateShipmentPieceDto,
  UpdateShipmentPieceDto,
} from './dto/create-shipment-piece.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Shipment Pieces')
@Controller('shipment-pieces')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class ShipmentPiecesController {
  constructor(
    private readonly shipmentPiecesService: ShipmentPiecesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_CREATE)
  @ApiOperation({ summary: 'Add a piece to an existing shipment' })
  @ApiResponse({ status: 201, description: 'Piece added to shipment successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or insufficient quantity' })
  @ApiResponse({ status: 409, description: 'Piece already exists in this shipment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createShipmentPieceDto: CreateShipmentPieceDto) {
    return this.shipmentPiecesService.create(createShipmentPieceDto);
  }

  @Get()
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get all shipment pieces with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'shipmentId', required: false, description: 'Filter by shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment pieces retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('shipmentId') shipmentId?: string,
  ) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;
    const where: any = {};

    if (shipmentId) where.shipmentId = shipmentId;

    return this.shipmentPiecesService.findAll({ skip, take, where });
  }

  @Get('shipment/:shipmentId')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get all pieces for a specific shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment pieces retrieved successfully' })
  async findByShipmentId(@Param('shipmentId', ParseUUIDPipe) shipmentId: string) {
    return this.shipmentPiecesService.findByShipmentId(shipmentId);
  }

  @Get(':id')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get a shipment piece by ID' })
  @ApiParam({ name: 'id', description: 'Shipment piece UUID' })
  @ApiResponse({ status: 200, description: 'Shipment piece retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipment piece not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentPiecesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_UPDATE)
  @ApiOperation({ summary: 'Update a shipment piece' })
  @ApiParam({ name: 'id', description: 'Shipment piece UUID' })
  @ApiResponse({ status: 200, description: 'Shipment piece updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Shipment piece not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShipmentPieceDto: UpdateShipmentPieceDto,
  ) {
    return this.shipmentPiecesService.update(id, updateShipmentPieceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.LOT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a piece from a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment piece UUID' })
  @ApiResponse({ status: 204, description: 'Piece removed from shipment successfully' })
  @ApiResponse({ status: 404, description: 'Shipment piece not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentPiecesService.remove(id);
  }
}
