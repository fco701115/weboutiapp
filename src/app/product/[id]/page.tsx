export const revalidate = 60;

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductClient } from '@/components/ProductClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    // Fetch product with its category
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true
        }
    });

    if (!product) {
        notFound();
    }

    // Convert decimal/number fields for serialization
    const serializedProduct = {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
    };

    // Fetch related products (same category, excluding current product)
    let relatedProducts: any[] = [];
    if (product.categoryId) {
        const rawRelated = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                NOT: { id: product.id }
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        relatedProducts = rawRelated.map(p => ({
            ...p,
            price: Number(p.price),
            salePrice: p.salePrice ? Number(p.salePrice) : null,
        }));
    }

    return (
        <ProductClient 
            product={serializedProduct} 
            relatedProducts={relatedProducts} 
        />
    );
}
