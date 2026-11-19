"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingBag, Eye, Heart } from "lucide-react";
import { ProductList, ProductVariant } from "@/types";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: ProductList;
  onQuickView?: (product: ProductList) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.length > 0 ? product.variants[0] : null
  );

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const discountPercent = displayOriginalPrice > displayPrice
    ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
    : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: selectedVariant?.imageUrl || product.primaryImageUrl,
      variantId: selectedVariant?.id,
      size: selectedVariant?.size || "Tiêu chuẩn",
      colorName: selectedVariant?.colorName || "Mặc định",
      colorHex: selectedVariant?.colorHex || "#D4A373",
      unitPrice: displayPrice,
      originalPrice: displayOriginalPrice,
    });

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!wishlisted) {
      toast.success("Đã thêm vào danh sách yêu thích!");
    } else {
      toast.info("Đã xóa khỏi danh sách yêu thích.");
    }
  }

  // Unique colors from variants for dots
  const uniqueColors = product.variants?.reduce((acc: ProductVariant[], curr) => {
    if (!acc.some((item) => item.colorHex.toLowerCase() === curr.colorHex.toLowerCase())) {
      acc.push(curr);
    }
    return acc;
  }, []) || [];

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-cream-200 hover:border-wood-300 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={getImageUrl(selectedVariant?.imageUrl || product.primaryImageUrl)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="bg-amber-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-sm">
              Flash Sale
            </span>
          )}
          {product.isNew && !product.isFlashSale && discountPercent === 0 && (
            <span className="bg-wood-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-sm">
              Mới Về
            </span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10 translate-x-10 group-hover:translate-x-0 transition-transform duration-200">
          <button
            onClick={handleWishlist}
            aria-label="Yêu thích"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-700 hover:text-rose-500 hover:bg-white flex items-center justify-center shadow-md transition-all"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label="Xem nhanh"
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-700 hover:text-wood-600 hover:bg-white flex items-center justify-center shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Add Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-wood-600 hover:bg-wood-700 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Thêm Nhanh Vào Giỏ</span>
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Material & Brand */}
        <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-1">
          <span className="truncate">{product.material}</span>
          <span className="font-medium text-wood-500">{product.brand}</span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`} className="block group-hover:text-wood-600 transition-colors">
          <h3 className="text-xs md:text-sm font-semibold text-charcoal-900 line-clamp-2 min-h-[2rem] leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Color Swatches */}
        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1.5 my-2">
            {uniqueColors.slice(0, 5).map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedVariant?.colorHex.toLowerCase() === variant.colorHex.toLowerCase()
                    ? "ring-2 ring-wood-500 ring-offset-1 scale-110"
                    : "border-cream-300 hover:scale-105"
                }`}
                style={{ backgroundColor: variant.colorHex }}
                title={variant.colorName}
              />
            ))}
            {uniqueColors.length > 5 && (
              <span className="text-[10px] text-charcoal-500">+{uniqueColors.length - 5}</span>
            )}
            {selectedVariant && (
              <span className="text-[10px] text-charcoal-500 ml-1 truncate">
                {selectedVariant.colorName}
              </span>
            )}
          </div>
        )}

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1 my-1">
          <div className="flex items-center text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
          </div>
          <span className="text-[11px] font-bold text-charcoal-700">{product.averageRating.toFixed(1)}</span>
          <span className="text-[10px] text-charcoal-500">({product.reviewCount})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-cream-100">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-bold text-wood-600">
              {formatCurrency(displayPrice)}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-[10px] text-charcoal-500 line-through">
                {formatCurrency(displayOriginalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-7 h-7 rounded-lg bg-cream-100 hover:bg-wood-600 hover:text-white text-wood-600 flex items-center justify-center transition-colors md:hidden"
            aria-label="Thêm vào giỏ"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
