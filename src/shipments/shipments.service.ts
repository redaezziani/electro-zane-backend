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
import { LotArrivalsService } from '../lot-arrivals/lot-arrivals.service';
import { Shipment, Prisma } from '@prisma/client';

@Injectable()
export class ShipmentsService {
  constructor(
    private prisma: PrismaService,
    private lotArrivalsService: LotArrivalsService,
  ) {}

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    // Validate lot pieces exist and have enough remaining quantity
    for (const piece of createShipmentDto.pieces) {
      const lotPiece = await this.prisma.lotPiece.findFirst({
        where: { id: piece.lotPieceId, deletedAt: null },
        include: { shipmentPieces: true },
      });

      if (!lotPiece) {
        throw new NotFoundException(
          `Lot piece with ID ${piece.lotPieceId} not found`,
        );
      }

      const alreadyShipped = lotPiece.shipmentPieces.reduce(
        (sum, sp) => sum + sp.quantityShipped,
        0,
      );
      const availableQuantity = lotPiece.quantity - alreadyShipped;

      if (availableQuantity < piece.quantityShipped) {
        throw new BadRequestException(
          `Insufficient quantity for lot piece ${lotPiece.name}. Available: ${availableQuantity}, Requested: ${piece.quantityShipped}`,
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

    // Update lot piece status: only mark SHIPPED if all quantity is now in shipments
    for (const piece of createShipmentDto.pieces) {
      const lotPiece = await this.prisma.lotPiece.findFirst({
        where: { id: piece.lotPieceId },
        include: { shipmentPieces: true },
      });

      if (lotPiece) {
        const totalShipped = lotPiece.shipmentPieces.reduce(
          (sum, sp) => sum + sp.quantityShipped,
          0,
        );
        const newStatus = totalShipped >= lotPiece.quantity ? 'SHIPPED' : 'AVAILABLE';
        await this.prisma.lotPiece.update({
          where: { id: piece.lotPieceId },
          data: { status: newStatus },
        });
      }
    }

    // Auto-create a pending LotArrival for this shipment
    const totalQty = shipment.pieces.reduce(
      (sum, sp) => sum + sp.quantityShipped,
      0,
    );
    const totalValue = shipment.pieces.reduce(
      (sum, sp) => sum + Number(sp.lotPiece.unitPrice) * sp.quantityShipped,
      0,
    );
    const pieceDetails = shipment.pieces.map((sp) => ({
      name: sp.lotPiece.name,
      quantityExpected: sp.quantityShipped,
      quantityReceived: sp.quantityShipped,
      status: 'pending',
    }));

    await this.lotArrivalsService.create({
      shipmentId: shipment.id,
      quantity: totalQty,
      totalValue,
      shippingCompany: createShipmentDto.shippingCompany,
      shippingCompanyCity: createShipmentDto.shippingCompanyCity ?? '',
      pieceDetails,
      status: undefined,
      notes: createShipmentDto.notes,
      verifiedBy: undefined,
    });

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
      include: {
        pieces: {
          include: { lotPiece: true },
        },
        arrivals: { where: { deletedAt: null } },
      },
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

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        pieces: {
          include: {
            lotPiece: {
              include: { lot: true },
            },
          },
        },
        arrivals: { where: { deletedAt: null } },
      },
    });

    // Auto-create a LotArrival when shipment is first marked as ARRIVED
    const becomingArrived =
      updateShipmentDto.status === 'ARRIVED' &&
      shipment.status !== 'ARRIVED' &&
      shipment.arrivals.length === 0;

    if (becomingArrived && shipment.pieces.length > 0) {
      const totalQty = shipment.pieces.reduce(
        (sum, sp) => sum + sp.quantityShipped,
        0,
      );
      const totalValue = shipment.pieces.reduce(
        (sum, sp) => sum + Number(sp.lotPiece.unitPrice) * sp.quantityShipped,
        0,
      );
      const pieceDetails = shipment.pieces.map((sp) => ({
        name: sp.lotPiece.name,
        quantityExpected: sp.quantityShipped,
        quantityReceived: sp.quantityShipped,
        status: 'pending',
      }));

      await this.lotArrivalsService.create({
        shipmentId: id,
        quantity: totalQty,
        totalValue,
        shippingCompany: shipment.shippingCompany,
        shippingCompanyCity: shipment.shippingCompanyCity ?? '',
        pieceDetails,
        status: undefined,
        notes: undefined,
        verifiedBy: undefined,
      });
    }

    // Sync shared fields to related LotArrivals
    const arrivalSync: Record<string, any> = {};
    if (updateShipmentDto.shippingCompany !== undefined)
      arrivalSync.shippingCompany = updateShipmentDto.shippingCompany;
    if (updateShipmentDto.shippingCompanyCity !== undefined)
      arrivalSync.shippingCompanyCity = updateShipmentDto.shippingCompanyCity;
    if (updateShipmentDto.notes !== undefined)
      arrivalSync.notes = updateShipmentDto.notes;

    if (Object.keys(arrivalSync).length > 0) {
      await this.prisma.lotArrival.updateMany({
        where: { shipmentId: id, deletedAt: null },
        data: arrivalSync,
      });
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.lotArrival.updateMany({
        where: { shipmentId: id, deletedAt: null },
        data: { deletedAt: now },
      }),
      this.prisma.shipment.update({
        where: { id },
        data: { deletedAt: now },
      }),
    ]);
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
