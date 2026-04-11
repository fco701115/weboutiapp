'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ChevronLeft, Truck, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Minus, Plus, Trash2, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { data: session, status } = useSession();
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(true);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        neighborhood: '',
        locality: '',
        city: '',
        postalCode: '',
        phone: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('CASH');

    React.useEffect(() => {
        const loadUserData = (email: string, name: string) => {
            if (!formData.email) {
                const parts = name.split(' ');
                setFormData(prev => ({
                    ...prev,
                    email: email,
                    firstName: prev.firstName || parts[0] || '',
                    lastName: prev.lastName || parts.slice(1).join(' ') || ''
                }));
            }
            
            const stored = localStorage.getItem(`addresses_${email}`);
            if (stored) {
                const parsedAddresses = JSON.parse(stored);
                setSavedAddresses(parsedAddresses);
                if (parsedAddresses.length > 0) {
                    const addr = parsedAddresses[0];
                    setFormData(prev => ({
                        ...prev,
                        firstName: addr.contactName ? addr.contactName.split(' ')[0] : prev.firstName,
                        lastName: addr.contactName ? addr.contactName.split(' ').slice(1).join(' ') : prev.lastName,
                        address: addr.street || prev.address,
                        neighborhood: addr.neighborhood || '',
                        locality: addr.locality || '',
                        city: addr.city || '',
                        postalCode: addr.postalCode || '',
                        indications: addr.indications || '',
                        phone: addr.phone || prev.phone
                    } as any));
                    setShowAddressForm(false);
                    setSelectedAddressIndex(0);
                } else {
                    setShowAddressForm(true);
                }
            } else {
                setShowAddressForm(true);
            }
        };

        if (status === 'authenticated' && session?.user?.email) {
            loadUserData(session.user.email, session.user.name || '');
        } else if (status === 'unauthenticated') {
            const localUser = localStorage.getItem('user');
            if (localUser) {
                const parsed = JSON.parse(localUser);
                loadUserData(parsed.email, parsed.name || '');
            }
        }
    }, [session, status]);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const currentAddr = !showAddressForm && savedAddresses[selectedAddressIndex] 
                ? savedAddresses[selectedAddressIndex]
                : {
                    title: 'Ingresada Manualmente',
                    street: formData.address,
                    neighborhood: formData.neighborhood,
                    locality: formData.locality,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    indications: (formData as any).indications || ''
                };

            const addressTitle = currentAddr.title || 'Dirección';
            
            // Structured Address String: [Type] Street, Neighborhood, Locality, City. (Ind: ...) (CP: ...) Tel: ...
            const structuredAddress = `[${addressTitle}] ${currentAddr.street.trim()}, ${currentAddr.neighborhood.trim()}, ${currentAddr.locality.trim()}, ${currentAddr.city.trim()}. ${currentAddr.indications ? `(Ind: ${currentAddr.indications.trim()}) ` : ''}${currentAddr.postalCode ? `(CP: ${currentAddr.postalCode.trim()}) ` : ''}Tel: ${formData.phone.trim()}`;

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                    email: formData.email.trim().toLowerCase(),
                    address: structuredAddress,
                    total: totalPrice,
                    status: 'PENDING',
                    paymentMethod,
                    items: items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        quantity: item.quantity
                    }))
                })
            });

            if (res.ok) {
                setIsSuccess(true);
                clearCart();
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            alert('Error al procesar el pedido. Intenta de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-500 mb-8 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-[40px] font-black text-slate-900 tracking-tighter leading-tight mb-4">
                    ¡Pedido Realizado!
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-md mx-auto mb-10">
                    Gracias por tu compra. Te hemos enviado un correo con los detalles de tu pedido.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black text-[14px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                    Volver a la tienda
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Tu carro está vacío</h2>
                <Link href="/" className="text-[#1a3da1] font-bold hover:underline">Ir a comprar productos</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="max-w-[1200px] mx-auto px-4 py-10">
                <div className="flex items-center gap-2 mb-10">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[14px] transition-colors">
                        <ChevronLeft size={18} />
                        VOLVER A LA TIENDA
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Form side */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-8 md:p-12">
                            <h2 className="text-[28px] font-black text-slate-900 mb-8 tracking-tighter flex items-center gap-4">
                                <span className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 text-lg">1</span>
                                Información de Envío
                            </h2>

                            {!showAddressForm && savedAddresses.length > 0 ? (
                                <div className="p-6 border-2 border-[#1a3da1] rounded-2xl bg-[#1a3da1]/5 flex justify-between items-start group relative mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-[#1a3da1] flex items-center justify-center border border-[#1a3da1]/20 mt-1">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 flex items-center gap-2 text-lg">
                                                {savedAddresses[selectedAddressIndex]?.title || 'Dirección de Envío'}
                                                <span className="px-2 py-0.5 bg-[#1a3da1] text-white text-[10px] rounded-full uppercase tracking-widest font-bold ml-2">Seleccionada</span>
                                            </p>
                                            <p className="text-slate-600 font-black mt-2 text-[15px]">{formData.firstName} {formData.lastName}</p>
                                            <p className="text-slate-800 font-bold mt-1 text-[16px]">{savedAddresses[selectedAddressIndex]?.street || formData.address}</p>
                                            
                                            {savedAddresses[selectedAddressIndex]?.indications && (
                                                <div className="mt-2 mb-1">
                                                    <span className="text-[9px] font-black text-[#1a3da1] uppercase tracking-widest block mb-0.5">Indicación para la entrega:</span>
                                                    <p className="text-[#1a3da1] font-bold text-[12px] bg-[#1a3da1]/5 inline-block px-3 py-1.5 rounded-xl border border-[#1a3da1]/10">
                                                        {savedAddresses[selectedAddressIndex].indications}
                                                    </p>
                                                </div>
                                            )}

                                            {(savedAddresses[selectedAddressIndex]?.neighborhood || savedAddresses[selectedAddressIndex]?.locality) && (
                                                <p className="text-slate-500 font-medium mt-1">
                                                    {savedAddresses[selectedAddressIndex]?.locality}
                                                    {savedAddresses[selectedAddressIndex]?.neighborhood ? `, ${savedAddresses[selectedAddressIndex].neighborhood}` : ''}
                                                </p>
                                            )}
                                            <p className="text-slate-500 font-medium">{formData.city}</p>
                                            {savedAddresses[selectedAddressIndex]?.mapUrl && (
                                                <div className="mt-4 rounded-xl overflow-hidden border border-[#1a3da1]/20 h-[110px] relative group/checkout-map shadow-inner">
                                                    <iframe 
                                                        width="100%" 
                                                        height="100%" 
                                                        frameBorder="0" 
                                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(savedAddresses[selectedAddressIndex]?.mapAddress || (formData.address + ', ' + formData.city))}&t=m&z=15&output=embed`}
                                                        className="w-full h-full grayscale-[30%] group-hover/checkout-map:grayscale-0 transition-all duration-500"
                                                    ></iframe>
                                                    
                                                     {/* Indigo House Marker Overlay */}
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[90%] pointer-events-none z-[10] flex flex-col items-center scale-75">
                                                        <div className="w-3 h-1 bg-black/20 rounded-full blur-[1px] mb-[-2px]"></div>
                                                        <svg width="32" height="40" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                                                            <path d="M50 115C45 105 5 60 5 40C5 17.9086 25.1472 0 50 0C74.8528 0 95 17.9086 95 40C95 60 55 105 50 115Z" fill="#1a3da1" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
                                                            <circle cx="50" cy="40" r="22" fill="white" />
                                                            <path d="M50 24L32 38H38V58H62V38H68L50 24Z" fill="#1a3da1" />
                                                            <path d="M48 50H52V58H48V50Z" fill="white" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-slate-500 font-medium mt-1 text-sm bg-white inline-block px-3 py-1 rounded-lg border border-slate-100">{'📞 ' + formData.phone}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="text-[#1a3da1] font-black text-[12px] uppercase tracking-widest px-4 py-2 hover:bg-blue-100 rounded-xl transition-colors shrink-0"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : null}

                            <form onSubmit={handleCheckout} className="space-y-6">
                                {showAddressForm && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Nombre</label>
                                                <input
                                                    required
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    type="text"
                                                    placeholder="Juan"
                                                    className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Apellido</label>
                                                <input
                                                    required
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    type="text"
                                                    placeholder="Pérez"
                                                    className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Correo Electrónico</label>
                                            <input
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                type="email"
                                                placeholder="juan@ejemplo.com"
                                                className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Dirección de Entrega</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    type="text"
                                                    placeholder="Calle Principal #123"
                                                    className="w-full h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                />
                                                {savedAddresses.length > 0 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setIsAddressModalOpen(true)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[#1a3da1] hover:underline"
                                                    >
                                                        Usar Guardada
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div className="flex flex-col gap-2">
                                                 <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Localidad</label>
                                                 <input
                                                     required
                                                     value={formData.locality}
                                                     onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                                                     type="text"
                                                     placeholder="Tehuacán"
                                                     className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                 />
                                             </div>
                                             <div className="flex flex-col gap-2">
                                                 <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Colonia o Barrio</label>
                                                 <input
                                                     value={formData.neighborhood}
                                                     onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                     type="text"
                                                     placeholder="Centro"
                                                     className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                 />
                                             </div>
                                         </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div className="flex flex-col gap-2">
                                                 <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Ciudad / Estado</label>
                                                 <input
                                                     required
                                                     value={formData.city}
                                                     onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                     type="text"
                                                     placeholder="Puebla"
                                                     className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                 />
                                             </div>
                                             <div className="flex flex-col gap-2">
                                                 <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Código Postal</label>
                                                 <input
                                                     required
                                                     value={formData.postalCode}
                                                     onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                     type="text"
                                                     placeholder="75700"
                                                     className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                 />
                                             </div>
                                         </div>

                                         <div className="flex flex-col gap-2">
                                             <label className="text-[12px] font-black text-[lab(40_-1.58_-10.29)] uppercase tracking-widest px-1">Teléfono</label>
                                             <input
                                                 required
                                                 value={formData.phone}
                                                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                 type="tel"
                                                 placeholder="+52 55..."
                                                 className="h-[45px] px-5 bg-slate-50 border border-[#ccc] rounded-[4px] font-bold text-[var(--color-gray-900)] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                             />
                                         </div>
                                    </>
                                )}

                                {/* Payment placeholder section */}
                                <div className="pt-10">
                                    <h2 className="text-[28px] font-black text-slate-900 mb-8 tracking-tighter flex items-center gap-4">
                                        <span className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 text-lg">2</span>
                                        Método de Pago
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setPaymentMethod('CASH')}
                                            className={`border rounded-[15px] p-6 flex flex-col gap-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-[#1a3da1] bg-white shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 opacity-60'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'CASH' ? 'bg-[#1a3da1] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <Truck size={20} />
                                            </div>
                                            <span className={`font-black text-[14px] uppercase tracking-widest ${paymentMethod === 'CASH' ? 'text-slate-900' : 'text-slate-400'}`}>Pago al recibir</span>
                                        </div>
                                        <div 
                                            onClick={() => setPaymentMethod('CARD')}
                                            className={`border rounded-[15px] p-6 flex flex-col gap-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-[#1a3da1] bg-white shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 opacity-60'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'CARD' ? 'bg-[#1a3da1] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <span className={`font-black text-[14px] uppercase tracking-widest ${paymentMethod === 'CARD' ? 'text-slate-900' : 'text-slate-400'}`}>Tarjeta</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isProcessing}
                                    className={`w-full h-[54px] mt-8 rounded-[8px] font-black text-[16px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1a3892] text-white hover:bg-black active:scale-[0.98]'}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            PROCESANDO...
                                        </>
                                    ) : (
                                        <>
                                            FINALIZAR PEDIDO
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Summary side */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900 text-white rounded-[8px] shadow-2xl p-8 md:p-10 sticky top-24">
                            <h3 className="text-[22px] font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-6">Resumen del Pedido</h3>

                            <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center group relative border-b border-white/5 pb-6 last:border-0 last:pb-0">
                                        <div className="w-16 h-16 bg-white/5 rounded-[5px] overflow-hidden relative shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
                                            <Image
                                                src={item.image || 'https://via.placeholder.com/100'}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized={item.image?.startsWith('data:')}
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-[14px] leading-tight truncate text-white/90">{item.name}</p>

                                            <div className="flex items-center gap-4 mt-2">
                                                {/* Price - showing unit price or item total depending on space */}
                                                <p className="text-white/40 text-[12px] font-bold">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

                                                {/* Quantity Selector Mini */}
                                                <div className="flex items-center bg-white/10 rounded-lg overflow-hidden h-7 border border-white/10">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-1.5 hover:bg-white/10 text-white/60 transition-colors border-r border-white/5"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="px-2.5 font-black text-[11px] text-white">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="px-1.5 hover:bg-white/10 text-white/60 transition-colors border-l border-white/5"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-black text-[14px] tracking-tighter text-white">${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-white/60">
                                    <span className="text-[14px] font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-lg">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/40">
                                    <span className="text-[14px] font-bold uppercase tracking-widest">Envío</span>
                                    <span className="font-black text-[14px]">GRATIS</span>
                                </div>
                                <div className="h-px bg-white/10 w-full my-2" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[18px] font-black uppercase tracking-tighter">Total Final</span>
                                    <span className="text-[32px] font-black text-white tracking-tighter">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-3 bg-white/5 p-4 rounded-2xl text-white/50 text-[12px] font-medium leading-tight">
                                <ShieldCheck size={28} className="text-emerald-500" />
                                Pago Seguro 256-bit SSL. Tus datos personales se procesan de forma privada.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal de Direcciones */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Mis Direcciones de Envío</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="bg-slate-50 hover:bg-slate-200 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {savedAddresses.map((addr, idx) => (
                                <div 
                                    key={addr.id}
                                    onClick={() => {
                                        setSelectedAddressIndex(idx);
                                        setFormData(prev => ({
                                            ...prev,
                                            address: addr.street,
                                            city: addr.city + (addr.postalCode ? `, CP: ${addr.postalCode}` : ''),
                                            phone: addr.phone || prev.phone
                                        }));
                                        setShowAddressForm(false);
                                        setIsAddressModalOpen(false);
                                    }}
                                    className={`p-5 pl-14 border-2 rounded-2xl cursor-pointer transition-all relative group ${idx === selectedAddressIndex ? 'border-[#1a3da1] bg-[#1a3da1]/5 shadow-md shadow-blue-500/10' : 'border-slate-100 hover:border-[#1a3da1]/40'}`}
                                >
                                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${idx === selectedAddressIndex ? 'border-[#1a3da1]' : 'border-slate-300'}`}>
                                        {idx === selectedAddressIndex && <div className="w-2.5 h-2.5 bg-[#1a3da1] rounded-full" />}
                                    </div>
                                    
                                    <p className="font-black text-slate-900 mb-1">{addr.title || 'Dirección'}</p>
                                    <p className="text-sm text-slate-600 leading-tight">{addr.street}</p>
                                    <p className="text-sm text-slate-500 leading-tight mt-0.5">{addr.city}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button 
                                onClick={() => {
                                    setShowAddressForm(true);
                                    setIsAddressModalOpen(false);
                                    // Limpiamos los campos para escribir uno nuevo
                                    setFormData(prev => ({ ...prev, address: '', city: '', phone: '' }));
                                }}
                                className="text-[#1a3da1] font-bold text-sm tracking-wide hover:underline"
                            >
                                + Ingresar Manualmente
                            </button>
                            <button onClick={() => setIsAddressModalOpen(false)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-lg hover:bg-black transition-all">Hecho</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
