
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'editor@webmartapp.com';
  const hashedPassword = await bcrypt.hash('editor123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'EDITOR',
      status: 'ACTIVE'
    },
    create: {
      email,
      name: 'Editor de Contenido',
      password: hashedPassword,
      role: 'EDITOR',
      status: 'ACTIVE'
    }
  });

  console.log('Editor user updated/created with password: editor123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
