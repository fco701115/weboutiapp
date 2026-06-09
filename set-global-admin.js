
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@webboutapp.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('--- GLOBAL DATABASE SYNC ---');
  console.log('Using database identified by prisma/schema.prisma (should be prisma/dev.db)');
  
  const user = await prisma.user.upsert({
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
  console.log('Record for', email, 'updated. hasPassword:', !!check.password);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
