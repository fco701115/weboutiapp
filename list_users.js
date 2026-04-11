
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  console.log('--- Current users in DB ---');
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role}) Password: ${!!u.password}`);
  });
}

main().finally(() => prisma.$disconnect());
