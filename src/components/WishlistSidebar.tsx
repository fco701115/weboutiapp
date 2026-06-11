'use client';

import React, { useEffect, useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { X, Heart, Trash2, ShoppingCart, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function WishlistSidebar() {
    const { wishlist, toggleWishlist, isWishlistOpen, setWishlistOpen } = useWishlist();
    const { addItem } = useCart();
    const [mounted, setMounted] = useState(false);
    const [showAddToast, setShowAddToast] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAddToCart = (item: any) => {
        addItem(item, 1, false);
        setShowAddToast(true);
        setTimeout(() => setShowAddToast(false), 2000);
    };

    if (!mounted || !isWishlistOpen) return null;

    return (
        <div className="fixed inset-0 z-[1001] overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => setWishlistOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                <Heart size={20} fill="currentColor" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Mis Favoritos</h2>
                        </div>
                        <button
                            onClick={() => setWishlistOpen(false)}
                            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                        >
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
                        {wishlist.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <Heart size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">Tu lista está vacía</p>
                                    <p className="text-slate-500 text-sm">¡Guarda los productos que más te gusten!</p>
                                </div>
                                    <button
                                     onClick={() => setWishlistOpen(false)}
                                     className="bg-[#bea55b] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg shadow-green-500/20"
                                 >
                                    Explorar productos
                                </button>
                            </div>
                        ) : (
                            wishlist.map((item) => (
                                <div key={item.id} className="flex gap-4 group animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 shrink-0">
                                        <Image
                                            src={item.image || 'https://images.unsplash.com/photo-1527814732934-7191d90213ff?q=80&w=100&h=100&fit=crop'}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                            unoptimized={item.image?.startsWith('data:')}
                                        />
                                    </div>
                                    <div className="flex flex-col flex-grow justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2 hover:text-[#bea55b] transition-colors">
                                                <Link href={`/product/${item.id}`} onClick={() => setWishlistOpen(false)}>
                                                    {item.name}
                                                </Link>
                                            </h3>
                                            <p className="text-[#db0f70] font-bold mt-1 text-[15px]">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="flex items-center gap-2 text-[12px] font-bold text-[#bea55b] hover:text-slate-900 transition-colors uppercase tracking-wider"
                                            >
                                                <ShoppingCart size={14} />
                                                Agregar al carrito
                                            </button>
                                            <button
                                                onClick={() => toggleWishlist(item)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                title="Eliminar de favoritos"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Success Toast */}
                        {showAddToast && (
                            <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-80 z-[1002] animate-in slide-in-from-bottom-4 fade-in duration-300">
                                <div className="bg-[#bea55b] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                        <Check size={18} strokeWidth={3} />
                                    </div>
                                    <p className="text-[14px] font-bold leading-tight">
                                        ¡Producto agregado al carrito de compra!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-[#fcfdfd]">
                        <button
                            onClick={() => setWishlistOpen(false)}
                            className="w-full h-14 bg-slate-900 text-white rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                        >
                            CONTINUAR COMPRANDO
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

