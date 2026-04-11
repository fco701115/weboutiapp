'use client';
import { useState, useEffect } from 'react';
import {
    Package, ArrowLeft, Upload, Save, X, Plus, Info, CheckCircle2, AlertCircle, DollarSign, Hash, Layers
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        stock: '0',
        sku: '',
        categoryId: '',
        isVisible: true,
        isFeatured: false
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const catRes = await fetch('/api/categories');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                }

                // Fetch product data
                const prodRes = await fetch(`/api/products/${params.id}`);
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setFormData({
                        name: prodData.name,
                        description: prodData.description || '',
                        price: prodData.price.toString(),
                        salePrice: prodData.salePrice ? prodData.salePrice.toString() : '',
                        stock: prodData.stock.toString(),
                        sku: prodData.sku || '',
                        categoryId: prodData.categoryId,
                        isVisible: prodData.isVisible,
                        isFeatured: prodData.isFeatured
                    });
                    setImages(prodData.images || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (params.id) fetchData();
    }, [params.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
                    if (event.target?.result) {
                        setImages([...images, event.target.result as string]);
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
                    setImages([...images, data.secure_url]);
                }
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                alert('Error al subir imagen.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.categoryId) {
            alert('Por favor completa los campos obligatorios.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, images }),
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    router.push('/admin/products');
                }, 2000);
            } else {
                const err = await response.json();
                alert('Error: ' + err.error);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error de conexión.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-4">
                <Link
                    href="/admin/products"
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-[14px] transition-colors w-fit group"
                >
                    <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    Volver al Catálogo
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Package className="text-blue-600" />
                            Editar Producto
                        </h2>
                        <p className="text-slate-500 text-[14px]">Modifica los detalles del producto ID: #{params.id?.toString().slice(-6)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 text-blue-600">
                            <Info size={20} />
                            <h3 className="font-bold text-[18px]">Información Básica</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Nombre del Producto *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    type="text"
                                    className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Descripción Detallada</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="min-h-[200px] p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 text-blue-600">
                                <Upload size={20} />
                                <h3 className="font-bold text-[18px]">Imágenes</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 relative group overflow-hidden shadow-sm">
                                    <Image src={img} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-rose-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {images.length < 5 && (
                                <label className="aspect-square rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-md group-hover:scale-110 transition-transform">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-[12px] font-bold text-blue-600">Subir</span>
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 text-blue-600">
                            <DollarSign size={20} />
                            <h3 className="font-bold text-[18px]">Precios y Stock</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 px-1">Precio Base *</label>
                                    <input
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-slate-700 px-1">Precio Oferta</label>
                                    <input
                                        name="salePrice"
                                        value={formData.salePrice}
                                        onChange={handleChange}
                                        type="number"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold text-blue-600 focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Stock</label>
                                <input
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    type="number"
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 text-blue-600">
                            <Layers size={20} />
                            <h3 className="font-bold text-[18px]">Organización</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Categoría *</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-semibold text-slate-600 outline-none focus:ring-4 ring-blue-500/5"
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[14px] font-bold text-slate-700 px-1">Código SKU</label>
                                <input
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold text-slate-600 focus:ring-4 ring-blue-500/5 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="pt-4 space-y-3">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[14px] font-bold text-slate-700">Visibilidad</span>
                                    <input
                                        name="isVisible"
                                        checked={formData.isVisible}
                                        onChange={handleChange}
                                        type="checkbox"
                                        className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-row justify-end gap-3 pt-8 pb-10 border-t border-slate-100 mt-4">
                <button 
                    onClick={() => router.back()} 
                    className="bg-slate-100 text-slate-600 px-8 py-3.5 rounded-2xl font-bold text-[14px] hover:bg-slate-200 transition-all text-center"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-bold text-[14px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    Guardar Cambios
                </button>
            </div>

            {showSuccess && (
                <div className="fixed bottom-10 right-10 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right-10 duration-500 z-[100] border border-white/10">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[15px]">¡Cambios Guardados!</span>
                        <span className="text-[13px] text-slate-400">El producto ha sido actualizado con éxito.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
