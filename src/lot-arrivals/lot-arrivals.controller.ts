import {
  Controller,
  Get,
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
import { LotArrivalsService } from './lot-arrivals.service';
import { UpdateLotArrivalDto } from './dto/update-lot-arrival.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Lot Arrivals')
@Controller('lot-arrivals')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class LotArrivalsController {
  constructor(private readonly lotArrivalsService: LotArrivalsService) {}

  @Get()
  @Permissions(Permission.LOT_ARRIVAL_READ)
  @ApiOperation({ summary: 'Get all lot arrivals with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'lotId', required: false, description: 'Filter by lot ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Lot arrivals retrieved successfully' })
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

    return this.lotArrivalsService.findAll({ skip, take, where: Object.keys(where).length ? where : undefined });
  }

  @Get('by-lot/:lotId')
  @Permissions(Permission.LOT_ARRIVAL_READ)
  @ApiOperation({ summary: 'Get all lot arrivals for a specific lot' })
  @ApiParam({ name: 'lotId', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot arrivals retrieved successfully' })
  async findByLotId(@Param('lotId', ParseUUIDPipe) lotId: string) {
    return this.lotArrivalsService.findByLotId(lotId);
  }

  @Get('by-lot-detail/:lotDetailId')
  @Permissions(Permission.LOT_ARRIVAL_READ)
  @ApiOperation({ summary: 'Get all lot arrivals for a specific lot detail' })
  @ApiParam({ name: 'lotDetailId', description: 'Lot detail UUID' })
  @ApiResponse({ status: 200, description: 'Lot arrivals retrieved successfully' })
  async findByLotDetailId(@Param('lotDetailId', ParseUUIDPipe) lotDetailId: string) {
    return this.lotArrivalsService.findByLotDetailId(lotDetailId);
  }

  @Get(':id')
  @Permissions(Permission.LOT_ARRIVAL_READ)
  @ApiOperation({ summary: 'Get a lot arrival by ID' })
  @ApiParam({ name: 'id', description: 'Lot arrival UUID' })
  @ApiResponse({ status: 200, description: 'Lot arrival retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lot arrival not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotArrivalsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_ARRIVAL_UPDATE)
  @ApiOperation({ summary: 'Update/verify a lot arrival (admin updates what actually arrived)' })
  @ApiParam({ name: 'id', description: 'Lot arrival UUID' })
  @ApiResponse({ status: 200, description: 'Lot arrival updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Lot arrival not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLotArrivalDto: UpdateLotArrivalDto,
  ) {
    return this.lotArrivalsService.update(id, updateLotArrivalDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.LOT_ARRIVAL_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lot arrival (soft delete)' })
  @ApiParam({ name: 'id', description: 'Lot arrival UUID' })
  @ApiResponse({ status: 204, description: 'Lot arrival deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lot arrival not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotArrivalsService.remove(id);
  }
}
