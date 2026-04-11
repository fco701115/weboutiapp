'use client';
import { useState, useEffect } from 'react';
import { Flag, Plus, Trash2, Edit2, LayoutGrid, Square, Columns, X, Save, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminBanners() {
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        position: 'Home-Mid',
        type: 'Simple',
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/banners');
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setIsLoading(false);
        }
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
                        setFormData(prev => ({ ...prev, image: result as string }));
                    }
                };
                reader.readAsDataURL(file);
                return;
            }

            setIsSaving(true);
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('upload_preset', UPLOAD_PRESET);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formDataUpload,
                });
                const data = await response.json();
                if (data.secure_url) {
                    setFormData(prev => ({ ...prev, image: data.secure_url }));
                }
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                alert('Error al subir imagen.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingId ? `/api/banners/${editingId}` : '/api/banners';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowSuccess(true);
                setFormData({ title: '', subtitle: '', image: '', position: 'Home-Mid', type: 'Simple' });
                setEditingId(null);
                setIsModalOpen(false);
                fetchBanners();
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            alert('Error saving banner');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
            try {
                const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
                if (res.ok) fetchBanners();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const openEditModal = (banner: any) => {
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            image: banner.image,
            position: banner.position || 'Home-Mid',
            type: banner.type || 'Simple'
        });
        setEditingId(banner.id);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 flex flex-col min-h-full">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Flag className="text-blue-600" />
                        Gestión de Banners
                    </h2>
                    <p className="text-slate-500 text-[14px]">Controla los banners promocionales en diferentes posiciones de la web.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', subtitle: '', image: '', position: 'Home-Mid', type: 'Simple' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Banner
                </button>
            </div>

            {isLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold text-[14px] mt-4">Cargando banners...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {banners.length === 0 ? (
                        <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-3">
                            <Flag size={40} className="text-slate-300" />
                            <p className="text-slate-400 font-bold">Aún no hay banners configurados.</p>
                        </div>
                    ) : (
                        banners.map((b) => (
                            <div key={b.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col">
                                <div className="h-48 relative overflow-hidden bg-slate-100">
                                    {b.image && (
                                        <Image
                                            src={b.image}
                                            alt={b.title}
                                            fill
                                            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                            unoptimized={b.image.startsWith('data:')}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent p-6 flex flex-col justify-end">
                                        <span className="px-3 py-1 bg-blue-600 text-white w-fit rounded-lg text-[11px] font-bold uppercase tracking-widest mb-2 shadow-lg shadow-blue-600/20">{b.position}</span>
                                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-1">{b.title}</h3>
                                        {b.subtitle && <p className="text-white/80 text-[13px] font-medium">{b.subtitle}</p>}
                                    </div>
                                </div>
                                <div className="p-4 flex items-center justify-between border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                            {b.type === 'Doble' ? <Columns size={16} /> : <Square size={16} />}
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-600">Tipo: {b.type}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(b)}
                                            className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal de Creación Banner */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl p-8 rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-[24px] text-slate-900">
                                {editingId ? 'Editar Banner' : 'Nuevo Banner'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 tracking-tight opacity-50 uppercase">Título</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        type="text"
                                        placeholder="Ej: Promo Especial"
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 tracking-tight opacity-50 uppercase">Subtítulo (Opcional)</label>
                                    <input
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        type="text"
                                        placeholder="Ej: Descuentos de temporada"
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 tracking-tight opacity-50 uppercase">Posición</label>
                                    <select
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold outline-none cursor-pointer"
                                    >
                                        <option value="Home-Mid">Home - Mitad de página</option>
                                        <option value="Home-Bottom">Home - Inferior</option>
                                        <option value="Header">Header Promo</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 tracking-tight opacity-50 uppercase">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold outline-none cursor-pointer"
                                    >
                                        <option value="Simple">Simple (100% ancho)</option>
                                        <option value="Doble">Doble (50% ancho)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 tracking-tight opacity-50 uppercase">Imagen</label>
                                    <div className="h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2 group transition-colors hover:border-blue-300">
                                        {formData.image ? (
                                            <>
                                                <Image src={formData.image} alt="Preview" fill className="object-cover" unoptimized={formData.image.startsWith('data:')} />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="bg-white text-slate-900 p-2 rounded-lg cursor-pointer font-bold text-[12px]">Cambiar</label>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Flag size={32} className="text-slate-300" />
                                                <span className="text-[12px] font-bold text-slate-400">Dimensión: Recomendado ancho completo</span>
                                            </>
                                        )}
                                        <input type="file" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    {!formData.image && <p className="text-rose-500 text-[10px] font-bold uppercase">La imagen es obligatoria</p>}
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving || !formData.image}
                                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                {editingId ? 'Actualizar Banner' : 'Guardar Banner'}
                                            </>
                                        )}
                                    </button>
                                </div>
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
                        <span className="font-bold text-[15px]">Banner Guardado</span>
                        <span className="text-[13px] text-slate-400">Actualizando lista...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
