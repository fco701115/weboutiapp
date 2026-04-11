'use client';
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileMenu } from "@/components/MobileMenu";
import { CategoriesMenu } from "@/components/CategoriesMenu";
import { CartSidebar } from "@/components/CartSidebar";
import { WishlistSidebar } from "@/components/WishlistSidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <>
            <div className="sticky top-0 z-50 shadow-sm">
                <Header />
                <Navbar />
            </div>
            <main className="flex-grow pb-[70px] md:pb-0">
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <CartSidebar />
            <WishlistSidebar />
            <MobileMenu />
            <CategoriesMenu />
        </>
    );
}
