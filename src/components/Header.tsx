'use client';
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function Header() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { totalItems, setCartOpen, setMenuOpen } = useCart();
    const { wishlistCount, setWishlistOpen } = useWishlist();
    // `mounted` is used to guard rendering of cart and wishlist counts.
    // It can be initialized to `true` to avoid an extra render cycle.
    const [mounted, setMounted] = useState(true);
    const [localUser, setLocalUser] = useState<any>(null);
    
    // Search Autocomplete States
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLFormElement>(null);
    
    // The component is considered mounted from the start, so no effect is needed.

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

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 150);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch search results
    useEffect(() => {
        if (!debouncedSearchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            setShowDropdown(false);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            setShowDropdown(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error("Error fetching search results", error);
            } finally {
                setIsSearching(false);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                            className="md:hidden p-1 text-gray-700 hover:text-[#db0f70] cursor-pointer"
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
                            className="flex items-center gap-2 text-gray-700 hover:text-[#db0f70] cursor-pointer relative pr-2"
                        >
                            <Heart size={24} className="text-[#db0f70]" strokeWidth={2.5} />
                            {favCount > 0 && <span className="absolute -top-1 -right-1 bg-[#db0f70] text-white text-[9px] w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold">{favCount}</span>}
                        </div>

                        <div
                            onClick={() => setCartOpen(true)}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#db0f70] cursor-pointer relative pr-2 group"
                        >
                            <ShoppingCart size={30} className="text-[#db0f70]" />
                            {cartCount > 0 && <span className="absolute -top-1 right-0 bg-black text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">{cartCount}</span>}
                        </div>
                    </div>
                </div>

                <form ref={searchRef} onSubmit={handleSearch} className="w-full md:flex-1 md:max-w-xl md:px-12 relative">
                    <div className="flex w-full items-center border border-[#db0f70] rounded-sm overflow-hidden focus-within:ring-1 focus-within:ring-[#db0f70] focus-within:border-[#db0f70]">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchTerm(val);
                                if (val.trim()) {
                                    setIsSearching(true);
                                    setShowDropdown(true);
                                } else {
                                    setIsSearching(false);
                                    setShowDropdown(false);
                                }
                            }}
                            onFocus={() => {
                                if (searchTerm.trim()) setShowDropdown(true);
                            }}
                            placeholder="Buscar productos..."
                            className="flex-1 pt-[10px] pb-[10px] px-4 text-sm outline-none text-[#231f20]"
                        />
                        <button type="submit" className="bg-[#db0f70] text-white p-[10px] px-6 hover:bg-[#b50c5c] transition-colors">
                            <Search size={20} />
                        </button>
                    </div>

                    {showDropdown && searchTerm.trim() && (
                        <div className="absolute top-full left-0 right-0 md:left-12 md:right-12 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-[1001] max-h-[400px] overflow-y-auto">
                            {isSearching ? (
                                <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="flex flex-col">
                                    {searchResults.slice(0, 5).map((product: any) => (
                                        <Link 
                                            key={product.id} 
                                            href={`/product/${product.id}`}
                                            onClick={() => {
                                                setShowDropdown(false);
                                                setSearchTerm('');
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                                        >
                                            <div className="w-10 h-10 relative rounded overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                                                <Image 
                                                    src={product.imageUrl || "https://via.placeholder.com/150"} 
                                                    alt={product.name} 
                                                    fill 
                                                    className="object-cover" 
                                                    unoptimized={product.imageUrl?.startsWith('data:')}
                                                />
                                            </div>
                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <span className="text-sm font-bold text-gray-800 truncate">{product.name}</span>
                                                <span className="text-xs text-[#db0f70] font-black">${(product.salePrice || product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </Link>
                                    ))}
                                    {searchResults.length > 5 && (
                                        <Link 
                                            href={`/search?q=${encodeURIComponent(searchTerm.trim())}`}
                                            onClick={() => setShowDropdown(false)}
                                            className="p-3 text-center text-sm font-bold text-[#db0f70] hover:bg-gray-50 transition-colors"
                                        >
                                            Ver todos los resultados ({searchResults.length})
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">No se encontraron productos</div>
                            )}
                        </div>
                    )}
                </form>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/account" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center transition-all group-hover:border-[#db0f70] group-hover:bg-white overflow-hidden shadow-sm">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : user?.name ? (
                                <span className="text-[15px] font-black text-[#db0f70]">{user.name[0].toUpperCase()}</span>
                            ) : (
                                <User size={20} className="text-[#db0f70]" strokeWidth={2.5} />
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            {user ? (
                                <>
                                    <span className="text-[11px] font-bold text-gray-400 leading-none">Mi Cuenta</span>
                                    <span className="text-[14px] font-black text-gray-800 group-hover:text-[#db0f70] transition-colors leading-tight truncate max-w-[120px]">
                                        {user.name}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[14px] font-black text-gray-800 group-hover:text-[#db0f70] transition-colors leading-tight">
                                    Mi cuenta
                                </span>
                            )}
                        </div>
                    </Link>

                    <div 
                        onClick={() => setWishlistOpen(true)}
                        className="flex items-center gap-2 text-gray-700 hover:text-[#db0f70] cursor-pointer group relative pr-2"
                    >
                        <Heart size={28} className="text-[#db0f70] group-hover:fill-[#db0f70] transition-all" strokeWidth={2.5} />
                        {favCount > 0 && <span className="absolute -top-1 -right-1 bg-[#db0f70] text-white text-[9px] w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold animate-in zoom-in">{favCount}</span>}
                    </div>

                    <div
                        onClick={() => setCartOpen(true)}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#db0f70] cursor-pointer relative pr-2 group"
                    >
                        <ShoppingCart size={28} className="text-[#db0f70]" />
                        {cartCount > 0 && <span className="absolute -top-1 right-0 bg-black text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">{cartCount}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

