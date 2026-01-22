import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { QueryOrderDto } from './dto/query-order.dto';
import { PdfService } from 'src/common/services/pdf.service';
import { PaymentService } from 'src/payments/payments.service';
import { CreatePaymentDto } from 'src/payments/dto/create-payment.dto';
import * as fs from 'fs';
import * as path from 'path';
import { console } from 'inspector';
import { Logger } from '@nestjs/common';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { PaymentStatus } from '@prisma/client';
import { ActivityLoggerService, ActivityAction } from '../common/logger/activity-logger.service';
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private paymentService: PaymentService,
    private activityLogger: ActivityLoggerService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
  async create(
    createOrderDto: CreateOrderDto,
    createdById?: string,
  ): Promise<OrderResponseDto & { payment?: any }> {
    const orderNumber = await this.generateOrderNumber();

    // Batch fetch SKUs and include necessary relations
    const skuIds = createOrderDto.items.map((i) => i.skuId);
    const skus = await this.prisma.productSKU.findMany({
      where: { id: { in: skuIds } },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (skus.length !== skuIds.length) {
      const foundIds = skus.map((s) => s.id);
      const missingIds = skuIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`SKU(s) not found: ${missingIds.join(', ')}`);
    }

    // Validate stock availability
    for (const item of createOrderDto.items) {
      const sku = skus.find((s) => s.id === item.skuId)!;
      if (sku.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${sku.variant.product.name} (${sku.sku}). Available: ${sku.stock}, Requested: ${item.quantity}`
        );
      }
    }

    let subtotal = new Decimal(0);

    const itemsData = createOrderDto.items.map((item: OrderItemDto) => {
      const sku = skus.find((s) => s.id === item.skuId)!;
      const unitPrice = new Decimal(sku.price.toString());
      const totalPrice = unitPrice.mul(item.quantity);
      subtotal = subtotal.plus(totalPrice);

      return {
        skuId: sku.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productName: sku.variant.product.name,
        skuCode: sku.sku,
      };
    });

    // Placeholder: calculate tax, shipping, discounts as needed
    const taxAmount = new Decimal(0);
    const shippingAmount = new Decimal(0);
    const discountAmount = new Decimal(0);
    const totalAmount = subtotal
      .plus(taxAmount)
      .plus(shippingAmount)
      .minus(discountAmount);

    // Create the order and decrement stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          createdById: createdById ?? null,
          confirmedById: createdById ?? null, // Initially confirmed by the creator
          confirmedAt: new Date(), // Set confirmation time
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount,
          totalAmount,
          currency: 'USD',
          language: createOrderDto.language || 'en', // Store the language
          customerName: createOrderDto.customerName,
          customerPhone: createOrderDto.customerPhone,
          customerEmail: createOrderDto.customerEmail ?? null,
          customerAddress: createOrderDto.customerAddress ?? undefined,
          notes: createOrderDto.notes ?? null,
          trackingNumber: createOrderDto.trackingNumber ?? null,
          deliveryLat: createOrderDto.deliveryLat ?? null,
          deliveryLng: createOrderDto.deliveryLng ?? null,
          deliveryPlace: createOrderDto.deliveryPlace ?? null,
          invoiceUrl: '',
          invoiceFileId: '',
          items: { create: itemsData },
        },
        include: {
          items: true,
          confirmedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Decrement stock for each SKU
      for (const item of createOrderDto.items) {
        await tx.productSKU.update({
          where: { id: item.skuId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    // Generate PDF with language support
    const { url, fileId } = await this.pdfService.generateOrderPdf(
      {
        ...order,
        items: order.items.map((i) => ({
          ...i,
          name: i.productName,
          quantity: i.quantity,
          totalPrice: i.totalPrice.toNumber(),
        })),
      },
      (createOrderDto.language as any) || 'en',
    );

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        invoiceUrl: url,
        invoiceFileId: fileId,
        status: 'DELIVERED', // Set status to DELIVERED since moderator is placing the order
        paymentStatus: 'COMPLETED', // Set payment status to COMPLETED
        deliveredAt: new Date(), // Set delivery timestamp
      },
      include: {
        items: true,
        confirmedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create cash payment
    if (createOrderDto.method) {
      const paymentDto: CreatePaymentDto = {
        method: createOrderDto.method,
        orderId: updatedOrder.id,
        amount: totalAmount.toNumber(),
        currency: 'USD',
        processedById: createdById,
      };

      const payment = await this.paymentService.createPayment(paymentDto);

      // Log activity
      await this.logOrderActivity(
        ActivityAction.CREATE,
        updatedOrder,
        createdById,
        `Created order ${updatedOrder.orderNumber} for ${updatedOrder.customerName}`,
      );

      return { ...this.formatOrderResponse(updatedOrder), payment };
    }

    // Log activity
    await this.logOrderActivity(
      ActivityAction.CREATE,
      updatedOrder,
      createdById,
      `Created order ${updatedOrder.orderNumber} for ${updatedOrder.customerName}`,
    );

    return {
      ...this.formatOrderResponse(updatedOrder),
    };
  }

  async findAll(query: QueryOrderDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              sku: {
                include: {
                  images: true,
                },
              },
            },
          },
          createdBy: true,
          confirmedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders.map(this.formatOrderResponse),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        confirmedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return this.formatOrderResponse(order);
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<OrderResponseDto> {
    // 1. Fetch existing order with items
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const data: any = { ...updateOrderDto };

    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      const skuIds = updateOrderDto.items.map((i) => i.skuId);
      const skus = await this.prisma.productSKU.findMany({
        where: { id: { in: skuIds } },
        include: { variant: { include: { product: true } } },
      });

      if (skus.length !== skuIds.length) {
        const foundIds = skus.map((s) => s.id);
        const missingIds = skuIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `SKU(s) not found: ${missingIds.join(', ')}`,
        );
      }

      // Validate stock availability for new items
      for (const item of updateOrderDto.items) {
        const sku = skus.find((s) => s.id === item.skuId)!;

        // Calculate the net change in quantity for this SKU
        const oldItem = order.items.find((i) => i.skuId === item.skuId);
        const oldQuantity = oldItem ? oldItem.quantity : 0;
        const quantityDifference = item.quantity - oldQuantity;

        // If we're adding more stock, check if it's available
        if (quantityDifference > 0 && sku.stock < quantityDifference) {
          throw new BadRequestException(
            `Insufficient stock for ${sku.variant.product.name} (${sku.sku}). Available: ${sku.stock}, Needed: ${quantityDifference} more`
          );
        }
      }

      let subtotal = new Decimal(0);

      const itemsData = updateOrderDto.items.map((item) => {
        const sku = skus.find((s) => s.id === item.skuId)!;
        const unitPrice = new Decimal(sku.price.toString());
        const totalPrice = unitPrice.mul(item.quantity);
        subtotal = subtotal.plus(totalPrice);

        return {
          skuId: sku.id,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          productName: sku.variant.product.name,
          skuCode: sku.sku,
        };
      });

      // Placeholder: recalc tax, shipping, discount if needed
      const taxAmount = order.taxAmount;
      const shippingAmount = order.shippingAmount;
      const discountAmount = order.discountAmount;
      const totalAmount = subtotal
        .plus(taxAmount)
        .plus(shippingAmount)
        .minus(discountAmount);

      data.subtotal = subtotal;
      data.totalAmount = totalAmount;

      // Update items and adjust stock in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Restore stock for old items
        for (const oldItem of order.items) {
          await tx.productSKU.update({
            where: { id: oldItem.skuId },
            data: {
              stock: {
                increment: oldItem.quantity,
              },
            },
          });
        }

        // Delete old items
        await tx.orderItem.deleteMany({ where: { orderId: id } });

        // Decrement stock for new items
        if (updateOrderDto.items) {
          for (const item of updateOrderDto.items) {
            await tx.productSKU.update({
              where: { id: item.skuId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      });

      data.items = { create: itemsData };
    }

    // 4. Update order
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });
    // lets delete old invoice and generate a new one
    if (order.invoiceFileId) {
      try {
        // Delete local PDF file instead of ImageKit
        const pdfPath = path.resolve(
          process.cwd(),
          'public/pdfs/orders',
          order.invoiceFileId,
        );
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          console.log(`✅ Deleted old PDF: ${pdfPath}`);
        }
      } catch (error) {
        console.error('Error deleting old PDF:', error);
      }
    }
    const { url, fileId } = await this.pdfService.generateOrderPdf(
      {
        ...updatedOrder,
        items: updatedOrder.items.map((i) => ({
          ...i,
          name: i.productName,
          quantity: i.quantity,
          totalPrice: i.totalPrice.toNumber(),
        })),
      },
      (updateOrderDto.language as any) || updatedOrder.language || 'en',
    );
    const finalOrder = await this.prisma.order.update({
      where: { id: updatedOrder.id },
      data: { invoiceUrl: url, invoiceFileId: fileId },
      include: { items: true },
    });

    // Log activity
    await this.logOrderActivity(
      ActivityAction.UPDATE,
      finalOrder,
      userId,
      `Updated order ${finalOrder.orderNumber}`,
    );

    return this.formatOrderResponse(finalOrder);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Log activity before deletion
    await this.logOrderActivity(
      ActivityAction.DELETE,
      order,
      userId,
      `Deleted order ${order.orderNumber}`,
    );

    // Restore stock and delete order in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Restore stock for each item (only if order wasn't cancelled, as cancelled orders already restored stock)
      if (order.status !== 'CANCELLED') {
        for (const item of order.items) {
          await tx.productSKU.update({
            where: { id: item.skuId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Delete the order
      await tx.order.delete({ where: { id } });
    });

    // Delete local PDF file if exists
    if (order.invoiceFileId) {
      try {
        const pdfPath = path.resolve(
          process.cwd(),
          'public/pdfs/orders',
          order.invoiceFileId,
        );
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          console.log(`✅ Deleted PDF: ${pdfPath}`);
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }
  }

  async cancelOrder(dto: CancelOrderDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        payments: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is already cancelled
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Cancel related payments (if any)
      for (const payment of order.payments) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.CANCELLED },
        });
      }

      // Restore stock for each item
      for (const item of order.items) {
        await tx.productSKU.update({
          where: { id: item.skuId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      return tx.order.update({
        where: { id: dto.orderId },
        data: {
          status: 'CANCELLED',
          notes: dto.reason ? `${order.notes ?? ''}\nCancellation reason: ${dto.reason}`.trim() : order.notes,
        },
        include: { items: true },
      });
    });

    // Log activity
    await this.logOrderActivity(
      ActivityAction.CANCEL,
      result,
      userId,
      `Cancelled order ${result.orderNumber}${dto.reason ? `. Reason: ${dto.reason}` : ''}`,
    );

    return result;
  }

  async refundOrder(dto: CancelOrderDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        payments: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is already refunded
    if (order.status === 'REFUNDED') {
      throw new BadRequestException('Order is already refunded');
    }

    // Check if order is cancelled
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot refund a cancelled order');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Refund related payments (if any)
      for (const payment of order.payments) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      // Restore stock for each item
      for (const item of order.items) {
        await tx.productSKU.update({
          where: { id: item.skuId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status and payment status
      return tx.order.update({
        where: { id: dto.orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
          notes: dto.reason ? `${order.notes ?? ''}\nRefund reason: ${dto.reason}`.trim() : order.notes,
        },
        include: { items: true },
      });
    });

    // Log activity
    await this.logOrderActivity(
      ActivityAction.REFUND,
      result,
      userId,
      `Refunded order ${result.orderNumber}${dto.reason ? `. Reason: ${dto.reason}` : ''}`,
    );

    return result;
  }

  private formatOrderResponse(order: any): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      createdById: order.createdById,
      confirmedById: order.confirmedById,
      confirmedBy: order.confirmedBy || undefined,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      shippingAmount: order.shippingAmount.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      currency: order.currency,
      language: order.language,
      invoiceUrl: order.invoiceUrl,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      customerAddress: order.customerAddress,
      deliveryLat: order.deliveryLat ?? null,
      deliveryLng: order.deliveryLng ?? null,
      deliveryPlace: order.deliveryPlace ?? null,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      confirmedAt: order.confirmedAt,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      items: order.items.map((item) => ({
        skuId: item.skuId,
        productName: item.productName,
        skuCode: item.skuCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
    };
  }

  /**
   * Helper method to log order activities
   */
  private async logOrderActivity(
    action: ActivityAction,
    order: any,
    userId?: string,
    description?: string,
  ): Promise<void> {
    let user: { id: string; name: string | null; email: string; role: any } | null = null;
    if (userId) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    this.activityLogger.logActivity({
      userId: user?.id,
      userName: user?.name || undefined,
      userEmail: user?.email,
      userRole: user?.role,
      action,
      entity: 'Order',
      entityId: order.id,
      description: description || `${action} order ${order.orderNumber}`,
      metadata: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount?.toNumber ? order.totalAmount.toNumber() : order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemsCount: order.items?.length || 0,
      },
    });
  }
}
