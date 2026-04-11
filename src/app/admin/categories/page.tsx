'use client';
import { useState, useEffect } from 'react';
import { Tags, Plus, Search, Edit2, Trash2, Folder, X, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import Image from 'next/image';

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', imageUrl: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            alert('Error deleting');
        }
    };

    const handleEdit = (cat: any) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl || '' });
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!CLOUD_NAME || !UPLOAD_PRESET) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result;
                    if (result) {
                        setFormData(prev => ({ ...prev, imageUrl: result as string }));
                    }
                };
                reader.readAsDataURL(file);
                return;
            }

            setIsUploading(true);
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('upload_preset', UPLOAD_PRESET);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: uploadData,
                });
                const data = await response.json();
                if (data.secure_url) {
                    setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Error al subir imagen');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form with data:', formData);
        try {
            const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowSuccess(true);
                setFormData({ name: '', slug: '', imageUrl: '' });
                setIsModalOpen(false);
                setEditingId(null);
                fetchCategories();
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || 'No se pudo guardar la categoría'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error de conexión al guardar la categoría');
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Tags className="text-blue-600" />
                        Gestión de Categorías
                    </h2>
                    <p className="text-slate-500 text-[14px]">Organiza tus productos por grupos y etiquetas.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', slug: '', imageUrl: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nueva Categoría
                </button>
            </div>

            {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold text-[14px]">Cargando categorías...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {categories.length === 0 ? (
                        <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-3">
                            <Folder size={40} className="text-slate-300" />
                            <p className="text-slate-400 font-bold">Aún no hay categorías creadas.</p>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-50/50 rounded-full -mr-4 -mt-4 sm:-mr-8 sm:-mt-8 transition-transform group-hover:scale-125 duration-500" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden relative shrink-0">
                                            {cat.imageUrl ? (
                                                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" unoptimized={cat.imageUrl?.startsWith('data:')} />
                                            ) : (
                                                <Folder size={20} className="sm:hidden" /> || <Folder size={24} className="hidden sm:block" />
                                            )}
                                        </div>
                                        <div className="flex gap-0.5 sm:gap-1">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit2 size={14} className="sm:hidden" />
                                                <Edit2 size={16} className="hidden sm:block" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} className="sm:hidden" />
                                                <Trash2 size={16} className="hidden sm:block" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                                        <h3 className="font-bold text-[14px] sm:text-[18px] text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate">{cat.name}</h3>
                                        <p className="text-slate-400 text-[10px] sm:text-[13px] font-bold tracking-tight truncate opacity-60">/{cat.slug}</p>
                                    </div>
                                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] sm:text-[12px] font-black text-slate-500 uppercase tracking-widest">Activo</span>
                                        </div>
                                        <span className="text-[10px] sm:text-[12px] font-black text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                            {cat._count?.products || 0} Prod.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            )}

            {/* Modal de Creación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md p-8 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-[20px] text-slate-900">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col gap-4 mb-4">
                                <label className="text-[14px] font-bold text-slate-700">Miniatura (Opcional)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                                        {formData.imageUrl ? (
                                            <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <Upload className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <label className="flex-1">
                                        <div className="bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-2 text-[14px] font-bold text-slate-600 text-center cursor-pointer transition-colors">
                                            {isUploading ? 'Subiendo...' : 'Cambiar Imagen'}
                                        </div>
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700">Nombre de Categoría</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    type="text"
                                    placeholder="Ej: Accesorios"
                                    className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 opacity-50">Slug de URL (Automático)</label>
                                <input
                                    readOnly
                                    value={formData.slug}
                                    type="text"
                                    className="h-12 px-4 bg-slate-100 border border-slate-100 rounded-xl text-[14px] font-bold text-slate-500 outline-none"
                                />
                            </div>
                            <button
                                disabled={isUploading}
                                className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {editingId ? 'Actualizar Categoría' : 'Guardar Categoría'}
                            </button>
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
                        <span className="font-bold text-[15px]">Categoría Creada</span>
                        <span className="text-[13px] text-slate-400">Actualizando lista...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
