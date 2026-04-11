import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sort = searchParams.get('sort');

        const where: any = {};

        if (q) {
            where.OR = [
                { name: { contains: q } },
                { description: { contains: q } }
            ];
        }

        if (category) {
            where.categoryId = category;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };
        if (sort === 'newest') orderBy = { createdAt: 'desc' };

        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            orderBy
        });

        const formattedProducts = products.map(p => {
            const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
            const firstImage = Array.isArray(images) ? images[0] : images;

            return {
                ...p,
                imageUrl: firstImage || "https://via.placeholder.com/200",
            };
        });

        return NextResponse.json(formattedProducts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
    }
}
