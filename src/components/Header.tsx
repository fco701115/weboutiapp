'use client';
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function Header() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { totalItems, setCartOpen, setMenuOpen } = useCart();
    const { wishlistCount, setWishlistOpen } = useWishlist();
    const [mounted, setMounted] = useState(false);
    const [localUser, setLocalUser] = useState<any>(null);
    
    // Check local storage for legacy login
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
    const displayName = user?.name || 'Invitado';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const cartCount = mounted ? totalItems : 0;
    const favCount = mounted ? wishlistCount : 0;

    return (
<div className="bg-white border-b border-gray-100 sticky top-0 z-[1000]">
            <div className="max-w-[1200px] mx-auto px-4 py-[16px] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-2">
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={() => setMenuOpen(true)}
                            className="md:hidden p-1 text-gray-700 hover:text-[#bea55b] cursor-pointer"
                        >
                            <Menu size={28} />
                        </div>
<Link href="/" prefetch={true} className="flex items-center gap-2">
                              <img src="/Logo-Boutique.png" alt="Logo" className="h-10 md:h-14 w-auto" />
                          </Link>
                    </div>

                    <div className="flex md:hidden items-center gap-4">
                        <div
                            onClick={() => setWishlistOpen(true)}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#bea55b] cursor-pointer relative pr-2"
                        >
                            <Heart size={24} className="text-[#db0f70]" strokeWidth={2.5} />
                            {favCount > 0 && <span className="absolute -top-1 -right-1 bg-[#bea55b] text-white text-[9px] w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">{favCount}</span>}
                        </div>

                        <div
                            onClick={() => setCartOpen(true)}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#bea55b] cursor-pointer relative pr-2 group"
                        >
                            <ShoppingCart size={30} className="text-[#db0f70]" />
                            {cartCount > 0 && <span className="absolute -top-1 right-0 bg-black text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">{cartCount}</span>}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="w-full md:flex-1 md:max-w-xl md:px-12">
                    <div className="flex w-full items-center border border-gray-300 rounded-sm overflow-hidden focus-within:ring-1 focus-within:ring-[#bea55b] focus-within:border-[#bea55b]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar productos..."
                            className="flex-1 pt-[10px] pb-[10px] px-4 text-sm outline-none text-[#db0f70]"
                        />
                        <button type="submit" className="bg-[#db0f70] text-white p-[10px] px-6 hover:bg-[#db0f70] transition-colors">
                            <Search size={20} />
                        </button>
                    </div>
                </form>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/account" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-white overflow-hidden shadow-sm">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : user?.name ? (
                                <span className="text-[15px] font-black text-[#bea55b]">{user.name[0].toUpperCase()}</span>
                            ) : (
                                <User size={20} className="text-[#db0f70]" strokeWidth={2.5} />
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            {user ? (
                                <>
                                    <span className="text-[11px] font-bold text-gray-400 leading-none">Mi Cuenta</span>
                                    <span className="text-[14px] font-black text-gray-800 group-hover:text-[#bea55b] transition-colors leading-tight truncate max-w-[120px]">
                                        {user.name}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[14px] font-black text-gray-800 group-hover:text-[#bea55b] transition-colors leading-tight">
                                    Mi cuenta
                                </span>
                            )}
                        </div>
                    </Link>

                    <div 
                        onClick={() => setWishlistOpen(true)}
                        className="flex items-center gap-2 text-gray-700 hover:text-[#bea55b] cursor-pointer group relative pr-2"
                    >
                        <Heart size={28} className="text-[#db0f70] group-hover:fill-[#db0f70] transition-all" strokeWidth={2.5} />
                        {favCount > 0 && <span className="absolute -top-1 -right-1 bg-[#bea55b] text-white text-[9px] w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold animate-in zoom-in">{favCount}</span>}
                    </div>

                    <div
                        onClick={() => setCartOpen(true)}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#bea55b] cursor-pointer relative pr-2 group"
                    >
                        <ShoppingCart size={28} className="text-[#db0f70]" />
                        {cartCount > 0 && <span className="absolute -top-1 right-0 bg-black text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">{cartCount}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

