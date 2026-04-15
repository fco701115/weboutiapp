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

    // Function to parse the images field safely
    const parseImages = (imagesStr: any) => {
        try {
            return typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
        } catch {
            return [];
        }
    };

    // Convert and sanitize product for serialization
    const serializedProduct = JSON.parse(JSON.stringify({
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        images: parseImages(product.images)
    }));

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

        relatedProducts = JSON.parse(JSON.stringify(rawRelated.map(p => {
            const images = parseImages(p.images);
            const firstImage = Array.isArray(images) ? images[0] : images;
            
            return {
                id: p.id,
                name: p.name,
                price: Number(p.price),
                salePrice: p.salePrice ? Number(p.salePrice) : null,
                imageUrl: firstImage || "https://via.placeholder.com/200",
                rating: 0,
                discountBadge: p.salePrice ? Math.round((1 - Number(p.salePrice) / Number(p.price)) * 100) + '%' : undefined
            };
        })));
    }

    return (
        <ProductClient 
            product={serializedProduct} 
            relatedProducts={relatedProducts} 
        />
    );
}
