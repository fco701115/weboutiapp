'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Search, SlidersHorizontal, PackageOpen, X } from 'lucide-react';
import { FilterSidebar } from '@/components/FilterSidebar';

interface SearchClientProps {
    initialProducts: any[];
    categories: any[];
    searchParams: {
        q?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
    };
}

export function SearchClient({ initialProducts, categories, searchParams }: SearchClientProps) {
    const router = useRouter();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const query = searchParams.q || '';
    const categoryId = searchParams.category || '';
    const minPrice = searchParams.minPrice || '';
    const maxPrice = searchParams.maxPrice || '';
    const sort = searchParams.sort || 'newest';

    const handleApplyFilters = (filters: any) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.category) params.set('category', filters.category);
        
        router.push(`/search?${params.toString()}`);
    };

    const removeFilter = (key: string) => {
        const params = new URLSearchParams();
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete(key);
        router.push(`/search?${currentParams.toString()}`);
    };

    const hasActiveFilters = minPrice || maxPrice || sort !== 'newest' || categoryId;
    const activeCategory = categories.find(c => c.id === categoryId);

    return (
        <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tighter leading-tight flex items-center gap-4">
                        <Search size={32} className="text-[#e996a0]" />
                        {query ? `Búsqueda: "${query}"` : activeCategory ? activeCategory.name : 'Todos los productos'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[12px]">
                            {initialProducts.length} productos encontrados
                        </p>
                        {hasActiveFilters && (
                            <div className="h-4 w-[2px] bg-slate-200" />
                        )}
                        <button 
                            onClick={() => router.push('/search')}
                            className={`text-[11px] font-black uppercase tracking-widest text-[#e996a0] hover:underline transition-all ${hasActiveFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            Limpiar todo
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-50 rounded-[24px] font-black text-slate-700 hover:border-[#e996a0] hover:text-[#e996a0] hover:shadow-xl hover:shadow-pink-900/10 transition-all active:scale-95 group"
                    >
                        <SlidersHorizontal size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Filtros Avanzados</span>
                        {hasActiveFilters && (
                            <span className="w-6 h-6 bg-[#e996a0] text-white text-[10px] rounded-full flex items-center justify-center font-black animate-in zoom-in">
                                !
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Active Filters Bar */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-10">
                    {minPrice && (
                        <div className="bg-white border-2 border-slate-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Min:</span>
                            <span className="text-[13px] font-black text-[#e996a0]">${minPrice}</span>
                            <button onClick={() => removeFilter('minPrice')} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {maxPrice && (
                        <div className="bg-white border-2 border-slate-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Max:</span>
                            <span className="text-[13px] font-black text-[#e996a0]">${maxPrice}</span>
                            <button onClick={() => removeFilter('maxPrice')} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {sort !== 'newest' && (
                        <div className="bg-white border-2 border-slate-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Orden:</span>
                            <span className="text-[13px] font-black text-[#e996a0]">
                                {sort === 'price_asc' ? 'Menor Precio' : 'Mayor Precio'}
                            </span>
                            <button onClick={() => removeFilter('sort')} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {categoryId && activeCategory && (
                        <div className="bg-white border-2 border-slate-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Categoría:</span>
                            <span className="text-[13px] font-black text-[#e996a0] truncate max-w-[150px]">{activeCategory.name}</span>
                            <button onClick={() => removeFilter('category')} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <FilterSidebar 
                isOpen={isFilterOpen} 
                onClose={() => setIsFilterOpen(false)} 
                currentFilters={{ minPrice, maxPrice, sort, category: categoryId }}
                onApply={handleApplyFilters}
            />

            {initialProducts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                        <PackageOpen size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No encontramos resultados</h2>
                    <p className="text-slate-500 font-medium">Intenta con otras palabras clave o explora las categorías.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
                    {initialProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
