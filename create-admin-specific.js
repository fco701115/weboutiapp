const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@webboutapp.com';
  const password = 'admin123';
  const name = 'Administrador';

  try {
    console.log('--- CREATING ADMIN USER ---');
    console.log(`Email: ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        name: name
      },
      create: {
        email,
        name,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.status}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();