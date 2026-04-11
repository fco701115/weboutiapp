
const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.orderItem.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  });
  console.log('Last 5 OrderItems:', JSON.stringify(items, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
