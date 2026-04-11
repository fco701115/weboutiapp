
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'fedeperez70@gmail.com'.toLowerCase();
  const password = 'DazleaChangeMe2026'; // A temporary but secure-ish looking password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ User not found in DB:', email);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: {
        password: hashedPassword
    }
  });

  console.log('✅ Password updated for:', email);
  console.log('Temporary password set to:', password);
}

main()
  .catch((e) => {
    console.error('❌ Error updating password:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
