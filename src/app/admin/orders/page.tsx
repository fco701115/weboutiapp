'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, Clock, CheckCircle2, User, MapPin, Trash2, X, RefreshCw, CreditCard, Banknote, Truck, Printer } from 'lucide-react';
import Image from 'next/image';


export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showShippingModal, setShowShippingModal] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');


    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/orders?t=' + Date.now());
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error('Data is not an array:', data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const exportToCSV = () => {
        if (filteredOrders.length === 0) return alert('No hay datos para exportar');
        
        const headers = ['ID Pedido', 'Fecha', 'Cliente', 'Email', 'Direccion', 'Total', 'Metodo Pago', 'Estado'];
        const rows = filteredOrders.map((o: any) => [
            o.id.toUpperCase(),
            new Date(o.createdAt).toLocaleString('es-ES'),
            `"${o.customer}"`,
            o.email,
            `"${o.address}"`,
            o.total.toFixed(2),
            o.paymentMethod,
            o.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedidos_fichines_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) fetchOrders();
        } catch (error) {
            alert('Error updating status');
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('¿Eliminar este pedido permanentemente?')) return;
        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            fetchOrders();
        } catch (error) {
            alert('Error deleting');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 font-black';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 font-black';
            case 'PENDING': return 'bg-[var(--color-amber-100)] text-[var(--color-amber-600)] font-black';
            case 'CANCELLED': return 'bg-rose-100 text-rose-600 font-black';
            default: return 'bg-slate-100 text-slate-500 font-black';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Completado';
            case 'SHIPPED': return 'Enviado';
            case 'PENDING': return 'Pendiente';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    const markAsRead = async (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, isRead: true } : o));
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true })
            });
        } catch (error) {
            console.error('Error marking as read');
        }
    };
    
    const handlePrint = () => {
        const printContent = document.getElementById('printable-order');
        if (!printContent) return;
        
        window.print();
    };

    const formatAddress = (fullAddress: string) => {
        if (!fullAddress) return { street: '', neighborhood: '', locality: '', city: '', cp: '', type: '', indications: '', phone: '', mapUrl: '', mapAddress: '' };
        
        let streetVal = fullAddress;
        let mapUrlVal = '';
        let mapLocVal = '';
        let phoneVal = '';
        let indicationsVal = '';
        let neighborhoodVal = '';
        let cityVal = '';
        let cpVal = '';
        let localityVal = '';

        // 1. Extract Map stuff
        const mapMatch = streetVal.match(/ \[MAPA: (.*?)\]$/) || streetVal.match(/ \(Ubicación: (.*?)\)/);
        if (mapMatch) {
            mapUrlVal = mapMatch[1];
            mapLocVal = mapMatch[1]; 
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
                // Only street
                streetVal = parts[0];
            } else if (parts.length === 2) {
                // Street, City
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
            mapUrl: mapUrlVal,
            mapAddress: mapLocVal,
            phone: phoneVal,
            indications: indicationsVal
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" />
                        Gestión de Pedidos
                    </h2>
                    <p className="text-slate-500 text-[14px]">Supervisa y procesa las ventas realizadas en la tienda.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchOrders} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={exportToCSV}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                         Exportar CSV
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por cliente, ID o email..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-auto px-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-600 hover:bg-slate-100 transition-all outline-none cursor-pointer"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="SHIPPED">Enviados</option>
                        <option value="COMPLETED">Completados</option>
                        <option value="CANCELLED">Cancelados</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold text-[14px]">Cargando pedidos en tiempo real...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px]">
                        <ShoppingCart size={40} className="text-slate-200" />
                        <p className="text-slate-400 font-bold">No se encontraron pedidos con esos criterios.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden group">
                            <div className="p-6 flex flex-col lg:flex-row gap-6 lg:items-center bg-white">



                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pedido</span>
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-[15px] group-hover:underline">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-medium mt-1">
                                            <Clock size={14} />
                                            {new Date(order.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cliente</span>
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-[15px]">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 uppercase">
                                                {order.customer[0]}
                                            </div>
                                            {order.customer}
                                        </div>
                                        <span className="text-slate-500 text-[12px] font-medium truncate">{order.email}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Dirección</span>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[14px] truncate" title={formatAddress(order.address).street}>
                                                <MapPin size={14} className="text-rose-500 shrink-0" />
                                                {formatAddress(order.address).street}
                                                {formatAddress(order.address).mapUrl && (
                                                    <a href={formatAddress(order.address).mapUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-[13px] hover:scale-110 transition-transform" title="Abrir en Google Maps">📍</a>
                                                )}
                                            </div>
                                            <div className="pl-5 text-[11px] text-slate-400 font-bold truncate leading-relaxed">
                                                <span className="text-[9px] opacity-70 mr-0.5 font-black uppercase">Loc:</span>
                                                {formatAddress(order.address).locality || '---'}
                                                <span className="mx-1 opacity-40">|</span>
                                                <span className="text-[9px] opacity-70 mr-0.5 font-black uppercase">Col:</span>
                                                {formatAddress(order.address).neighborhood || '---'}
                                                {formatAddress(order.address).cp && (
                                                    <span className="ml-1 items-center font-black">
                                                        <span className="mx-1 opacity-40">|</span>
                                                        <span className="text-[9px] opacity-70 mr-0.5 font-black uppercase text-blue-500">CP:</span>
                                                        <span className="text-blue-500 underline decoration-1 underline-offset-2">{formatAddress(order.address).cp}</span>
                                                    </span>
                                                )}
                                                {formatAddress(order.address).indications && (
                                                    <span className="ml-1 items-center font-black">
                                                        <span className="mx-1 opacity-40">|</span>
                                                        <span className="text-[9px] opacity-70 mr-0.5 font-black uppercase text-amber-500">Ind:</span>
                                                        <span className="text-amber-500 truncate inline-block max-w-[80px]">{formatAddress(order.address).indications}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {(() => {
                                            const addr = formatAddress(order.address);
                                            const t = addr.type;
                                            if (!t) return null;
                                            return (
                                                <div className="mt-1">
                                                    <span 
                                                        onClick={() => setShowShippingModal(order)}
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer hover:scale-105 transition-all shadow-sm inline-flex w-fit items-center gap-2 ${
                                                            t === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                                            t === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                            'bg-white text-slate-500 border-slate-200'
                                                        }`}
                                                    >
                                                        {t === 'Casa' ? '🏠' : t === 'Trabajo' ? '💼' : '🛤️'} {t}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pago</span>
                                        <div className="text-slate-900 font-bold text-[18px]">${order.total.toFixed(2)}</div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                            {order.paymentMethod === 'CARD' ? (
                                                <>
                                                    <CreditCard size={12} className="text-blue-500" />
                                                    Tarjeta
                                                </>
                                            ) : (
                                                <>
                                                    <Banknote size={12} className="text-emerald-500" />
                                                    Pago al recibir
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-8">
                                    <div className="flex flex-col gap-2">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider outline-none cursor-pointer transition-colors ${getStatusStyles(order.status)}`}
                                        >
                                            <option value="PENDING">Pendiente</option>
                                            <option value="SHIPPED">Enviado</option>
                                            <option value="COMPLETED">Completado</option>
                                            <option value="CANCELLED">Cancelado</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-sm active:scale-95 ${order.isRead ? 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'}`}
                                        >
                                            <Eye size={16} />
                                            Ver
                                        </button>

                                        <button
                                            onClick={() => deleteOrder(order.id)}
                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


            {/* Modal Detalle de Pedido (Estilo Panel de Usuario) */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-black text-[22px] text-slate-900 tracking-tight flex items-center gap-2">
                                    Pedido #{selectedOrder.id.slice(-6).toUpperCase()}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-widest border border-slate-100 ${getStatusStyles(selectedOrder.status)}`}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </span>
                                    <span className="text-[12px] text-slate-400 font-bold">{new Date(selectedOrder.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrint}
                                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs"
                                    title="Imprimir Pedido"
                                >
                                    <Printer size={20} />
                                    <span className="hidden sm:inline">Imprimir</span>
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content Scrollable */}
                        <div id="printable-order" className="flex-1 overflow-y-auto p-8 pt-4 space-y-8 print:p-0 print:overflow-visible">
                            {/* Products List */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Artículos del Pedido</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-blue-100 transition-all group">
                                            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-50 overflow-hidden relative p-2 flex-shrink-0">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized={item.image.startsWith('data:')} />
                                                ) : (
                                                    <ShoppingCart size={24} className="text-slate-200 m-auto" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-black text-slate-900 text-sm truncate">{item.name}</h5>
                                                <p className="text-slate-400 text-[12px] font-bold uppercase tracking-wider">Cant: {item.quantity} × ${item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#1a3da1] text-[15px]">${(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm">
                                <div className="flex items-center justify-between text-slate-500 font-bold text-sm">
                                    <span>Subtotal</span>
                                    <span>${selectedOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-500 font-bold text-sm">
                                    <span>Envío</span>
                                    <span className="text-emerald-500">Gratis</span>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-lg font-black text-slate-900">Total</span>
                                    <span className="text-2xl font-black text-[#1a3da1]">${selectedOrder.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Shipping Section (Style as User Panel) */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Información de Envío</h4>
                                    {(() => {
                                        const addr = formatAddress(selectedOrder.address);
                                        const t = addr.type;
                                        if (!t) return null;
                                        return (
                                            <span 
                                                onClick={() => setShowShippingModal(selectedOrder)}
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer hover:scale-105 transition-all shadow-sm inline-flex w-fit items-center gap-2 ${
                                                    t === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                                    t === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                    'bg-white text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                {t === 'Casa' ? '🏠' : t === 'Trabajo' ? '💼' : '🛤️'} {t}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-900 text-[15px] leading-tight">{formatAddress(selectedOrder.address).street}</p>
                                        {formatAddress(selectedOrder.address).indications && (
                                            <div className="my-2 bg-amber-50/30 border border-amber-100/50 rounded-2xl p-3">
                                                <span className="text-[9px] text-amber-500/80 font-black uppercase block mb-1">Indicación para la entrega:</span>
                                                <p className="text-amber-900/80 font-bold text-[12px] leading-snug">{formatAddress(selectedOrder.address).indications}</p>
                                            </div>
                                        )}
                                        <p className="text-slate-500 text-[13px] font-bold">
                                            <span className="text-[10px] text-slate-300 font-black uppercase mr-1">Col:</span>
                                            {formatAddress(selectedOrder.address).neighborhood || '---'}
                                        </p>
                                        <p className="text-slate-500 text-[13px] font-bold">
                                            <span className="text-[10px] text-slate-300 font-black uppercase mr-1">Loc:</span>
                                            {formatAddress(selectedOrder.address).locality || '---'}
                                        </p>
                                        <p className="text-slate-400 text-[12px] font-bold">
                                            {formatAddress(selectedOrder.address).city}
                                            {formatAddress(selectedOrder.address).cp && ` (CP: ${formatAddress(selectedOrder.address).cp})`}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-200/50 space-y-2">
                                        <p className="text-slate-900 font-bold text-[13px] flex items-center gap-2">👤 {selectedOrder.customer}</p>
                                        <p className="text-[#1a3da1] font-black text-[13px] flex items-center gap-2">📞 {formatAddress(selectedOrder.address).phone || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actualizar Estado:</span>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => {
                                        updateStatus(selectedOrder.id, e.target.value);
                                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                                    }}
                                    className={`px-4 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest outline-none border transition-all ${getStatusStyles(selectedOrder.status)}`}
                                >
                                    <option value="PENDING">Pendiente</option>
                                    <option value="SHIPPED">Enviado</option>
                                    <option value="COMPLETED">Completado</option>
                                    <option value="CANCELLED">Cancelado</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                            >
                                Cerrar Detalle
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Detalle de Envío EXACTO al diseño de usuario */}
            {showShippingModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 p-8 flex flex-col gap-6 relative">
                        {/* Botón Cerrar Flotante */}
                        <button 
                            onClick={() => setShowShippingModal(null)}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-4">
                            {/* Badge Tipo de Lugar */}
                            <div className="flex">
                                <span className={`border px-4 py-2 rounded-2xl flex items-center gap-2 font-extrabold text-[12px] uppercase tracking-wider shadow-sm ${
                                    formatAddress(showShippingModal.address).type === 'Casa' ? 'bg-blue-50 text-[#1a3da1] border-blue-100' :
                                    formatAddress(showShippingModal.address).type === 'Trabajo' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                    'bg-slate-50 text-slate-700 border-slate-100'
                                }`}>
                                    {(() => {
                                        const t = formatAddress(showShippingModal.address).type;
                                        return t === 'Casa' ? '🏠 CASA' : t === 'Trabajo' ? '💼 TRABAJO' : '🛤️ LUGAR';
                                    })()}
                                </span>
                            </div>

                            {/* Dirección Principal */}
                            <div className="space-y-1 pt-1">
                                <h4 className="text-[22px] font-black text-slate-900 leading-tight">
                                    {formatAddress(showShippingModal.address).street}
                                </h4>
                                
                                {formatAddress(showShippingModal.address).indications && (
                                    <div className="mt-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase leading-none px-1">Indicación para la entrega:</span>
                                        <p className="text-slate-500 font-bold text-[13px] px-1">
                                            {formatAddress(showShippingModal.address).indications}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 pt-3">
                                    <div className="grid grid-cols-2 gap-4 px-1">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Localidad:</span>
                                            <p className="text-slate-500 font-bold text-[15px] truncate">
                                                {formatAddress(showShippingModal.address).locality || '---'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Colonia o barrio (opcional):</span>
                                            <p className="text-slate-500 font-bold text-[15px] truncate">
                                                {formatAddress(showShippingModal.address).neighborhood || '---'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 px-1">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Ciudad (opcional):</span>
                                            <p className="text-slate-400 font-bold text-[14px] truncate">
                                                {formatAddress(showShippingModal.address).city || '---'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Código Postal (opcional):</span>
                                            <p className="text-blue-500 font-black text-[14px] truncate underline decoration-1 underline-offset-2">
                                                {formatAddress(showShippingModal.address).cp || '---'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-50 w-full" />

                            {/* Datos de Contacto */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center text-[#582f87]">
                                        <User size={20} className="fill-current" />
                                    </div>
                                    <span className="text-slate-900 font-black text-[16px]">{showShippingModal.customer}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center text-[#c54b7c]">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18C15.655 18 11.968 16.471 9.248 13.752C6.529 11.032 5 7.345 5 3.5C5 3.10218 5.15804 2.72064 5.43934 2.43934C5.72064 2.15804 6.10218 2 6.5 2H10.5C10.741 2.00007 10.974 2.08332 11.16 2.23594C11.346 2.38855 11.474 2.60155 11.523 2.839L12.273 6.589C12.33 6.874 12.274 7.17 12.115 7.415C11.956 7.66 11.71 7.828 11.428 7.884L8.718 8.428C9.528 10.134 10.866 11.472 12.572 12.282L13.116 9.572C13.172 9.29 13.34 9.044 13.585 8.885C13.83 8.726 14.126 8.67 14.411 8.727L18.161 9.477C18.3985 9.526 18.6115 9.654 18.7641 9.84C18.9167 10.026 19 10.259 19 10.5V14.5C19 14.8978 18.842 15.2794 18.5607 15.5607C18.2794 15.842 17.8978 16 17.5 16C13.655 16 9.968 14.471 7.248 11.752C4.529 9.032 3 5.345 3 1.5C3 1.10218 3.15804 0.720644 3.43934 0.43934C3.72064 0.158036 4.10218 0 4.5 0H8.5C8.941 0.0003 9.368 0.151 9.71 0.428C10.052 0.705 10.288 1.092 10.38 1.526L11.13 5.276C11.233 5.797 11.131 6.337 10.839 6.786C10.547 7.235 10.095 7.545 10.569 7.663C11.666 9.998 13.502 11.834 15.837 12.931C15.955 13.505 16.265 13.053 16.714 12.761C17.163 12.469 17.703 12.367 18.224 12.47L21.974 13.22C22.408 13.312 22.795 13.548 23.072 13.89C23.349 14.232 23.4997 14.659 23.5 15.1V19.1C23.5 19.4978 23.342 19.8794 23.0607 20.1607C22.7794 20.442 22.3978 20.6 22 20.6Z" transform="translate(0, 3) rotate(-90 12 10.3)" />
                                        </svg>
                                    </div>
                                    <span className="text-slate-900 font-extrabold text-[16px] tracking-tight">
                                        {formatAddress(showShippingModal.address).phone || '---'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botón Acción Google Maps */}
                        <div className="pt-2">
                            <button
                                onClick={() => setShowShippingModal(null)}
                                className="w-full h-14 bg-slate-900 text-white rounded-3xl font-black text-[13px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-order, #printable-order * {
                        visibility: visible;
                    }
                    #printable-order {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px !important;
                        background: white !important;
                    }
                    .fixed, .bg-slate-900/60, button, select, .p-8.border-t, div[role="dialog"] {
                        display: none !important;
                    }
                }
            ` }} />
        </div>
    );
}
