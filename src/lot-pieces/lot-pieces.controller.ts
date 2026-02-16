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
import { LotPiecesService } from './lot-pieces.service';
import {
  CreateLotPieceDto,
  UpdateLotPieceDto,
} from './dto/create-lot-piece.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Lot Pieces')
@Controller('lot-pieces')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class LotPiecesController {
  constructor(private readonly lotPiecesService: LotPiecesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_CREATE)
  @ApiOperation({ summary: 'Create a new lot piece' })
  @ApiResponse({ status: 201, description: 'Lot piece created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createLotPieceDto: CreateLotPieceDto) {
    return this.lotPiecesService.create(createLotPieceDto);
  }

  @Get()
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get all lot pieces with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'lotId', required: false, description: 'Filter by lot ID' })
  @ApiQuery({ name: 'status', required: false, example: 'NEW' })
  @ApiResponse({ status: 200, description: 'Lot pieces retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('lotId') lotId?: string,
    @Query('status') status?: string,
  ) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;
    const where: any = {};

    if (lotId) where.lotId = lotId;
    if (status) where.status = status;

    return this.lotPiecesService.findAll({ skip, take, where });
  }

  @Get('lot/:lotId')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get all pieces for a specific lot' })
  @ApiParam({ name: 'lotId', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot pieces retrieved successfully' })
  async findByLotId(@Param('lotId', ParseUUIDPipe) lotId: string) {
    return this.lotPiecesService.findByLotId(lotId);
  }

  @Get(':id')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get a lot piece by ID' })
  @ApiParam({ name: 'id', description: 'Lot piece UUID' })
  @ApiResponse({ status: 200, description: 'Lot piece retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lot piece not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotPiecesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_UPDATE)
  @ApiOperation({ summary: 'Update a lot piece' })
  @ApiParam({ name: 'id', description: 'Lot piece UUID' })
  @ApiResponse({ status: 200, description: 'Lot piece updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Lot piece not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLotPieceDto: UpdateLotPieceDto,
  ) {
    return this.lotPiecesService.update(id, updateLotPieceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.LOT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lot piece (soft delete)' })
  @ApiParam({ name: 'id', description: 'Lot piece UUID' })
  @ApiResponse({ status: 204, description: 'Lot piece deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lot piece not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotPiecesService.remove(id);
  }
}
