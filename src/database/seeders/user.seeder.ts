import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('🌱 Seeding users...');

  // Salt rounds for password hashing
  const saltRounds = 12;

  // Define users to seed
  const usersToSeed = [
    {
      email: 'soufiane@electrozane.com',
      password: 'Admin123!',
      name: 'Soufiane',
      role: UserRole.ADMIN,
      isEmailVerified: true,
    },
  ];

  for (const userData of usersToSeed) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`👤 User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isEmailVerified: userData.isEmailVerified,
        },
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error);
    }
  }

  console.log('✨ User seeding completed!');
}

export async function clearUsers() {
  console.log('🧹 Clearing users and related data...');

  try {
    // Delete all data in reverse dependency order
    await prisma.refreshToken.deleteMany();
    console.log('🗑️ Cleared all refresh tokens');

    await prisma.userDevice.deleteMany();
    console.log('🗑️ Cleared all user devices');

    await prisma.productReview.deleteMany();
    console.log('🗑️ Cleared all product reviews');

    await prisma.cartItem.deleteMany();
    console.log('🗑️ Cleared all cart items');

    await prisma.payment.deleteMany();
    console.log('🗑️ Cleared all payments');

    await prisma.orderItem.deleteMany();
    console.log('🗑️ Cleared all order items');

    await prisma.order.deleteMany();
    console.log('🗑️ Cleared all orders');

    // Delete all users
    await prisma.user.deleteMany();
    console.log('🗑️ Cleared all users');

    console.log('✨ User clearing completed!');
  } catch (error) {
    console.error('❌ Failed to clear users:', error);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
