import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotArrivalDto, UpdateLotArrivalDto } from './dto/update-lot-arrival.dto';
import { LotArrival, Prisma } from '@prisma/client';

@Injectable()
export class LotArrivalsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new lot arrival record when a shipment arrives
   */
  async create(createLotArrivalDto: CreateLotArrivalDto): Promise<LotArrival> {
    // Validate shipment exists
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: createLotArrivalDto.shipmentId, deletedAt: null },
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

    if (!shipment) {
      throw new NotFoundException(
        `Shipment with ID ${createLotArrivalDto.shipmentId} not found`,
      );
    }

    // Get the lot ID (assume all pieces in shipment belong to same lot for simplicity)
    // Or you could create multiple arrivals for different lots
    const lotId = shipment.pieces[0]?.lotPiece?.lotId;

    if (!lotId) {
      throw new NotFoundException('No lot found for this shipment');
    }

    return this.prisma.lotArrival.create({
      data: {
        lotId,
        shipmentId: createLotArrivalDto.shipmentId,
        quantity: createLotArrivalDto.quantity,
        totalValue: createLotArrivalDto.totalValue,
        shippingCompany: createLotArrivalDto.shippingCompany,
        shippingCompanyCity: createLotArrivalDto.shippingCompanyCity,
        pieceDetails: createLotArrivalDto.pieceDetails as any,
        status: createLotArrivalDto.status || 'PENDING',
        notes: createLotArrivalDto.notes,
        verifiedBy: createLotArrivalDto.verifiedBy,
      },
      include: {
        lot: true,
        shipment: {
          include: {
            pieces: {
              include: {
                lotPiece: true,
              },
            },
          },
        },
      },
    });
  }

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
          shipment: {
            include: {
              pieces: {
                include: {
                  lotPiece: true,
                },
              },
            },
          },
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
        shipment: {
          include: {
            pieces: {
              include: {
                lotPiece: true,
              },
            },
          },
        },
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
        shipment: {
          include: {
            pieces: {
              include: {
                lotPiece: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByShipmentId(shipmentId: string) {
    return this.prisma.lotArrival.findMany({
      where: { shipmentId, deletedAt: null },
      include: {
        lot: true,
        shipment: {
          include: {
            pieces: {
              include: {
                lotPiece: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // This is the main method admins use to verify and update arrival data
  async update(
    id: string,
    updateLotArrivalDto: UpdateLotArrivalDto,
  ): Promise<LotArrival> {
    const lotArrival = await this.prisma.lotArrival.findFirst({
      where: { id, deletedAt: null },
      include: {
        shipment: {
          include: {
            pieces: {
              include: {
                lotPiece: true,
              },
            },
          },
        },
      },
    });

    if (!lotArrival) {
      throw new NotFoundException(`Lot arrival with ID ${id} not found`);
    }

    // Update with verifiedAt timestamp when status changes from PENDING
    const dataToUpdate: any = {
      quantity: updateLotArrivalDto.quantity,
      totalValue: updateLotArrivalDto.totalValue,
      shippingCompany: updateLotArrivalDto.shippingCompany,
      shippingCompanyCity: updateLotArrivalDto.shippingCompanyCity,
      pieceDetails: updateLotArrivalDto.pieceDetails as any,
      status: updateLotArrivalDto.status,
      notes: updateLotArrivalDto.notes,
      verifiedBy: updateLotArrivalDto.verifiedBy,
    };

    // Set verifiedAt when admin updates the arrival
    if (
      updateLotArrivalDto.status &&
      updateLotArrivalDto.status !== 'PENDING'
    ) {
      dataToUpdate.verifiedAt = new Date();
    }

    // Update the lot arrival and update lot piece statuses
    return this.prisma.$transaction(async (tx) => {
      const updatedArrival = await tx.lotArrival.update({
        where: { id },
        data: dataToUpdate,
        include: {
          lot: true,
          shipment: {
            include: {
              pieces: {
                include: {
                  lotPiece: true,
                },
              },
            },
          },
        },
      });

      // Update lot piece statuses based on arrival verification
      if (
        updateLotArrivalDto.status &&
        updateLotArrivalDto.status !== 'PENDING'
      ) {
        const arrivalPieceDetails =
          (updateLotArrivalDto.pieceDetails as any[]) || [];

        for (const shipmentPiece of lotArrival.shipment.pieces) {
          // Find matching piece in arrival details
          const arrivalPiece = arrivalPieceDetails.find(
            (ap: any) => ap.name === shipmentPiece.lotPiece.name,
          );

          if (arrivalPiece) {
            // Determine status based on arrival status
            let pieceStatus = 'ARRIVED';
            if (updateLotArrivalDto.status === 'DAMAGED') {
              pieceStatus = 'DAMAGED';
            } else if (updateLotArrivalDto.status === 'INCOMPLETE') {
              pieceStatus = 'AVAILABLE'; // Partially arrived
            } else if (updateLotArrivalDto.status === 'VERIFIED') {
              pieceStatus = 'ARRIVED';
            }

            // Update lot piece status
            await tx.lotPiece.update({
              where: { id: shipmentPiece.lotPieceId },
              data: { status: pieceStatus as any },
            });
          }
        }

        // Update shipment status to ARRIVED
        await tx.shipment.update({
          where: { id: lotArrival.shipmentId },
          data: {
            status: 'ARRIVED',
            actualArrival: new Date(),
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
