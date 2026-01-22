import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PublicCategoryDto } from '../dto/public-category.dto';

@Injectable()
export class PublicCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<PublicCategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    }));
  }
}
