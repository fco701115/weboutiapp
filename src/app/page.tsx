import { ProductCard } from '@/components/ProductCard';
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { PromoBanners } from '@/components/PromoBanners';
import { FeaturesSection } from '@/components/FeaturesSection';
import { prisma } from '@/lib/prisma';

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });

    return products.map(p => {
      const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      const firstImage = Array.isArray(images) ? images[0] : images;

      return {
        id: p.id,
        name: p.name,
        rating: 0,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : undefined,
        imageUrl: firstImage || "https://via.placeholder.com/200",
        discountBadge: p.salePrice ? `${Math.round((1 - Number(p.salePrice) / Number(p.price)) * 100)}%` : undefined
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Hero />
      <Categories />

      {/* Container de Ancho Fijo */}
      <div className="w-full max-w-[1200px] mx-auto px-4 pt-4 pb-8">

        {/* Header/Title Category Section */}
        <div className="flex justify-between items-center bg-transparent border-t border-gray-100 mb-8 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] font-black text-slate-900 tracking-tighter capitalize">Novedades Destacadas</h2>
            <div className="h-1 w-20 bg-[#124baf] rounded-full" />
          </div>
          <button className="bg-[#124baf] hover:bg-[#0f4094] text-white px-8 py-3 text-sm font-black rounded-[5px] transition-all shadow-lg shadow-blue-500/10 active:scale-95 uppercase tracking-widest">
            Ver Todos
          </button>
        </div>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">
              No hay productos disponibles todavía.
            </div>
          ) : (
            products.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))
          )}
        </div>
      </div>

      <PromoBanners />
      <FeaturesSection />
    </>
  );
}
