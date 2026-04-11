'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function PromoBanners() {
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchBanners = async () => {
            try {
                const res = await fetch('/api/banners');
                if (res.ok) {
                    const data = await res.json();
                    setBanners(data);
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (!mounted) {
        return <div className="w-full max-w-[1200px] mx-auto py-8 px-[10px] h-[200px]" />;
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto py-8 px-[10px]">
            {isLoading ? (
                <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : banners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className={`relative h-[180px] md:h-[220px] rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-slate-900 ${banner.type === 'Simple' ? 'md:col-span-2' : 'col-span-1'}`}
                        >
                            {banner.image && (
                                <Image
                                    src={banner.image}
                                    alt={banner.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    unoptimized={banner.image.startsWith('data:')}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent p-6 flex flex-col justify-end">
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-1 drop-shadow-md">
                                    {banner.title}
                                </h3>
                                {banner.subtitle && (
                                    <p className="text-white/90 text-[14px] md:text-[16px] font-medium drop-shadow-md">
                                        {banner.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
