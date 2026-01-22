import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UsersFilterDto, UserRole } from './dto/users.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: UsersFilterDto) {
    const {
      offset = 0,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters || {};

    const where: any = {
      deletedAt: null,
    };

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply role filter
    if (role) {
      where.role = role;
    }

    // Apply active status filter
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Count total users matching the filter
    const total = await this.prisma.user.count({ where });

    // Fetch users with pagination
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdOrders: true,
            reviews: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      data: users,
      total,
      offset,
      limit,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdOrders: true,
            reviews: true,
            cartItems: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, role = UserRole.USER, isActive = true } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string) {
    const user = await this.findOne(id);

    // Prevent users from updating their own role unless they're admin
    if (id === currentUserId && updateUserDto.role && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const updateData: any = {
      name: updateUserDto.name,
      role: updateUserDto.role,
      isActive: updateUserDto.isActive,
    };

    // Hash new password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string, currentUserId: string) {
    // Prevent users from deleting themselves
    if (id === currentUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const user = await this.findOne(id);

    // Soft delete the user
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'User deleted successfully' };
  }

  async bulkDelete(userIds: string[], currentUserId: string) {
    // Prevent users from deleting themselves
    if (userIds.includes(currentUserId)) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    // Soft delete the users
    await this.prisma.user.updateMany({
      where: {
        id: { in: userIds },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: `${userIds.length} users deleted successfully` };
  }

  async toggleStatus(id: string, currentUserId: string) {
    // Prevent users from deactivating themselves
    if (id === currentUserId) {
      throw new ForbiddenException('Cannot change your own status');
    }

    const user = await this.findOne(id);
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}
