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
      email: 'admin@example.com',
      password: 'Admin123!',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      isEmailVerified: true,
    },
    {
      email: 'moderator@example.com',
      password: 'Moderator123!',
      name: 'Content Moderator',
      role: UserRole.MODERATOR,
      isEmailVerified: true,
    },
    {
      email: 'john.doe@example.com',
      password: 'User123!',
      name: 'John Doe',
      role: UserRole.USER,
      isEmailVerified: true,
    },
    {
      email: 'jane.smith@example.com',
      password: 'User123!',
      name: 'Jane Smith',
      role: UserRole.USER,
      isEmailVerified: true,
    },
    {
      email: 'unverified@example.com',
      password: 'User123!',
      name: 'Unverified User',
      role: UserRole.USER,
      isEmailVerified: false,
      emailVerificationToken: 'sample-verification-token-123',
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
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
          emailVerificationToken: userData.emailVerificationToken || null,
          emailVerificationExpires: userData.emailVerificationExpires || null,
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
  console.log('🧹 Clearing users...');
  
  try {
    // Delete all refresh tokens first (due to foreign key constraint)
    await prisma.refreshToken.deleteMany();
    console.log('🗑️ Cleared all refresh tokens');

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
