import { PrismaClient, UserRole } from '@prisma/client';
import { ROLE_PERMISSIONS } from '../../auth/permissions/role-permissions.config';

const prisma = new PrismaClient();

export async function seedPermissions() {
  console.log('🌱 Seeding role permissions...');

  try {
    // Iterate through each role and its permissions
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      console.log(`📝 Seeding permissions for role: ${role}`);

      for (const permission of permissions) {
        // Upsert each permission
        await prisma.rolePermission.upsert({
          where: {
            role_permission: {
              role: role as UserRole,
              permission: permission,
            },
          },
          create: {
            role: role as UserRole,
            permission: permission,
            isActive: true,
          },
          update: {
            isActive: true,
          },
        });
      }

      console.log(`✅ Seeded ${permissions.length} permissions for ${role}`);
    }

    console.log('✨ Role permissions seeding completed!');
  } catch (error) {
    console.error('❌ Failed to seed permissions:', error);
    throw error;
  }
}

export async function clearPermissions() {
  console.log('🧹 Clearing role permissions...');

  try {
    await prisma.rolePermission.deleteMany();
    console.log('🗑️ Cleared all role permissions');
    console.log('✨ Permissions clearing completed!');
  } catch (error) {
    console.error('❌ Failed to clear permissions:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
