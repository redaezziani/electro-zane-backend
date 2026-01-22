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
import { LotsService } from './lots.service';
import { CreateLotDto, UpdateLotDto } from './dto/create-lot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Lots')
@Controller('lots')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_CREATE)
  @ApiOperation({ summary: 'Create a new lot' })
  @ApiResponse({ status: 201, description: 'Lot created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createLotDto: CreateLotDto) {
    return this.lotsService.create(createLotDto);
  }

  @Get()
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get all lots with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'PENDING' })
  @ApiResponse({ status: 200, description: 'Lots retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;
    const where = status ? { status: status as any } : undefined;

    return this.lotsService.findAll({ skip, take, where });
  }

  @Get(':id')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get a lot by ID' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotsService.findOne(id);
  }

  @Get('lotId/:lotId')
  @Permissions(Permission.LOT_READ)
  @ApiOperation({ summary: 'Get a lot by human-readable lotId' })
  @ApiParam({ name: 'lotId', description: 'Human-readable lot ID (1, 2, 3...)' })
  @ApiResponse({ status: 200, description: 'Lot retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  async findByLotId(@Param('lotId', ParseIntPipe) lotId: number) {
    return this.lotsService.findByLotId(lotId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_UPDATE)
  @ApiOperation({ summary: 'Update a lot' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLotDto: UpdateLotDto,
  ) {
    return this.lotsService.update(id, updateLotDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.LOT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lot (soft delete)' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 204, description: 'Lot deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotsService.remove(id);
  }
}
