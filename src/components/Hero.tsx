'use client';
import { Laptop, Smartphone, Gamepad as GamepadIcon, Speaker, Camera, Watch, Monitor, Mouse, Headphones, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export function Hero() {
    const [categories, setCategories] = useState<any[]>([]);
    const [sliders, setSliders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlider, setCurrentSlider] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const [catRes, sliderRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/sliders')
                ]);

                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                }

                if (sliderRes.ok) {
                    const sliderData = await sliderRes.json();
                    setSliders(sliderData.filter((s: any) => s.status === 'ACTIVE'));
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Auto-advance slider
    useEffect(() => {
        if (sliders.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlider((prev) => (prev + 1) % sliders.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [sliders]);

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('lap') || n.includes('comp')) return <Laptop size={18} />;
        if (n.includes('smart') || n.includes('tab') || n.includes('celu')) return <Smartphone size={18} />;
        if (n.includes('gam') || n.includes('cons')) return <GamepadIcon size={18} />;
        if (n.includes('audi') || n.includes('vid') || n.includes('parlan')) return <Speaker size={18} />;
        if (n.includes('cam') || n.includes('foto')) return <Camera size={18} />;
        if (n.includes('watch') || n.includes('wear') || n.includes('reloj')) return <Watch size={18} />;
        if (n.includes('moni')) return <Monitor size={18} />;
        if (n.includes('peri') || n.includes('mous') || n.includes('tecl')) return <Mouse size={18} />;
        if (n.includes('head') || n.includes('audif')) return <Headphones size={18} />;
        return <Laptop size={18} />;
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 mt-6 h-[300px] md:h-[380px]">
            {!mounted || isLoading ? (
                <div className="w-full h-full bg-gray-50 animate-pulse rounded-[4px]" />
            ) : (
                <div className="flex gap-4 h-full">
                    {/* Sidebar Categories (Mock for Desktop) */}
                    <div className="hidden lg:flex flex-col w-72 bg-white border border-gray-100 shadow-sm rounded-[4px] overflow-hidden">
                        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar border border-[#173495] rounded-[5px]">
                            {isLoading ? (
                                <div className="flex flex-col gap-2 p-6">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="h-6 bg-gray-100 animate-pulse rounded w-full" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {categories.map((cat, i) => (
                                        <Link
                                            key={cat.id || i}
                                            href={`/search?category=${cat.id}`}
                                            className="flex items-center justify-between px-6 py-[10px] text-gray-700 hover:bg-gray-50 hover:text-[#1a3da1] transition-all group border-b border-gray-50/50 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-gray-400 group-hover:text-[#1a3da1] group-hover:scale-110 transition-all w-5 h-5 flex items-center justify-center">
                                                    {cat.imageUrl ? (
                                                        <div className="relative w-full h-full overflow-hidden rounded-sm">
                                                            <Image
                                                                src={cat.imageUrl}
                                                                alt={cat.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized={cat.imageUrl.startsWith('data:')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        getIcon(cat.name)
                                                    )}
                                                </div>
                                                <span className="font-bold text-[14px]">{cat.name}</span>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Banner / Slider */}
                    <div className="flex-1 rounded-[4px] relative overflow-hidden group shadow-sm bg-[#12245b]">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="absolute inset-0">
                                {sliders.length > 0 && sliders.map((slider, index) => (
                                    <div
                                        key={slider.id}
                                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlider ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                    >
                                        {/* Background Image / Overlay */}
                                        {slider.image ? (
                                            <div className="absolute inset-0 z-0">
                                                <Image
                                                    src={slider.image}
                                                    alt={slider.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={slider.image.startsWith('data:')}
                                                />
                                                {/* Subtle gradient only on the text area for legibility */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute right-0 top-0 w-full md:w-1/2 h-full bg-gradient-to-l from-[#365bff] to-transparent opacity-40 z-0" />
                                                <div className="absolute right-[-100px] top-[-50px] w-64 md:w-96 h-64 md:h-96 bg-cyan-400 rounded-full blur-[60px] md:blur-[80px] opacity-30 z-0" />
                                            </>
                                        )}

                                        {slider.thumbnail && (
                                            <div className="absolute right-0 top-0 w-full md:w-[50%] h-full flex items-center justify-end md:justify-center p-4 md:p-8 z-10 opacity-100">
                                                <div className="relative w-1/2 md:w-full h-full max-h-[200px] md:max-h-[320px]">
                                                    <Image
                                                        src={slider.thumbnail}
                                                        alt={slider.title + " thumbnail"}
                                                        fill
                                                        className="object-contain object-right md:object-center drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                                                        unoptimized={slider.thumbnail.startsWith('data:')}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute top-1/2 left-6 md:left-14 -translate-y-1/2 z-20 text-white flex flex-col gap-1 md:gap-2 pr-4 w-full md:max-w-xl">
                                            <span className="text-cyan-300 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-1">
                                                {slider.subtitle || 'OFERTA ESPECIAL'}
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-2 tracking-tight leading-tight capitalize">
                                                {slider.title}
                                            </h2>
                                            <p className="text-xs sm:text-sm md:text-lg text-gray-100 mb-4 md:mb-8 max-w-[280px] md:max-w-[450px] font-medium">
                                                {slider.description || 'Lo mejor en tecnología para tu setup. Descubre nuestras ofertas exclusivas.'}
                                            </p>

                                            <div>
                                                <Link href={slider.link || "/search"} className="inline-block bg-white text-slate-900 px-6 md:px-10 py-2 md:py-3 rounded-[3px] font-bold shadow-lg hover:bg-[#1a3da1] hover:text-white transition-all text-sm md:text-base">
                                                    {slider.buttonText || 'Ver Ofertas'}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Slider Indicators */}
                        {sliders.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                                {sliders.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlider(i)}
                                        className={`w-2 md:w-8 h-1.5 rounded-full transition-all duration-300 ${i === currentSlider ? 'bg-white' : 'bg-white/20'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
