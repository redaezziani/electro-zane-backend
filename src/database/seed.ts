import { PrismaClient } from '@prisma/client';
import { seedUsers, clearUsers } from './seeders/user.seeder';
import { seedCategories } from './seeders/category.seeder';
import { seedProducts } from './seeders/product.seeder';
import { seedOrders } from './seeders/order.seeder';
import { seedReviews, clearReviews } from './seeders/review.seeder';
import { clearSettings, seedSettings } from './seeders/setting.seeder';

const prisma = new PrismaClient();

async function clearAll() {
  console.log('🧹 Clearing existing data...');

  // Clear in reverse dependency order (most dependent first)
  await clearReviews();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productSKUImage.deleteMany();
  await prisma.productSKU.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await clearSettings();
  await clearUsers();

  console.log('✅ All data cleared');
}

async function seedAll() {
  console.log('🌱 Seeding all data...');

  await seedSettings();
  await seedUsers();
  await seedCategories();
  await seedProducts();
  // await seedOrders();
  // await seedReviews(); // Add this

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
