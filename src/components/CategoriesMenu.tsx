'use client';
import { useCart } from '@/context/CartContext';
import { X, ChevronRight, Laptop, Smartphone, Gamepad, Headphones, Watch, Mouse, Speaker, Camera, Monitor } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function CategoriesMenu() {
    const { isCategoriesOpen, setCategoriesOpen } = useCart();
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling when categories are open
    useEffect(() => {
        if (isCategoriesOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCategoriesOpen]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const getIcon = (name: string) => {
        if (!name) return <Laptop size={20} />;
        const n = name.toLowerCase();
        if (n.includes('lap') || n.includes('comp')) return <Laptop size={20} />;
        if (n.includes('smart') || n.includes('tab') || n.includes('celu')) return <Smartphone size={20} />;
        if (n.includes('gam') || n.includes('cons')) return <Gamepad size={20} />;
        if (n.includes('audi') || n.includes('vid') || n.includes('parlan')) return <Speaker size={20} />;
        if (n.includes('cam') || n.includes('foto')) return <Camera size={20} />;
        if (n.includes('watch') || n.includes('wear') || n.includes('reloj')) return <Watch size={20} />;
        if (n.includes('moni')) return <Monitor size={20} />;
        if (n.includes('peri') || n.includes('mous') || n.includes('tecl')) return <Mouse size={20} />;
        if (n.includes('head') || n.includes('audif')) return <Headphones size={20} />;
        return <Laptop size={20} />; // Fallback
    };

    if (!mounted) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 ${isCategoriesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setCategoriesOpen(false)}
            />

            {/* Menu Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[2001] shadow-2xl transition-transform duration-300 ease-in-out transform ${isCategoriesOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-[18px] font-extrabold text-[#e996a0] uppercase tracking-wide">Categorías</h2>
                    <button
                        onClick={() => setCategoriesOpen(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.id || i}
                            href={`/search?category=${cat.id}`}
                            onClick={() => setCategoriesOpen(false)}
                            className="flex items-center justify-between px-6 py-4 border-b border-gray-50 text-gray-700 hover:bg-gray-50 hover:text-[#e996a0] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 group-hover:text-[#e996a0] group-hover:scale-110 transition-all w-8 h-8 flex items-center justify-center relative overflow-hidden rounded-lg">
                                    {cat.imageUrl ? (
                                        <Image 
                                            src={cat.imageUrl} 
                                            alt={cat.name || 'Categoría'} 
                                            fill 
                                            className="object-cover" 
                                            unoptimized={cat.imageUrl && cat.imageUrl.startsWith('data:')}
                                        />
                                    ) : (
                                        getIcon(cat.name)
                                    )}
                                </span>
                                <span className="font-bold text-[15px]">{cat.name}</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <p className="text-[12px] text-gray-400 font-medium">
                        Explora miles de productos por tecnología y rendimiento.
                    </p>
                </div>
            </div>

        </>
    );
}
