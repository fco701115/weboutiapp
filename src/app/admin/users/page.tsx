'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Plus, MoreVertical, Edit2, Trash2, Mail, Shield, ShieldCheck, Clock, X, CheckCircle2, Save, ShoppingBag, Star, Heart, MessageSquare, ChevronRight, MapPin, Briefcase, Mountain, User as UserIcon } from 'lucide-react';

interface AddressData {
    street: string;
    neighborhood: string;
    locality: string;
    city: string;
    cp: string;
    type: string;
    indications: string;
    phone: string;
    mapUrl: string;
}

export default function AdminUsers() {
    const [usersList, setUsersList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'VIEWER',
        status: 'ACTIVE'
    });
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [activityUser, setActivityUser] = useState<any>(null);
    const [userActivity, setUserActivity] = useState<any>(null);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [activityTab, setActivityTab] = useState('orders');

    useEffect(() => {
        fetchUsers();
        
        const handleUpdate = () => fetchUsers();
        window.addEventListener('admin-user-updated', handleUpdate);
        
        return () => window.removeEventListener('admin-user-updated', handleUpdate);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/users?_t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            const usersWithCounts = (Array.isArray(data) ? data : []).map((u: any) => {
                let count = 0;
                if (u.addresses) {
                    try {
                        const parsed = typeof u.addresses === 'string' ? JSON.parse(u.addresses) : u.addresses;
                        if (Array.isArray(parsed)) count = parsed.length;
                    } catch(e) {}
                }
                return { ...u, _count: { ...u._count, addresses: count } };
            });
            setUsersList(usersWithCounts);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsersList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivity = async (user: any) => {
        setActivityUser(user);
        setIsLoadingActivity(true);
        setActivityTab('orders');
        try {
            const res = await fetch(`/api/users/${user.id}/activity?_t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                
                const orderAddresses: string[] = data.orders?.map((o: any) => o.address) || [];
                let savedAddresses: string[] = [];
                if (user.addresses) {
                    try {
                        const parsed = typeof user.addresses === 'string' ? JSON.parse(user.addresses) : user.addresses;
                        if (Array.isArray(parsed)) {
                            savedAddresses = parsed.map((addr: any) => 
                                `[${addr.title}] ${addr.street}, ${addr.neighborhood || ''}, ${addr.locality}, ${addr.city || ''}. ${addr.indications ? `(Ind: ${addr.indications}) ` : ''}${addr.postalCode ? `(CP: ${addr.postalCode}) ` : ''}Tel: ${addr.phone}`
                            );
                        }
                    } catch(e) {
                        console.error('Failed to parse saved addresses:', e);
                    }
                }
                const uniqueAddresses = Array.from(new Set([...savedAddresses, ...orderAddresses]));
                
                setUserActivity({
                    ...data,
                    uniqueAddresses
                });
                
                setUsersList(prev => prev.map(u => u.id === user.id ? {
                    ...u,
                    _count: {
                        orders: data.orders?.length || 0,
                        reviews: data.reviews?.length || 0,
                        messages: data.messages?.length || 0,
                        favorites: data.favorites?.length || 0,
                        addresses: uniqueAddresses.length
                    }
                } : u));
            }
        } catch (error) {
            console.error('Error fetching activity');
        } finally {
            setIsLoadingActivity(false);
        }
    };

    const filteredUsers = usersList.filter(user => 
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowSuccess(true);
                setFormData({ name: '', email: '', role: 'VIEWER', status: 'ACTIVE' });
                setIsModalOpen(false);
                setEditingUser(null);
                fetchUsers();
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                const error = await res.json();
                alert(error.error || 'Error saving user');
            }
        } catch (error) {
            alert('Error saving user');
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'VIEWER',
            status: user.status || 'ACTIVE'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar a este usuario?')) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            alert('Error deleting user');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700';
            case 'INACTIVE': return 'bg-slate-100 text-slate-500';
            case 'BANNED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const formatRole = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'Super Admin';
            case 'EDITOR': return 'Editor';
            case 'VIEWER': return 'Lector';
            case 'USER': return 'Cliente';
            default: return role;
        }
    };

    const getOrderStatusStyles = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            case 'PENDING': return 'bg-[var(--color-amber-100)] text-[var(--color-amber-600)]';
            case 'CANCELLED': return 'bg-rose-100 text-rose-600';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const formatAddress = (fullAddress: string): AddressData => {
        if (!fullAddress) return { street: '', neighborhood: '', locality: '', city: '', cp: '', type: '', indications: '', phone: '', mapUrl: '' };
        
        let streetVal = fullAddress;
        let phoneVal = '';
        let indicationsVal = '';
        let neighborhoodVal = '';
        let cityVal = '';
        let cpVal = '';
        let localityVal = '';
        let mapUrlVal = '';

        // 1. Extract Map stuff
        const mapMatch = streetVal.match(/ \[MAPA: (.*?)\]$/) || streetVal.match(/ \(Ubicación: (.*?)\)/);
        if (mapMatch) {
            mapUrlVal = mapMatch[1];
            streetVal = streetVal.replace(mapMatch[0], '');
        }

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

        // 4. Extract CP (Flexible: handles (CP: 123), CP: 123, CP 123)
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

        // 6. Catch raw CP at end (e.g. "...Zapotitlan, 75841")
        const rawCpAtEnd = streetVal.match(/,?\s+(\d{5})\.?$/);
        if (rawCpAtEnd && !cpVal) {
            cpVal = rawCpAtEnd[1];
            streetVal = streetVal.replace(rawCpAtEnd[0], '');
        }

        // CLEANING: Strip trailing/leading separator garbage
        streetVal = streetVal.replace(/[.\s,]+$/, '').trim();

        // 7. Hierarchy Parsing: Right-to-Left Strategy
        const parts = streetVal.split(',').map(p => p.trim());
        
        if (parts.length > 0) {
            if (parts.length === 1) {
                // Only street
                streetVal = parts[0];
            } else if (parts.length === 2) {
                // Street, City/Localidad
                streetVal = parts[0];
                cityVal = parts[1];
            } else if (parts.length === 3) {
                // Street, Locality, City
                streetVal = parts[0];
                localityVal = parts[1];
                cityVal = parts[2];
            } else if (parts.length >= 4) {
                // Street, Neighborhood, Locality, City (Full style)
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
            indications: indicationsVal,
            mapUrl: mapUrlVal
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Gestión de Usuarios
                    </h2>
                    <p className="text-slate-500 text-[14px]">Administra los permisos y accesos de tu equipo.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: '', email: '', role: 'VIEWER', status: 'ACTIVE' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Invitar Usuario
                </button>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/30">
                    <div className="relative flex-grow">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o rol..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-[14px] focus:ring-4 ring-blue-500/5 transition-all outline-none"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold text-[14px]">Sincronizando equipo...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-slate-100 overflow-hidden">
                        {filteredUsers.length === 0 ? (
                            <div className="col-span-full p-20 text-center flex flex-col items-center gap-3">
                                <Users size={40} className="text-slate-200" />
                                <p className="text-slate-400 font-bold">
                                    {searchTerm ? 'No se encontraron usuarios para "' + searchTerm + '"' : 'No hay usuarios registrados.'}
                                </p>
                            </div>
                        ) : filteredUsers.map((user) => (
                            <div key={user.id} className="p-4 sm:p-8 hover:bg-slate-50/50 transition-all group relative overflow-hidden border-slate-100">
                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                                    <button className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm">
                                        <MoreVertical size={16} className="sm:hidden" />
                                        <MoreVertical size={18} className="hidden sm:block" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[28px] p-[2px] sm:p-[3px] shadow-xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${
                                        user.role === 'SUPER_ADMIN' ? 'from-rose-500 to-red-600 shadow-rose-500/10' :
                                        user.role === 'EDITOR' ? 'from-amber-400 to-orange-500 shadow-orange-500/10' :
                                        'from-blue-500 to-indigo-600 shadow-blue-500/10'
                                    }`}>
                                        <div className={`w-full h-full rounded-xl sm:rounded-[25px] bg-white flex items-center justify-center font-bold text-[16px] sm:text-[24px] tracking-tighter uppercase overflow-hidden ${
                                            user.role === 'SUPER_ADMIN' ? 'text-rose-600' :
                                            user.role === 'EDITOR' ? 'text-orange-500' :
                                            'text-blue-600'
                                        }`}>
                                             {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : user.name?.substring(0, 2) || '??'}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-[14px] sm:text-[18px] text-slate-900 leading-tight line-clamp-1">{user.name || 'Sin nombre'}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[13px] font-medium mt-1 w-full justify-center">
                                        <Mail size={12} className="text-slate-300 shrink-0" />
                                        <span className="truncate max-w-[100px] sm:max-w-none">{user.email}</span>
                                    </div>

                                    <div className="mt-4 sm:mt-5 w-full bg-slate-50/80 rounded-xl sm:rounded-2xl p-2 sm:p-3 grid grid-cols-5 gap-0.5 sm:gap-1 border border-slate-100/50">
                                        <div className="flex flex-col items-center justify-center border-r border-slate-100" title="Pedidos">
                                            <ShoppingBag size={12} className="sm:hidden text-blue-500 mb-0.5" />
                                            <ShoppingBag size={14} className="hidden sm:block text-blue-500 mb-1" />
                                            <span className="text-[9px] sm:text-[11px] font-black text-slate-700">{user._count?.orders || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center border-r border-slate-100" title="Valoraciones">
                                            <Star size={12} className="sm:hidden mb-0.5 text-amber-500" />
                                            <Star size={14} className="hidden sm:block mb-1 text-amber-500" />
                                            <span className="text-[9px] sm:text-[11px] font-black text-slate-700">{user._count?.reviews || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center border-r border-slate-100" title="Favoritos">
                                            <Heart size={12} className="sm:hidden text-rose-500 mb-0.5" />
                                            <Heart size={14} className="hidden sm:block text-rose-500 mb-1" />
                                            <span className="text-[9px] sm:text-[11px] font-black text-slate-700">{user._count?.favorites || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center border-r border-slate-100" title="Mensajes">
                                            <MessageSquare size={12} className="sm:hidden text-indigo-500 mb-0.5" />
                                            <MessageSquare size={14} className="hidden sm:block text-indigo-500 mb-1" />
                                            <span className="text-[9px] sm:text-[11px] font-black text-slate-700">{user._count?.messages || 0}</span>
                                        </div>
                                        <div 
                                            className="flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
                                            title="Direcciones Guardadas"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fetchActivity(user).then(() => setActivityTab('addresses'));
                                            }}
                                        >
                                            <MapPin size={12} className="sm:hidden text-red-500 mb-0.5 fill-red-500/20" />
                                            <MapPin size={14} className="hidden sm:block text-red-500 mb-1 fill-red-500/20" strokeWidth={3} />
                                            <span className="text-[9px] sm:text-[11px] font-black text-slate-700">{user._count?.addresses || 0}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1 sm:gap-2">
                                        <span className="flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-white border border-slate-100 text-slate-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                                            {user.role === 'SUPER_ADMIN' ? <ShieldCheck size={10} className="sm:hidden text-amber-500" /> : <Shield size={10} className="sm:hidden" />}
                                            {user.role === 'SUPER_ADMIN' ? <ShieldCheck size={12} className="hidden sm:block text-amber-500" /> : <Shield size={12} className="hidden sm:block" />}
                                            {formatRole(user.role)}
                                        </span>
                                        <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider ${getStatusStyles(user.status)}`}>
                                            {user.status === 'ACTIVE' ? 'Activo' : user.status === 'INACTIVE' ? 'Inactivo' : 'Baneado'}
                                        </span>
                                    </div>

                                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                                        <button 
                                            onClick={() => fetchActivity(user)}
                                            className="text-blue-600 text-[10px] sm:text-[12px] font-black hover:underline flex items-center gap-1 uppercase tracking-widest"
                                        >
                                            Actividad
                                            <ChevronRight size={14} />
                                        </button>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(user)}
                                                className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 size={12} className="sm:hidden" />
                                                <Edit2 size={14} className="hidden sm:block" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white transition-all border border-transparent hover:border-rose-100"
                                            >
                                                <Trash2 size={12} className="sm:hidden" />
                                                <Trash2 size={14} className="hidden sm:block" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Actividad del Usuario */}
            {activityUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-500">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[20px] bg-blue-50 flex items-center justify-center font-black text-2xl text-blue-600">
                                    {activityUser.name?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl text-slate-900 leading-none mb-1">{activityUser.name}</h3>
                                    <p className="text-slate-400 font-bold text-sm tracking-tight">{activityUser.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActivityUser(null)}
                                className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-4 sm:px-8 flex items-center justify-between sm:justify-start gap-1 border-b border-slate-100 bg-white">
                            {[
                                { id: 'orders', label: 'Pedidos', icon: ShoppingBag, count: userActivity?.orders?.length || 0, color: 'text-blue-500' },
                                { id: 'reviews', label: 'Valoraciones', icon: Star, count: userActivity?.reviews?.length || 0, color: 'text-amber-500' },
                                { id: 'favorites', label: 'Favoritos', icon: Heart, count: userActivity?.favorites?.length || 0, color: 'text-rose-500' },
                                { id: 'messages', label: 'Mensajes', icon: MessageSquare, count: userActivity?.messages?.length || 0, color: 'text-indigo-500' },
                                { id: 'addresses', label: 'Direcciones', icon: MapPin, count: userActivity?.uniqueAddresses?.length || 0, color: 'text-red-500' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActivityTab(tab.id)}
                                    className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-6 py-3 sm:py-4 font-black text-[10px] sm:text-sm relative transition-all ${activityTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <tab.icon size={14} className={`sm:hidden ${tab.color}`} />
                                    <tab.icon size={16} className={`hidden sm:block ${tab.color}`} />
                                    <span className="sm:hidden">{tab.label.slice(0, 4)}.</span>
                                    <span className="hidden sm:block">{tab.label}</span>
                                    <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] ${activityTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {tab.count}
                                    </span>
                                    {activityTab === tab.id && (
                                        <div className="absolute bottom-0 left-1 right-1 h-1 bg-blue-600 rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
                            {isLoadingActivity ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-slate-400 font-bold text-sm">Cargando actividad...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activityTab === 'orders' && (
                                        userActivity?.orders?.length === 0 ? (
                                            <EmptyState icon={ShoppingBag} text="No se encontraron pedidos." />
                                        ) : userActivity?.orders?.map((order: any) => (
                                            <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">
                                                        #{order.id.slice(-6).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">${order.total.toLocaleString()}</p>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none mt-1">
                                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getOrderStatusStyles(order.status)}`}>
                                                    {order.status === 'PENDING' ? 'Pendiente' : 
                                                     order.status === 'SHIPPED' ? 'Enviado' :
                                                     order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'Completado' :
                                                     order.status === 'CANCELLED' ? 'Cancelado' :
                                                     order.status}
                                                </span>
                                            </div>
                                        ))
                                    )}

                                    {activityTab === 'reviews' && (
                                        userActivity?.reviews?.length === 0 ? (
                                            <EmptyState icon={Star} text="Aún no ha dejado valoraciones." />
                                        ) : userActivity?.reviews?.map((review: any) => (
                                            <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-black text-slate-900">{review.productName}</h4>
                                                    <div className="flex text-amber-400 gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-sm leading-relaxed font-medium italic">"{review.comment}"</p>
                                                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest pt-2">
                                                    Escrita el {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))
                                    )}

                                    {activityTab === 'messages' && (
                                        userActivity?.messages?.length === 0 ? (
                                            <EmptyState icon={MessageSquare} text="No hay mensajes registrados." />
                                        ) : userActivity?.messages?.map((msg: any) => (
                                            <div key={msg.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-black text-slate-900">{msg.subject || 'Sin asunto'}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${msg.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {msg.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">{msg.content}</p>
                                                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest pt-1">
                                                     {new Date(msg.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))
                                    )}

                                    {activityTab === 'favorites' && (
                                        userActivity?.favorites?.length === 0 ? (
                                            <EmptyState icon={Heart} text="No tiene productos en favoritos." />
                                        ) : userActivity?.favorites?.map((product: any) => (
                                            <div key={product.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm hover:border-rose-100 transition-all">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden p-2 flex-shrink-0">
                                                    <img 
                                                        src={(() => {
                                                            try {
                                                                const parsed = JSON.parse(product.images || '[]');
                                                                return Array.isArray(parsed) ? parsed[0] : parsed;
                                                            } catch {
                                                                return product.images;
                                                            }
                                                        })()} 
                                                        className="w-full h-full object-contain"
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-black text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                                                    <p className="text-rose-500 font-black text-sm mt-0.5">${product.price.toLocaleString()}</p>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 mr-2" />
                                            </div>
                                        ))
                                    )}

                                    {activityTab === 'addresses' && (
                                        userActivity?.uniqueAddresses?.length === 0 ? (
                                            <EmptyState icon={MapPin} text="No se encontraron direcciones registradas." />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {userActivity?.uniqueAddresses?.map((fullAddr: string, i: number) => {
                                                    const addr = formatAddress(fullAddr);
                                                    return (
                                                        <div key={i} className="p-5 bg-white border border-slate-100 shadow-sm rounded-[28px] relative hover:border-rose-300 transition-all group">
                                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                                                                    addr.type === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                                                    addr.type === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                                    'bg-slate-50 text-slate-700 border-slate-100'
                                                                }`}>
                                                                    {addr.type === 'Casa' ? '🏠' : addr.type === 'Trabajo' ? <Briefcase size={12} className="fill-current" /> : <Mountain size={12} className="fill-current" />} 
                                                                    {addr.type || 'Dirección'}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-slate-900 font-black text-[16px] leading-tight">{addr.street}</p>
                                                                {addr.mapUrl && (
                                                                    <a 
                                                                        href={addr.mapUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="text-[13px] hover:scale-125 transition-transform" 
                                                                        title="Abrir en Google Maps"
                                                                    >
                                                                        📍
                                                                    </a>
                                                                )}
                                                            </div>

                                                            {addr.indications && (
                                                                <div className="mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1">
                                                                    <span className="text-[9px] font-black text-slate-300 uppercase leading-none">Indicación para la entrega:</span>
                                                                    <p className="text-slate-500 text-[12px] font-bold">
                                                                        {addr.indications}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="space-y-1.5 pt-1">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <p className="text-slate-500 font-bold text-[13px] flex flex-col">
                                                                        <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">Localidad:</span>
                                                                        <span className="truncate">{addr.locality || '---'}</span>
                                                                    </p>
                                                                    <p className="text-slate-500 font-bold text-[13px] flex flex-col">
                                                                        <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">Colonia o barrio (opcional):</span>
                                                                        <span className="truncate">{addr.neighborhood || '---'}</span>
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <p className="text-slate-400 font-bold text-[12px] flex flex-col">
                                                                        <span className="text-[9px] font-black text-slate-200 uppercase shrink-0">Ciudad (opcional):</span>
                                                                        <span className="truncate">{addr.city || '---'}</span>
                                                                    </p>
                                                                    <p className="text-blue-400 font-bold text-[12px] flex flex-col">
                                                                        <span className="text-[9px] font-black text-blue-200 uppercase shrink-0">Código Postal (opcional):</span>
                                                                        <span className="truncate">{addr.cp || '---'}</span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="pt-3 mt-3 border-t border-slate-50 space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-5 h-5 flex items-center justify-center text-[#582f87]">
                                                                        <UserIcon size={16} className="fill-current" />
                                                                    </div>
                                                                    <span className="text-slate-800 font-black text-[14px]">{(fullAddr.match(/👤 (.*?)( Tel:|$)/) || [])[1] || activityUser.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-5 h-5 flex items-center justify-center text-[#c54b7c]">
                                                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M21 16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18C15.655 18 11.968 16.471 9.248 13.752C6.529 11.032 5 7.345 5 3.5C5 3.10218 5.15804 2.72064 5.43934 2.43934C5.72064 2.15804 6.10218 2 6.5 2H10.5C10.741 2.00007 10.974 2.08332 11.16 2.23594C11.346 2.38855 11.474 2.60155 11.523 2.839L12.273 6.589C12.33 6.874 12.274 7.17 12.115 7.415C11.956 7.66 11.71 7.828 11.428 7.884L8.718 8.428C9.528 10.134 10.866 11.472 12.572 12.282L13.116 9.572C13.172 9.29 13.34 9.044 13.585 8.885C13.83 8.726 14.126 8.67 14.411 8.727L18.161 9.477C18.3985 9.526 18.6115 9.654 18.7641 9.84C18.9167 10.026 19 10.259 19 10.5V14.5C19 14.8978 18.842 15.2794 18.5607 15.5607C18.2794 15.842 17.8978 16 17.5 16C13.655 16 9.968 14.471 7.248 11.752C4.529 9.032 3 5.345 3 1.5C3 1.10218 3.15804 0.720644 3.43934 0.43934C3.72064 0.158036 4.10218 0 4.5 0H8.5C8.941 0.0003 9.368 0.151 9.71 0.428C10.052 0.705 10.288 1.092 10.38 1.526L11.13 5.276C11.233 5.797 11.131 6.337 10.839 6.786C10.547 7.235 10.095 7.545 10.569 7.663C11.666 9.998 13.502 11.834 15.837 12.931C15.955 13.505 16.265 13.053 16.714 12.761C17.163 12.469 17.703 12.367 18.224 12.47L21.974 13.22C22.408 13.312 22.795 13.548 23.072 13.89C23.349 14.232 23.4997 14.659 23.5 15.1V19.1C23.5 19.4978 23.342 19.8794 23.0607 20.1607C22.7794 20.442 22.3978 20.6 22 20.6Z" transform="translate(0, 3) rotate(-90 12 10.3)" />
                                                                        </svg>
                                                                    </div>
                                                                    <span className="text-slate-800 font-extrabold text-[14px]">{addr.phone || '---'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8 bg-white border-t border-slate-100">
                             <button onClick={() => setActivityUser(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                                Cerrar Actividad
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Invitar/Editar Usuario */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-[24px] text-slate-900">
                                    {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
                                </h3>
                                <p className="text-[13px] text-slate-400 font-medium">
                                    {editingUser ? 'Actualiza la información del equipo.' : 'Define los accesos para el nuevo integrante.'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Nombre Completo</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Correo Electrónico</label>
                                <input
                                    required
                                    disabled={!!editingUser}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    className={`h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none transition-all ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Rol de Acceso</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all"
                                >
                                    <option value="VIEWER">Lector (Solo vista)</option>
                                    <option value="EDITOR">Editor (Modifica contenido)</option>
                                    <option value="SUPER_ADMIN">Admin (Control Total)</option>
                                    <option value="USER">Cliente</option>
                                </select>
                            </div>

                            {editingUser && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 px-1">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all"
                                    >
                                        <option value="ACTIVE">Activo</option>
                                        <option value="INACTIVE">Inactivo</option>
                                        <option value="BANNED">Baneado</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-4">
                                <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                                    <Save size={20} />
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notificación Éxito */}
            {showSuccess && (
                <div className="fixed bottom-10 right-10 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right-10 duration-500 z-[100] border border-white/10">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[15px]">
                            {editingUser ? 'Cambios Guardados' : 'Usuario Agregado'}
                        </span>
                        <span className="text-[13px] text-slate-400">El equipo ha sido actualizado.</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente auxiliar para estados vacíos
function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
            <Icon size={40} className="text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold text-[14px]">{text}</p>
        </div>
    );
}
