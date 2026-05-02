'use client';
import { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle, XCircle, Search, Filter, MessageSquare, Loader2, Package } from 'lucide-react';
import Link from 'next/link';

export default function AdminReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            if (res.ok) {
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchReviews();
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta valoración?')) return;
        try {
            const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchReviews();
            }
        } catch (error) {
            alert('Error deleting review');
        }
    };

    const filteredReviews = reviews.filter(rev => {
        const matchesTab = filter === 'ALL' || rev.status === filter;
        const matchesSearch = 
            (rev.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rev.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rev.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rev.productName || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Valoraciones</h2>
                    <p className="text-slate-500 font-bold text-[14px]">Modera y analiza las reseñas de tus clientes.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative min-w-[300px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar por cliente, email o producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none transition-all"
                        />
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        {['ALL', 'APPROVED', 'PENDING'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f === 'ALL' ? 'Todas' : f === 'APPROVED' ? 'Aprobadas' : 'Pendientes'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <MessageSquare size={48} />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-xl font-black text-slate-900">No se encontraron valoraciones</h3>
                        <p className="text-slate-400 font-bold text-[14px] mt-2">Prueba ajustando los filtros o el término de búsqueda.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredReviews.map((rev) => (
                        <div key={rev.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 uppercase">
                                                {rev.userName ? rev.userName[0] : '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900">{rev.userName || 'Usuario Anónimo'}</h4>
                                                <p className="text-[12px] font-bold text-slate-400">{rev.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Fecha desconocida'}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${rev.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {rev.status === 'APPROVED' ? 'Aprobada' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Link href={`/product/${rev.productId}`} className="text-[13px] font-black text-[#e996a0] hover:underline uppercase tracking-wide flex items-center gap-2">
                                                <Package size={14} />
                                                {rev.productName}
                                            </Link>
                                            <div className="flex gap-1 text-amber-400">
                                                {[1,2,3,4,5].map(s => (
                                                    <Star key={s} size={14} fill={s <= rev.rating ? "currentColor" : "none"} className={s <= rev.rating ? "text-amber-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 font-medium italic leading-relaxed text-[15px]">"{rev.comment}"</p>
                                    </div>
                                </div>

                                <div className="flex md:flex-col justify-end gap-3 pt-4 md:pt-0 min-w-[140px]">
                                    {rev.status === 'PENDING' && (
                                        <button 
                                            onClick={() => updateStatus(rev.id, 'APPROVED')}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
                                        >
                                            <CheckCircle size={16} />
                                            Aprobar
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(rev.id)} 
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-500 px-4 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

