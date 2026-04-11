import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch products to have images as fallback for items created without images
        const products = await prisma.product.findMany({
            select: { id: true, images: true }
        });
        
        const productImagesMap: Record<string, string | null> = {};
        products.forEach(p => {
            try {
                const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                productImagesMap[p.id] = Array.isArray(images) && images.length > 0 ? images[0] : null;
            } catch (e) {
                productImagesMap[p.id] = null;
            }
        });

        // Enrich items with fallback images
        const enrichedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                image: item.image || productImagesMap[item.productId] || null
            }))
        }));

        return NextResponse.json(enrichedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        // Process items to ensure they have images
        const processedItems = await Promise.all(data.items.map(async (item: any) => {
            let itemImage = item.image;
            
            // If image is missing, try to fetch it from the product
            if (!itemImage) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { images: true }
                });
                if (product && product.images) {
                    try {
                        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                        itemImage = Array.isArray(parsed) ? parsed[0] : parsed;
                    } catch (e) {
                        itemImage = null;
                    }
                }
            }
            
            return {
                productId: item.productId,
                name: item.name,
                image: itemImage || null,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity)
            };
        }));

        const order = await prisma.order.create({
            data: {
                customer: data.customer,
                email: data.email,
                address: data.address,
                total: parseFloat(data.total),
                status: data.status || 'PENDING',
                paymentMethod: data.paymentMethod || 'CASH',
                items: {
                    create: processedItems
                }
            },
            include: {
                items: true
            }
        });
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
