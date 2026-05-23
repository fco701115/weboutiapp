
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@webmartapp.com';
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

  const check = await prisma.user.findUnique({ where: { email } });
  console.log('Final Database State Check for admin@webmartapp.com:');
  console.log(JSON.stringify(check, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
