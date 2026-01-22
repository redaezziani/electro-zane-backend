import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLotArrivalDto } from './dto/update-lot-arrival.dto';
import { LotArrival, Prisma } from '@prisma/client';

@Injectable()
export class LotArrivalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.LotArrivalWhereInput;
    orderBy?: Prisma.LotArrivalOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const whereClause: Prisma.LotArrivalWhereInput = {
      deletedAt: null,
      ...where,
    };

    const [lotArrivals, total] = await Promise.all([
      this.prisma.lotArrival.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          lot: true,
          lotDetail: true,
        },
      }),
      this.prisma.lotArrival.count({ where: whereClause }),
    ]);

    return { lotArrivals, total };
  }

  async findOne(id: string): Promise<LotArrival> {
    const lotArrival = await this.prisma.lotArrival.findFirst({
      where: { id, deletedAt: null },
      include: {
        lot: true,
        lotDetail: true,
      },
    });

    if (!lotArrival) {
      throw new NotFoundException(`Lot arrival with ID ${id} not found`);
    }

    return lotArrival;
  }

  async findByLotId(lotId: string) {
    return this.prisma.lotArrival.findMany({
      where: { lotId, deletedAt: null },
      include: {
        lotDetail: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLotDetailId(lotDetailId: string) {
    return this.prisma.lotArrival.findMany({
      where: { lotDetailId, deletedAt: null },
      include: {
        lot: true,
        lotDetail: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // This is the main method admins use to verify and update arrival data
  async update(id: string, updateLotArrivalDto: UpdateLotArrivalDto): Promise<LotArrival> {
    const lotArrival = await this.prisma.lotArrival.findFirst({
      where: { id, deletedAt: null },
      include: {
        lotDetail: true,
      },
    });

    if (!lotArrival) {
      throw new NotFoundException(`Lot arrival with ID ${id} not found`);
    }

    // Update with verifiedAt timestamp when status changes from PENDING
    const dataToUpdate: any = {
      quantity: updateLotArrivalDto.quantity,
      price: updateLotArrivalDto.price,
      shippingCompany: updateLotArrivalDto.shippingCompany,
      shippingCompanyCity: updateLotArrivalDto.shippingCompanyCity,
      pieceDetails: updateLotArrivalDto.pieceDetails as any,
      status: updateLotArrivalDto.status,
      notes: updateLotArrivalDto.notes,
    };

    // Set verifiedAt when admin updates the arrival
    if (updateLotArrivalDto.status && updateLotArrivalDto.status !== 'PENDING') {
      dataToUpdate.verifiedAt = new Date();
    }

    // Use transaction to update both arrival and lot detail
    return this.prisma.$transaction(async (tx) => {
      // Update the lot arrival
      const updatedArrival = await tx.lotArrival.update({
        where: { id },
        data: dataToUpdate,
        include: {
          lot: true,
          lotDetail: true,
        },
      });

      // Update the linked lot detail's piece details with the verified status
      if (updateLotArrivalDto.status && updateLotArrivalDto.status !== 'PENDING') {
        const lotDetail = lotArrival.lotDetail;
        const arrivalPieceDetails = updateLotArrivalDto.pieceDetails || [];

        // Get the current piece details from lot detail
        const currentPieceDetails = (lotDetail.pieceDetails as any[]) || [];

        // Update piece details statuses based on arrival verification
        const updatedPieceDetails = currentPieceDetails.map((piece: any) => {
          // Find matching piece in arrival
          const arrivalPiece = arrivalPieceDetails.find(
            (ap: any) => ap.name === piece.name,
          );

          if (arrivalPiece) {
            // Update status based on arrival status
            let pieceStatus = 'verified';
            if (updateLotArrivalDto.status === 'DAMAGED') {
              pieceStatus = 'damaged';
            } else if (updateLotArrivalDto.status === 'INCOMPLETE') {
              pieceStatus = 'incomplete';
            } else if (updateLotArrivalDto.status === 'EXCESS') {
              pieceStatus = 'excess';
            }

            return {
              ...piece,
              status: pieceStatus,
            };
          }

          return piece;
        });

        // Update the lot detail with the new piece details
        await tx.lotDetail.update({
          where: { id: lotArrival.lotDetailId },
          data: {
            pieceDetails: updatedPieceDetails as any,
          },
        });
      }

      return updatedArrival;
    });
  }

  async remove(id: string): Promise<void> {
    const lotArrival = await this.prisma.lotArrival.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lotArrival) {
      throw new NotFoundException(`Lot arrival with ID ${id} not found`);
    }

    await this.prisma.lotArrival.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
