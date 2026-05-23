const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  const sliders = await prisma.slider.findMany();
  const categories = await prisma.category.findMany();
  const banners = await prisma.banner.findMany();
  const products = await prisma.product.findMany({ take: 5 });

  console.log('--- Sliders ---');
  sliders.forEach(s => console.log(`Title: ${s.title}, Image: ${s.image}, Thumbnail: ${s.thumbnail}`));

  console.log('\n--- Categories ---');
  categories.forEach(c => console.log(`Name: ${c.name}, ImageUrl: ${c.imageUrl}`));

  console.log('\n--- Banners ---');
  banners.forEach(b => console.log(`Title: ${b.title}, Image: ${b.image}`));

  console.log('\n--- Products (Sample 5) ---');
  products.forEach(p => console.log(`Name: ${p.name}, Images: ${p.images}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
