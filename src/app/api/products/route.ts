import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Ensure category exists or handle accordingly
        // For now we assume categoryId is passed correctly
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
                stock: parseInt(data.stock),
                sku: data.sku,
                images: JSON.stringify(data.images || []),
                categoryId: data.categoryId, // Needs real category ID
                isVisible: data.isVisible !== undefined ? data.isVisible : true,
                isFeatured: data.isFeatured !== undefined ? data.isFeatured : false
            }
        });

        // Revalidate home page cache
        revalidatePath('/');

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });

        const formattedProducts = products.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : []
        }));

        return NextResponse.json(formattedProducts, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
