'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ChevronLeft, Truck, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Minus, Plus, Trash2, MapPin, Lock, HelpCircle, Landmark } from 'lucide-react';
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
        indications: '',
        addressType: 'Casa', // 'Casa', 'Trabajo', 'Lugar'
    });

    const [paymentMethod, setPaymentMethod] = useState('CASH');

    // Card payment state
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardHolder: '',
        useSameAddress: true,
    });
    const [showCvvTooltip, setShowCvvTooltip] = useState(false);

    // Format card number with spaces every 4 digits
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    // Format expiry MM/AA
    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        return cleaned;
    };

    // Detect card type
    const getCardType = (num: string) => {
        const n = num.replace(/\s/g, '');
        if (/^4/.test(n)) return 'visa';
        if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
        if (/^3[47]/.test(n)) return 'amex';
        return null;
    };

    const cardType = getCardType(cardData.cardNumber);

    React.useEffect(() => {
        const loadUserData = async (email: string, name: string) => {
            // Pre-fill basic info
            const parts = name.split(' ');
            setFormData(prev => ({
                ...prev,
                email: email,
                firstName: prev.firstName || parts[0] || '',
                lastName: prev.lastName || parts.slice(1).join(' ') || ''
            }));

            let parsedAddresses: any[] = [];
            
            // 1. Try to load from localStorage first (for speed)
            const stored = localStorage.getItem(`addresses_${email}`);
            if (stored) {
                try {
                    parsedAddresses = JSON.parse(stored);
                } catch (e) {
                    console.error('Error parsing local addresses');
                }
            }

            // 2. If authenticated and no local addresses (or just to keep in sync), fetch from DB
            if (status === 'authenticated') {
                try {
                    const res = await fetch('/api/users');
                    const allUsers = await res.json();
                    if (Array.isArray(allUsers)) {
                        const dbUser = allUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
                        if (dbUser && dbUser.addresses) {
                            const dbAddresses = JSON.parse(dbUser.addresses);
                            if (Array.isArray(dbAddresses) && dbAddresses.length > 0) {
                                // Prioritize DB addresses or merge
                                parsedAddresses = dbAddresses;
                                // Sync local storage
                                localStorage.setItem(`addresses_${email}`, JSON.stringify(dbAddresses));
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user addresses from DB:', error);
                }
            }
            
            if (parsedAddresses.length > 0) {
                setSavedAddresses(parsedAddresses);
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
                }));
                setShowAddressForm(false);
                setSelectedAddressIndex(0);
            } else {
                setShowAddressForm(true);
            }
        };

        if (status === 'authenticated' && session?.user?.email) {
            loadUserData(session.user.email, session.user.name || '');
        } else if (status === 'unauthenticated') {
            const localUser = localStorage.getItem('user');
            if (localUser) {
                try {
                    const parsed = JSON.parse(localUser);
                    if (parsed && parsed.email) {
                        loadUserData(parsed.email, parsed.name || '');
                    }
                } catch (e) {
                    console.error('Error parsing local user');
                }
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
                    title: formData.addressType,
                    street: formData.address,
                    neighborhood: formData.neighborhood,
                    locality: formData.locality,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    indications: formData.indications || ''
                };

            const addressTitle = currentAddr.title || formData.addressType || 'Dirección';
            
            // Structured Address String: [Type] Street, Neighborhood, Locality, City. (Ind: ...) (CP: ...) Tel: ...
            const structuredAddress = `[${addressTitle}] ${currentAddr.street.trim()}, ${currentAddr.neighborhood?.trim() || ''}, ${currentAddr.locality?.trim() || ''}, ${currentAddr.city?.trim() || ''}. ${currentAddr.indications ? `(Ind: ${currentAddr.indications.trim()}) ` : ''}${currentAddr.postalCode ? `(CP: ${currentAddr.postalCode.trim()}) ` : ''}Tel: ${formData.phone.trim()}`;

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
                <Link href="/" className="text-[#198754] font-bold hover:underline">Ir a comprar productos</Link>
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
                        <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-4 sm:p-8 md:p-12">

                            {!showAddressForm && savedAddresses.length > 0 ? (
                                <div className="p-4 border-2 border-[#198754] rounded-2xl bg-[#198754]/5 flex justify-between items-start group relative mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-[#198754] flex items-center justify-center border border-[#198754]/20 mt-1">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 flex items-center gap-2 text-lg">
                                                {savedAddresses[selectedAddressIndex]?.title || 'Dirección de Envío'}
                                                <span className="px-2 py-0.5 bg-[#198754] text-white text-[10px] rounded-full uppercase tracking-widest font-bold ml-2">Seleccionada</span>
                                            </p>

                                            {/* Mobile Change Button */}
                                            <button 
                                                type="button"
                                                onClick={() => setIsAddressModalOpen(true)}
                                                className="md:hidden text-[#198754] font-black text-[11px] uppercase tracking-widest px-3 py-1 bg-[#198754]/10 rounded-lg transition-colors mt-2 mb-2"
                                            >
                                                Cambiar Dirección
                                            </button>

                                            <p className="text-slate-600 font-black mt-2 text-[15px]">{formData.firstName} {formData.lastName}</p>
                                            <p className="text-slate-800 font-bold mt-1 text-[16px]">{savedAddresses[selectedAddressIndex]?.street || formData.address}</p>
                                            
                                            {savedAddresses[selectedAddressIndex]?.indications && (
                                                <div className="mt-2 mb-1">
                                                    <span className="text-[9px] font-black text-[#198754] uppercase tracking-widest block mb-0.5">Indicación para la entrega:</span>
                                                    <p className="text-[#198754] font-bold text-[12px] bg-[#198754]/5 inline-block px-3 py-1.5 rounded-xl border border-[#198754]/10">
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
                                                <div className="mt-4 rounded-xl overflow-hidden border border-[#198754]/20 h-[110px] relative group/checkout-map shadow-inner">
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
                                                            <path d="M50 115C45 105 5 60 5 40C5 17.9086 25.1472 0 50 0C74.8528 0 95 17.9086 95 40C95 60 55 105 50 115Z" fill="#198754" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
                                                            <circle cx="50" cy="40" r="22" fill="white" />
                                                            <path d="M50 24L32 38H38V58H62V38H68L50 24Z" fill="#198754" />
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
                                        className="hidden md:block text-[#198754] font-black text-[12px] uppercase tracking-widest px-4 py-2 hover:bg-green-100 rounded-xl transition-colors shrink-0"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : null}

                            <form onSubmit={handleCheckout} className="space-y-6">
                                {showAddressForm && (
                                    <>
                                        {/* Step 1: Datos Personales */}
                                        <div className="space-y-6 mb-12">
                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-[18px] font-bold text-slate-900">1</span>
                                                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight"><span className="border-b-2 border-slate-300">Datos</span> de Personales:</h3>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre y Apellido:</label>
                                                <input
                                                    required
                                                    value={`${formData.firstName} ${formData.lastName}`.trim()}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const parts = val.split(' ');
                                                        setFormData({ 
                                                            ...formData, 
                                                            firstName: parts[0] || '', 
                                                            lastName: parts.slice(1).join(' ') || '' 
                                                        });
                                                    }}
                                                    type="text"
                                                    className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Teléfono:</label>
                                                    <input
                                                        required
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        type="tel"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Correo Electrónico:</label>
                                                    <input
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        type="email"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2: Dirección de Envío */}
                                        <div className="space-y-6 mb-12">
                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-[18px] font-bold text-slate-900">2</span>
                                                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight"><span className="border-b-2 border-slate-300">Dirección</span> de envió:</h3>
                                            </div>

                                            {/* Address Type Selector */}
                                            <div className="flex gap-4 mb-6">
                                                {['Casa', 'Trabajo', 'Lugar'].map((type) => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                        <input 
                                                            type="radio" 
                                                            name="addressType" 
                                                            value={type}
                                                            checked={formData.addressType === type}
                                                            onChange={() => setFormData({ ...formData, addressType: type })}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.addressType === type ? 'border-[#198754] bg-[#198754]' : 'border-slate-300'}`}>
                                                            {formData.addressType === type && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                                                            {type === 'Casa' ? '🏠' : type === 'Trabajo' ? '💼' : '🏙️'} {type}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Dirección o lugar de entrega</label>
                                                <input
                                                    required
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    type="text"
                                                    placeholder="Ej. Nombre de la calle y Nro. domicilio"
                                                    className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Indicación para la entrega:</label>
                                                <input
                                                    value={formData.indications}
                                                    onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                                                    type="text"
                                                    placeholder="Ej. Entre calles, color de casa, no tiene timbre"
                                                    className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Localidad:</label>
                                                    <input
                                                        required
                                                        value={formData.locality}
                                                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Colonia o Barrio (Opcional):</label>
                                                    <input
                                                        value={formData.neighborhood}
                                                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Ciudad (Opcional):</label>
                                                    <input
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Código Postal (Opcional):</label>
                                                    <input
                                                        value={formData.postalCode}
                                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 3: Método de Pago */}
                                <div className="pt-0 border-t border-slate-100 mt-6">
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 text-[14px] font-bold">3</span>
                                        <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Método de Pago</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Pago al recibir */}
                                        <div 
                                            onClick={() => setPaymentMethod('CASH')}
                                            className={`border-[1.5px] rounded-[15px] p-4 flex flex-col gap-3 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-[#198754] bg-white shadow-lg ring-4 ring-[#198754]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'CASH' ? 'bg-[#198754] text-white' : 'bg-slate-50 text-slate-300'}`}>
                                                <Truck size={20} />
                                            </div>
                                            <span className={`font-black text-[11px] uppercase tracking-widest leading-tight ${paymentMethod === 'CASH' ? 'text-slate-900' : 'text-slate-300'}`}>Pago al recibir</span>
                                        </div>

                                        {/* Tarjeta */}
                                        <div 
                                            onClick={() => setPaymentMethod('CARD')}
                                            className={`border-[1.5px] rounded-[15px] p-4 flex flex-col gap-3 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-[#198754] bg-white shadow-lg ring-4 ring-[#198754]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'CARD' ? 'bg-[#198754] text-white' : 'bg-slate-50 text-slate-300'}`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                {/* Card brand logos */}
                                                <div className="flex items-center gap-1">
                                                    {/* VISA */}
                                                    <div className={`h-6 px-1.5 rounded flex items-center justify-center border transition-all ${cardType === 'visa' || paymentMethod === 'CARD' ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-40'}`}>
                                                        <svg width="26" height="8" viewBox="0 0 32 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <text x="0" y="10" fontFamily="Arial" fontWeight="900" fontSize="10" fill="#1A1F71" letterSpacing="0">VISA</text>
                                                        </svg>
                                                    </div>
                                                    {/* Mastercard */}
                                                    <div className={`h-6 w-8 rounded flex items-center justify-center border transition-all ${cardType === 'mastercard' || paymentMethod === 'CARD' ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-40'}`}>
                                                        <svg width="22" height="14" viewBox="0 0 28 18" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="10" cy="9" r="9" fill="#EB001B"/>
                                                            <circle cx="18" cy="9" r="9" fill="#F79E1B"/>
                                                            <path d="M14 3.07a9 9 0 0 1 0 11.86A9 9 0 0 1 14 3.07z" fill="#FF5F00"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`font-black text-[11px] uppercase tracking-widest leading-tight ${paymentMethod === 'CARD' ? 'text-slate-900' : 'text-slate-300'}`}>Tarjeta</span>
                                        </div>

                                        {/* Transferencia */}
                                        <div
                                            onClick={() => setPaymentMethod('TRANSFER')}
                                            className={`border-[1.5px] rounded-[15px] p-4 flex flex-col gap-3 cursor-pointer transition-all ${paymentMethod === 'TRANSFER' ? 'border-[#198754] bg-white shadow-lg ring-4 ring-[#198754]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'TRANSFER' ? 'bg-[#198754] text-white' : 'bg-slate-50 text-slate-300'}`}>
                                                <Landmark size={20} />
                                            </div>
                                            <span className={`font-black text-[11px] uppercase tracking-widest leading-tight ${paymentMethod === 'TRANSFER' ? 'text-slate-900' : 'text-slate-300'}`}>Transferencia</span>
                                        </div>
                                    </div>

                                    {/* Card Form - expandable */}
                                    <div
                                        style={{
                                            maxHeight: paymentMethod === 'CARD' ? '600px' : '0px',
                                            opacity: paymentMethod === 'CARD' ? 1 : 0,
                                            overflow: 'hidden',
                                            transition: 'max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
                                        }}
                                    >
                                        <div className="mt-5 p-5 border border-slate-200 rounded-[16px] bg-slate-50/60 space-y-4">
                                            {/* Card Number */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Número de tarjeta</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={cardData.cardNumber}
                                                        onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                                                        placeholder="•••• •••• •••• ••••"
                                                        maxLength={19}
                                                        className="w-full h-[48px] px-5 pr-12 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 text-[15px] tracking-widest focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none placeholder:text-slate-300 placeholder:tracking-widest placeholder:font-normal"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                        {cardType === 'visa' && (
                                                            <svg width="32" height="10" viewBox="0 0 32 10" fill="none"><text x="0" y="10" fontFamily="Arial" fontWeight="900" fontSize="10" fill="#1A1F71">VISA</text></svg>
                                                        )}
                                                        {cardType === 'mastercard' && (
                                                            <svg width="28" height="18" viewBox="0 0 28 18"><circle cx="10" cy="9" r="9" fill="#EB001B"/><circle cx="18" cy="9" r="9" fill="#F79E1B"/><path d="M14 3.07a9 9 0 0 1 0 11.86A9 9 0 0 1 14 3.07z" fill="#FF5F00"/></svg>
                                                        )}
                                                        {cardType === 'amex' && (
                                                            <div className="bg-blue-600 px-1.5 py-0.5 rounded"><span className="text-white font-black text-[8px] tracking-widest">AMEX</span></div>
                                                        )}
                                                        {!cardType && <Lock size={16} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expiry + CVV */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha de vencimiento (MM / AA)</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={cardData.expiry}
                                                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                                                        placeholder="MM / AA"
                                                        maxLength={5}
                                                        className="w-full h-[48px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Código de seguridad</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            inputMode="numeric"
                                                            value={cardData.cvv}
                                                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3) })}
                                                            placeholder={cardType === 'amex' ? '••••' : '•••'}
                                                            maxLength={cardType === 'amex' ? 4 : 3}
                                                            className="w-full h-[48px] px-5 pr-10 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                                                        />
                                                        <div className="relative inline-block">
                                                            <button
                                                                type="button"
                                                                onMouseEnter={() => setShowCvvTooltip(true)}
                                                                onMouseLeave={() => setShowCvvTooltip(false)}
                                                                className="absolute right-3 top-0 -translate-y-[30px] text-slate-300 hover:text-slate-500 transition-colors"
                                                            >
                                                                <HelpCircle size={16} />
                                                            </button>
                                                            {showCvvTooltip && (
                                                                <div className="absolute right-0 bottom-full mb-2 w-52 bg-slate-900 text-white text-[11px] rounded-xl p-3 shadow-2xl z-50 font-medium leading-relaxed">
                                                                    El código de seguridad (CVV) son los 3 dígitos en el reverso de tu tarjeta. En Amex son 4 dígitos en el frente.
                                                                    <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-900 rotate-45" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cardholder Name */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre del titular</label>
                                                <input
                                                    type="text"
                                                    value={cardData.cardHolder}
                                                    onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                                                    placeholder="Tal como aparece en la tarjeta"
                                                    className="w-full h-[48px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 uppercase focus:ring-4 ring-[#198754]/5 focus:border-[#198754] transition-all outline-none placeholder:text-slate-300 placeholder:normal-case placeholder:font-normal"
                                                />
                                            </div>

                                            {/* Same address checkbox */}
                                            <label className="flex items-center gap-3 cursor-pointer group mt-1">
                                                <div
                                                    onClick={() => setCardData({ ...cardData, useSameAddress: !cardData.useSameAddress })}
                                                    className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all shrink-0 ${cardData.useSameAddress ? 'bg-[#198754] border-[#198754]' : 'border-slate-300 bg-white'}`}
                                                >
                                                    {cardData.useSameAddress && (
                                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                                                    Usar la dirección de envío como dirección de facturación
                                                </span>
                                            </label>

                                            {/* Security badge */}
                                            <div className="flex items-center gap-2 pt-1">
                                                <Lock size={13} className="text-[#198754] shrink-0" />
                                                <span className="text-[11px] text-slate-400 font-medium">Tus datos de pago están cifrados con SSL de 256 bits</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transfer Info Panel - expandable */}
                                    <div
                                        style={{
                                            maxHeight: paymentMethod === 'TRANSFER' ? '600px' : '0px',
                                            opacity: paymentMethod === 'TRANSFER' ? 1 : 0,
                                            overflow: 'hidden',
                                            transition: 'max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
                                        }}
                                    >
                                        <div className="mt-5 border border-slate-200 rounded-[16px] overflow-hidden">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
                                                <div className="w-5 h-5 rounded-full border-2 border-[#198754] flex items-center justify-center shrink-0">
                                                    <div className="w-2.5 h-2.5 bg-[#198754] rounded-full" />
                                                </div>
                                                <span className="font-black text-slate-900 text-[15px]">Transferencia Bancaria</span>
                                            </div>

                                            {/* Body */}
                                            <div className="px-5 py-5 bg-white space-y-4 text-[14px] text-slate-700 leading-relaxed">
                                                <p>Realiza tu pago mediante transferencia bancaria a la siguiente cuenta:</p>

                                                {/* Bank details */}
                                                <div className="bg-slate-50 border border-slate-100 rounded-[12px] px-4 py-4 space-y-1">
                                                    <p className="font-black text-slate-900 text-[14px]">KC ROLA, INC</p>
                                                    <p className="font-semibold text-slate-600">Banco General</p>
                                                    <p className="font-semibold text-slate-600">Cuenta Corriente: <span className="font-black text-slate-900 tracking-wide">03-72-01-122123-8</span></p>
                                                </div>

                                                <p>Al momento de transferir, incluye en la descripción: <span className="font-bold text-slate-900">nombre de la persona que realizó el pedido</span> y <span className="font-bold text-slate-900">número de orden</span>.</p>

                                                <p>Una vez realizado el pago, envía tu comprobante a <a href="mailto:panama@kennethcolelatino.com" className="font-bold text-[#198754] hover:underline break-all">panama@kennethcolelatino.com</a> para iniciar la validación.</p>

                                                <p>Tu pedido será procesado una vez confirmado el pago.</p>

                                                <p className="text-slate-500 text-[13px] pt-1 border-t border-slate-100">Gracias por comprar en Kenneth Cole Latinoamérica.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isProcessing}
                                    className={`w-full h-[58px] mt-10 rounded-[12px] font-black text-[16px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#198754] text-white hover:bg-[#198754]/90 active:scale-[0.98]'}`}
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
                        <div className="bg-slate-900 text-white rounded-[8px] shadow-2xl p-4 sticky top-24">
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
                                    className={`p-5 pl-14 border-2 rounded-2xl cursor-pointer transition-all relative group ${idx === selectedAddressIndex ? 'border-[#198754] bg-[#198754]/5 shadow-md shadow-green-500/10' : 'border-slate-100 hover:border-[#198754]/40'}`}
                                >
                                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${idx === selectedAddressIndex ? 'border-[#198754]' : 'border-slate-300'}`}>
                                        {idx === selectedAddressIndex && <div className="w-2.5 h-2.5 bg-[#198754] rounded-full" />}
                                    </div>
                                    
                                    <p className="font-black text-slate-900 mb-1">{addr.type || addr.title || 'Dirección'}</p>
                                    <p className="text-sm text-slate-600 leading-tight">{addr.street}</p>
                                    {addr.locality && <p className="text-sm text-slate-500 leading-tight mt-0.5">{addr.locality}</p>}
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
                                className="text-[#198754] font-bold text-sm tracking-wide hover:underline"
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
