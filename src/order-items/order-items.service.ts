import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { QueryOrderItemDto } from './dto/query-order-item.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    const item = await this.prisma.orderItem.create({ data: dto });
    return this.format(item);
  }

  async findAll(query: QueryOrderItemDto) {
    const {
      page = 1,
      limit = 10,
      orderId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (orderId) where.orderId = orderId;

    const [items, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
          sku: {
            select: {
              id: true,
              sku: true,
              variant: {
                select: {
                  product: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.orderItem.count({ where }),
    ]);

    return {
      data: items.map(this.format),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<OrderItemResponseDto> {
    const item = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Order item not found');
    return this.format(item);
  }

  async update(
    id: string,
    dto: UpdateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    const item = await this.prisma.orderItem.update({
      where: { id },
      data: dto,
    });
    return this.format(item);
  }

  async remove(id: string): Promise<void> {
    // First, get the order item to retrieve the quantity and skuId
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
      include: {
        sku: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // Return the quantity back to stock
    const sku = orderItem.sku;
    const previousStock = sku.stock;
    const newStock = previousStock + orderItem.quantity;

    // Update the SKU stock and create inventory movement in a transaction
    await this.prisma.$transaction([
      // Update SKU stock
      this.prisma.productSKU.update({
        where: { id: orderItem.skuId },
        data: { stock: newStock },
      }),
      // Create inventory movement record
      this.prisma.inventoryMovement.create({
        data: {
          skuId: orderItem.skuId,
          type: 'IN',
          quantity: orderItem.quantity,
          reason: 'Order item deleted',
          reference: orderItem.orderId,
          previousStock: previousStock,
          newStock: newStock,
        },
      }),
      // Delete the order item
      this.prisma.orderItem.delete({ where: { id } }),
    ]);
  }

  private format(item: any): OrderItemResponseDto {
    return {
      id: item.id,
      orderId: item.orderId,
      orderNumber: item.order?.orderNumber,
      skuId: item.skuId,
      skuCode: item.sku?.sku ?? item.skuCode,
      productName: item.sku?.variant?.product?.name ?? item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber?.() ?? item.unitPrice,
      totalPrice: item.totalPrice.toNumber?.() ?? item.totalPrice,
    };
  }
}
