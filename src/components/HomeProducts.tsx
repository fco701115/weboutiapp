import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export async function HomeProducts() {
    try {
        // Fetch first 10 products directly from the database
        const products = await prisma.product.findMany({
            where: { isVisible: true },
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        if (products.length === 0) {
            return (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">
                    No hay productos disponibles todavía.
                </div>
            );
        }

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-8 overflow-visible">
                {formattedProducts.map((p) => (
                    <ProductCard key={p.id} product={p as any} />
                ))}
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch home products:", error);
        return (
            <div className="col-span-full py-20 text-center text-red-400 font-bold uppercase tracking-widest text-[12px]">
                Error al cargar los productos.
            </div>
        );
    }
}
