import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateShipmentPieceDto,
  UpdateShipmentPieceDto,
} from './dto/create-shipment-piece.dto';
import { ShipmentPiece, Prisma } from '@prisma/client';

@Injectable()
export class ShipmentPiecesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createShipmentPieceDto: CreateShipmentPieceDto,
  ): Promise<ShipmentPiece> {
    // Validate shipment exists
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: createShipmentPieceDto.shipmentId, deletedAt: null },
    });

    if (!shipment) {
      throw new NotFoundException(
        `Shipment with ID ${createShipmentPieceDto.shipmentId} not found`,
      );
    }

    // Validate lot piece exists and has enough quantity
    const lotPiece = await this.prisma.lotPiece.findFirst({
      where: { id: createShipmentPieceDto.lotPieceId, deletedAt: null },
    });

    if (!lotPiece) {
      throw new NotFoundException(
        `Lot piece with ID ${createShipmentPieceDto.lotPieceId} not found`,
      );
    }

    if (lotPiece.quantity < createShipmentPieceDto.quantityShipped) {
      throw new BadRequestException(
        `Insufficient quantity for lot piece ${lotPiece.name}. Available: ${lotPiece.quantity}, Requested: ${createShipmentPieceDto.quantityShipped}`,
      );
    }

    // Check if piece already exists in this shipment
    const existing = await this.prisma.shipmentPiece.findUnique({
      where: {
        shipmentId_lotPieceId: {
          shipmentId: createShipmentPieceDto.shipmentId,
          lotPieceId: createShipmentPieceDto.lotPieceId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `This lot piece is already in the shipment. Use update to change the quantity.`,
      );
    }

    const shipmentPiece = await this.prisma.shipmentPiece.create({
      data: {
        shipmentId: createShipmentPieceDto.shipmentId,
        lotPieceId: createShipmentPieceDto.lotPieceId,
        quantityShipped: createShipmentPieceDto.quantityShipped,
        notes: createShipmentPieceDto.notes,
      },
      include: {
        shipment: true,
        lotPiece: {
          include: {
            lot: true,
          },
        },
      },
    });

    // Update shipment totals
    await this.updateShipmentTotals(createShipmentPieceDto.shipmentId);

    // Update lot piece status to SHIPPED
    await this.prisma.lotPiece.update({
      where: { id: createShipmentPieceDto.lotPieceId },
      data: { status: 'SHIPPED' },
    });

    return shipmentPiece;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ShipmentPieceWhereInput;
    orderBy?: Prisma.ShipmentPieceOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const [shipmentPieces, total] = await Promise.all([
      this.prisma.shipmentPiece.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          shipment: true,
          lotPiece: {
            include: {
              lot: true,
            },
          },
        },
      }),
      this.prisma.shipmentPiece.count({ where }),
    ]);

    return { shipmentPieces, total };
  }

  async findOne(id: string): Promise<ShipmentPiece> {
    const shipmentPiece = await this.prisma.shipmentPiece.findUnique({
      where: { id },
      include: {
        shipment: true,
        lotPiece: {
          include: {
            lot: true,
          },
        },
      },
    });

    if (!shipmentPiece) {
      throw new NotFoundException(`Shipment piece with ID ${id} not found`);
    }

    return shipmentPiece;
  }

  async findByShipmentId(shipmentId: string) {
    const whereClause: Prisma.ShipmentPieceWhereInput = {
      shipmentId,
    };

    const [shipmentPieces, total] = await Promise.all([
      this.prisma.shipmentPiece.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        include: {
          shipment: true,
          lotPiece: {
            include: {
              lot: true,
            },
          },
        },
      }),
      this.prisma.shipmentPiece.count({ where: whereClause }),
    ]);

    return { shipmentPieces, total };
  }

  async update(
    id: string,
    updateShipmentPieceDto: UpdateShipmentPieceDto,
  ): Promise<ShipmentPiece> {
    const shipmentPiece = await this.prisma.shipmentPiece.findUnique({
      where: { id },
      include: { lotPiece: true },
    });

    if (!shipmentPiece) {
      throw new NotFoundException(`Shipment piece with ID ${id} not found`);
    }

    // Validate quantity if being updated
    if (
      updateShipmentPieceDto.quantityShipped &&
      shipmentPiece.lotPiece.quantity < updateShipmentPieceDto.quantityShipped
    ) {
      throw new BadRequestException(
        `Insufficient quantity for lot piece ${shipmentPiece.lotPiece.name}. Available: ${shipmentPiece.lotPiece.quantity}, Requested: ${updateShipmentPieceDto.quantityShipped}`,
      );
    }

    const updated = await this.prisma.shipmentPiece.update({
      where: { id },
      data: updateShipmentPieceDto,
      include: {
        shipment: true,
        lotPiece: {
          include: {
            lot: true,
          },
        },
      },
    });

    // Update shipment totals
    await this.updateShipmentTotals(shipmentPiece.shipmentId);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const shipmentPiece = await this.prisma.shipmentPiece.findUnique({
      where: { id },
    });

    if (!shipmentPiece) {
      throw new NotFoundException(`Shipment piece with ID ${id} not found`);
    }

    await this.prisma.shipmentPiece.delete({
      where: { id },
    });

    // Update shipment totals
    await this.updateShipmentTotals(shipmentPiece.shipmentId);

    // Update lot piece status back to AVAILABLE if not in any other shipment
    const otherShipments = await this.prisma.shipmentPiece.count({
      where: { lotPieceId: shipmentPiece.lotPieceId },
    });

    if (otherShipments === 0) {
      await this.prisma.lotPiece.update({
        where: { id: shipmentPiece.lotPieceId },
        data: { status: 'AVAILABLE' },
      });
    }
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
      (sum, sp) => sum + Number(sp.lotPiece.unitPrice) * sp.quantityShipped,
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
