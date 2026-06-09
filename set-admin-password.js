
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@webboutapp.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email,
      name: 'Administrador Principal',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('Admin user updated/created with password: admin123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
