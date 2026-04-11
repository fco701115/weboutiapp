'use client';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={48} className="text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h1>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Parece que aún no has añadido nada a tu carrito. ¡Explora nuestra tienda y encuentra algo increíble!
                </p>
                <Link
                    href="/"
                    className="bg-[#1a3da1] text-white px-8 py-3 rounded-md font-bold hover:bg-blue-800 transition-colors"
                >
                    Ir a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-[1200px] mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                    <ShoppingBag className="text-[#1a3da1]" />
                    Carrito de Compras ({totalItems})
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                <Link href={`/product/${item.id}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:opacity-80 transition-opacity">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link href={`/product/${item.id}`}>
                                        <h3 className="font-bold text-gray-800 text-[16px] truncate hover:text-[#1a3da1] transition-colors cursor-pointer">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <p className="text-[#1a3da1] font-bold text-[16px] mt-1">
                                        $ {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-gray-300 rounded overflow-hidden h-8">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-2 hover:bg-gray-100 text-gray-600 transition-colors border-r border-gray-300"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-4 font-bold text-sm text-gray-800">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-2 hover:bg-gray-100 text-gray-600 transition-colors border-l border-gray-300"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                                        >
                                            <Trash2 size={16} />
                                            <span className="hidden sm:inline">Eliminar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Link href="/" className="inline-flex items-center gap-2 text-[#1a3da1] font-bold hover:underline mt-4">
                            <ArrowLeft size={18} />
                            Continuar Comprando
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Resumen del Pedido</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Subtotal ({totalItems} productos)</span>
                                    <span>$ {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Envío estimado</span>
                                    <span className="text-green-600">GRATIS</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-2xl font-extrabold text-[#f15922]">$ {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <button className="w-full bg-[#f15922] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d44a19] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mb-4">
                                Finalizar Compra
                            </button>

                            <p className="text-[12px] text-gray-400 text-center">
                                Pagos seguros y protegidos.<br />Garantía de satisfacción Dazlea.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
