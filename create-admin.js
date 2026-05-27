const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  try {
    console.log('\n🔧 --- CREAR USUARIO ADMINISTRADOR ---\n');
    
    const email = await question('📧 Email del admin (ej: admin@webshop.com): ');
    const name = await question('👤 Nombre del admin (ej: Administrador): ');
    const password = await question('🔐 Contraseña segura: ');
    
    if (!email || !password) {
      console.log('❌ Email y contraseña son obligatorios');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        name: name || 'Administrador'
      },
      create: {
        email,
        name: name || 'Administrador',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('\n✅ ¡Admin creado exitosamente!\n');
    console.log('📋 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   Rol: ${admin.role}\n`);
    console.log('🔗 Accede a: /admin/login\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
