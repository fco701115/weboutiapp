export const revalidate = 60;

import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { PromoBanners } from '@/components/PromoBanners';
import { FeaturesSection } from '@/components/FeaturesSection';
import { HomeProducts } from '@/components/HomeProducts';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  // Fetch initial data on the server for instant loading
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <>
      <Hero />
      <Categories initialCategories={categories} />

      {/* Container de Ancho Fijo */}
      <div className="w-full max-w-[1200px] mx-auto px-2 pt-4 pb-8">

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

        {/* Grilla de Productos (Server Component) */}
        <HomeProducts />
      </div>

      <PromoBanners />
      <FeaturesSection />
    </>
  );
}
