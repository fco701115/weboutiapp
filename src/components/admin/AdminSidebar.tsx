'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Tags,
    Image as ImageIcon,
    Flag,
    ShoppingCart,
    Users,
    Mail,
    LogOut,
    Star
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Productos', icon: Package, href: '/admin/products' },
    { name: 'Categorías', icon: Tags, href: '/admin/categories' },
    { name: 'Sliders', icon: ImageIcon, href: '/admin/sliders' },
    { name: 'Banners', icon: Flag, href: '/admin/banners' },
    { name: 'Ordenes', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'Mensajes', icon: Mail, href: '/admin/messages' },
    { name: 'Valoraciones', icon: Star, href: '/admin/reviews' },
    { name: 'Usuarios', icon: Users, href: '/admin/users' },
];


export function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
    const pathname = usePathname();
    const { clearCart } = useCart();
    const { clearWishlist } = useWishlist();

    const handleLogout = async () => {
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        clearCart();
        clearWishlist();
        window.dispatchEvent(new Event('local-user-updated'));
        await signOut({ callbackUrl: window.location.origin });
    };

    return (
        <aside className={`w-64 bg-[#0f172a] text-white h-screen flex flex-col fixed left-0 top-0 z-[60] border-r border-slate-800 shadow-2xl transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[14px]">TG</div>
                    Admin Panel
                </h1>
                {/* Close button for mobile */}
                <button 
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-slate-400 hover:text-white transition-all"
                >
                    <LayoutDashboard size={20} className="rotate-45" />
                </button>
            </div>


            <nav className="flex-grow p-4 space-y-1 overflow-y-auto no-scrollbar">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Principal</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                            <span className="font-semibold text-[14px]">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all mb-2"
                >
                    <LogOut size={20} className="rotate-180" />
                    <span className="font-semibold text-[14px]">Ver Tienda</span>
                </Link>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-semibold text-[14px]">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
