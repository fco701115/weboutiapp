import 'dotenv/config'
import { prisma } from './src/lib/prisma'

async function main() {
    const categories = [
        { name: 'Componentes', slug: 'componentes', id: 'cat_1' },
        { name: 'Periféricos', slug: 'perifericos', id: 'cat_2' },
        { name: 'Laptops', slug: 'laptops', id: 'cat_3' },
        { name: 'Gaming', slug: 'gaming', id: 'cat_4' }
    ]

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
            },
        })
    }

    console.log('Seed categories created')

    // Dummy Order
    await prisma.order.upsert({
        where: { id: 'order_test_1' },
        update: {},
        create: {
            id: 'order_test_1',
            customer: 'Juan Perez',
            email: 'juan@example.com',
            address: 'Calle Falsa 123, Madrid',
            total: 1200.00,
            status: 'PENDING',
            items: {
                create: [
                    { productId: 'test_prod_1', name: 'Logitech G-Pro Wireless', price: 120.00, quantity: 1 }
                ]
            }
        }
    })
    console.log('Seed orders created')

    // Default Admin User
    await prisma.user.upsert({
        where: { email: 'admin@webmartapp.com' },
        update: {},
        create: {
            name: 'Administrador Principal',
            email: 'admin@webmartapp.com',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE'
        }
    })
    console.log('Seed users created')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
