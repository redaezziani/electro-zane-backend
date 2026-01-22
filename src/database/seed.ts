import { PrismaClient } from '@prisma/client';
import { seedUsers, clearUsers } from './seeders/user.seeder';
import { seedPermissions, clearPermissions } from './seeders/permissions.seeder';

const prisma = new PrismaClient();

async function clearAll() {
  console.log('🧹 Clearing existing data...');

  // Clear users and permissions
  await clearUsers();
  await clearPermissions();

  console.log('✅ All data cleared');
}

async function seedAll() {
  console.log('🌱 Seeding all data...');

  // Seed permissions first, then users
  await seedPermissions();
  await seedUsers();

  console.log('✅ All data seeded');
}

async function main() {
  console.log('🚀 Starting database seeding...');

  try {
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear') || args.includes('-c');
    const shouldSeed =
      args.includes('--seed') || args.includes('-s') || args.length === 0;

    if (shouldClear) {
      await clearAll();
    }

    if (shouldSeed) {
      await seedAll();
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
