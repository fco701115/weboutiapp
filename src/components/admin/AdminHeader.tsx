'use client';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';


export function AdminHeader({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
    const { data: session } = useSession();
    const [localUser, setLocalUser] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem('user');
        if (saved) {
            try {
                setLocalUser(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse local user');
            }
        }
    }, []);

    const user = session?.user || localUser;

    const formatRole = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'Super Admin';
            case 'EDITOR': return 'Editor';
            case 'VIEWER': return 'Lector';
            case 'USER': return 'Cliente';
            default: return 'Admin';
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-[50] px-4 md:px-8 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/70">
            <div className="flex items-center gap-4 flex-1">
                {/* Hamburger menu for mobile */}
                <button 
                    onClick={() => setIsOpen(true)}
                    className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-all"
                >
                    <Menu size={24} />
                </button>

                <div className="relative w-96 group hidden md:block">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar en el panel..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-100/50 border-none rounded-xl text-[14px] focus:ring-2 ring-blue-500/10 focus:bg-white transition-all outline-none"
                    />
                </div>
            </div>


            <div className="flex items-center gap-3">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2" />

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="flex flex-col items-end">
                        <span className="text-[14px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-none">
                            {user?.name || 'Mi Cuenta'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                            {(user as any)?.role ? formatRole((user as any).role) : 'Administrador'}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20">
                        <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                            ) : (
                                <User size={22} className="text-blue-600" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
