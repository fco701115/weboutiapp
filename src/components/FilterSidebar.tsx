'use client';
import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronRight, Check, Trash2 } from 'lucide-react';

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: {
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
        category?: string;
    };
    onApply: (filters: any) => void;
}

export function FilterSidebar({ isOpen, onClose, currentFilters, onApply }: FilterSidebarProps) {
    const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
    const [sort, setSort] = useState(currentFilters.sort || 'newest');
    const [categoryId, setCategoryId] = useState(currentFilters.category || '');
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sincronizar estado local cuando cambian los filtros externos
    useEffect(() => {
        setMinPrice(currentFilters.minPrice || '');
        setMaxPrice(currentFilters.maxPrice || '');
        setSort(currentFilters.sort || 'newest');
        setCategoryId(currentFilters.category || '');
    }, [currentFilters, isOpen]);

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

    const handleApply = () => {
        onApply({ minPrice, maxPrice, sort, category: categoryId });
        onClose();
    };

    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');
        setCategoryId('');
        onApply({ minPrice: '', maxPrice: '', sort: 'newest', category: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-all opacity-100 animate-in fade-in duration-300" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#e996a0] to-[#d8858f] rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-pink-900/20">
                            <SlidersHorizontal size={24} />
                        </div>
                        <div>
                            <h2 className="text-[22px] font-black text-slate-900 tracking-tight leading-none">Filtros</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personaliza tu búsqueda</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Sort */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-[#e996a0] rounded-full" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Ordenar por</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            {[
                                { id: 'newest', label: 'Más recientes' },
                                { id: 'price_asc', label: 'Precio: Menor a Mayor' },
                                { id: 'price_desc', label: 'Precio: Mayor a Menor' }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSort(option.id)}
                                    className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all duration-300 font-bold group ${
                                        sort === option.id 
                                        ? 'border-[#e996a0] bg-pink-50/30 text-[#e996a0] shadow-sm' 
                                        : 'border-slate-50 hover:border-slate-200 text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <span className="tracking-tight">{option.label}</span>
                                    {sort === option.id ? (
                                        <div className="w-6 h-6 bg-[#e996a0] rounded-full flex items-center justify-center text-white">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 border-2 border-slate-100 rounded-full group-hover:border-slate-200 transition-colors" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-[#e996a0] rounded-full" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Rango de Precio</h3>
                        </div>
                        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mínimo</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 group-focus-within:text-[#e996a0] transition-colors">$</span>
                                        <input
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-4 bg-white border-2 border-white rounded-2xl font-black text-slate-900 focus:border-[#e996a0] focus:ring-4 focus:ring-pink-100 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 font-black text-slate-200 text-xl">—</div>
                                <div className="flex-1 space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Máximo</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 group-focus-within:text-[#e996a0] transition-colors">$</span>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="Max"
                                            className="w-full pl-8 pr-4 py-4 bg-white border-2 border-white rounded-2xl font-black text-slate-900 focus:border-[#e996a0] focus:ring-4 focus:ring-pink-100 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-5 pb-10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-[#e996a0] rounded-full" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Categoría</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            <button
                                onClick={() => setCategoryId('')}
                                className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all font-bold ${
                                    categoryId === '' 
                                    ? 'border-[#e996a0] bg-pink-50/30 text-[#e996a0] shadow-sm' 
                                    : 'border-slate-50 hover:border-slate-200 text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="tracking-tight">Todas las categorías</span>
                                {categoryId === '' && <Check size={18} strokeWidth={3} />}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all font-bold ${
                                        categoryId === cat.id 
                                        ? 'border-[#e996a0] bg-pink-50/30 text-[#e996a0] shadow-sm' 
                                        : 'border-slate-50 hover:border-slate-200 text-slate-500 hover:text-slate-700'
                                }`}
                                >
                                    <span className="tracking-tight">{cat.name}</span>
                                    {categoryId === cat.id && <Check size={18} strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-5 gap-4 sticky bottom-0 z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={handleReset}
                        className="col-span-2 px-4 py-5 rounded-[24px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 group border border-transparent hover:border-red-100"
                        title="Limpiar filtros"
                    >
                        <Trash2 size={16} className="group-hover:shake" />
                        Limpiar
                    </button>
                    <button
                        onClick={handleApply}
                        className="col-span-3 px-8 py-5 bg-[#e996a0] hover:bg-slate-900 text-white rounded-[24px] font-black shadow-2xl shadow-pink-500/30 active:scale-[0.97] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px] group overflow-hidden relative"
                    >
                        <span className="relative z-10">Aplicar Filtros</span>
                        <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>
            </div>
        </div>
    );
}
