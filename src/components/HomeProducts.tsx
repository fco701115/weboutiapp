'use client';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { PackageOpen } from 'lucide-react';

export function HomeProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch first 10 products using the same search API that works
                const res = await fetch('/api/search?sort=newest');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.slice(0, 10)); // Top 10
                }
            } catch (error) {
                console.error("Failed to fetch home products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-8">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-[350px] bg-white rounded-[32px] animate-pulse border border-slate-50" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">
                No hay productos disponibles todavía.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-8 overflow-visible">
            {products.map((p) => (
                <ProductCard key={p.id} product={{
                    ...p,
                    price: Number(p.price),
                    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
                    rating: 0
                } as any} />
            ))}
        </div>
    );
}
