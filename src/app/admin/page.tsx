'use client';
import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    ShoppingCart,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Clock,
    CheckCircle2,
    MoreVertical,
    Layers,
    LayoutDashboard,
    Mail,
    Loader2,
    Star,
    MessageSquare,
    Activity,
    Search
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const statsData = await res.json();
                setData(statsData);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        
        const handleUpdate = () => fetchData();
        window.addEventListener('admin-user-updated', handleUpdate);
        
        return () => window.removeEventListener('admin-user-updated', handleUpdate);
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-600 bg-emerald-100';
            case 'PENDING': return 'text-amber-600 bg-amber-100';
            case 'PROCESSING': return 'text-blue-600 bg-blue-100';
            case 'CANCELLED': return 'text-rose-600 bg-rose-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Completado';
            case 'PENDING': return 'Pendiente';
            case 'PROCESSING': return 'En Proceso';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full" />
                        </div>
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[11px]">Sincronizando Datos...</p>
                </div>
            </div>
        );
    }

    const statsConfig = [
        { label: 'Ventas Totales', value: `$${data?.stats?.revenue?.toLocaleString() || '0'}`, icon: DollarSign, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', href: '/admin/orders', detail: '+12.4% vs last month' },
        { label: 'Ordenes Totales', value: data?.stats?.orders || '0', icon: ShoppingCart, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20', href: '/admin/orders', detail: '24 new orders today' },
        { label: 'Usuarios Activos', value: data?.stats?.users || '0', icon: Users, color: 'from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-500/20', href: '/admin/users', detail: '80% conversion rate' },
        { label: 'Valoración Media', value: '4.8', icon: Star, color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/20', href: '/admin/reviews', detail: 'Based on 48 reviews' },
    ];

    const maxRevenue = Math.max(...(data?.revenueByMonth?.map((m: any) => m.revenue) || [1]));

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header section with glass effect */}
            <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-10 border border-white/60 shadow-xl shadow-slate-200/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                            <LayoutDashboard size={32} />
                        </div>
                        <div>
                            <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">Command Center</h2>
                            <p className="text-slate-500 font-bold text-[14px] mt-2 flex items-center gap-2">
                                <Activity size={14} className="text-emerald-500" />
                                Monitor de salud del sistema • Mayo 2026
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/admin/orders" 
                            className={`h-14 px-6 bg-white rounded-2xl border shadow-sm font-bold text-[13px] text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 relative ${
                                data?.stats?.pendingOrders > 0 
                                ? 'border-blue-200 ring-4 ring-blue-500/10 animate-pulse' 
                                : 'border-slate-100'
                            }`}
                        >

                            <ShoppingCart size={18} className="text-blue-600" />
                            <span>Órdenes Recientes</span>
                            {data?.stats?.pendingOrders > 0 && (
                                <span className="bg-blue-600 text-white min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                                    {data.stats.pendingOrders}
                                </span>
                            )}
                        </Link>

                        {/* El buscador se puede integrar en la barra lateral o como un modal global más adelante */}

                        {data?.stats?.unreadMessages > 0 && (
                            <Link href="/admin/messages" className="h-14 px-6 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 font-black text-[13px] text-white hover:scale-105 transition-all flex items-center gap-3 animate-in zoom-in">
                                <Mail size={18} />
                                {data.stats.unreadMessages} Mensajes
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid - High Visual Impact */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {statsConfig.map((stat, i) => (
                    <Link key={i} href={stat.href} className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-24 h-24 sm:w-40 sm:h-40 bg-slate-50 rounded-full group-hover:bg-blue-50/50 transition-colors duration-500" />
                        <div className="relative z-10 space-y-3 sm:space-y-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={20} className="sm:hidden" />
                                    <stat.icon size={28} className="hidden sm:block" />
                                </div>
                                <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-2xl bg-slate-50 text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-500">
                                    <ArrowUpRight size={16} className="sm:hidden" />
                                    <ArrowUpRight size={20} className="hidden sm:block" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-slate-400 font-black text-[9px] sm:text-[11px] uppercase tracking-[0.10em] sm:tracking-[0.15em] mb-0.5 sm:mb-1">{stat.label}</h4>
                                <div className="flex items-baseline gap-1 sm:gap-2">
                                    <span className="text-[20px] sm:text-[36px] font-black text-slate-900 tracking-tight">{stat.value}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4 text-[8px] sm:text-[11px] font-black text-emerald-500 bg-emerald-50/50 w-fit px-2 py-1 sm:px-3 sm:py-1.5 rounded-full ring-1 ring-emerald-100/50">
                                    <TrendingUp size={10} className="sm:hidden" />
                                    <TrendingUp size={12} className="hidden sm:block" />
                                    <span className="truncate max-w-[60px] sm:max-w-none">{stat.detail}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>


            {/* Analytics & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Sales Chart - Premium Visualization */}
                <div className="lg:col-span-2 bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                         <div className="flex bg-slate-50 p-1 rounded-xl">
                             {['Week', 'Month', 'Year'].map(t => (
                                 <button key={t} className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${t === 'Month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                     {t}
                                 </button>
                             ))}
                         </div>
                    </div>
                    
                    <div className="space-y-2 mb-10">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Análisis de Ingresos</h3>
                        <p className="text-slate-400 font-bold text-[14px]">Comparativa de crecimiento mensual del semestre actual.</p>
                    </div>

                    <div className="h-80 w-full flex items-end justify-between px-4 pb-4 gap-6">
                        {data?.revenueByMonth?.map((item: any, i: number) => {
                            const heightPercentage = Math.max((item.revenue / maxRevenue) * 100, 8);
                            return (
                                <div key={i} className="flex-grow group relative h-full flex flex-col justify-end items-center">
                                    <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-slate-900 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xl">
                                            ${item.revenue.toLocaleString()}
                                        </div>
                                    </div>
                                    <div
                                        className="w-full max-w-[60px] bg-gradient-to-t from-blue-700 to-blue-400 rounded-2xl transition-all duration-1000 ease-out shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20 group-hover:to-blue-300 relative overflow-hidden"
                                        style={{ height: `${heightPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                                    </div>
                                    <div className="mt-6 text-center">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.month}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Orders - Modern List Styling */}
                <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Actividad</h3>
                            <p className="text-slate-400 font-bold text-[13px]">Transacciones en tiempo real</p>
                        </div>
                        <Link href="/admin/orders" className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all">
                            <ArrowUpRight size={20} />
                        </Link>
                    </div>

                    <div className="flex-grow space-y-6">
                        {data?.recentOrders?.length > 0 ? (
                            data.recentOrders.map((order: any, i: number) => (
                                <Link key={i} href={`/admin/orders`} className="flex items-center gap-5 group p-2 -mx-2 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600 transition-all shadow-sm">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h4 className="text-[15px] font-black text-slate-900 truncate tracking-tight">{order.customer}</h4>
                                        <p className="text-[12px] font-bold text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[16px] font-black text-slate-900 tracking-tight">${order.total?.toLocaleString()}</span>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ring-1 ring-inset ${getStatusStyle(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                   <ShoppingCart size={40} />
                                </div>
                                <p className="text-slate-400 font-bold text-[13px] uppercase tracking-widest">No hay pedidos registrados</p>
                            </div>
                        )}
                    </div>
                    
                    <Link href="/admin/orders" className="mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                        Ver Todo el Historial
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Helper components for icons missing from main imports
function ShoppingBag({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    )
}
