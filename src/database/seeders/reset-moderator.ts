import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetModeratorPassword() {
  console.log('🔄 Resetting moderator password...');

  const email = 'moderator@example.com';
  const newPassword = 'Moderator123!';
  const saltRounds = 12;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Moderator user not found. Creating...');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Content Moderator',
          role: UserRole.MODERATOR,
          isEmailVerified: true,
          isActive: true,
        },
      });

      console.log('✅ Moderator user created');
    } else {
      console.log(`📧 Found user: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🔐 Role: ${user.role}`);
      console.log(`✅ Active: ${user.isActive}`);
      console.log(`📧 Email Verified: ${user.isEmailVerified}`);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isActive: true,
          isEmailVerified: true,
        },
      });

      console.log('✅ Password updated successfully');
      console.log(`📝 New password: ${newPassword}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetModeratorPassword();
