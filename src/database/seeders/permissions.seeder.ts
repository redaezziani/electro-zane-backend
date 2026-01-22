import { PrismaClient, UserRole } from '@prisma/client';
import { Permission } from '../../auth/permissions/permissions.enum';

const prisma = new PrismaClient();

// Default permissions configuration
const DEFAULT_PERMISSIONS = {
  [UserRole.ADMIN]: Object.values(Permission), // All permissions

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
    Permission.USER_TOGGLE_STATUS, // <-- Moderator has this

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

    // Lot permissions
    Permission.LOT_CREATE,
    Permission.LOT_READ,
    Permission.LOT_UPDATE,
    Permission.LOT_DELETE,

    // Lot Detail permissions
    Permission.LOT_DETAIL_CREATE,
    Permission.LOT_DETAIL_READ,
    Permission.LOT_DETAIL_UPDATE,
    Permission.LOT_DETAIL_DELETE,

    // Lot Arrival permissions
    Permission.LOT_ARRIVAL_CREATE,
    Permission.LOT_ARRIVAL_READ,
    Permission.LOT_ARRIVAL_UPDATE,
    Permission.LOT_ARRIVAL_VERIFY,
    Permission.LOT_ARRIVAL_DELETE,
  ],

  [UserRole.USER]: [
    // Product permissions (read only)
    Permission.PRODUCT_READ,

    // Category permissions (read only)
    Permission.CATEGORY_READ,

    // Order permissions (own orders only)
    Permission.ORDER_CREATE,
    Permission.ORDER_READ,
    Permission.ORDER_CANCEL,

    // User permissions (own account only)
    Permission.USER_READ,
    Permission.USER_UPDATE,

    // Review permissions
    Permission.REVIEW_CREATE,
    Permission.REVIEW_READ,
  ],
};

export async function seedPermissions() {
  console.log('🔐 Seeding permissions...');

  try {
    // Clear existing permissions
    await prisma.rolePermission.deleteMany({});
    console.log('  ✓ Cleared existing permissions');

    // Seed default permissions
    let count = 0;
    for (const [role, permissions] of Object.entries(DEFAULT_PERMISSIONS)) {
      for (const permission of permissions) {
        await prisma.rolePermission.create({
          data: {
            role: role as UserRole,
            permission,
            isActive: true,
          },
        });
        count++;
      }
    }

    console.log(`  ✓ Created ${count} role permissions`);
    console.log(`    - ADMIN: ${DEFAULT_PERMISSIONS[UserRole.ADMIN].length} permissions`);
    console.log(`    - MODERATOR: ${DEFAULT_PERMISSIONS[UserRole.MODERATOR].length} permissions`);
    console.log(`    - USER: ${DEFAULT_PERMISSIONS[UserRole.USER].length} permissions`);

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('✅ Permissions seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Permissions seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
