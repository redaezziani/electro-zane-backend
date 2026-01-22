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
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

import { OrderResponseDto } from './dto/order-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderSortBy, QueryOrderDto, SortOrder } from './dto/query-order.dto';
import { PaginatedOrdersResponseDto } from './dto/response.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { UserRole } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions(Permission.ORDER_CREATE)
  @ApiOperation({ summary: 'Create a new order (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Get()
  @Permissions(Permission.ORDER_READ_ALL)
  @ApiOperation({ summary: 'Get all orders with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by order number, customer name, or customer phone',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sortBy', enum: OrderSortBy, required: false })
  @ApiQuery({ name: 'sortOrder', enum: SortOrder, required: false })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: PaginatedOrdersResponseDto,
  })
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Permissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'Get an order by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.ORDER_UPDATE)
  @ApiOperation({ summary: 'Update an order (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req,
  ) {
    return this.ordersService.update(id, updateOrderDto, req.user.userId);
  }

  @Delete(':id')
  @Permissions(Permission.ORDER_DELETE)
  @ApiOperation({ summary: 'Delete an order (Admin only)' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.ordersService.remove(id, req.user.userId);
  }

  @Post('cancel')
  @Permissions(Permission.ORDER_CANCEL)
  @ApiOperation({ summary: 'Cancel an order (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(@Body() dto: CancelOrderDto, @Request() req) {
    return this.ordersService.cancelOrder(dto, req.user.userId);
  }

  @Post('refund')
  // @Permissions(Permission.REFUND)
  @ApiOperation({ summary: 'Refund an order (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order refunded successfully' })
  async refundOrder(@Body() dto: CancelOrderDto, @Request() req) {
    return this.ordersService.refundOrder(dto, req.user.userId);
  }
}
