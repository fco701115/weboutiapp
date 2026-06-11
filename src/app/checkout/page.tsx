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
                <Link href="/" className="text-[#bea55b] font-bold hover:underline">Ir a comprar productos</Link>
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
                                <div className="p-4 border-2 border-[#bea55b] rounded-2xl bg-[#bea55b]/5 flex justify-between items-start group relative mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-[#bea55b] flex items-center justify-center border border-[#bea55b]/20 mt-1">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 flex items-center gap-2 text-lg">
                                                {savedAddresses[selectedAddressIndex]?.title || 'Dirección de Envío'}
                                                <span className="px-2 py-0.5 bg-[#bea55b] text-white text-[10px] rounded-full uppercase tracking-widest font-bold ml-2">Seleccionada</span>
                                            </p>

                                            {/* Mobile Change Button */}
                                            <button 
                                                type="button"
                                                onClick={() => setIsAddressModalOpen(true)}
                                                className="md:hidden text-[#bea55b] font-black text-[11px] uppercase tracking-widest px-3 py-1 bg-[#bea55b]/10 rounded-lg transition-colors mt-2 mb-2"
                                            >
                                                Cambiar Dirección
                                            </button>

                                            <p className="text-slate-600 font-black mt-2 text-[15px]">{formData.firstName} {formData.lastName}</p>
                                            <p className="text-slate-800 font-bold mt-1 text-[16px]">{savedAddresses[selectedAddressIndex]?.street || formData.address}</p>
                                            
                                            {savedAddresses[selectedAddressIndex]?.indications && (
                                                <div className="mt-2 mb-1">
                                                    <span className="text-[9px] font-black text-[#bea55b] uppercase tracking-widest block mb-0.5">Indicación para la entrega:</span>
                                                    <p className="text-[#bea55b] font-bold text-[12px] bg-[#bea55b]/5 inline-block px-3 py-1.5 rounded-xl border border-[#bea55b]/10">
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
                                                <div className="mt-4 rounded-xl overflow-hidden border border-[#bea55b]/20 h-[110px] relative group/checkout-map shadow-inner">
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
                                                            <path d="M50 115C45 105 5 60 5 40C5 17.9086 25.1472 0 50 0C74.8528 0 95 17.9086 95 40C95 60 55 105 50 115Z" fill="#bea55b" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
                                                            <circle cx="50" cy="40" r="22" fill="white" />
                                                            <path d="M50 24L32 38H38V58H62V38H68L50 24Z" fill="#bea55b" />
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
                                        className="hidden md:block text-[#bea55b] font-black text-[12px] uppercase tracking-widest px-4 py-2 hover:bg-green-100 rounded-xl transition-colors shrink-0"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : null}

                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                                {showAddressForm && (
                                    <>
                                        {/* Step 1: Datos Personales */}
                                        <div className="space-y-6 mb-[24px]">
                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-[18px] font-bold text-slate-900">1</span>
                                                <h3 className="text-[18px] font-bold text-slate-900 tracking-tight"><span className="border-b-2 border-slate-300">Datos</span> de Personales:</h3>
                                            </div>

                                            <div className="flex flex-col gap-2 mb-[12px]">
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
                                                    className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0 md:gap-y-4 mb-0">
                                                <div className="flex flex-col gap-2 mb-0 md:mb-[12px]">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Teléfono:</label>
                                                    <input
                                                        required
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        type="tel"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 mb-[12px] mt-[12px] md:mt-0">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Correo Electrónico:</label>
                                                    <input
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        type="email"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2: Dirección de Envío */}
                                        <div className="space-y-6 mb-[24px]">
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
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.addressType === type ? 'border-[#db0f70] bg-[#db0f70]' : 'border-slate-300'}`}>
                                                            {formData.addressType === type && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                                                            {type === 'Casa' ? '🏠' : type === 'Trabajo' ? '💼' : '🏙️'} {type}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>

                                            <div className="flex flex-col gap-2 mb-[12px]">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Dirección o lugar de entrega</label>
                                                <input
                                                    required
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    type="text"
                                                    placeholder="Ej. Nombre de la calle y Nro. domicilio"
                                                    className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 mb-[12px]">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Indicación para la entrega:</label>
                                                <input
                                                    value={formData.indications}
                                                    onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                                                    type="text"
                                                    placeholder="Ej. Entre calles, color de casa, no tiene timbre"
                                                    className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0 md:gap-y-4 mb-0">
                                                <div className="flex flex-col gap-2 mb-0 md:mb-[12px]">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Localidad:</label>
                                                    <input
                                                        required
                                                        value={formData.locality}
                                                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 mb-[12px] mt-[12px] md:mt-0">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Colonia o Barrio (Opcional):</label>
                                                    <input
                                                        value={formData.neighborhood}
                                                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0 md:gap-y-4 mb-0">
                                                <div className="flex flex-col gap-2 mb-0 md:mb-[12px]">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Ciudad (Opcional):</label>
                                                    <input
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 mb-[12px] mt-[12px] md:mt-0">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Código Postal (Opcional):</label>
                                                    <input
                                                        value={formData.postalCode}
                                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                        type="text"
                                                        className="h-[45px] px-5 bg-white border border-[#CECECE] rounded-[12px] font-bold text-slate-900 focus:ring-4 ring-[#bea55b]/5 focus:border-[#bea55b] transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 3: Método de Pago */}
                                <div className="pt-0 border-t border-slate-100 mt-6">
                                    <div className="flex items-center gap-4 mb-[18px] md:mb-8">
                                        <span className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 text-[14px] font-bold">3</span>
                                        <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Método de Pago</h2>
                                    </div>
                                         <div className="border border-slate-200 rounded-[8px] bg-white overflow-hidden mt-6">
                                        {/* Tarjeta de crédito */}
                                        <div className="border-b border-slate-200">
                                            <div 
                                                onClick={() => setPaymentMethod('CARD')}
                                                className={`flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 ${paymentMethod === 'CARD' ? 'bg-[#fafbfa]' : 'bg-white hover:bg-slate-50/50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                        paymentMethod === 'CARD' ? 'border-[#0a0a0a] bg-[#0a0a0a]' : 'border-slate-300 bg-white'
                                                    }`}>
                                                        {paymentMethod === 'CARD' && <div className="w-[6px] h-[6px] bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-[14px]">Tarjeta de crédito</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-[20px] px-1.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                        <svg width="22" height="7" viewBox="0 0 32 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <text x="0" y="10" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
                                                        </svg>
                                                    </div>
                                                    <div className="h-[20px] px-1.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                        <svg width="18" height="11" viewBox="0 0 28 18" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="10" cy="9" r="9" fill="#EB001B"/>
                                                            <circle cx="18" cy="9" r="9" fill="#F79E1B"/>
                                                            <path d="M14 3.07a9 9 0 0 1 0 11.86A9 9 0 0 1 14 3.07z" fill="#FF5F00"/>
                                                        </svg>
                                                    </div>
                                                    <div className="h-[20px] px-1.5 rounded-[4px] border border-slate-200 bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                        <span className="text-[#016FD0] font-black text-[8px] tracking-wide leading-none">AMEX</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    maxHeight: paymentMethod === 'CARD' ? '500px' : '0px',
                                                    opacity: paymentMethod === 'CARD' ? 1 : 0,
                                                    overflow: 'hidden',
                                                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                                                }}
                                                className={`transition-all duration-300 ${paymentMethod === 'CARD' ? 'border-t border-slate-200 bg-[#fafbfa] px-5 pb-5 pt-2' : 'bg-transparent'}`}
                                            >
                                                <div className="space-y-3.5">
                                                    {/* Card Number */}
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={cardData.cardNumber}
                                                            onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                                                            placeholder="Número de tarjeta"
                                                            maxLength={19}
                                                            className="w-full h-[46px] px-4 pr-10 bg-white border border-slate-200 rounded-[6px] text-slate-800 text-[14px] focus:border-black focus:ring-1 focus:ring-black transition-all outline-none placeholder:text-slate-400 font-medium"
                                                        />
                                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                            {cardType === 'visa' && (
                                                                <span className="text-[#1A1F71] font-black text-[9px] tracking-wide">VISA</span>
                                                            )}
                                                            {cardType === 'mastercard' && (
                                                                <svg width="20" height="12" viewBox="0 0 28 18"><circle cx="10" cy="9" r="9" fill="#EB001B"/><circle cx="18" cy="9" r="9" fill="#F79E1B"/><path d="M14 3.07a9 9 0 0 1 0 11.86A9 9 0 0 1 14 3.07z" fill="#FF5F00"/></svg>
                                                            )}
                                                            {cardType === 'amex' && (
                                                                <span className="text-[#016FD0] font-black text-[9px] tracking-wide">AMEX</span>
                                                            )}
                                                            {!cardType && <Lock size={15} />}
                                                        </div>
                                                    </div>

                                                    {/* Expiry + CVV */}
                                                    <div className="grid grid-cols-2 gap-3.5">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={cardData.expiry}
                                                            onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                                                            placeholder="Fecha de vencimiento (MM / AA)"
                                                            maxLength={5}
                                                            className="w-full h-[46px] px-4 bg-white border border-slate-200 rounded-[6px] text-slate-800 text-[14px] focus:border-black focus:ring-1 focus:ring-black transition-all outline-none placeholder:text-slate-400 font-medium"
                                                        />
                                                        <div className="relative">
                                                            <input
                                                                type="password"
                                                                inputMode="numeric"
                                                                value={cardData.cvv}
                                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3) })}
                                                                placeholder="Código de seguridad"
                                                                maxLength={cardType === 'amex' ? 4 : 3}
                                                                className="w-full h-[46px] px-4 pr-10 bg-white border border-slate-200 rounded-[6px] text-slate-800 text-[14px] focus:border-black focus:ring-1 focus:ring-black transition-all outline-none placeholder:text-slate-400 font-medium"
                                                            />
                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                                <button
                                                                    type="button"
                                                                    onMouseEnter={() => setShowCvvTooltip(true)}
                                                                    onMouseLeave={() => setShowCvvTooltip(false)}
                                                                    className="text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                                                                >
                                                                    <HelpCircle size={15} />
                                                                </button>
                                                                {showCvvTooltip && (
                                                                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-slate-900 text-white text-[11px] rounded-lg p-2.5 shadow-2xl z-50 font-medium leading-relaxed">
                                                                        El código de seguridad (CVV) son los 3 dígitos en el reverso de tu tarjeta. En Amex son 4 dígitos en el frente.
                                                                        <div className="absolute bottom-[-5px] right-3.5 w-2 h-2 bg-slate-900 rotate-45" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Cardholder Name */}
                                                    <input
                                                        type="text"
                                                        value={cardData.cardHolder}
                                                        onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                                                        placeholder="Nombre del titular"
                                                        className="w-full h-[46px] px-4 bg-white border border-slate-200 rounded-[6px] text-slate-800 text-[14px] uppercase focus:border-black focus:ring-1 focus:ring-black transition-all outline-none placeholder:text-slate-400 placeholder:normal-case font-medium"
                                                    />

                                                    {/* Same address checkbox */}
                                                    <div className="pt-2 select-none">
                                                        <div
                                                            onClick={() => setCardData({ ...cardData, useSameAddress: !cardData.useSameAddress })}
                                                            className="flex items-center gap-3 cursor-pointer group"
                                                        >
                                                            <div
                                                                className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${cardData.useSameAddress ? 'bg-[#0a0a0a] border-[#0a0a0a]' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                                                            >
                                                                {cardData.useSameAddress && (
                                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                                                                Usar la dirección de envío como dirección de facturación
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transferencia Bancaria */}
                                        <div className="border-b border-slate-200">
                                            <div 
                                                onClick={() => setPaymentMethod('TRANSFER')}
                                                className={`flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 ${paymentMethod === 'TRANSFER' ? 'bg-[#fafbfa]' : 'bg-white hover:bg-slate-50/50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                        paymentMethod === 'TRANSFER' ? 'border-[#0a0a0a] bg-[#0a0a0a]' : 'border-slate-300 bg-white'
                                                    }`}>
                                                        {paymentMethod === 'TRANSFER' && <div className="w-[6px] h-[6px] bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-[14px]">Transferencia Bancaria</span>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    maxHeight: paymentMethod === 'TRANSFER' ? '500px' : '0px',
                                                    opacity: paymentMethod === 'TRANSFER' ? 1 : 0,
                                                    overflow: 'hidden',
                                                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                                                }}
                                                className={`transition-all duration-300 ${paymentMethod === 'TRANSFER' ? 'border-t border-slate-200 bg-[#fafbfa] px-5 pb-5 pt-4' : 'bg-transparent'}`}
                                            >
                                                <div className="space-y-4 text-[13.5px] text-slate-600 leading-relaxed">
                                                    <p className="font-medium text-slate-700">Realiza tu pago mediante transferencia bancaria a la siguiente cuenta:</p>

                                                    {/* Bank details card */}
                                                    <div className="bg-white border border-slate-200 rounded-[8px] p-4.5 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                                        <p className="font-bold text-slate-900 text-[14px]">KC ROLA, INC</p>
                                                        <p className="font-semibold text-slate-700">Banco General</p>
                                                        <p className="font-medium text-slate-500">Cuenta Corriente: <span className="font-bold text-slate-950 tracking-wider">03-72-01-122123-8</span></p>
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        <p>Al transferir, incluye en la descripción: <span className="font-bold text-slate-900">nombre del titular</span> y <span className="font-bold text-slate-900">número de orden</span>.</p>
                                                        <p>Una vez realizado, envía tu comprobante a <a href="mailto:panama@kennethcolelatino.com" className="font-bold text-[#bea55b] hover:underline break-all">panama@kennethcolelatino.com</a> para iniciar la validación.</p>
                                                        <p>Tu pedido será procesado una vez confirmado el pago.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pago al recibir */}
                                        <div>
                                            <div 
                                                onClick={() => setPaymentMethod('CASH')}
                                                className={`flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 ${paymentMethod === 'CASH' ? 'bg-[#fafbfa]' : 'bg-white hover:bg-slate-50/50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                        paymentMethod === 'CASH' ? 'border-[#0a0a0a] bg-[#0a0a0a]' : 'border-slate-300 bg-white'
                                                    }`}>
                                                        {paymentMethod === 'CASH' && <div className="w-[6px] h-[6px] bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-[14px]">Pago al recibir</span>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    maxHeight: paymentMethod === 'CASH' ? '150px' : '0px',
                                                    opacity: paymentMethod === 'CASH' ? 1 : 0,
                                                    overflow: 'hidden',
                                                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                                                }}
                                                className={`transition-all duration-300 ${paymentMethod === 'CASH' ? 'border-t border-slate-200 bg-[#fafbfa] px-5 pb-5 pt-4' : 'bg-transparent'}`}
                                            >
                                                <div className="flex gap-3 text-slate-600 text-[13.5px] leading-relaxed">
                                                    <Truck className="text-[#bea55b] shrink-0 mt-0.5" size={16} />
                                                    <p>
                                                        Realiza tu pago en efectivo o con tarjeta clave/crédito al repartidor al momento de recibir tu pedido en la puerta de tu hogar u oficina.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                 <button
                                     type="submit"
                                     disabled={isProcessing}
                                     className={`w-full h-[58px] mt-10 rounded-[12px] font-black text-[16px] uppercase tracking-widest transition-all hidden lg:flex items-center justify-center gap-3 shadow-xl ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#bea55b] text-white hover:bg-[#bea55b]/90 active:scale-[0.98]'}`}
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
                        <div className="bg-slate-900 text-white rounded-[8px] shadow-2xl p-4 lg:sticky lg:top-24 mb-10 lg:mb-0">
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

                         {/* Botón Finalizar Pedido para Móvil */}
                         <button
                             type="submit"
                             form="checkout-form"
                             disabled={isProcessing}
                             className={`w-full h-[58px] mt-[20px] rounded-[12px] font-black text-[16px] uppercase tracking-widest transition-all lg:hidden flex items-center justify-center gap-3 shadow-xl ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#db0f70] text-white hover:bg-[#db0f70]/90 active:scale-[0.98]'}`}
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
                                    className={`p-5 pl-14 border-2 rounded-2xl cursor-pointer transition-all relative group ${idx === selectedAddressIndex ? 'border-[#bea55b] bg-[#bea55b]/5 shadow-md shadow-green-500/10' : 'border-slate-100 hover:border-[#bea55b]/40'}`}
                                >
                                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${idx === selectedAddressIndex ? 'border-[#bea55b]' : 'border-slate-300'}`}>
                                        {idx === selectedAddressIndex && <div className="w-2.5 h-2.5 bg-[#bea55b] rounded-full" />}
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
                                className="text-[#bea55b] font-bold text-sm tracking-wide hover:underline"
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

