const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:XHlzgFUYxaPEcFoYGTbLplPNhyoZcBdQ@viaduct.proxy.rlwy.net:46447/railway",
    },
  },
});

async function main() {
  const categories = [
    { name: 'Componentes', slug: 'componentes', id: 'cat_1' },
    { name: 'Periféricos', slug: 'perifericos', id: 'cat_2' },
    { name: 'Laptops', slug: 'laptops', id: 'cat_3' },
    { name: 'Gaming', slug: 'gaming', id: 'cat_4' }
  ];

  console.log('--- SEEDING CATEGORIES IN PRODUCTION ---');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Success! Categories created in production.');
}

main()
  .catch(e => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect());
