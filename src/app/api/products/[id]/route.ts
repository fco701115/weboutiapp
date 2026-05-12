import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Parse images
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

        return NextResponse.json({
            ...product,
            images: Array.isArray(images) ? images : [images]
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await req.json();

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
                stock: parseInt(data.stock),
                sku: data.sku,
                images: JSON.stringify(data.images || []),
                categoryId: data.categoryId,
                isVisible: data.isVisible !== undefined ? data.isVisible : true,
                isFeatured: data.isFeatured !== undefined ? data.isFeatured : false
            }
        });

        // Revalidate home page cache
        revalidatePath('/');

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id }
        });

        // Revalidate home page cache
        revalidatePath('/');

        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
