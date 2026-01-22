import { UserRole } from '@prisma/client';
import { Permission } from './permissions.enum';

/**
 * Role-based permissions configuration
 * Defines what permissions each role has
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission),
  ],

  [UserRole.MODERATOR]: [
    // Product permissions
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,

    // Category permissions
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,

    // Order permissions
    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_READ_ALL,
    Permission.ORDER_UPDATE,
    Permission.ORDER_CANCEL,
    Permission.ORDER_CONFIRM,

    // User permissions (limited)
    Permission.USER_READ,
    Permission.USER_READ_ALL,
    Permission.USER_MANAGE_FROM_USERS,

    // Payment permissions
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_PROCESS,

    // Inventory permissions
    Permission.INVENTORY_READ,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_ADJUST,

    // Analytics permissions
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,

    // Settings permissions (read only)
    Permission.SETTINGS_READ,

    // Review permissions
    Permission.REVIEW_READ,
    Permission.REVIEW_APPROVE,
    Permission.REVIEW_DELETE,
  ],

  [UserRole.USER]: [
    // Product permissions (read only)
    Permission.PRODUCT_READ,

    // Category permissions (read only)
    Permission.CATEGORY_READ,

    // Order permissions (own orders only)
    Permission.ORDER_CREATE,
    Permission.ORDER_READ, // Only own orders
    Permission.ORDER_CANCEL, // Only own orders

    // User permissions (own account only)
    Permission.USER_READ, // Only own account
    Permission.USER_UPDATE, // Only own account

    // Review permissions
    Permission.REVIEW_CREATE,
    Permission.REVIEW_READ,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
