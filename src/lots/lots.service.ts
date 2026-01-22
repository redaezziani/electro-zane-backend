import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotDto, UpdateLotDto } from './dto/create-lot.dto';
import { Lot, Prisma } from '@prisma/client';

@Injectable()
export class LotsService {
  constructor(private prisma: PrismaService) {}

  async create(createLotDto: CreateLotDto): Promise<Lot> {
    return this.prisma.lot.create({
      data: {
        totalPrice: createLotDto.totalPrice,
        totalQuantity: createLotDto.totalQuantity,
        companyName: createLotDto.companyName,
        companyCity: createLotDto.companyCity,
        notes: createLotDto.notes,
        status: createLotDto.status,
      },
      include: {
        details: true,
        arrivals: true,
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.LotWhereInput;
    orderBy?: Prisma.LotOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const whereClause: Prisma.LotWhereInput = {
      deletedAt: null,
      ...where,
    };

    const [lots, total] = await Promise.all([
      this.prisma.lot.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          details: {
            where: { deletedAt: null },
          },
          arrivals: {
            where: { deletedAt: null },
          },
        },
      }),
      this.prisma.lot.count({ where: whereClause }),
    ]);

    return { lots, total };
  }

  async findOne(id: string): Promise<Lot> {
    const lot = await this.prisma.lot.findFirst({
      where: { id, deletedAt: null },
      include: {
        details: {
          where: { deletedAt: null },
          include: {
            arrivals: {
              where: { deletedAt: null },
            },
          },
        },
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });

    if (!lot) {
      throw new NotFoundException(`Lot with ID ${id} not found`);
    }

    return lot;
  }

  async findByLotId(lotId: number): Promise<Lot> {
    const lot = await this.prisma.lot.findFirst({
      where: { lotId, deletedAt: null },
      include: {
        details: {
          where: { deletedAt: null },
          include: {
            arrivals: {
              where: { deletedAt: null },
            },
          },
        },
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });

    if (!lot) {
      throw new NotFoundException(`Lot with lotId ${lotId} not found`);
    }

    return lot;
  }

  async update(id: string, updateLotDto: UpdateLotDto): Promise<Lot> {
    const lot = await this.prisma.lot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lot) {
      throw new NotFoundException(`Lot with ID ${id} not found`);
    }

    return this.prisma.lot.update({
      where: { id },
      data: updateLotDto,
      include: {
        details: {
          where: { deletedAt: null },
        },
        arrivals: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const lot = await this.prisma.lot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lot) {
      throw new NotFoundException(`Lot with ID ${id} not found`);
    }

    await this.prisma.lot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
