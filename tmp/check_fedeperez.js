
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'fedeperez70@gmail.com'.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ User not found in DB:', email);
  } else {
    console.log('✅ User found in DB:', JSON.stringify(user, null, 2));
  }
}

main()
  .catch((e) => {
    console.error('❌ Error checking user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
