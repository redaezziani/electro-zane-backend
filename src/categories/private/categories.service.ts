import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/response.dto';
@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.category.findFirst({
        where: {
          slug: uniqueSlug,
          id: excludeId ? { not: excludeId } : undefined,
          deletedAt: null,
        },
      });

      if (!existing) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);
    const uniqueSlug = await this.ensureUniqueSlug(slug);

    // Check if parent exists
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: {
          id: createCategoryDto.parentId,
          deletedAt: null,
        },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: uniqueSlug,
        description: createCategoryDto.description,
        info: createCategoryDto.info,
        parentId: createCategoryDto.parentId,
        isActive: createCategoryDto.isActive ?? true,
        sortOrder: createCategoryDto.sortOrder ?? 0,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    return this.formatCategoryResponse(category);
  }

  async findAll(includeChildren = false, includeProductCount = false): Promise<CategoryResponseDto[]> {
    const include: any = {};

    if (includeChildren) {
      include.children = {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      };
    }

    if (includeProductCount) {
      include._count = {
        select: {
          products: {
            where: { deletedAt: null },
          },
        },
      };
    }

    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null },
      include,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map(category => this.formatCategoryResponse(category));
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategoryResponse(category);
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategoryResponse(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let uniqueSlug: string | undefined;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const slug = this.generateSlug(updateCategoryDto.name);
      uniqueSlug = await this.ensureUniqueSlug(slug, id);
    }

    // Check if parent exists and prevent circular references
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.prisma.category.findFirst({
        where: {
          id: updateCategoryDto.parentId,
          deletedAt: null,
        },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      // Check for circular reference by checking if the new parent is a descendant
      const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
      if (isDescendant) {
        throw new BadRequestException('Cannot set parent to a descendant category');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        slug: uniqueSlug,
        description: updateCategoryDto.description,
        info: updateCategoryDto.info,
        parentId: updateCategoryDto.parentId,
        isActive: updateCategoryDto.isActive,
        sortOrder: updateCategoryDto.sortOrder,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    return this.formatCategoryResponse(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async isDescendant(categoryId: string, potentialAncestorId: string): Promise<boolean> {
    const descendants = await this.prisma.category.findMany({
      where: {
        parentId: categoryId,
        deletedAt: null,
      },
      select: { id: true },
    });

    for (const descendant of descendants) {
      if (descendant.id === potentialAncestorId) {
        return true;
      }
      
      const isNestedDescendant = await this.isDescendant(descendant.id, potentialAncestorId);
      if (isNestedDescendant) {
        return true;
      }
    }

    return false;
  }

  private formatCategoryResponse(category: any): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      info: category.info,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: category.parent ? {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug,
        description: category.parent.description,
        info: category.parent.info,
        parentId: category.parent.parentId,
        isActive: category.parent.isActive,
        sortOrder: category.parent.sortOrder,
        createdAt: category.parent.createdAt,
        updatedAt: category.parent.updatedAt,
      } : undefined,
      children: category.children?.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        info: child.info,
        parentId: child.parentId,
        isActive: child.isActive,
        sortOrder: child.sortOrder,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })),
      productCount: category._count?.products,
    };
  }
}
