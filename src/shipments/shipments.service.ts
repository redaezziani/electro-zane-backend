import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
} from './dto/create-shipment.dto';
import { Shipment, Prisma } from '@prisma/client';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    // Validate lot pieces exist and have enough quantity
    for (const piece of createShipmentDto.pieces) {
      const lotPiece = await this.prisma.lotPiece.findFirst({
        where: { id: piece.lotPieceId, deletedAt: null },
      });

      if (!lotPiece) {
        throw new NotFoundException(
          `Lot piece with ID ${piece.lotPieceId} not found`,
        );
      }

      if (lotPiece.quantity < piece.quantityShipped) {
        throw new BadRequestException(
          `Insufficient quantity for lot piece ${lotPiece.name}. Available: ${lotPiece.quantity}, Requested: ${piece.quantityShipped}`,
        );
      }
    }

    // Create shipment with pieces
    const shipment = await this.prisma.shipment.create({
      data: {
        shippingCompany: createShipmentDto.shippingCompany,
        shippingCompanyCity: createShipmentDto.shippingCompanyCity,
        trackingNumber: createShipmentDto.trackingNumber,
        estimatedArrival: createShipmentDto.estimatedArrival
          ? new Date(createShipmentDto.estimatedArrival)
          : null,
        notes: createShipmentDto.notes,
        status: createShipmentDto.status,
        pieces: {
          create: createShipmentDto.pieces.map((piece) => ({
            lotPieceId: piece.lotPieceId,
            quantityShipped: piece.quantityShipped,
            notes: piece.notes,
          })),
        },
      },
      include: {
        pieces: {
          include: {
            lotPiece: {
              include: {
                lot: true,
              },
            },
          },
        },
      },
    });

    // Update shipment totals
    await this.updateShipmentTotals(shipment.id);

    // Update lot piece status to SHIPPED
    for (const piece of createShipmentDto.pieces) {
      await this.prisma.lotPiece.update({
        where: { id: piece.lotPieceId },
        data: { status: 'SHIPPED' },
      });
    }

    return this.findOne(shipment.id);
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ShipmentWhereInput;
    orderBy?: Prisma.ShipmentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const whereClause: Prisma.ShipmentWhereInput = {
      deletedAt: null,
      ...where,
    };

    const [shipments, total] = await Promise.all([
      this.prisma.shipment.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          pieces: {
            include: {
              lotPiece: {
                include: {
                  lot: true,
                },
              },
            },
          },
          arrivals: {
            where: { deletedAt: null },
          },
        },
      }),
      this.prisma.shipment.count({ where: whereClause }),
    ]);

    return { shipments, total };
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, deletedAt: null },
      include: {
        pieces: {
          include: {
            lotPiece: {
              include: {
                lot: true,
              },
            },
          },
        },
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  async findByShipmentId(shipmentId: number): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { shipmentId, deletedAt: null },
      include: {
        pieces: {
          include: {
            lotPiece: {
              include: {
                lot: true,
              },
            },
          },
        },
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(
        `Shipment with shipmentId ${shipmentId} not found`,
      );
    }

    return shipment;
  }

  async update(
    id: string,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<Shipment> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    const updateData: any = { ...updateShipmentDto };

    if (updateShipmentDto.estimatedArrival) {
      updateData.estimatedArrival = new Date(updateShipmentDto.estimatedArrival);
    }

    if (updateShipmentDto.actualArrival) {
      updateData.actualArrival = new Date(updateShipmentDto.actualArrival);
    }

    return this.prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        pieces: {
          include: {
            lotPiece: {
              include: {
                lot: true,
              },
            },
          },
        },
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    await this.prisma.shipment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Recalculate and update shipment totals based on its pieces
   */
  private async updateShipmentTotals(shipmentId: string): Promise<void> {
    const shipmentPieces = await this.prisma.shipmentPiece.findMany({
      where: { shipmentId },
      include: {
        lotPiece: true,
      },
    });

    const totalPieces = shipmentPieces.reduce(
      (sum, sp) => sum + sp.quantityShipped,
      0,
    );

    const totalValue = shipmentPieces.reduce(
      (sum, sp) =>
        sum + Number(sp.lotPiece.unitPrice) * sp.quantityShipped,
      0,
    );

    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        totalPieces,
        totalValue,
      },
    });
  }
}
