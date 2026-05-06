'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Minus,
    Plus,
    ShoppingCart,
    Zap,
    Phone,
    Truck,
    ChevronRight,
    Heart,
    Share2,
    Check
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useReviews } from '@/context/ReviewsContext';

interface ProductClientProps {
    product: any;
    relatedProducts: any[];
}

export function ProductClient({ product, relatedProducts }: ProductClientProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { addItem } = useCart();
    const { toggleWishlist: toggleGlobalWishlist, isInWishlist } = useWishlist();

    const [localUser, setLocalUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('user');
        if (saved) setLocalUser(JSON.parse(saved));
    }, []);

    const currentUser = session?.user || localUser;

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [mainImage, setMainImage] = useState(product.images?.[0] || '');
    const [showShareToast, setShowShareToast] = useState(false);

    // Reviews State
    const { reviews: allReviews, addReview } = useReviews();
    const reviews = allReviews.filter(r => r.productId === product.id);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const handleAddReview = () => {
        if (newComment.trim() === '') return;
        addReview({
            productId: product.id,
            productName: product.name,
            rating: newRating,
            comment: newComment,
            userEmail: currentUser?.email || '',
            userName: isAnonymous ? 'Anónimo' : (currentUser?.name || 'Usuario')
        });
        setNewComment('');
        setNewRating(5);
        setIsAnonymous(false);
    };

    // Zoom state
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const lensWidth = 160;
        const lensHeight = 160;

        let lx = x - lensWidth / 2;
        let ly = y - lensHeight / 2;

        lx = Math.max(0, Math.min(lx, rect.width - lensWidth));
        ly = Math.max(0, Math.min(ly, rect.height - lensHeight));

        setLensPos({ x: lx, y: ly });

        const px = (lx / (rect.width - lensWidth)) * 100;
        const py = (ly / (rect.height - lensHeight)) * 100;

        setZoomPos({ x: px, y: py });
    };

    const handleAddToCart = () => {
        addItem({
            ...product,
            price: product.salePrice || product.price,
            image: product.images?.[0] || ''
        }, quantity);
    };

    const handleBuyNow = () => {
        addItem({
            ...product,
            price: product.salePrice || product.price,
            image: product.images?.[0] || ''
        }, quantity, false);
        router.push('/checkout');
    };

    const currentImage = mainImage || 'https://via.placeholder.com/600';

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Mira este producto: ${product.name}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
            if (err instanceof Error && err.name !== 'AbortError') {
                await navigator.clipboard.writeText(window.location.href);
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2000);
            }
        }
    };

    const toggleWishlist = () => {
        toggleGlobalWishlist(product);
    };

    const isFav = isInWishlist(product.id);

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-6 font-medium">
                    <Link href="/" prefetch={true} className="hover:text-[#e996a0] cursor-pointer">Inicio</Link>
                    <ChevronRight size={14} />
                    <span className="hover:text-[#e996a0] cursor-pointer font-bold">{product.category?.name || 'Categoría'}</span>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 truncate max-w-[200px]">{product.name}</span>
                </div>

                {/* Product Section Card */}
                <div className="bg-white rounded-[5px] shadow-sm border border-slate-100 p-6 md:p-10 mb-8 overflow-hidden relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* Image Gallery */}
                        <div className="flex flex-col gap-6">
                            <div
                                ref={containerRef}
                                onMouseEnter={() => setZoomVisible(true)}
                                onMouseLeave={() => setZoomVisible(false)}
                                onMouseMove={handleMouseMove}
                                className="relative aspect-square w-full bg-white border border-slate-100 rounded-[5px] overflow-hidden cursor-crosshair group z-20 shadow-sm"
                            >
                                <Image
                                    src={currentImage}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-6 transition-transform duration-200"
                                    unoptimized={currentImage.startsWith('data:')}
                                />

                                {/* Action Bubbles */}
                                <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                                        className="w-[45px] h-[45px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2 border-white/80 backdrop-blur-md bg-white/90 group/btn"
                                        title="Guardar en favoritos"
                                    >
                                        <Heart 
                                            size={20} 
                                            className={`transition-all duration-300 ${isFav ? 'text-red-500 fill-red-500 scale-110 animate-pulse' : 'text-slate-400 group-hover/btn:text-red-500'}`} 
                                        />
                                    </button>
                                    
                                    <div className="relative group/share">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleShare(); }}
                                            className="w-[45px] h-[45px] bg-white/90 border-2 border-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-[#e996a0] transition-all duration-300 shadow-lg group-hover/share:scale-110"
                                            title="Compartir producto"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                        
                                        {showShareToast && (
                                            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#e996a0] text-white text-[11px] font-black py-2 px-4 rounded-xl whitespace-nowrap shadow-xl animate-in fade-in slide-in-from-right-4 duration-300 flex items-center gap-2">
                                                <Check size={14} />
                                                Copiado
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Discount Badge */}
                                {product.salePrice && (
                                    <div className="absolute right-4 top-4 z-40 rounded-full w-[45px] h-[45px] bg-[#e996a0] text-white flex flex-col items-center justify-center text-[11px] font-black leading-tight shadow-lg border-2 border-white animate-in zoom-in duration-500">
                                        -{Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)}%
                                    </div>
                                )}

                                {zoomVisible && (
                                    <div
                                        className="absolute border border-slate-200 bg-white/10 pointer-events-none z-30"
                                        style={{
                                            width: '180px',
                                            height: '180px',
                                            left: `${lensPos.x}px`,
                                            top: `${lensPos.y}px`,
                                            boxShadow: '0 0 0 2000px rgba(0,0,0,0.03)'
                                        }}
                                    />
                                )}
                            </div>

                            {product.images?.length > 1 && (
                                <div className="grid grid-cols-5 gap-3">
                                    {product.images.map((img: string, i: number) => (
                                        <div
                                            key={i}
                                            onClick={() => setMainImage(img)}
                                            className={`aspect-square border-2 rounded-2xl p-1 cursor-pointer transition-all ${mainImage === img ? 'border-[#e996a0] shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <div className="relative w-full h-full rounded-xl overflow-hidden">
                                                <Image
                                                    src={img}
                                                    alt={`Thumb ${i}`}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized={img.startsWith('data:')}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col relative py-2">
                            {/* Magnifying window on desktop */}
                            {zoomVisible && (
                                <div
                                    className="absolute top-0 inset-x-0 bottom-0 z-[100] bg-white border border-slate-100 shadow-2xl overflow-hidden hidden md:block rounded-[5px]"
                                    style={{
                                        backgroundImage: `url(${currentImage})`,
                                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '250%',
                                    }}
                                />
                            )}

                            <div className="flex flex-col gap-1 mb-4">
                                <span className="text-[12px] font-black text-[#e996a0] uppercase tracking-[0.2em]">{product.category?.name || 'TECNOLOGÍA'}</span>
                                <h1 className="text-[26px] md:text-[32px] font-black text-slate-900 leading-[1.1] tracking-tight">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[36px] font-black text-[#e996a0] tracking-tighter">
                                        $ {(product.salePrice || product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    {product.salePrice && (
                                        <span className="text-[18px] text-[#999] line-through font-bold">
                                            $ {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                                <span className="bg-[#e996a0]/5 text-[#e996a0] px-3 py-1 rounded-full text-[11px] font-black uppercase">En Stock</span>
                            </div>

                            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-6">
                                <div className="flex text-amber-400 gap-[2px]">
                                    {[1, 2, 3, 4, 5].map((s) => {
                                        const averageRating = reviews.length > 0 
                                            ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
                                            : 0;
                                        return (
                                            <i
                                                key={s}
                                                className={s <= Math.round(averageRating) ? "fa-solid fa-star" : "fa-regular fa-star"}
                                                style={{
                                                    fontFamily: '"Font Awesome 6 Free"',
                                                    fontWeight: s <= Math.round(averageRating) ? 900 : 400,
                                                    fontSize: '16px'
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <span className="text-[14px] font-bold text-slate-400">
                                    {reviews.length > 0 
                                        ? `${(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} valoraciones)` 
                                        : 'Sin valoraciones'}
                                </span>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-y-4 mb-8">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Código</span>
                                    <span className="text-slate-900 font-bold text-[14px]">#{product.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Marca</span>
                                    <span className="text-slate-900 font-bold text-[14px]">Original</span>
                                </div>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="mt-auto space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1 border border-slate-200/50">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
                                        >
                                            <Minus size={20} className="text-slate-600" />
                                        </button>
                                        <div className="w-14 text-center font-black text-slate-900 text-lg">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm active:scale-95"
                                        >
                                            <Plus size={20} className="text-slate-600" />
                                        </button>
                                    </div>
                                    <div className="flex-grow flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Total Selección</span>
                                        <span className="text-xl font-black text-slate-900">${((product.salePrice || product.price) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="h-[45px] bg-slate-900 text-white rounded-[5px] font-bold text-[14px] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 px-4"
                                    >
                                        <ShoppingCart size={18} />
                                        Agregar al Carrito
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="h-[45px] bg-[#e996a0] text-white rounded-[5px] font-bold text-[14px] hover:bg-pink-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 border-b-2 border-pink-900/50 px-4"
                                    >
                                        <Zap size={18} fill="currentColor" />
                                        Comprar Ahora
                                    </button>
                                </div>

                                {/* Support Buttons */}
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="tel:+8809638365975"
                                        className="h-[45px] bg-[#16804d] text-white rounded-[5px] font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-[#136d41] transition-all shadow-lg active:scale-95"
                                    >
                                        <div className="bg-white/20 p-1.5 rounded-md flex items-center justify-center">
                                            <Phone size={18} fill="currentColor" />
                                        </div>
                                        +8809638365975
                                    </Link>
                                    <Link
                                        href={`https://wa.me/8809638365975?text=Hola, estoy interesado en ${product.name}`}
                                        target="_blank"
                                        className="h-[45px] bg-[#16804d] text-white rounded-[5px] font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-[#136d41] transition-all shadow-lg active:scale-95"
                                    >
                                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        Preguntar sobre este producto
                                    </Link>
                                </div>

                                {/* Shipping Info Box */}
                                <div className="bg-pink-50/50 border border-pink-100 rounded-[20px] p-5 flex items-center gap-4 text-pink-900 shadow-sm">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#e996a0] shrink-0">
                                        <Truck size={24} />
                                    </div>
                                    <div className="text-[12.5px] font-bold leading-tight">
                                        Envío Express GRATIS<br />
                                        <span className="text-pink-500/60 font-medium">Recíbelo en 24-48 horas en todo el país.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[5px] shadow-sm border border-slate-100 overflow-hidden mb-12">
                    <div className="flex border-b border-slate-100 bg-slate-50/50 rounded-t-[5px]">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-10 py-5 text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === 'description' ? 'text-[#e996a0] bg-white border-b-2 border-[#e996a0]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Descripción
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-10 py-5 text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === 'reviews' ? 'text-[#e996a0] bg-white border-b-2 border-[#e996a0]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Valoraciones ({reviews.length})
                        </button>
                    </div>

                    <div className="p-10">
                        {activeTab === 'description' ? (
                            <div className="prose prose-slate max-w-none">
                                <h2 className="text-[20px] font-black text-slate-900 mb-6 uppercase tracking-tight">Especificaciones Técnicas</h2>
                                <div className="text-[15px] text-slate-600 leading-relaxed font-medium">
                                    {product.description || "Este producto no tiene una descripción detallada todavía."}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Add Review Form */}
                                {!mounted ? (
                                    <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
                                ) : currentUser ? (
                                    <div className="flex flex-col gap-2 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <h3 className="text-[18px] font-bold text-[#e996a0]">Agregar reseña</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <i
                                                    key={i}
                                                    className={i <= newRating ? "fa-solid fa-star text-amber-400" : "fa-regular fa-star text-amber-400 opacity-60"}
                                                    style={{
                                                        fontFamily: '"Font Awesome 6 Free"',
                                                        fontWeight: i <= newRating ? 900 : 400,
                                                        fontSize: '24px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setNewRating(i)}
                                                />
                                            ))}
                                            <span className="ml-2 text-[13px] font-bold text-slate-400 uppercase tracking-widest">{newRating} / 5</span>
                                        </div>
                                        <textarea
                                            className="border border-slate-200 rounded-xl p-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#e996a0]/20 focus:border-[#e996a0] transition-all"
                                            rows={3}
                                            placeholder="Cuéntanos tu experiencia con el producto..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />

                                        <div className="flex items-center gap-2 mt-2 ml-1">
                                            <input
                                                type="checkbox"
                                                id="anonymousReview"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-[#e996a0] focus:ring-[#e996a0]"
                                            />
                                            <label htmlFor="anonymousReview" className="text-[12px] font-bold text-slate-500 cursor-pointer select-none">Valoración anónima</label>
                                        </div>

                                        <button
                                            className="self-start mt-2 bg-[#e996a0] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#153288] transition-all active:scale-95 shadow-lg shadow-[#e996a0]/10"
                                            onClick={handleAddReview}
                                        >
                                            Publicar reseña
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                                            <i className="fa-solid fa-lock text-2xl" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-[16px] font-bold text-slate-900">¿Deseas dejar una reseña?</h4>
                                            <p className="text-[13px] text-slate-500">Debes iniciar sesión con tu cuenta para calificar este producto.</p>
                                        </div>
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="mt-2 bg-[#e996a0] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#153288] transition-all active:scale-95 shadow-lg shadow-[#e996a0]/10 uppercase tracking-widest text-[11px]"
                                        >
                                            Iniciar Sesión
                                        </button>
                                    </div>
                                )}

                                {/* List of Reviews */}
                                <div className="flex flex-col gap-4">
                                    {reviews.length === 0 ? (
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[12px]">Aún no hay reseñas</p>
                                    ) : (
                                        reviews.map((rev, idx) => (
                                            <div key={idx} className="border-b pb-2">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <i
                                                            key={i}
                                                            className={i <= rev.rating ? "fa-solid fa-star text-amber-400" : "fa-regular fa-star text-gray-300"}
                                                            style={{
                                                                fontFamily: '"Font Awesome 6 Free"',
                                                                fontWeight: i <= rev.rating ? 900 : 400,
                                                                fontSize: '16px'
                                                            }}
                                                        />
                                                    ))}
                                                    <span className="text-xs text-slate-400 ml-2">{rev.date}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <span className="text-[13px] font-bold text-slate-700">{rev.userName || 'Usuario Dazlea'}</span>
                                                    <p className="text-[14px] text-slate-600 leading-relaxed">{rev.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-[1200px] mx-auto px-2 sm:px-4 mt-16 pb-10">
                    <div className="flex flex-col gap-1 mb-10 pb-[10px] border-b border-[#dfdfdf]">
                        <h2 className="text-[22px] font-lato m-0 font-semibold text-slate-900 tracking-tighter capitalize border-[#dfdfdf]">Categorias</h2>

                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
