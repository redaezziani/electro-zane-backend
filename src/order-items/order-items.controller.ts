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
} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { QueryOrderItemDto } from './dto/query-order-item.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Order Items')
@Controller('order-items')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class OrderItemsController {
  constructor(private readonly service: OrderItemsService) {}

  @Post()
  @Permissions(Permission.ORDER_CREATE)
  @ApiOperation({ summary: 'Create a new order item' })
  @ApiResponse({ status: 201, type: OrderItemResponseDto })
  create(@Body() dto: CreateOrderItemDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions(Permission.ORDER_READ_ALL)
  @ApiOperation({ summary: 'Get all order items with pagination' })
  findAll(@Query() query: QueryOrderItemDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'Get an order item by ID' })
  @ApiResponse({ status: 200, type: OrderItemResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.ORDER_UPDATE)
  @ApiOperation({ summary: 'Update an order item' })
  @ApiResponse({ status: 200, type: OrderItemResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateOrderItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.ORDER_DELETE)
  @ApiOperation({ summary: 'Delete an order item' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
