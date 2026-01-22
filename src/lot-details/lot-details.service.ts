import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDetailDto, UpdateLotDetailDto } from './dto/create-lot-detail.dto';
import { LotDetail, Prisma, ArrivalStatus } from '@prisma/client';

@Injectable()
export class LotDetailsService {
  constructor(private prisma: PrismaService) {}

  async create(createLotDetailDto: CreateLotDetailDto): Promise<LotDetail> {
    // Verify lot exists
    const lot = await this.prisma.lot.findFirst({
      where: { id: createLotDetailDto.lotId, deletedAt: null },
    });

    if (!lot) {
      throw new NotFoundException(`Lot with ID ${createLotDetailDto.lotId} not found`);
    }

    // Create the lot detail and automatically create a corresponding lot arrival
    const lotDetail = await this.prisma.lotDetail.create({
      data: {
        lotId: createLotDetailDto.lotId,
        quantity: createLotDetailDto.quantity,
        price: createLotDetailDto.price,
        shippingCompany: createLotDetailDto.shippingCompany,
        shippingCompanyCity: createLotDetailDto.shippingCompanyCity,
        pieceDetails: createLotDetailDto.pieceDetails as any,
        notes: createLotDetailDto.notes,
      },
      include: {
        arrivals: true,
      },
    });

    // AUTO-CREATE LotArrival with same data (PENDING status)
    await this.prisma.lotArrival.create({
      data: {
        lotId: createLotDetailDto.lotId,
        lotDetailId: lotDetail.id,
        quantity: createLotDetailDto.quantity,
        price: createLotDetailDto.price,
        shippingCompany: createLotDetailDto.shippingCompany,
        shippingCompanyCity: createLotDetailDto.shippingCompanyCity,
        pieceDetails: createLotDetailDto.pieceDetails as any,
        status: ArrivalStatus.PENDING,
        notes: 'Auto-created from lot detail',
      },
    });

    // Return the lot detail with the newly created arrival
    const result = await this.prisma.lotDetail.findUnique({
      where: { id: lotDetail.id },
      include: {
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Lot detail with ID ${lotDetail.id} not found`);
    }

    return result;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.LotDetailWhereInput;
    orderBy?: Prisma.LotDetailOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const whereClause: Prisma.LotDetailWhereInput = {
      deletedAt: null,
      ...where,
    };

    const [lotDetails, total] = await Promise.all([
      this.prisma.lotDetail.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          lot: true,
          arrivals: {
            where: { deletedAt: null },
          },
        },
      }),
      this.prisma.lotDetail.count({ where: whereClause }),
    ]);

    return { lotDetails, total };
  }

  async findOne(id: string): Promise<LotDetail> {
    const lotDetail = await this.prisma.lotDetail.findFirst({
      where: { id, deletedAt: null },
      include: {
        lot: true,
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });

    if (!lotDetail) {
      throw new NotFoundException(`Lot detail with ID ${id} not found`);
    }

    return lotDetail;
  }

  async findByLotId(lotId: string) {
    return this.prisma.lotDetail.findMany({
      where: { lotId, deletedAt: null },
      include: {
        arrivals: {
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateLotDetailDto: UpdateLotDetailDto): Promise<LotDetail> {
    const lotDetail = await this.prisma.lotDetail.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lotDetail) {
      throw new NotFoundException(`Lot detail with ID ${id} not found`);
    }

    return this.prisma.lotDetail.update({
      where: { id },
      data: {
        quantity: updateLotDetailDto.quantity,
        price: updateLotDetailDto.price,
        shippingCompany: updateLotDetailDto.shippingCompany,
        shippingCompanyCity: updateLotDetailDto.shippingCompanyCity,
        pieceDetails: updateLotDetailDto.pieceDetails as any,
        notes: updateLotDetailDto.notes,
      },
      include: {
        lot: true,
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const lotDetail = await this.prisma.lotDetail.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lotDetail) {
      throw new NotFoundException(`Lot detail with ID ${id} not found`);
    }

    await this.prisma.lotDetail.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
