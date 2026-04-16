'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, ChevronLeft, ShoppingBag, Heart, ShieldCheck, Star, Trash2, CheckCircle2, Truck, Eye, X, Briefcase, Mountain } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useWishlist } from '@/context/WishlistContext';
import { useReviews } from '@/context/ReviewsContext';

export default function AccountPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { wishlist, toggleWishlist, wishlistCount } = useWishlist();
    const { reviews, getReviewsForUser } = useReviews();
    
    const [user, setUser] = useState<any>({ name: '', email: '', role: 'USER' });
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, reviews, addresses
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderFilter, setOrderFilter] = useState('ALL');
    
    // Addresses state
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [viewingAddress, setViewingAddress] = useState<any>(null);

    const formatAddress = (fullAddress: string) => {
        if (!fullAddress) return { street: '', neighborhood: '', locality: '', city: '', cp: '', type: '', indications: '', phone: '' };
        
        let streetVal = fullAddress;
        let phoneVal = '';
        let indicationsVal = '';
        let neighborhoodVal = '';
        let cityVal = '';
        let cpVal = '';
        let localityVal = '';

        // 1. Clean Map tags
        streetVal = streetVal.replace(/ \[MAPA: .*?\]$/, '').replace(/ \(Ubicación: .*?\)/, '');

        // 2. Extract Phone
        const phoneMatch = streetVal.match(/ Tel: ((\+?\d+ ?)+)/);
        if (phoneMatch) {
            phoneVal = phoneMatch[1].trim();
            streetVal = streetVal.replace(phoneMatch[0], '');
        }

        // 3. Extract Indications
        const indMatch = streetVal.match(/ \(Ind: (.*?)\)/);
        if (indMatch) {
            indicationsVal = indMatch[1];
            streetVal = streetVal.replace(indMatch[0], '');
        }

        // 4. Extract CP (Flexible)
        const cpMatch = streetVal.match(/ \(CP:? (.*?)\)/) || streetVal.match(/ CP:? (\d{5})/i);
        if (cpMatch) {
            cpVal = cpMatch[1];
            streetVal = streetVal.replace(cpMatch[0], '');
        }

        // 5. Extract Type [Casa]
        let typeVal = '';
        const typeMatch = streetVal.match(/^\[(.*?)\]\s*/);
        if (typeMatch) {
            typeVal = typeMatch[1];
            streetVal = streetVal.replace(typeMatch[0], '');
        }

        // 6. Catch raw CP at end
        const rawCpAtEnd = streetVal.match(/,?\s+(\d{5})\.?$/);
        if (rawCpAtEnd && !cpVal) {
            cpVal = rawCpAtEnd[1];
            streetVal = streetVal.replace(rawCpAtEnd[0], '');
        }

        // CLEANING
        streetVal = streetVal.replace(/[.\s,]+$/, '').trim();

        // 7. Hierarchy Parsing: Right-to-Left Strategy
        const parts = streetVal.split(',').map(p => p.trim());
        
        if (parts.length > 0) {
            if (parts.length === 1) {
                streetVal = parts[0];
            } else if (parts.length === 2) {
                streetVal = parts[0];
                cityVal = parts[1];
            } else if (parts.length === 3) {
                streetVal = parts[0];
                localityVal = parts[1];
                cityVal = parts[2];
            } else if (parts.length >= 4) {
                streetVal = parts[0];
                cityVal = parts[parts.length - 1]; 
                localityVal = parts[parts.length - 2];
                neighborhoodVal = parts.slice(1, -2).join(', ');
            }
        }

        return {
            type: typeVal,
            street: streetVal,
            neighborhood: neighborhoodVal,
            locality: localityVal,
            city: cityVal,
            cp: cpVal,
            phone: phoneVal,
            indications: indicationsVal
        };
    };
    const [newAddress, setNewAddress] = useState({ 
        title: 'Casa', 
        street: '', 
        indications: '', 
        locality: '', 
        neighborhood: '', 
        city: '', 
        postalCode: '', 
        contactName: '', 
        phone: '' 
    });

    const userReviews = user ? getReviewsForUser(user.email) : [];

    useEffect(() => {
        if (status === 'unauthenticated') {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) {
                router.push('/login');
                return;
            }
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            fetchUserOrders(parsed.email);
        } else if (status === 'authenticated' && session?.user) {
            fetchFullUserData(session.user.email || '');
            fetchUserOrders(session.user.email || '');
        }
    }, [session, status]);

    useEffect(() => {
        if (user && !editName) {
            setEditName(user.name);
        }
        if (user && user.email) {
            const savedAddresses = localStorage.getItem(`addresses_${user.email}`);
            if (savedAddresses) {
                setAddresses(JSON.parse(savedAddresses));
            }
        }
        if (user?.name && !newAddress.contactName) {
            setNewAddress(prev => ({ ...prev, contactName: user.name }));
        }
    }, [user]);

    const handleSaveAddress = async () => {
        if (!newAddress.street || !newAddress.locality || !newAddress.contactName || !newAddress.phone) {
            return alert('Por favor, completa los campos obligatorios: Dirección, Localidad, Nombre de contacto y Teléfono');
        }
        const updatedAddresses = [...addresses, { ...newAddress, id: Date.now() }];
        setAddresses(updatedAddresses);
        localStorage.setItem(`addresses_${user.email}`, JSON.stringify(updatedAddresses));
        
        // Sync with DB
        if (user.id) {
            try {
                await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ addresses: updatedAddresses })
                });
            } catch (error) {
                console.error('Failed to sync addresses with server');
            }
        }

        setIsAddingAddress(false);
        setNewAddress({ 
            title: 'Casa', 
            street: '', 
            indications: '', 
            locality: '', 
            neighborhood: '', 
            city: '', 
            postalCode: '', 
            contactName: user?.name || '', 
            phone: '' 
        });
    };

    const handleDeleteAddress = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar esta dirección?')) return;
        const updatedAddresses = addresses.filter(a => a.id !== id);
        setAddresses(updatedAddresses);
        localStorage.setItem(`addresses_${user.email}`, JSON.stringify(updatedAddresses));

        // Sync with DB
        if (user.id) {
            try {
                await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ addresses: updatedAddresses })
                });
            } catch (error) {
                console.error('Failed to sync addresses with server');
            }
        }
    };

    const handleSaveProfile = async () => {
        const updatedUser = { ...user, name: editName };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Sync with DB
        if (user.id) {
            try {
                await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: editName })
                });
            } catch (error) {
                console.error('Failed to sync profile with server');
            }
        }

        setIsEditing(false);
    };

    const fetchFullUserData = async (email: string) => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                const dbUser = data.find((u: any) => u.email === email);
                if (dbUser) {
                    setUser(dbUser);
                    setEditName(dbUser.name);
                    if (dbUser.addresses) {
                        try {
                            setAddresses(JSON.parse(dbUser.addresses));
                        } catch (e) {
                            console.error('Failed to parse addresses from DB');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching full user data:', error);
        }
    };

    const fetchUserOrders = async (email: string) => {
        if (!email) return;
        try {
            const res = await fetch('/api/orders'); 
            const data = await res.json();
            setOrders(data.filter((o: any) => o.email?.toLowerCase().trim() === email.toLowerCase().trim()));
        } catch (error) {
            console.error('Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmOrderReceived = async (orderId: string) => {
        if (!confirm('¿Confirmas que has recibido este pedido?')) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' })
            });
            if (res.ok) {
                await fetchUserOrders(user.email);
                setOrderFilter('COMPLETED');
            }
        } catch (error) {
            console.error('Failed to update order status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('local-user-updated'));
        await signOut({ callbackUrl: '/' });
    };

    if (status === 'loading' || !user) return null;


    return (
        <div className="bg-[#f7f9fa] min-h-screen pb-20">
            <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3 space-y-6 lg:space-y-4">
                        <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm text-center flex lg:flex-col items-center lg:justify-center gap-4 lg:gap-0">
                            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-tr from-[#1a3da1] to-blue-400 rounded-2xl lg:rounded-[32px] p-[3px] shadow-xl shadow-blue-500/20 relative overflow-hidden flex-shrink-0">
                                <div className="w-full h-full bg-white rounded-[13px] lg:rounded-[28px] flex items-center justify-center font-black text-xl lg:text-3xl text-[#1a3da1] overflow-hidden">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name ? user.name[0].toUpperCase() : 'U'
                                    )}
                                </div>
                            </div>
                            <div className="text-left lg:text-center flex-grow">
                                <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight">{user.name}</h2>
                                <p className="text-slate-400 font-medium text-xs lg:text-sm truncate max-w-[200px] lg:max-w-none">{user.email}</p>
                                <span className={`inline-block mt-2 lg:mt-4 px-3 py-1 rounded-full text-[9px] lg:text-[11px] font-black uppercase tracking-wider border ${
                                    user.role === 'VIEWER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                    {user.role === 'VIEWER' ? 'Lector (Solo Vista)' : 'Cliente Verificado'}
                                </span>
                            </div>
                        </div>

                        <div className="sticky top-4 lg:relative lg:top-0 z-30">
                            {/* Mobile scroll indicators */}
                            <div className="lg:hidden absolute left-0 top-0 bottom-0 flex items-center px-1 z-40 pointer-events-none">
                                <div className="bg-white/80 rounded-full shadow-sm p-0.5 text-[#1a3da1]/50 flex items-center justify-center border border-slate-100 backdrop-blur-sm">
                                    <ChevronLeft size={12} />
                                </div>
                            </div>
                            <div className="lg:hidden absolute right-0 top-0 bottom-0 flex items-center px-1 z-40 pointer-events-none">
                                <div className="bg-white/80 rounded-full shadow-sm p-0.5 text-[#1a3da1]/50 flex items-center justify-center border border-slate-100 backdrop-blur-sm">
                                    <ChevronRight size={12} />
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-2 flex flex-row lg:flex-col overflow-x-auto no-scrollbar gap-1 lg:gap-0">
                                <button onClick={() => setActiveTab('profile')} className={`flex flex-col lg:flex-row items-center lg:justify-between p-2 lg:p-4 rounded-2xl transition-all min-w-[85px] lg:w-full flex-shrink-0 ${activeTab === 'profile' ? 'bg-[#1a3da1] text-white shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3">
                                        <User size={20} className={activeTab === 'profile' ? 'text-white' : 'text-[#1a3da1]'} />
                                        <span className="font-bold text-[10px] lg:text-[14px] whitespace-nowrap">Mi cuenta</span>
                                    </div>
                                    <ChevronRight size={16} className={`hidden lg:block ${activeTab === 'profile' ? 'text-white/40' : 'text-slate-200'}`} />
                                </button>
                                <button onClick={() => setActiveTab('orders')} className={`flex flex-col lg:flex-row items-center lg:justify-between p-2 lg:p-4 rounded-2xl transition-all min-w-[85px] lg:w-full flex-shrink-0 ${activeTab === 'orders' ? 'bg-[#1a3da1] text-white shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3">
                                        <Package size={20} className={activeTab === 'orders' ? 'text-white' : 'text-[#1a3da1]'} />
                                        <span className="font-bold text-[10px] lg:text-[14px] whitespace-nowrap">Mis Pedidos</span>
                                    </div>
                                    <ChevronRight size={16} className={`hidden lg:block ${activeTab === 'orders' ? 'text-white/40' : 'text-slate-200'}`} />
                                </button>
                                <button onClick={() => setActiveTab('favorites')} className={`flex flex-col lg:flex-row items-center lg:justify-between p-2 lg:p-4 rounded-2xl transition-all min-w-[85px] lg:w-full flex-shrink-0 ${activeTab === 'favorites' ? 'bg-[#1a3da1] text-white shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3">
                                        <Heart size={20} className={activeTab === 'favorites' ? 'text-white' : 'text-[#1a3da1]'} />
                                        <span className="font-bold text-[10px] lg:text-[14px] whitespace-nowrap">Favoritos</span>
                                    </div>
                                    <ChevronRight size={16} className={`hidden lg:block ${activeTab === 'favorites' ? 'text-white/40' : 'text-slate-200'}`} />
                                </button>
                                <button onClick={() => setActiveTab('reviews')} className={`flex flex-col lg:flex-row items-center lg:justify-between p-2 lg:p-4 rounded-2xl transition-all min-w-[85px] lg:w-full flex-shrink-0 ${activeTab === 'reviews' ? 'bg-[#1a3da1] text-white shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3">
                                        <Star size={20} className={activeTab === 'reviews' ? 'text-white' : 'text-[#1a3da1]'} />
                                        <span className="font-bold text-[10px] lg:text-[14px] whitespace-nowrap">Valoraciones</span>
                                    </div>
                                    <ChevronRight size={16} className={`hidden lg:block ${activeTab === 'reviews' ? 'text-white/40' : 'text-slate-200'}`} />
                                </button>
                                <button onClick={() => setActiveTab('addresses')} className={`flex flex-col lg:flex-row items-center lg:justify-between p-2 lg:p-4 rounded-2xl transition-all min-w-[85px] lg:w-full flex-shrink-0 ${activeTab === 'addresses' ? 'bg-[#1a3da1] text-white shadow-lg shadow-blue-500/10' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3">
                                        <MapPin size={20} className={activeTab === 'addresses' ? 'text-white' : 'text-[#1a3da1]'} />
                                        <span className="font-bold text-[10px] lg:text-[14px] whitespace-nowrap">Direcciones</span>
                                    </div>
                                    <ChevronRight size={16} className={`hidden lg:block ${activeTab === 'addresses' ? 'text-white/40' : 'text-slate-200'}`} />
                                </button>

                                <div className="hidden lg:block h-px bg-slate-50 my-2 mx-4" />

                                <button
                                    onClick={handleLogout}
                                    className="flex flex-col lg:flex-row items-center lg:justify-start gap-1.5 lg:gap-3 p-2 lg:p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-[10px] lg:text-[14px] min-w-[85px] lg:w-full flex-shrink-0"
                                >
                                    <LogOut size={20} />
                                    <span className="whitespace-nowrap">Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-6 lg:space-y-8">
                        {/* Stats Row - Hides on mobile if not in profile tab to create a "window" feel for other sections */}
                        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 ${activeTab === 'profile' ? 'grid' : 'hidden lg:grid'}`}>
                            {/* Proceso */}
                            <div 
                                onClick={() => { 
                                    setActiveTab('orders');
                                    setOrderFilter('PENDING');
                                }} 
                                className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-blue-500/10"
                            >
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1a3da1] group-hover:scale-110 transition-transform flex-shrink-0">
                                        <ShoppingBag size={18} className="sm:size-[20px]" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate leading-tight">En Proceso</p>
                                        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight">{orders.filter(o => o.status === 'PENDING').length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Enviados */}
                            <div 
                                onClick={() => { 
                                    setActiveTab('orders');
                                    setOrderFilter('SHIPPED');
                                }} 
                                className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-indigo-500/10"
                            >
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Truck size={18} className="sm:size-[20px]" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate leading-tight">Enviados</p>
                                        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight">{orders.filter(o => o.status === 'SHIPPED').length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Entregados */}
                            <div 
                                onClick={() => { 
                                    setActiveTab('orders');
                                    setOrderFilter('COMPLETED');
                                }} 
                                className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-emerald-500/10"
                            >
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <CheckCircle2 size={18} className="sm:size-[20px]" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate leading-tight">Entregados</p>
                                        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight">{orders.filter(o => o.status === 'COMPLETED').length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Favoritos */}
                            <div onClick={() => setActiveTab('favorites')} className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-rose-500/10">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Heart size={18} className="sm:size-[20px]" fill="currentColor" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate leading-tight">Favoritos</p>
                                        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight">{wishlistCount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Opiniones */}
                            <div onClick={() => setActiveTab('reviews')} className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-amber-500/10">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Star size={18} className="sm:size-[20px]" fill="currentColor" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate leading-tight">Opiniones</p>
                                        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight">{userReviews.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Direcciones */}
                            <div onClick={() => setActiveTab('addresses')} className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-violet-500/10">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <MapPin size={18} className="sm:size-[20px]" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate leading-tight">Direcciones</p>
                                        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight">{addresses.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB CONTENT: ORDERS */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="px-2 py-8 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Mis Pedidos</h3>
                                    <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 sm:w-fit">
                                        {[
                                            { id: 'ALL', label: 'Todos' },
                                            { id: 'PENDING', label: 'Proceso' },
                                            { id: 'SHIPPED', label: 'Enviados' },
                                            { id: 'COMPLETED', label: 'Entregados' }
                                        ].map(f => (
                                            <button 
                                                key={f.id}
                                                onClick={() => setOrderFilter(f.id)}
                                                className={`px-[10px] py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-grow sm:flex-grow-0 ${
                                                    orderFilter === f.id 
                                                    ? 'bg-[#1a3da1] text-white shadow-lg shadow-blue-500/20 scale-105' 
                                                    : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    {isLoading ? (
                                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px] animate-pulse">
                                            Cargando historial...
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <ShoppingBag size={48} className="text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold">No has realizado pedidos todavía.</p>
                                            <Link href="/" className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all">Empezar a Comprar</Link>
                                        </div>
                                    ) : (
                                        orders
                                            .filter(o => orderFilter === 'ALL' || o.status === orderFilter)
                                            .map((order, i) => (
                                                <div key={i} className="flex flex-col p-5 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:border-blue-100 hover:bg-white transition-all group overflow-hidden">
                                                    {/* Top Row: Basic Info and Quick Actions */}
                                                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-[#1a3da1] text-[13px] font-black group-hover:scale-105 transition-transform shadow-sm">
                                                                #{order.id.slice(-6).toUpperCase()}
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <p className="font-black text-slate-900 text-base sm:text-lg leading-tight">${order.total.toLocaleString()}</p>
                                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.05em] sm:tracking-[0.1em] ${
                                                                    order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                                    order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-600' :
                                                                    order.status === 'PENDING' ? 'bg-[var(--color-amber-100)] text-[var(--color-amber-600)]' :
                                                                    'bg-blue-50 text-[#1a3da1]'
                                                                }`}>
                                                                {order.status === 'PENDING' ? 'En Preparación' : 
                                                                 order.status === 'SHIPPED' ? 'Enviado' : 
                                                                 order.status === 'COMPLETED' ? 'Entregado' :
                                                                 order.status === 'CANCELLED' ? 'Cancelado' :
                                                                 order.status}
                                                            </span>
                                                            <button 
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-[#1a3da1] hover:border-[#1a3da1] transition-all hover:scale-110 shadow-sm"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Row: Conditional Confirmation Action */}
                                                    {order.status === 'SHIPPED' && (
                                                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    confirmOrderReceived(order.id);
                                                                }}
                                                                className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95"
                                                            >
                                                                Confirmar de recibido!
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))

                                    )}
                                </div>
                            </div>
                        )}

                        {/* ORDER DETAIL MODAL */}
                        {selectedOrder && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                                <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                    <div className="p-4 sm:p-8 rounded-t-[3px] border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Detalle del Pedido</h3>
                                            <p className="text-slate-400 font-bold text-sm">#{selectedOrder.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="p-4 sm:p-8 rounded-b-[3px] max-h-[70vh] overflow-y-auto no-scrollbar space-y-8">
                                        {/* Status & Date */}
                                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                                                <span className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                                    selectedOrder.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                                                    selectedOrder.status === 'SHIPPED' ? 'bg-blue-200 text-blue-900' :
                                                    selectedOrder.status === 'PENDING' ? 'bg-[var(--color-amber-100)] text-[var(--color-amber-600)]' :
                                                    'bg-blue-50 text-[#1a3da1]'
                                                }`}>
                                                    {selectedOrder.status === 'PENDING' ? 'En Preparación' : 
                                                     selectedOrder.status === 'SHIPPED' ? 'Enviado' :
                                                     'Entregado'}
                                                </span>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                                                <p className="font-bold text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="space-y-4">
                                            <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Productos ({selectedOrder.items.length})</h4>
                                            <div className="space-y-3">
                                                {selectedOrder.items.map((item: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 group">
                                                        <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-50">
                                                            {item.image ? (
                                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <ShoppingBag size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <h5 className="font-bold text-slate-900 text-sm truncate">{item.name}</h5>
                                                            <p className="text-slate-400 text-[12px] font-medium">Cant: {item.quantity} × ${item.price.toLocaleString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-[#1a3da1] text-sm">${(item.price * item.quantity).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                        {/* Summary */}
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center justify-between text-slate-500 font-bold text-sm">
                                                <span>Subtotal</span>
                                                <span>${selectedOrder.total.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-500 font-bold text-sm">
                                                <span>Envío</span>
                                                <span className="text-emerald-500">Gratis</span>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-lg font-black text-slate-900">Total</span>
                                                <span className="text-2xl font-black text-[#1a3da1]">${selectedOrder.total.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Shipping Detail Summary with Bubble */}
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dirección de Envío</h4>
                                                {(() => {
                                                    const addr = formatAddress(selectedOrder.address);
                                                    if (!addr.type) return null;
                                                    return (
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                                                            addr.type === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                                            addr.type === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                            'bg-white text-slate-500 border-slate-200'
                                                        }`}>
                                                            {addr.type === 'Casa' ? '🏠' : addr.type === 'Trabajo' ? <Briefcase size={10} className="fill-current" /> : <Mountain size={10} className="fill-current" />} {addr.type}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="mb-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Dirección o lugar de entrega:</span>
                                                    <p className="font-black text-slate-900 text-[15px] leading-tight">
                                                        {formatAddress(selectedOrder.address).street}
                                                    </p>
                                                </div>
                                                
                                                {formatAddress(selectedOrder.address).indications && (
                                                    <div className="mb-2">
                                                        <span className="text-[9px] font-black text-[#1a3da1] uppercase tracking-widest block mb-0.5">Indicación para la entrega:</span>
                                                        <p className="text-[#1a3da1] font-black text-[13px] bg-[#1a3da1]/5 inline-block px-3 py-1.5 rounded-xl border border-[#1a3da1]/10">
                                                            {formatAddress(selectedOrder.address).indications}
                                                        </p>
                                                    </div>
                                                )}

                                                <p className="text-slate-500 font-bold text-[13px] pt-1">
                                                    {formatAddress(selectedOrder.address).locality}
                                                    {formatAddress(selectedOrder.address).neighborhood ? ` | ${formatAddress(selectedOrder.address).neighborhood}` : ''}
                                                </p>
                                                <p className="text-slate-400 font-bold text-[12px]">
                                                    {formatAddress(selectedOrder.address).city}
                                                    {formatAddress(selectedOrder.address).cp && ` (CP: ${formatAddress(selectedOrder.address).cp})`}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Close Button Inside Scrollable Area */}
                                        <div className="pt-8 mt-8 border-t border-slate-100 pb-4">
                                            <button 
                                                onClick={() => setSelectedOrder(null)}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]"
                                            >
                                                Cerrar Detalle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: FAVORITES */}
                        {activeTab === 'favorites' && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Mis Favoritos</h3>
                                </div>

                                <div className="p-8">
                                    {wishlist.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <Heart size={48} className="text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No tienes productos en favoritos.</p>
                                            <Link href="/" className="mt-4 bg-[#1a3da1] text-white px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20">Explorar Productos</Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {wishlist.map((item, i) => (
                                                <div key={i} className="flex gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-blue-100 transition-all group relative">
                                                    <Link href={`/product/${item.id}`} className="w-24 h-24 bg-white rounded-2xl border border-slate-100 overflow-hidden relative p-2 block flex-shrink-0">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-contain p-2 group-hover:scale-110 transition-transform"
                                                        />
                                                    </Link>
                                                    <div className="flex-1 py-1 pr-8">
                                                        <Link href={`/product/${item.id}`} className="block font-black text-slate-900 hover:text-[#1a3da1] transition-colors line-clamp-2 leading-tight">
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-[#1a3da1] font-black mt-2">${item.price.toLocaleString()}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleWishlist(item)}
                                                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: REVIEWS */}
                        {activeTab === 'reviews' && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Mis Valoraciones</h3>
                                </div>

                                <div className="p-8 space-y-6">
                                    {userReviews.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-center">
                                            <Star size={48} className="text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Aún no has calificado ningún producto.</p>
                                        </div>
                                    ) : (
                                        userReviews.map((rev, i) => (
                                            <div key={i} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Link href={`/product/${rev.productId}`} className="font-black text-slate-900 hover:text-[#1a3da1] transition-colors">{rev.productName}</Link>
                                                    <span className="text-[11px] font-bold text-slate-400">{rev.date}</span>
                                                </div>
                                                <div className="flex text-amber-400 gap-1">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star key={s} size={14} fill={s <= rev.rating ? "currentColor" : "none"} className={s <= rev.rating ? "text-amber-400" : "text-slate-200"} />
                                                    ))}
                                                </div>
                                                <p className="text-slate-600 text-sm italic leading-relaxed">"{rev.comment}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: PROFILE (DEFAULT) */}
                        {activeTab === 'profile' && (
                             <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="p-8 border-b border-slate-100">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Información de Cuenta</h3>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-[#1a3da1] transition-all"
                                                placeholder="Tu nombre"
                                            />
                                        ) : (
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700">{user.name}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Correo Electrónico</label>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-500 cursor-not-allowed">{user.email}</div>
                                        <p className="text-[10px] text-slate-300 font-bold px-1 italic">El correo no se puede cambiar por seguridad.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Cliente</label>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700">
                                            {user.role === 'VIEWER' ? 'Lector / Acceso Limitado' : 'Cliente Premium / Verificado'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Miembro desde</label>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Noviembre 2025'}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                    {isEditing ? (
                                        <>
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="px-8 py-3 rounded-xl font-black text-[13px] uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                onClick={handleSaveProfile}
                                                className="bg-[#1a3da1] text-white px-8 py-3 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                            >
                                                Guardar Cambios
                                            </button>
                                        </>
                                    ) : (
                                        user.role !== 'VIEWER' && (
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                                            >
                                                Editar Perfil
                                            </button>
                                        )
                                    )}
                                </div>
                             </div>
                        )}

                        {/* TAB CONTENT: ADDRESSES */}
                        {activeTab === 'addresses' && (
                             <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                                    {!isAddingAddress && (
                                        <button onClick={() => {
                                            setNewAddress(prev => ({ ...prev, contactName: user?.name || '' }));
                                            setIsAddingAddress(true);
                                        }} className="bg-[#1a3da1] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center gap-2">
                                            Añadir Nueva
                                        </button>
                                    )}
                                </div>
                                            {isAddingAddress ? (
                                    <div className="p-8 space-y-8 bg-slate-50/50">
                                        <div className="space-y-6">
                                            {/* Tipo de dirección */}
                                            <div className="space-y-4">
                                                <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Nueva dirección:</h4>
                                                <div className="flex flex-wrap gap-6">
                                                    {[
                                                        { label: '🏠 Casa', value: 'Casa' },
                                                        { label: '💼 Trabajo', value: 'Trabajo' },
                                                        { label: '🛤️ Lugar', value: 'Lugar' }
                                                    ].map((type) => (
                                                        <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                                                            <div 
                                                                onClick={() => setNewAddress({...newAddress, title: type.value})}
                                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newAddress.title === type.value ? 'border-[#1a3da1] bg-[#1a3da1]' : 'border-slate-300 bg-white group-hover:border-[#1a3da1]'}`}
                                                            >
                                                                {newAddress.title === type.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <span className={`font-bold text-sm ${newAddress.title === type.value ? 'text-slate-900' : 'text-slate-500'}`}>{type.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Campos de texto principales */}
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Dirección o lugar de entrega</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej. Nombre de la calle y Nro. domicilio" 
                                                        value={newAddress.street} 
                                                        onChange={e => setNewAddress({...newAddress, street: e.target.value})} 
                                                        className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Indicación para la entrega:</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej. Entre calles, color de casa, no tiene timbre" 
                                                        value={newAddress.indications} 
                                                        onChange={e => setNewAddress({...newAddress, indications: e.target.value})} 
                                                        className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Localidad:</label>
                                                        <input 
                                                            type="text" 
                                                            value={newAddress.locality} 
                                                            onChange={e => setNewAddress({...newAddress, locality: e.target.value})} 
                                                            className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Colonia o barrio (opcional):</label>
                                                        <input 
                                                            type="text" 
                                                            value={newAddress.neighborhood} 
                                                            onChange={e => setNewAddress({...newAddress, neighborhood: e.target.value})} 
                                                            className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Ciudad (opcional):</label>
                                                        <input 
                                                            type="text" 
                                                            value={newAddress.city} 
                                                            onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                                                            className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Código Postal (opcional):</label>
                                                        <input 
                                                            type="text" 
                                                            value={newAddress.postalCode} 
                                                            onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} 
                                                            className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-200">
                                                    <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest mb-6">Datos de contacto:</h4>
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Nombre y apellido:</label>
                                                            <input 
                                                                type="text" 
                                                                value={newAddress.contactName} 
                                                                onChange={e => setNewAddress({...newAddress, contactName: e.target.value})} 
                                                                className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                            />
                                                        </div>
                                                        <div className="space-y-2 max-w-sm">
                                                            <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Teléfono:</label>
                                                            <input 
                                                                type="text" 
                                                                value={newAddress.phone} 
                                                                onChange={e => setNewAddress({...newAddress, phone: e.target.value})} 
                                                                className="w-full h-12 px-5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-[#1a3da1] transition-all" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                                            <button onClick={() => setIsAddingAddress(false)} className="px-8 py-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors">Cancelar</button>
                                            <button onClick={handleSaveAddress} className="px-10 py-3 rounded-xl text-white font-black text-sm bg-[#1a3da1] hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-widest">Guardar Dirección</button>
                                        </div>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="p-8 flex flex-col items-center justify-center text-center py-20">
                                        <MapPin size={48} className="text-slate-100 mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No has guardado direcciones aún.</p>
                                    </div>
                                ) : (
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="p-6 bg-white border border-slate-200 shadow-sm rounded-[32px] relative hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer" onClick={() => setViewingAddress(addr)}>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAddress(addr.id);
                                                    }} 
                                                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-300 hover:text-rose-500 hover:border-rose-100 border border-slate-50 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                
                                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                                                        addr.title === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                                        addr.title === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                        'bg-slate-50 text-slate-700 border-slate-100'
                                                    }`}>
                                                        {addr.title === 'Casa' ? '🏠' : addr.title === 'Trabajo' ? <Briefcase size={12} className="fill-current" /> : <Mountain size={12} className="fill-current" />} 
                                                        {addr.title || 'Dirección'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-slate-900 font-black text-[18px] leading-tight">{addr.street}</p>
                                                    <p className="text-slate-500 font-bold text-[14px]">
                                                        {addr.locality}
                                                        {addr.neighborhood ? ' | ' + addr.neighborhood : ''}
                                                    </p>
                                                    <p className="text-slate-400 font-bold text-[13px]">
                                                        {addr.city || '---'}
                                                        {addr.postalCode ? ' (CP: ' + addr.postalCode + ')' : ''}
                                                    </p>
                                                    
                                                    {addr.indications && (
                                                        <p className="text-slate-400 text-[13px] italic mt-4 bg-slate-50/50 p-3 rounded-[15px] border border-slate-100">
                                                            Ind: {addr.indications}
                                                        </p>
                                                    )}

                                                    <div className="pt-4 mt-4 border-t border-slate-50 space-y-2.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 flex items-center justify-center text-[#582f87]">
                                                                <User size={18} className="fill-current" />
                                                            </div>
                                                            <span className="text-slate-900 font-black text-[15px]">{addr.contactName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 flex items-center justify-center text-[#c54b7c]">
                                                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M21 16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18C15.655 18 11.968 16.471 9.248 13.752C6.529 11.032 5 7.345 5 3.5C5 3.10218 5.15804 2.72064 5.43934 2.43934C5.72064 2.15804 6.10218 2 6.5 2H10.5C10.741 2.00007 10.974 2.08332 11.16 2.23594C11.346 2.38855 11.474 2.60155 11.523 2.839L12.273 6.589C12.33 6.874 12.274 7.17 12.115 7.415C11.956 7.66 11.71 7.828 11.428 7.884L8.718 8.428C9.528 10.134 10.866 11.472 12.572 12.282L13.116 9.572C13.172 9.29 13.34 9.044 13.585 8.885C13.83 8.726 14.126 8.67 14.411 8.727L18.161 9.477C18.3985 9.526 18.6115 9.654 18.7641 9.84C18.9167 10.026 19 10.259 19 10.5V14.5C19 14.8978 18.842 15.2794 18.5607 15.5607C18.2794 15.842 17.8978 16 17.5 16C13.655 16 9.968 14.471 7.248 11.752C4.529 9.032 3 5.345 3 1.5C3 1.10218 3.15804 0.720644 3.43934 0.43934C3.72064 0.158036 4.10218 0 4.5 0H8.5C8.941 0.0003 9.368 0.151 9.71 0.428C10.052 0.705 10.288 1.092 10.38 1.526L11.13 5.276C11.233 5.797 11.131 6.337 10.839 6.786C10.547 7.235 10.095 7.545 10.569 7.663C11.666 9.998 13.502 11.834 15.837 12.931C15.955 13.505 16.265 13.053 16.714 12.761C17.163 12.469 17.703 12.367 18.224 12.47L21.974 13.22C22.408 13.312 22.795 13.548 23.072 13.89C23.349 14.232 23.4997 14.659 23.5 15.1V19.1C23.5 19.4978 23.342 19.8794 23.0607 20.1607C22.7794 20.442 22.3978 20.6 22 20.6Z" transform="translate(0, 3) rotate(-90 12 10.3)" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-slate-900 font-extrabold text-[15px]">{addr.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        )}

                        {/* VIEW ADDRESS MODAL (Matches Admin Style) */}
                        {viewingAddress && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 p-8 flex flex-col gap-6 relative">
                                    <button 
                                        onClick={() => setViewingAddress(null)}
                                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="space-y-4">
                                        <div className="flex">
                                            <span className={`border px-4 py-2 rounded-2xl flex items-center gap-2 font-extrabold text-[12px] uppercase tracking-wider shadow-sm ${
                                                viewingAddress.title === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                                viewingAddress.title === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                'bg-slate-50 text-slate-700 border-slate-100'
                                            }`}>
                                                {viewingAddress.title === 'Casa' ? '🏠 CASA' : viewingAddress.title === 'Trabajo' ? '💼 TRABAJO' : '🛤️ LUGAR'}
                                            </span>
                                        </div>

                                        <div className="space-y-1 pt-1">
                                            <h4 className="text-[24px] font-black text-slate-900 leading-tight">
                                                {viewingAddress.street}
                                            </h4>
                                            <p className="text-slate-500 font-bold text-[15px]">
                                                {viewingAddress.neighborhood ? `${viewingAddress.neighborhood}, ` : ''}
                                                {viewingAddress.locality}
                                            </p>
                                            <p className="text-slate-400 font-bold text-[14px]">
                                                {viewingAddress.city}
                                                {viewingAddress.postalCode ? ` (CP: ${viewingAddress.postalCode})` : ''}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 rounded-[22px] p-4">
                                            <p className="text-slate-400 italic text-[14px]">
                                                Ind: {viewingAddress.indications || 'Sin indicaciones adicionales.'}
                                            </p>
                                        </div>

                                        <div className="h-px bg-slate-50 w-full" />

                                        <div className="space-y-3 pt-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 flex items-center justify-center text-[#582f87]">
                                                    <User size={20} className="fill-current" />
                                                </div>
                                                <span className="text-slate-900 font-black text-[16px]">{viewingAddress.contactName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 flex items-center justify-center text-[#c54b7c]">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M21 16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18C15.655 18 11.968 16.471 9.248 13.752C6.529 11.032 5 7.345 5 3.5C5 3.10218 5.15804 2.72064 5.43934 2.43934C5.72064 2.15804 6.10218 2 6.5 2H10.5C10.741 2.00007 10.974 2.08332 11.16 2.23594C11.346 2.38855 11.474 2.60155 11.523 2.839L12.273 6.589C12.33 6.874 12.274 7.17 12.115 7.415C11.956 7.66 11.71 7.828 11.428 7.884L8.718 8.428C9.528 10.134 10.866 11.472 12.572 12.282L13.116 9.572C13.172 9.29 13.34 9.044 13.585 8.885C13.83 8.726 14.126 8.67 14.411 8.727L18.161 9.477C18.3985 9.526 18.6115 9.654 18.7641 9.84C18.9167 10.026 19 10.259 19 10.5V14.5C19 14.8978 18.842 15.2794 18.5607 15.5607C18.2794 15.842 17.8978 16 17.5 16C13.655 16 9.968 14.471 7.248 11.752C4.529 9.032 3 5.345 3 1.5C3 1.10218 3.15804 0.720644 3.43934 0.43934C3.72064 0.158036 4.10218 0 4.5 0H8.5C8.941 0.0003 9.368 0.151 9.71 0.428C10.052 0.705 10.288 1.092 10.38 1.526L11.13 5.276C11.233 5.797 11.131 6.337 10.839 6.786C10.547 7.235 10.095 7.545 10.569 7.663C11.666 9.998 13.502 11.834 15.837 12.931C15.955 13.505 16.265 13.053 16.714 12.761C17.163 12.469 17.703 12.367 18.224 12.47L21.974 13.22C22.408 13.312 22.795 13.548 23.072 13.89C23.349 14.232 23.4997 14.659 23.5 15.1V19.1C23.5 19.4978 23.342 19.8794 23.0607 20.1607C22.7794 20.442 22.3978 20.6 22 20.6Z" transform="translate(0, 3) rotate(-90 12 10.3)" />
                                                    </svg>
                                                </div>
                                                <span className="text-slate-900 font-extrabold text-[16px] tracking-tight">
                                                    {viewingAddress.phone || '---'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            onClick={() => setViewingAddress(null)}
                                            className="w-full h-14 bg-slate-900 text-white rounded-3xl font-black text-[13px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                                        >
                                            Entendido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                     </div>
                 </div>
             </div>
         </div>
     );
 }
