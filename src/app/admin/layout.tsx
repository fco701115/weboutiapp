'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const isAdminLogin = pathname === '/admin/login';

    useEffect(() => {
        if (status === 'loading' || isAdminLogin) return;

        if (status === 'unauthenticated') {
            router.push('/admin/login');
        } else if (session?.user) {
            const role = (session.user as any).role;
            if (role !== 'SUPER_ADMIN' && role !== 'EDITOR') {
                router.push('/admin/login?error=Unauthorized');
            }
        }
    }, [status, session, router, isAdminLogin]);

    if (isAdminLogin) {
        return <div className="min-h-screen bg-slate-50">{children}</div>;
    }

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>;
    }

    // Double check role before rendering protected content
    const userRole = (session?.user as any)?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'EDITOR') {
        return null; // The useEffect handles the redirect
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden">
            <AdminSidebar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            
            <div className="flex-grow flex flex-col min-h-screen transition-all duration-300 lg:pl-64">
                <AdminHeader setIsOpen={setIsMenuOpen} />
                <main className="p-4 md:p-8 flex-grow">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>


                <footer className="px-8 py-6 text-center border-t border-slate-200 bg-white">
                    <p className="text-[12px] font-medium text-slate-400">
                        © {new Date().getFullYear()} TG Admin Panel • Developed with ❤️ for Tech E-commerce
                    </p>
                </footer>
            </div>
            
            {/* Overlay for mobile */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}

