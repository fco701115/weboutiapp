'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: any, quantity?: number, openCart?: boolean) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setCartOpen: (isOpen: boolean) => void;
    isMenuOpen: boolean;
    setMenuOpen: (isOpen: boolean) => void;
    isCategoriesOpen: boolean;
    setCategoriesOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart');
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: any, quantity: number = 1, openCart: boolean = true) => {
        setItems((prev) => {
            const existingItem = prev.find((item) => item.id === String(product.id));
            if (existingItem) {
                return prev.map((item) =>
                    item.id === String(product.id)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            const newItem: CartItem = {
                id: String(product.id),
                name: product.name,
                price: Number(product.price),
                image: (product.image || product.imageUrl || (Array.isArray(product.images) ? product.images[0] : product.images)) || '',
                quantity: quantity,
            };
            return [...prev, newItem];
        });
        if (openCart) {
            setIsCartOpen(true); // Open cart when item added if requested
        }
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== String(id)));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((item) => (item.id === String(id) ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                setCartOpen: setIsCartOpen,
                isMenuOpen,
                setMenuOpen: setIsMenuOpen,
                isCategoriesOpen,
                setCategoriesOpen: setIsCategoriesOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
