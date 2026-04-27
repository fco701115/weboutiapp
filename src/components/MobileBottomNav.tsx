'use client';
import { Menu, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function MobileBottomNav() {
    const { data: session } = useSession();
    const { totalItems, setCartOpen, setMenuOpen, setCategoriesOpen } = useCart();
    const [mounted, setMounted] = useState(false);
    
    // Check local storage for legacy login
    const [localUser, setLocalUser] = useState<any>(null);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkUser = () => {
            const saved = localStorage.getItem('user');
            if (saved) {
                try {
                    setLocalUser(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse local user');
                }
            } else {
                setLocalUser(null);
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        window.addEventListener('local-user-updated', checkUser);
        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('local-user-updated', checkUser);
        };
    }, [session]);

    const user = session?.user || localUser;

    const count = mounted ? totalItems : 0;
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] h-[70px] px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around h-full relative">

                {/* Category */}
                <div
                    onClick={() => setCategoriesOpen(true)}
                    className="flex flex-col items-center gap-1 text-gray-700 cursor-pointer"
                >
                    <Menu size={22} strokeWidth={2.5} />
                    <span className="text-[12px] font-bold">Categorias</span>
                </div>

                {/* Mensaje / WhatsApp */}
                <Link
                    href="https://wa.me/8809638365975"
                    target="_blank"
                    className="flex flex-col items-center gap-1 text-gray-700 transition-transform duration-200 hover:-translate-y-1 active:-translate-y-1"
                >
                    {/* WhatsApp outline icon — teléfono dentro de burbuja circular */}
                    <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="16" cy="16" r="13" />
                        <path d="M22 20.5c-.3-.15-1.8-.88-2.08-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.23-.65.08-1.8-.9-2.98-1.6-4.17-3.63-.32-.55.32-.51.91-1.7.1-.2.05-.37-.03-.52-.08-.15-.68-1.63-.93-2.23-.25-.58-.5-.5-.68-.51-.18-.01-.38-.01-.58-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49 1.89.82 2.63.89 3.57.75.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41z" />
                    </svg>
                    <span className="text-[12px] font-bold">Mensaje</span>
                </Link>

                {/* Home - Floating Center Button */}
                <div className="relative -top-4">
                    <Link href="/" className="flex flex-col items-center">
                        <div className="w-[64px] h-[64px] bg-[#1991F2] rounded-full shadow-[0_4px_15px_rgba(25,145,242,0.4)] flex flex-col items-center justify-center text-white transition-transform active:scale-90 overflow-hidden">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="white" className="mb-0.5">
                                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                            </svg>
                            <span className="text-[10px] font-bold leading-none">Inicio</span>
                        </div>
                    </Link>
                </div>

                {/* Cart */}
                <div
                    onClick={() => setCartOpen(true)}
                    className="flex flex-col items-center gap-1 text-gray-700 cursor-pointer"
                >
                    <div className="relative">
                        <ShoppingCart size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-bold">Cart ({count})</span>
                </div>

                {/* Perfil */}
                <Link
                    href={user ? "/account" : "/login"}
                    className="flex flex-col items-center gap-1 text-gray-700 transition-transform duration-200 hover:-translate-y-1 active:-translate-y-1"
                >
                    {user?.image ? (
                        <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full border border-slate-200" />
                    ) : (
                        <User size={22} strokeWidth={2.5} />
                    )}
                    <span className="text-[12px] font-bold">Mi cuenta</span>
                </Link>

            </div>
        </div>
    );
}
