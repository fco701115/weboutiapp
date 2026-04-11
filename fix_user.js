
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const emailRegex = /Albertflorom@gmail.com/i;
  const user = await prisma.user.findFirst({
    where: { 
        email: {
            contains: 'Albertflorom@gmail.com' // Lite approximation
        }
    }
  });

  // Better: find by exact email I saw in the list
  const users = await prisma.user.findMany();
  const targetUser = users.find(u => u.email.toLowerCase() === 'albertflorom@gmail.com');

  if (targetUser) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        email: targetUser.email.toLowerCase(), // Normalizar
        password: hashedPassword,
        status: 'ACTIVE'
      }
    });
    console.log('✅ User Albertflorom@gmail.com fixed and password set to 123456');
  } else {
    console.log('❌ User not found');
  }
}

main().finally(() => prisma.$disconnect());
