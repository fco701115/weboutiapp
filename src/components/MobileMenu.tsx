'use client';
import { useCart } from '@/context/CartContext';
import { X, ChevronRight, Home, ShoppingBag, User, Settings, Info, Phone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function MobileMenu() {
    const { data: session } = useSession();
    const { isMenuOpen, setMenuOpen } = useCart();
    const [mounted, setMounted] = useState(false);
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
    }, [session, isMenuOpen]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    if (!mounted) return null;

    const user = session?.user || localUser;

    const menuItems = [
        { icon: <Home size={20} />, label: 'Inicio', href: '/' },
        { icon: <ShoppingBag size={20} />, label: 'Productos', href: '/search' },
        { icon: <User size={20} />, label: 'Mi Cuenta', href: '/account' },
        { icon: <Info size={20} />, label: 'Nosotros', href: '/about' },
        { icon: <Phone size={20} />, label: 'Contacto', href: '/contact' },
    ];


    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-[2001] shadow-2xl transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
            >
                {/* Header */}
                <div className="bg-[#1a3da1] p-6 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/" onClick={() => setMenuOpen(false)}>
                            <span className="text-2xl font-black italic">Dazlea</span>
                        </Link>
                        <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={24} />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-sm">Hola, {user?.name || 'Invitado'}</p>
                            {!user ? (
                                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-xs text-blue-100 hover:underline">
                                    Iniciar sesión / Registrarse
                                </Link>
                            ) : (
                                <Link href="/account" onClick={() => setMenuOpen(false)} className="text-xs text-blue-100 hover:underline">
                                    Ver mi perfil
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pt-4 pb-10">
                    <div className="px-6 mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Navegación</h3>
                        <div className="space-y-1">
                            {menuItems.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-between py-3 text-gray-700 hover:text-[#1a3da1] transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 group-hover:text-[#1a3da1] transition-colors">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400 text-center">
                        © 2024 Dazlea. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </>
    );
}
