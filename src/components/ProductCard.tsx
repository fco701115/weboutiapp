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

    return (
        <div className="w-full max-w-[280px] h-[340px] sm:h-[370px] border-[1px] border-[#173495] p-2 sm:p-[13px] bg-white relative hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col mx-auto rounded-[5px] overflow-hidden group">
            {/* Discount Badge */}
            {(product.discountBadge || product.salePrice) && (
                <div
                    className="absolute right-3 top-3 z-10 rounded-full w-[40px] h-[40px] bg-[#1a3da1] text-white flex flex-col items-center justify-center text-[10px] font-black leading-tight shadow-md border-2 border-white"
                    style={{ fontFamily: '"Lato", sans-serif' }}
                >
                    -{product.discountBadge ? product.discountBadge.replace(/[^0-9%]/g, '') : Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100) + '%'}
                </div>
            )}

            {/* Image Area */}
            <div className="relative mx-auto w-full h-[140px] sm:h-[180px] p-2 sm:p-0">
                <Link href={`/product/${product.id}`} className="relative w-full h-full flex items-center justify-center bg-slate-50 border border-transparent rounded-2xl hover:bg-slate-100/50 transition-all cursor-pointer overflow-hidden">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 180px"
                        className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                </Link>
                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className="absolute right-2 bottom-2 z-10 w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-2 border-white/80 backdrop-blur-sm bg-white/90 group"
                >
                    <Heart 
                        size={16} 
                        className={`transition-all duration-300 ${isFav ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-400 group-hover:text-red-500'}`} 
                    />
                </button>
            </div>

            {/* Product Name Area */}
            <div className="w-full px-1 mt-4">
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-[14px] font-bold text-slate-800 line-clamp-2 leading-tight cursor-pointer hover:text-[#1a3da1] transition-colors h-[36px]">
                        {product.name}
                    </h3>
                </Link>
            </div>

            {/* Rating Area */}
            <div className="w-full px-1 mt-2 flex items-center text-amber-400 gap-[2px]">
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
            <div className="w-full px-1 mt-[5px] flex items-baseline gap-2">
                <span className="text-[16px] font-black text-[#1a3da1] tracking-tight">
                    $ {(product.salePrice || product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {product.salePrice && (
                    <span className="text-[12px] text-[#999] line-through font-bold">
                        $ {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                )}
            </div>

            {/* Actions Area */}
            <div className="mt-auto flex justify-between items-center w-full h-[35px] flex-row mb-1 gap-2 pt-2">
                <button
                    onClick={handleBuyNow}
                    className="flex-1 h-[35px] bg-[#1c3892] hover:bg-blue-800 text-white text-[13px] font-semibold flex items-center justify-center transition-all shadow-sm rounded-[5px] active:scale-95"
                >
                    Comprar Ahora
                </button>
                <button
                    onClick={handleAddToCart}
                    className="w-[35px] h-[35px] border border-slate-200 rounded-[5px] flex items-center justify-center hover:bg-blue-50 transition-all text-slate-500 hover:text-[#1a3da1] shadow-sm active:scale-90"
                >
                    <ShoppingCart size={18} />
                </button>
            </div>
        </div>
    );
}
