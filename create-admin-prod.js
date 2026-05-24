const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Explicitly use the public URL from .env
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:XHlzgFUYxaPEcFoYGTbLplPNhyoZcBdQ@viaduct.proxy.rlwy.net:46447/railway",
    },
  },
});

async function main() {
<<<<<<< HEAD
  const email = 'admin@webmartapp.com';
=======
  const email = 'admin@webshopapp.com';
>>>>>>> 52ffa8e (Fix UI alignments for mobile and search page)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('--- CREATING ADMIN IN PRODUCTION ---');
  
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

<<<<<<< HEAD
  console.log('✅ Success! User admin@webmartapp.com created/updated.');
=======
  console.log('✅ Success! User admin@webshopapp.com created/updated.');
>>>>>>> 52ffa8e (Fix UI alignments for mobile and search page)
  console.log('Role:', user.role);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
