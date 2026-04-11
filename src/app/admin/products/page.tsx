'use client';
import { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    ArrowUpDown,
    X
} from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                alert('Error al eliminar producto');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Catálogo de Productos
                    </h2>
                    <p className="text-slate-500 text-[14px]">Gestiona los productos visibles en tu tienda.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Producto
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none h-11 px-4 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-semibold text-slate-600 hover:bg-slate-100 transition-all">
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button className="flex-1 md:flex-none h-11 px-4 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-semibold text-slate-600 hover:bg-slate-100 transition-all">
                        <ArrowUpDown size={18} />
                        Ordenar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold text-[14px]">Cargando catálogo...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
                                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                                    <th className="px-4 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center hidden md:table-cell">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">
                                            No hay productos registrados en la base de datos.
                                        </td>
                                    </tr>
                                ) : products.map((p) => {
                                    const status = p.stock === 0 ? 'Sin Stock' : p.stock <= 5 ? 'Bajo Stock' : 'Activo';
                                    const mainImage = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1527814732934-7191d90213ff?q=80&w=100&h=100&fit=crop';

                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-sm shrink-0">
                                                        <Image src={mainImage} alt={p.name} fill className="object-cover" unoptimized={mainImage.startsWith('data:')} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-[13px] text-slate-900 truncate leading-tight mb-0.5">{p.name}</span>
                                                        <span className="text-[11px] text-slate-500">ID: #{p.id.slice(-4)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold whitespace-nowrap">
                                                    {p.category?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-bold text-[13px] text-slate-900">${p.price.toFixed(2)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                                    <Link
                                                        href={`/product/${p.id}`}
                                                        className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Ver"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/edit/${p.id}`}
                                                        className="p-1.5 md:p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteProduct(p.id)}
                                                        className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`font-bold text-[13px] ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>{p.stock}</span>
                                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${p.stock <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center hidden md:table-cell">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                                                    status === 'Bajo Stock' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isLoading && products.length > 0 && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <p className="text-[13px] text-slate-500 font-medium tracking-tight">Mostrando {products.length} productos</p>
                        <div className="flex items-center gap-2">
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-50" disabled>
                                <ChevronLeft size={18} />
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[14px] shadow-lg shadow-blue-500/20">1</button>
                            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
