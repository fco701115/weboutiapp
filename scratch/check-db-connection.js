const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log(`Conexión exitosa. Usuarios encontrados: ${userCount}`);
    
    const categoryCount = await prisma.category.count();
    console.log(`Categorías encontradas: ${categoryCount}`);
    
    console.log('--- TODO OK ---');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
