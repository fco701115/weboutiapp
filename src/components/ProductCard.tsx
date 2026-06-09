'use client';
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";

export interface Product {
    id: string;
    name: string;
    rating: number; // 0-5
    price: number;
    salePrice?: number;
    imageUrl: string;
    discountBadge?: string;
}

export function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const router = useRouter();

    const isFav = isInWishlist(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            ...product,
            price: product.salePrice || product.price,
            image: product.imageUrl
        });
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            ...product,
            price: product.salePrice || product.price,
            image: product.imageUrl
        }, 1, false);
        router.push('/checkout');
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleNavigate = () => {
        router.push(`/product/${product.id}`);
    };

    return (
<div 
            className="w-[168px] h-[308px] sm:w-[211.2px] sm:max-w-[211.2px] sm:h-[348px] border-[1px] border-[#ddd] hover:border-[#bea55b] p-2 sm:p-[13px] bg-white relative sm:hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col mx-auto rounded-[5px] overflow-hidden group"
        >
            <Link 
                href={`/product/${product.id}`}
                className="flex flex-col h-full no-underline"
            >
                {/* Discount Badge */}
                {(product.discountBadge || product.salePrice) && (
<div
                         className="absolute right-3 top-3 z-10 rounded-full w-[40px] h-[40px] bg-[#bea55b] text-white flex flex-col items-center justify-center text-[11px] font-black leading-tight shadow-md border-2 border-white"
                         style={{ fontFamily: '"Lato", sans-serif' }}
                     >
                        -{product.discountBadge ? product.discountBadge.replace(/[^0-9%]/g, '') : Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100) + '%'}
                    </div>
                )}

                {/* Image Area */}
                <div className="relative mx-auto w-full h-[140px] sm:h-[180px] p-0">
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-50 border border-transparent rounded-none sm:group-hover:bg-slate-100/50 transition-all overflow-hidden">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, 180px"
                            className="object-contain sm:group-hover:scale-110 transition-transform duration-500 rounded-none !w-[148px] !h-[148px] sm:!w-full sm:!h-full m-auto"
                        />
                    </div>
                </div>

                {/* Product Name Area */}
                <div className="w-full px-1 mt-4">
                    <h3 className="text-[14px] font-bold text-slate-800 line-clamp-2 leading-tight h-[36px] sm:group-hover:text-[#bea55b] transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Rating Area */}
                <div className="w-full px-1 mt-2 sm:mt-[5px] flex items-center text-amber-400 gap-[2px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <i
                            key={i}
                            className={`${i < product.rating ? "fa-solid fa-star" : "fa-regular fa-star"}`}
                            style={{
                                fontFamily: '"Font Awesome 6 Free"',
                                fontWeight: i < product.rating ? 900 : 400,
                                fontSize: '13px'
                            }}
                        />
                    ))}
                </div>

                {/* Price Area */}
                <div className="w-full px-1 mt-[5px] flex items-baseline gap-2 mb-[5px] pl-[2px] md:pl-0" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '14px' }}>
                    <span className="text-[14px] font-black text-[#bea55b] tracking-tight" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '14px' }}>
                        $ {(product.salePrice || product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {product.salePrice && (
                        <span className="text-[11px] text-[#999] line-through">
                            $ {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    )}
                </div>
            </Link>

            {/* Wishlist Button - Outside the Link to avoid nesting interactivity */}
            <button
                onClick={handleWishlist}
                className="absolute right-5 bottom-[160px] sm:right-[22px] sm:bottom-[150px] z-20 w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors shadow-sm border border-slate-200 bg-white group/fav"
                aria-label="Toggle Wishlist"
            >
                <Heart 
                    size={16} 
                    className={`transition-colors ${isFav ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-400 group-hover/fav:text-red-500'}`} 
                />
            </button>

            {/* Actions Area */}
            <div className="mt-auto flex justify-between items-center w-full h-[35px] flex-row mb-2 ml-0 mr-[4px] sm:m-0 sm:mb-1 gap-2 pt-2 relative z-10">
<button
                     onClick={handleBuyNow}
                     className="flex-1 h-[35px] bg-[#e1cb8a] hover:bg-[#e1cb8a] text-white text-[13px] font-semibold flex items-center justify-center transition-all shadow-sm rounded-[5px] active:scale-95"
                 >
                    Comprar Ahora
                </button>
                <button
                    onClick={handleAddToCart}
                    className="w-[35px] h-[35px] border border-slate-200 rounded-[5px] flex items-center justify-center hover:bg-green-50 transition-all text-slate-500 hover:text-[#bea55b] shadow-sm active:scale-90"
                >
                    <ShoppingCart size={18} />
                </button>
            </div>
        </div>
    );
}

