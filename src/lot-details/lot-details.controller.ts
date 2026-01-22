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
import { LotDetailsService } from './lot-details.service';
import { CreateLotDetailDto, UpdateLotDetailDto } from './dto/create-lot-detail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Lot Details')
@Controller('lot-details')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class LotDetailsController {
  constructor(private readonly lotDetailsService: LotDetailsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_DETAIL_CREATE)
  @ApiOperation({ summary: 'Create a new lot detail (auto-creates lot arrival)' })
  @ApiResponse({ status: 201, description: 'Lot detail created successfully with auto-generated arrival' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  async create(@Body() createLotDetailDto: CreateLotDetailDto) {
    return this.lotDetailsService.create(createLotDetailDto);
  }

  @Get()
  @Permissions(Permission.LOT_DETAIL_READ)
  @ApiOperation({ summary: 'Get all lot details with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'lotId', required: false, description: 'Filter by lot ID' })
  @ApiResponse({ status: 200, description: 'Lot details retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('lotId') lotId?: string,
  ) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;
    const where = lotId ? { lotId } : undefined;

    return this.lotDetailsService.findAll({ skip, take, where });
  }

  @Get('by-lot/:lotId')
  @Permissions(Permission.LOT_DETAIL_READ)
  @ApiOperation({ summary: 'Get all lot details for a specific lot' })
  @ApiParam({ name: 'lotId', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot details retrieved successfully' })
  async findByLotId(@Param('lotId', ParseUUIDPipe) lotId: string) {
    return this.lotDetailsService.findByLotId(lotId);
  }

  @Get(':id')
  @Permissions(Permission.LOT_DETAIL_READ)
  @ApiOperation({ summary: 'Get a lot detail by ID' })
  @ApiParam({ name: 'id', description: 'Lot detail UUID' })
  @ApiResponse({ status: 200, description: 'Lot detail retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lot detail not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotDetailsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Permissions(Permission.LOT_DETAIL_UPDATE)
  @ApiOperation({ summary: 'Update a lot detail' })
  @ApiParam({ name: 'id', description: 'Lot detail UUID' })
  @ApiResponse({ status: 200, description: 'Lot detail updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Lot detail not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLotDetailDto: UpdateLotDetailDto,
  ) {
    return this.lotDetailsService.update(id, updateLotDetailDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.LOT_DETAIL_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lot detail (soft delete)' })
  @ApiParam({ name: 'id', description: 'Lot detail UUID' })
  @ApiResponse({ status: 204, description: 'Lot detail deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lot detail not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotDetailsService.remove(id);
  }
}
