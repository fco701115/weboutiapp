export const revalidate = 60;

import { prisma } from '@/lib/prisma';
import { SearchClient } from '@/components/SearchClient';
import { Suspense } from 'react';

export default async function SearchPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
    const params = await searchParams;
    
    // Convert params to strings
    const query = typeof params.q === 'string' ? params.q : '';
    const categoryId = typeof params.category === 'string' ? params.category : '';
    const minPrice = typeof params.minPrice === 'string' ? params.minPrice : '';
    const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : '';
    const sort = typeof params.sort === 'string' ? params.sort : 'newest';

    // Fetch Categories
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    // Build Prisma query
    const where: any = { isVisible: true };
    if (query) {
        where.OR = [
            { name: { contains: query } },
            { description: { contains: query } }
        ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy
    });

    const formattedProducts = products.map(p => {
        const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        const firstImage = Array.isArray(images) ? images[0] : images;

        return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            salePrice: p.salePrice ? Number(p.salePrice) : undefined,
            imageUrl: firstImage || "https://via.placeholder.com/200",
            rating: 0,
            discountBadge: p.salePrice ? Math.round((1 - Number(p.salePrice) / Number(p.price)) * 100) + '%' : undefined
        };
    });

    return (
        <div className="bg-[#f7f9fa] min-h-screen">
            <Suspense fallback={
                <div className="max-w-[1200px] mx-auto px-4 py-20 text-center font-bold text-slate-400">
                    Cargando catálogo...
                </div>
            }>
                <SearchClient 
                    initialProducts={formattedProducts} 
                    categories={categories}
                    searchParams={{
                        q: query,
                        category: categoryId,
                        minPrice,
                        maxPrice,
                        sort
                    }}
                />
            </Suspense>
        </div>
    );
}
