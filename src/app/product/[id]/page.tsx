import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductClient } from '@/components/ProductClient';
import { unstable_cache } from 'next/cache';

export const revalidate = 3600; // Cache for 1 hour

interface Props {
    params: Promise<{ id: string }>;
}

// Cached function to get product by id
const getProduct = unstable_cache(
    async (id: string) => {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                category: true
            }
        });
    },
    ['product-detail'],
    { revalidate: 3600, tags: ['products'] }
);

// Cached function to get related products
const getRelatedProducts = unstable_cache(
    async (categoryId: string, productId: string) => {
        return await prisma.product.findMany({
            where: {
                categoryId,
                NOT: { id: productId },
                isVisible: true
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
    },
    ['related-products'],
    { revalidate: 3600, tags: ['products'] }
);

// Pre-generate the 50 most recent products at build time
// Returns empty array if database is unavailable (e.g., during build)
export async function generateStaticParams() {
    try {
        const products = await prisma.product.findMany({
            where: { isVisible: true },
            select: { id: true },
            take: 50,
            orderBy: { createdAt: 'desc' }
        });

        return products.map((product) => ({
            id: product.id,
        }));
    } catch {
        return [];
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const parseImages = (imagesStr: any) => {
        try {
            return typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
        } catch {
            return [];
        }
    };

    const serializedProduct = {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        images: parseImages(product.images),
        // Convirtiendo fechas a strings para evitar problemas de serialización
        createdAt: new Date(product.createdAt).toISOString(),
        updatedAt: new Date(product.updatedAt).toISOString(),
        category: product.category ? {
            ...product.category,
            createdAt: new Date(product.category.createdAt).toISOString(),
            updatedAt: new Date(product.category.updatedAt).toISOString(),
        } : null
    };

    let relatedProducts: any[] = [];
    if (product.categoryId) {
        const rawRelated = await getRelatedProducts(product.categoryId, product.id);

        relatedProducts = rawRelated.map(p => {
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
        });
    }

    return (
        <ProductClient 
            product={serializedProduct} 
            relatedProducts={relatedProducts} 
        />
    );
}

