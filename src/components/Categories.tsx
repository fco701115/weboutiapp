'use client';
import { useRef, useState, useEffect } from 'react';
import { Monitor, Cpu, HardDrive, Mouse, Keyboard, Headphones, Cable, Gamepad2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Categories({ initialCategories }: { initialCategories?: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>(initialCategories || []);
    const [isLoading, setIsLoading] = useState(!initialCategories);

    useEffect(() => {
        setMounted(true);
        if (!initialCategories) {
            fetchCategories();
        }
    }, [initialCategories]);

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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth / 2;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('monit')) return Monitor;
        if (n.includes('comp') || n.includes('proc')) return Cpu;
        if (n.includes('disco') || n.includes('stor') || n.includes('ssd')) return HardDrive;
        if (n.includes('mous') || n.includes('raton')) return Mouse;
        if (n.includes('tecl') || n.includes('keyb')) return Keyboard;
        if (n.includes('aud') || n.includes('head')) return Headphones;
        if (n.includes('red') || n.includes('net') || n.includes('cabl')) return Cable;
        if (n.includes('gam')) return Gamepad2;
        return LayoutGrid;
    };

    return (
        <div className="w-full mt-[30px] mb-[10px] max-w-[1200px] mx-auto px-4">
            {!mounted || (isLoading && categories.length === 0) ? (
                <>
                    <div className="flex flex-col gap-1 mb-10">
                        <div className="h-8 w-64 bg-gray-100 animate-pulse rounded" />
                        <div className="h-1 w-20 bg-gray-100 animate-pulse rounded-full" />
                    </div>
                    <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[30%] sm:w-[30%] md:w-[22%] lg:w-[15%] h-32 bg-gray-50 animate-pulse rounded-[15px_0_15px_0]" />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-1 mb-10">
                        <h2 className="text-[24px] font-black text-slate-900 tracking-tighter capitalize">Explora Categorías</h2>
                        <div className="h-1 w-20 bg-[#124baf] rounded-full" />
                    </div>

                    <div className="relative group/nav">
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-[-10px] md:left-[-20px] top-[42.5px] md:top-1/2 -translate-y-1/2 z-20 bg-white border border-slate-100 shadow-xl rounded-full p-2 md:p-3 text-slate-400 hover:text-[#1a3da1] hover:scale-110 transition-all md:opacity-0 md:group-hover/nav:opacity-100 flex items-center justify-center"
                        >
                            <ChevronLeft size={18} className="md:w-6 md:h-6" />
                        </button>

                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-[-10px] md:right-[-20px] top-[42.5px] md:top-1/2 -translate-y-1/2 z-20 bg-white border border-slate-100 shadow-xl rounded-full p-2 md:p-3 text-slate-400 hover:text-[#1a3da1] hover:scale-110 transition-all md:opacity-0 md:group-hover/nav:opacity-100 flex items-center justify-center"
                        >
                            <ChevronRight size={18} className="md:w-6 md:h-6" />
                        </button>

                        <div
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            className={`flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 sm:gap-6 pb-[10px] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        >
                            {categories.map((c) => {
                                const IconComponent = getIcon(c.name);
                                return (
                                    <Link
                                        href={`/search?category=${c.id}`}
                                        key={c.id}
                                        className="flex-shrink-0 w-[30%] sm:w-[30%] md:w-[22%] lg:w-[15%] snap-start flex flex-col items-center justify-center gap-5 group cursor-pointer"
                                    >
                                        <div className="w-[85px] h-[85px] sm:w-[100px] md:w-[120px] md:h-[120px] rounded-[15px_0_15px_0] bg-white shadow-sm border border-[#ddd] flex items-center justify-center text-slate-400 group-hover:border-[#173495] group-hover:text-[#173495] group-hover:bg-blue-50/30 group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 ease-out overflow-hidden relative">
                                            {c.imageUrl ? (
                                                <div className="relative w-full h-full p-2">
                                                    <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <IconComponent size={32} className="md:w-[48px] md:h-[48px]" strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <span className="text-[16px] font-bold text-[#003F99] group-hover:text-[#1a3da1] transition-colors text-center capitalize tracking-tight leading-tight px-2">
                                            {c.name.toLowerCase()}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
