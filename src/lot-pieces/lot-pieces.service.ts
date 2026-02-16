import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLotPieceDto,
  UpdateLotPieceDto,
} from './dto/create-lot-piece.dto';
import { LotPiece, Prisma } from '@prisma/client';

@Injectable()
export class LotPiecesService {
  constructor(private prisma: PrismaService) {}

  async create(createLotPieceDto: CreateLotPieceDto): Promise<LotPiece> {
    // Calculate total price
    const totalPrice =
      createLotPieceDto.unitPrice * createLotPieceDto.quantity;

    const piece = await this.prisma.lotPiece.create({
      data: {
        lotId: createLotPieceDto.lotId,
        name: createLotPieceDto.name,
        quantity: createLotPieceDto.quantity,
        unitPrice: createLotPieceDto.unitPrice,
        totalPrice: totalPrice,
        status: createLotPieceDto.status,
        color: createLotPieceDto.color,
        notes: createLotPieceDto.notes,
        metadata: createLotPieceDto.metadata,
      },
      include: {
        lot: true,
      },
    });

    // Update lot totals
    await this.updateLotTotals(createLotPieceDto.lotId);

    return piece;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.LotPieceWhereInput;
    orderBy?: Prisma.LotPieceOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const whereClause: Prisma.LotPieceWhereInput = {
      deletedAt: null,
      ...where,
    };

    const [pieces, total] = await Promise.all([
      this.prisma.lotPiece.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          lot: true,
          shipmentPieces: {
            include: {
              shipment: true,
            },
          },
        },
      }),
      this.prisma.lotPiece.count({ where: whereClause }),
    ]);

    return { pieces, total };
  }

  async findOne(id: string): Promise<LotPiece> {
    const piece = await this.prisma.lotPiece.findFirst({
      where: { id, deletedAt: null },
      include: {
        lot: true,
        shipmentPieces: {
          include: {
            shipment: true,
          },
        },
      },
    });

    if (!piece) {
      throw new NotFoundException(`Lot piece with ID ${id} not found`);
    }

    return piece;
  }

  async findByLotId(lotId: string) {
    const whereClause: Prisma.LotPieceWhereInput = {
      lotId,
      deletedAt: null,
    };

    const [pieces, total] = await Promise.all([
      this.prisma.lotPiece.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        include: {
          lot: true,
          shipmentPieces: {
            include: {
              shipment: true,
            },
          },
        },
      }),
      this.prisma.lotPiece.count({ where: whereClause }),
    ]);

    return { pieces, total };
  }

  async update(
    id: string,
    updateLotPieceDto: UpdateLotPieceDto,
  ): Promise<LotPiece> {
    const piece = await this.prisma.lotPiece.findFirst({
      where: { id, deletedAt: null },
    });

    if (!piece) {
      throw new NotFoundException(`Lot piece with ID ${id} not found`);
    }

    // Recalculate total price if quantity or unitPrice changed
    const quantity = updateLotPieceDto.quantity ?? piece.quantity;
    const unitPrice = updateLotPieceDto.unitPrice ?? piece.unitPrice;
    const totalPrice = Number(unitPrice) * quantity;

    const updated = await this.prisma.lotPiece.update({
      where: { id },
      data: {
        ...updateLotPieceDto,
        totalPrice,
      },
      include: {
        lot: true,
        shipmentPieces: {
          include: {
            shipment: true,
          },
        },
      },
    });

    // Update lot totals
    await this.updateLotTotals(piece.lotId);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const piece = await this.prisma.lotPiece.findFirst({
      where: { id, deletedAt: null },
    });

    if (!piece) {
      throw new NotFoundException(`Lot piece with ID ${id} not found`);
    }

    await this.prisma.lotPiece.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Update lot totals
    await this.updateLotTotals(piece.lotId);
  }

  /**
   * Recalculate and update lot totals based on its pieces
   */
  private async updateLotTotals(lotId: string): Promise<void> {
    const pieces = await this.prisma.lotPiece.findMany({
      where: { lotId, deletedAt: null },
    });

    const totalPrice = pieces.reduce(
      (sum, piece) => sum + Number(piece.totalPrice),
      0,
    );
    const totalQuantity = pieces.reduce(
      (sum, piece) => sum + piece.quantity,
      0,
    );

    await this.prisma.lot.update({
      where: { id: lotId },
      data: {
        totalPrice,
        totalQuantity,
      },
    });
  }
}
