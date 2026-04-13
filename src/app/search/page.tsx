'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Search, SlidersHorizontal, PackageOpen, X, ChevronRight } from 'lucide-react';
import { FilterSidebar } from '@/components/FilterSidebar';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'newest';

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [query, categoryId, minPrice, maxPrice, sort]);

    const fetchResults = async () => {
        setIsLoading(true);
        try {
            const url = new URL('/api/search', window.location.origin);
            if (query) url.searchParams.append('q', query);
            if (categoryId) url.searchParams.append('category', categoryId);
            if (minPrice) url.searchParams.append('minPrice', minPrice);
            if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
            if (sort) url.searchParams.append('sort', sort);

            const res = await fetch(url.toString());
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyFilters = (filters: any) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filters.minPrice) params.set('minPrice', filters.minPrice); else params.delete('minPrice');
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice); else params.delete('maxPrice');
        if (filters.sort) params.set('sort', filters.sort); else params.delete('sort');
        if (filters.category) params.set('category', filters.category); else params.delete('category');
        
        router.push(`/search?${params.toString()}`);
    };

    const removeFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`/search?${params.toString()}`);
    };

    const hasActiveFilters = minPrice || maxPrice || sort !== 'newest' || categoryId;

    const activeCategory = categories.find(c => c.id === categoryId);

    return (
        <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tighter leading-tight flex items-center gap-4">
                        <Search size={32} className="text-[#1a3da1]" />
                        {query ? `Búsqueda: "${query}"` : activeCategory ? activeCategory.name : 'Todos los productos'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[12px]">
                            {isLoading ? 'Buscando en catálogo...' : `${products.length} productos encontrados`}
                        </p>
                        {hasActiveFilters && (
                            <div className="h-4 w-[2px] bg-slate-200" />
                        )}
                        <button 
                            onClick={handleApplyFilters.bind(null, { minPrice: '', maxPrice: '', sort: 'newest', category: '' })}
                            className={`text-[11px] font-black uppercase tracking-widest text-[#1a3da1] hover:underline transition-all ${hasActiveFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            Limpiar todo
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-50 rounded-[24px] font-black text-slate-700 hover:border-[#1a3da1] hover:text-[#1a3da1] hover:shadow-xl hover:shadow-blue-900/10 transition-all active:scale-95 group"
                    >
                        <SlidersHorizontal size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Filtros Avanzados</span>
                        {hasActiveFilters && (
                            <span className="w-6 h-6 bg-[#1a3da1] text-white text-[10px] rounded-full flex items-center justify-center font-black animate-in zoom-in">
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
                            <span className="text-[13px] font-black text-[#1a3da1]">${minPrice}</span>
                            <button onClick={() => removeFilter('minPrice')} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {maxPrice && (
                        <div className="bg-white border-2 border-slate-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Max:</span>
                            <span className="text-[13px] font-black text-[#1a3da1]">${maxPrice}</span>
                            <button onClick={() => removeFilter('maxPrice')} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {sort !== 'newest' && (
                        <div className="bg-white border-2 border-slate-50 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Orden:</span>
                            <span className="text-[13px] font-black text-[#1a3da1]">
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
                            <span className="text-[13px] font-black text-[#1a3da1] truncate max-w-[150px]">{activeCategory.name}</span>
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

            {isLoading ? (

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-[350px] bg-white rounded-[32px] animate-pulse border border-slate-50" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
                        <PackageOpen size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No encontramos resultados</h2>
                    <p className="text-slate-500 font-medium">Intenta con otras palabras clave o explora las categorías.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
                    {products.map(p => (
                        <ProductCard key={p.id} product={{
                            ...p,
                            price: Number(p.price),
                            salePrice: p.salePrice ? Number(p.salePrice) : undefined,
                            rating: 0
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="bg-[#f7f9fa] min-h-screen">
            <Suspense fallback={
                <div className="max-w-[1200px] mx-auto px-4 py-20 text-center font-bold text-slate-400">
                    Cargando catálogo...
                </div>
            }>
                <SearchResults />
            </Suspense>
        </div>
    );
}
