import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { PromoBanners } from '@/components/PromoBanners';
import { FeaturesSection } from '@/components/FeaturesSection';
import { HomeProducts } from '@/components/HomeProducts';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';

// Cached function to fetch layout-critical data
const getBanners = unstable_cache(
  async () => {
    return await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },
  ['home-banners'],
  { revalidate: 3600, tags: ['banners'] }
);

const getCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  },
  ['home-categories'],
  { revalidate: 3600, tags: ['categories'] }
);

const getSliders = unstable_cache(
  async () => {
    return await prisma.slider.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { order: 'asc' }
    });
  },
  ['home-sliders'],
  { revalidate: 3600, tags: ['sliders'] }
);

export default async function Home() {
  // Fetch initial data on the server for instant loading
  const [categories, sliders, banners] = await Promise.all([
    getCategories(),
    getSliders(),
    getBanners()
  ]);

  // Sanitize data for Client Components (convert Dates to strings)
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedSliders = JSON.parse(JSON.stringify(sliders));
  const serializedBanners = JSON.parse(JSON.stringify(banners));

  return (
    <>
      <Hero initialCategories={serializedCategories} initialSliders={serializedSliders} />
      <Categories initialCategories={serializedCategories} />

      {/* Container de Ancho Fijo */}
      <div className="w-full max-w-[1200px] mx-auto px-2 pt-4 pb-8">

        {/* Header/Title Category Section */}
        <div className="flex justify-between items-center bg-transparent border-t border-gray-100 mb-8 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[22px] font-lato m-0 font-semibold text-slate-900 tracking-tighter capitalize">Novedades Destacadas</h2>

          </div>
          <button className="bg-[#e996a0] hover:bg-[#d8858f] text-white px-8 py-3 text-sm font-black rounded-[5px] transition-all shadow-lg shadow-[#e996a0]/10 active:scale-95 uppercase tracking-widest">
            Ver Todos
          </button>
        </div>

        {/* Grilla de Productos (Server Component) */}
        <Suspense fallback={
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#e996a0] border-t-transparent rounded-full animate-spin"></div>
            Cargando Novedades...
          </div>
        }>
          <HomeProducts />
        </Suspense>
      </div>

      <PromoBanners initialBanners={serializedBanners} />
      <FeaturesSection />
    </>
  );
}

