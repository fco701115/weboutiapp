
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@appecom.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name: 'Administrador',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('✅ Admin user created successfully.');
  } else {
    console.log('ℹ️ Admin user already exists.');
    // Ensure it has a password/correct role
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });
    console.log('✅ Admin user updated with correct credentials.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
