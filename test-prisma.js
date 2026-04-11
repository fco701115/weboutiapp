
const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const cats = await prisma.category.findMany();
        console.log('Categories:', cats);
        console.log('Fields:', Object.keys(cats[0] || {}));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
