'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartSidebar() {
    const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setCartOpen } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[1001] overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => setCartOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1a3da1] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <ShoppingBag size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Mi Carrito</h2>
                        </div>
                        <button
                            onClick={() => setCartOpen(false)}
                            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                        >
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <ShoppingBag size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">Tu carrito está vacío</p>
                                    <p className="text-slate-500 text-sm">¡Agrega algunos productos para empezar!</p>
                                </div>
                                <button
                                    onClick={() => setCartOpen(false)}
                                    className="bg-[#1a3da1] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#153288] transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Continuar comprando
                                </button>
                            </div>
                        ) : (
                            items.map((item) => (
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
                                            <h3 className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2 hover:text-[#1a3da1] transition-colors">
                                                <Link href={`/product/${item.id}`} onClick={() => setCartOpen(false)}>
                                                    {item.name}
                                                </Link>
                                            </h3>
                                            <p className="text-[#1a3da1] font-bold mt-1 text-[15px]">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-600 shadow-sm border border-transparent hover:border-slate-200"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-6 text-center text-[14px] font-bold text-slate-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-600 shadow-sm border border-transparent hover:border-slate-200"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-6 border-t border-slate-100 bg-[#fcfdfd] space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-bold text-[14px]">SUBTOTAL</span>
                                    <span className="text-[18px] font-black text-slate-900">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-[12px] font-medium">ENVÍO</span>
                                    <span className="text-[12px] font-bold uppercase">Calculado al checkout</span>
                                </div>
                                <div className="h-px bg-slate-100 w-full" />
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-900 font-extrabold text-[16px]">TOTAL</span>
                                    <span className="text-[22px] font-black text-[#1a3da1]">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <Link
                                    href="/checkout"
                                    onClick={() => setCartOpen(false)}
                                    className="w-full h-14 bg-[#1a3892] text-white rounded-[20px] font-bold flex items-center justify-center gap-3 hover:bg-[#153288] transition-all shadow-xl active:scale-95"
                                >
                                    PAGAR AHORA
                                    <ArrowRight size={20} />
                                </Link>
                                <button
                                    onClick={() => setCartOpen(false)}
                                    className="w-full text-center text-[12px] font-bold text-slate-400 hover:text-slate-600 py-1 transition-colors uppercase tracking-widest"
                                >
                                    Seguir comprando
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
