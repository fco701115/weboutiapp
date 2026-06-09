const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function debug() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@webjoyerapp.com' }
  });

  if (!user) {
    console.log('User not found in DB');
    return;
  }

  console.log('User found in DB:', {
    id: user.id,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password
  });

  const isValid = await bcrypt.compare('admin123', user.password || '');
  console.log('Password "admin123" is valid:', isValid);
}

debug()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());