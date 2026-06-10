'use client';
import { Menu, Laptop, Smartphone, Gamepad as GamepadIcon, Speaker, Camera, Watch, Monitor, Mouse, Headphones, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isHome = pathname === '/';

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [categories, setCategories] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    if (!mounted) return (
        <div className="bg-[#f9077b] text-white hidden md:block h-[50px]" />
    );

    const getIcon = (name: string) => {
        if (!name) return <Laptop size={18} />;
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
        return <Laptop size={18} />; // Default fallback
    };

    return (
        <div className="bg-[#e1cb8a] text-white hidden md:block">
            <div className="max-w-[1200px] mx-auto flex items-center h-[50px] px-4 relative bg-[#db0f70]">
                {/* Categories Dropdown Trigger (Desktop only) */}
                <div className="relative h-full" ref={dropdownRef}>
<div
                     onClick={() => {
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                         if (!isHome) setIsOpen(!isOpen);
                     }}
                      className={`hidden md:flex bg-[#ab0707] h-full items-center gap-3 px-6 h-full transition-colors w-[286px] text-[14px] font-bold flex-shrink-0 cursor-pointer ${!isHome ? 'hover:bg-[#ab0707]' : 'hover:bg-[#ab0707]'}`}
                 >
                        <Menu size={20} />
                        Categorías
                    </div>

                    {/* Dropdown Menu - Only functional on non-home pages */}
                    {!isHome && (
                        <div className={`absolute top-full left-0 w-[286px] bg-white border border-gray-100 shadow-xl rounded-b-md overflow-hidden transition-all duration-200 origin-top z-[100] ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                            <div className="py-2">
                                {categories.map((cat, i) => (
                                    <Link
                                        key={cat.id || i}
                                        href={`/search?category=${cat.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between px-6 py-[10px] text-gray-700 hover:bg-gray-50 hover:text-[#bea55b] transition-all group border-b border-gray-50/50 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-gray-400 group-hover:text-[#bea55b] group-hover:scale-110 transition-all w-5 h-5 flex items-center justify-center">
                                                {cat.imageUrl ? (
                                                    <div className="relative w-full h-full overflow-hidden rounded-sm">
                                                        <Image
                                                            src={cat.imageUrl}
                                                            alt={cat.name || 'Categoría'}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized={cat.imageUrl && cat.imageUrl.startsWith('data:')}
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
                        </div>
                    )}
                </div>

                {/* Links */}
                <nav className="flex-1 flex items-center ml-8">
                    <ul className="flex items-center gap-8 text-[16px] font-semibold whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <li>
                            <Link href="/" className="hover:text-gray-300 transition-colors">Inicio</Link>
                        </li>
                        <li>
                            <Link href="/search" prefetch={true} className="hover:text-gray-300 transition-colors">Productos</Link>
                        </li>
                        <li>
                            <Link href="/account" className="hover:text-gray-300 transition-colors">Mi Cuenta</Link>
                        </li>
                    </ul>
                    <div className="ml-auto">
                        <Link href="/contact" className="hover:text-gray-300 transition-colors font-semibold text-[16px]" style={{ fontFamily: 'Roboto, sans-serif' }}>Contacto</Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}

