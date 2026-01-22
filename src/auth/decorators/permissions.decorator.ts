import { SetMetadata } from '@nestjs/common';
import { Permission } from '../permissions/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions decorator
 * Use this to specify which permissions are required to access a route
 *
 * @example
 * ```typescript
 * @Permissions(Permission.PRODUCT_CREATE, Permission.PRODUCT_UPDATE)
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createProduct() { ... }
 * ```
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Require all permissions decorator
 * The user must have ALL specified permissions
 */
export const RequireAllPermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, requireAll: true });

/**
 * Require any permission decorator
 * The user must have AT LEAST ONE of the specified permissions
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, requireAll: false });
