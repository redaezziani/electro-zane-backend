import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission } from './permissions.enum';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);
  private permissionsCache: Map<UserRole, Set<string>> = new Map();
  private lastCacheUpdate: Date = new Date();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadPermissionsFromDatabase();
    this.logger.log('Permissions loaded from database');
  }

  /**
   * Load permissions from database and cache them
   */
  private async loadPermissionsFromDatabase(): Promise<void> {
    try {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { isActive: true },
      });

      // Clear cache
      this.permissionsCache.clear();

      // Build cache
      for (const rp of rolePermissions) {
        if (!this.permissionsCache.has(rp.role)) {
          this.permissionsCache.set(rp.role, new Set());
        }
        this.permissionsCache.get(rp.role)!.add(rp.permission);
      }

      this.lastCacheUpdate = new Date();
      this.logger.debug(`Loaded permissions for ${this.permissionsCache.size} roles`);
    } catch (error) {
      this.logger.error('Failed to load permissions from database', error);
      throw error;
    }
  }

  /**
   * Refresh cache if TTL expired
   */
  private async refreshCacheIfNeeded(): Promise<void> {
    const now = new Date();
    if (now.getTime() - this.lastCacheUpdate.getTime() > this.CACHE_TTL) {
      await this.loadPermissionsFromDatabase();
    }
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(role: UserRole, permission: Permission): Promise<boolean> {
    await this.refreshCacheIfNeeded();

    const rolePermissions = this.permissionsCache.get(role);
    if (!rolePermissions) {
      return false;
    }

    return rolePermissions.has(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  async hasAnyPermission(role: UserRole, permissions: Permission[]): Promise<boolean> {
    await this.refreshCacheIfNeeded();

    for (const permission of permissions) {
      if (await this.hasPermission(role, permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a role has all of the specified permissions
   */
  async hasAllPermissions(role: UserRole, permissions: Permission[]): Promise<boolean> {
    await this.refreshCacheIfNeeded();

    for (const permission of permissions) {
      if (!(await this.hasPermission(role, permission))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(role: UserRole): Promise<string[]> {
    await this.refreshCacheIfNeeded();

    const rolePermissions = this.permissionsCache.get(role);
    if (!rolePermissions) {
      return [];
    }

    return Array.from(rolePermissions);
  }

  /**
   * Manually refresh the cache (useful after updating permissions)
   */
  async refreshCache(): Promise<void> {
    await this.loadPermissionsFromDatabase();
  }

  /**
   * Get all permissions grouped by role
   */
  async getAllRolePermissions(): Promise<Record<UserRole, string[]>> {
    await this.refreshCacheIfNeeded();

    const result: Record<string, string[]> = {};

    for (const [role, permissions] of this.permissionsCache.entries()) {
      result[role] = Array.from(permissions);
    }

    return result as Record<UserRole, string[]>;
  }

  /**
   * Add a permission to a role
   */
  async addPermission(role: UserRole, permission: string): Promise<void> {
    await this.prisma.rolePermission.upsert({
      where: {
        role_permission: {
          role,
          permission,
        },
      },
      create: {
        role,
        permission,
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });

    await this.refreshCache();
    this.logger.log(`Added permission ${permission} to role ${role}`);
  }

  /**
   * Remove a permission from a role
   */
  async removePermission(role: UserRole, permission: string): Promise<void> {
    await this.prisma.rolePermission.updateMany({
      where: {
        role,
        permission,
      },
      data: {
        isActive: false,
      },
    });

    await this.refreshCache();
    this.logger.log(`Removed permission ${permission} from role ${role}`);
  }

  /**
   * Set all permissions for a role (replaces existing)
   */
  async setRolePermissions(role: UserRole, permissions: string[]): Promise<void> {
    // Deactivate all existing permissions for this role
    await this.prisma.rolePermission.updateMany({
      where: { role },
      data: { isActive: false },
    });

    // Add new permissions
    for (const permission of permissions) {
      await this.prisma.rolePermission.upsert({
        where: {
          role_permission: {
            role,
            permission,
          },
        },
        create: {
          role,
          permission,
          isActive: true,
        },
        update: {
          isActive: true,
        },
      });
    }

    await this.refreshCache();
    this.logger.log(`Set ${permissions.length} permissions for role ${role}`);
  }
}
