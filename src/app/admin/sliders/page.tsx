'use client';
import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, Play, Pause, ArrowUp, ArrowDown, X, Save, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminSliders() {
    const [sliders, setSliders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        thumbnail: '',
        link: '',
        buttonText: '',
        status: 'ACTIVE',
        order: 0
    });

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            const res = await fetch('/api/sliders');
            const data = await res.json();
            setSliders(data);
        } catch (error) {
            console.error('Failed to fetch sliders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'thumbnail') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!CLOUD_NAME || !UPLOAD_PRESET) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result;
                    if (result) {
                        setFormData(prev => ({ ...prev, [field]: result as string }));
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
                    setFormData(prev => ({ ...prev, [field]: data.secure_url }));
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
            const url = editingId ? `/api/sliders/${editingId}` : '/api/sliders';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowSuccess(true);
                setFormData({ title: '', subtitle: '', description: '', image: '', thumbnail: '', link: '', buttonText: '', status: 'ACTIVE', order: 0 });
                setEditingId(null);
                setIsModalOpen(false);
                fetchSliders();
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            alert('Error saving slider');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este slider?')) {
            try {
                const res = await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
                if (res.ok) fetchSliders();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const openEditModal = (slider: any) => {
        setFormData({
            title: slider.title,
            subtitle: slider.subtitle || '',
            description: slider.description || '',
            image: slider.image,
            thumbnail: slider.thumbnail || '',
            link: slider.link || '',
            buttonText: slider.buttonText || '',
            status: slider.status,
            order: slider.order
        });
        setEditingId(slider.id);
        setIsModalOpen(true);
    };

    const toggleStatus = async (slider: any) => {
        try {
            const res = await fetch(`/api/sliders/${slider.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...slider, status: slider.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
            });
            if (res.ok) fetchSliders();
        } catch (error) {
            console.error(error);
        }
    };

    const updateOrder = async (slider: any, direction: 'up' | 'down') => {
        const newOrder = direction === 'up' ? slider.order - 1 : slider.order + 1;
        if (newOrder < 1) return;
        try {
            const res = await fetch(`/api/sliders/${slider.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...slider, order: newOrder }),
            });
            if (res.ok) fetchSliders();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 flex flex-col min-h-full">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ImageIcon className="text-blue-600" />
                        Gestión de Sliders
                    </h2>
                    <p className="text-slate-500 text-[14px]">Controla el carrusel de imágenes principal de la página de inicio.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', subtitle: '', description: '', image: '', thumbnail: '', link: '', buttonText: '', status: 'ACTIVE', order: 0 });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nuevo Slider
                </button>
            </div>

            {isLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold text-[14px] mt-4">Cargando sliders...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {sliders.length === 0 ? (
                        <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-3">
                            <ImageIcon size={40} className="text-slate-300" />
                            <p className="text-slate-400 font-bold">Aún no hay sliders configurados.</p>
                        </div>
                    ) : (
                        sliders.map((s) => (
                            <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                <div className="w-full lg:w-72 h-40 rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-sm group-hover:scale-[1.02] transition-transform">
                                    <Image
                                        src={s.image}
                                        alt={s.title}
                                        fill
                                        className="object-cover"
                                        unoptimized={s.image.startsWith('data:')}
                                    />
                                </div>
                                <div className="flex-grow space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">Orden #{s.order}</span>
                                        <button
                                            onClick={() => toggleStatus(s)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {s.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </div>
                                    <h3 className="text-[20px] font-bold text-slate-900 leading-tight tracking-tight">{s.title}</h3>
                                    <p className="text-slate-500 text-[14px] font-medium">{s.subtitle}</p>
                                    <div className="mt-2 p-3 bg-slate-900 rounded-xl overflow-hidden max-w-[400px]">
                                        <p className="text-xs sm:text-sm md:text-lg text-gray-100 font-medium line-clamp-2">
                                            {s.description || 'Sin leyenda configurada...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 lg:border-l border-slate-100 lg:pl-6 h-20">
                                    <div className="flex flex-col gap-1 mr-2">
                                        <button
                                            onClick={() => updateOrder(s, 'up')}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        ><ArrowUp size={16} /></button>
                                        <button
                                            onClick={() => updateOrder(s, 'down')}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        ><ArrowDown size={16} /></button>
                                    </div>
                                    <button
                                        onClick={() => openEditModal(s)}
                                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    ><Edit2 size={20} /></button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    ><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal de Creación Slider */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl p-8 rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-[24px] text-slate-900">
                                {editingId ? 'Editar Slider' : 'Nuevo Banner Slider'}
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Título Principal</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        type="text"
                                        placeholder="Ej: Ofertas de Verano"
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Leyenda / Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Ej: Lo mejor en tecnología para tu setup..."
                                        rows={2}
                                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none resize-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Subtítulo / Promo</label>
                                    <input
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        type="text"
                                        placeholder="Ej: 50% de Descuento"
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Link de Referencia ("Ver Ofertas")</label>
                                    <input
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        type="text"
                                        placeholder="Ej: /search?category=ofertas o https://..."
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Texto del Botón</label>
                                    <input
                                        value={formData.buttonText}
                                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                        type="text"
                                        placeholder="Ej: Ver Ofertas"
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold outline-none"
                                    >
                                        <option value="ACTIVE">Activo</option>
                                        <option value="INACTIVE">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Imagen de Fondo</label>
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
                                                <ImageIcon size={32} className="text-slate-300" />
                                                <span className="text-[12px] font-bold text-slate-400">Dimensión: 1920x800 px</span>
                                            </>
                                        )}
                                        <input type="file" onChange={(e) => handleImageUpload(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    {!formData.image && <p className="text-rose-500 text-[10px] font-bold uppercase">La imagen es obligatoria</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 font-bold uppercase tracking-tight opacity-50">Miniatura (Opcional)</label>
                                    <div className="h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2 group transition-colors hover:border-blue-300">
                                        {formData.thumbnail ? (
                                            <>
                                                <Image src={formData.thumbnail} alt="Preview Thumbnail" fill className="object-contain" unoptimized={formData.thumbnail.startsWith('data:')} />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="bg-white text-slate-900 p-2 rounded-lg cursor-pointer font-bold text-[12px]">Cambiar</label>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="text-slate-300" />
                                                <span className="text-[12px] font-bold text-slate-400">Imagen de producto/persona</span>
                                            </>
                                        )}
                                        <input type="file" onChange={(e) => handleImageUpload(e, 'thumbnail')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
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
                                                {editingId ? 'Actualizar Slider' : 'Guardar Slider'}
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
                        <span className="font-bold text-[15px]">Slider Guardado</span>
                        <span className="text-[13px] text-slate-400">Actualizando carrusel...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
