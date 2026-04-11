'use client';


import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
    categoryId: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    toggleWishlist: (product: any) => void;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
    wishlistCount: number;
    isWishlistOpen: boolean;
    setWishlistOpen: (isOpen: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [localUser, setLocalUser] = useState<any>(null);

    // Get current user email from session or localStorage
    const userEmail = session?.user?.email || localUser?.email;

    // Load from localStorage and listen for user changes
    useEffect(() => {
        setMounted(true);
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error('Failed to parse wishlist');
            }
        }

        const checkUser = () => {
            const saved = localStorage.getItem('user');
            if (saved) setLocalUser(JSON.parse(saved));
        };
        checkUser();
        window.addEventListener('local-user-updated', checkUser);
        return () => window.removeEventListener('local-user-updated', checkUser);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, mounted]);

    // SYNC with DB when user is detected
    useEffect(() => {
        if (mounted && userEmail && wishlist.length > 0) {
            // Bulk sync (optimistic)
            wishlist.forEach(item => {
                fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productId: String(item.id), 
                        action: 'add',
                        userEmail: userEmail // Pass email to allow sync even without session
                    })
                }).catch(() => {});
            });
        }
    }, [userEmail, mounted]);

    const isInWishlist = (id: string) => {
        return wishlist.some((item) => String(item.id) === String(id));
    };

    const toggleWishlist = (product: any) => {
        setWishlist((prev) => {
            const exists = prev.find((item) => item.id === String(product.id));
            if (exists) {
                // Sync removal with DB
                fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productId: String(product.id), 
                        action: 'remove',
                        userEmail: userEmail
                    })
                }).catch(console.error);

                return prev.filter((item) => item.id !== String(product.id));
            } else {
                // Sync addition with DB
                fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productId: String(product.id), 
                        action: 'add',
                        userEmail: userEmail
                    })
                }).catch(console.error);

                const newItem: WishlistItem = {
                    id: String(product.id),
                    name: product.name,
                    price: Number(product.price),
                    image: (product.image || product.imageUrl || (Array.isArray(product.images) ? product.images[0] : product.images)) || '',
                    categoryId: product.categoryId || '',
                };
                return [...prev, newItem];
            }
        });
    };

    const clearWishlist = () => setWishlist([]);

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
                wishlistCount,
                isWishlistOpen,
                setWishlistOpen: setIsWishlistOpen,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}

