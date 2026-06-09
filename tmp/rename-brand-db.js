require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:XHlzgFUYxaPEcFoYGTbLplPNhyoZcBdQ@viaduct.proxy.rlwy.net:46447/railway',
    },
  },
});

const renames = [
  { from: 'admin@webmartapp.com', to: 'admin@webboutapp.com' },
  { from: 'editor@webmartapp.com', to: 'editor@webboutapp.com' },
  { from: 'admin@webjoyerapp.com', to: 'admin@webboutapp.com' },
];

async function main() {
  console.log('--- RENAMING BRAND-RELATED USERS ---');

  for (const rename of renames) {
    const current = await prisma.user.findUnique({ where: { email: rename.from } });

    if (!current) {
      console.log(`ℹ️  ${rename.from} not found.`);
      continue;
    }

    const target = await prisma.user.findUnique({ where: { email: rename.to } });

    if (target && target.id !== current.id) {
      console.log(`⚠️  ${rename.to} already exists. Skipping ${rename.from}.`);
      continue;
    }

    await prisma.user.update({
      where: { email: rename.from },
      data: { email: rename.to },
    });

    console.log(`✅ ${rename.from} -> ${rename.to}`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });