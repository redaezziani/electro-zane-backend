const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPermissions() {
  console.log('\n=== Checking Role Permissions ===\n');

  const roles = ['ADMIN', 'MODERATOR', 'USER'];

  for (const role of roles) {
    const perms = await prisma.rolePermission.findMany({
      where: { role, isActive: true },
      orderBy: { permission: 'asc' }
    });

    console.log(`${role} (${perms.length} permissions):`);
    perms.forEach(p => console.log(`  - ${p.permission}`));
    console.log('');
  }

  await prisma.$disconnect();
}

checkPermissions().catch(console.error);
