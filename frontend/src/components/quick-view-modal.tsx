"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingBag, ShieldCheck, Truck, Plus, Minus } from "lucide-react";
import { ProductList, ProductVariant } from "@/types";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: ProductList | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  // Unique sizes & colors
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ name: v.colorName, hex: v.colorHex })))
  ).map((str) => JSON.parse(str) as { name: string; hex: string });

  function handleAddToCart() {
    if (!product) return;
    addItem(
      {
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
      },
      quantity
    );

    toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng!`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-cream-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-700 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square md:aspect-auto bg-cream-100">
              <Image
                src={getImageUrl(selectedVariant?.imageUrl || product.primaryImageUrl)}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-wood-600 font-bold">
                  {product.material}
                </span>
                <h3 className="text-base md:text-lg font-serif font-bold text-charcoal-900 mt-1 leading-snug">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-charcoal-800">{product.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-charcoal-500">({product.reviewCount} đánh giá)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2.5 mt-3">
                  <span className="text-lg md:text-xl font-bold text-wood-600">
                    {formatCurrency(displayPrice)}
                  </span>
                  {displayOriginalPrice > displayPrice && (
                    <span className="text-xs text-charcoal-500 line-through">
                      {formatCurrency(displayOriginalPrice)}
                    </span>
                  )}
                </div>

                {/* Size options */}
                {sizes.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                      Kích thước giường:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => {
                        const isSelected = selectedVariant?.size === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              const match = product.variants.find(
                                (v) => v.size === s && (selectedVariant ? v.colorName === selectedVariant.colorName : true)
                              ) || product.variants.find((v) => v.size === s);
                              if (match) setSelectedVariant(match);
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                              isSelected
                                ? "border-wood-600 bg-wood-50 text-wood-700 font-bold"
                                : "border-cream-300 text-charcoal-700 hover:border-cream-400"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color options */}
                {colors.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                      Màu sắc: <span className="font-normal text-charcoal-600">{selectedVariant?.colorName}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {colors.map((c) => {
                        const isSelected = selectedVariant?.colorName === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              const match = product.variants.find(
                                (v) => v.colorName === c.name && (selectedVariant ? v.size === selectedVariant.size : true)
                              ) || product.variants.find((v) => v.colorName === c.name);
                              if (match) setSelectedVariant(match);
                            }}
                            className={`w-6 h-6 rounded-full border transition-all ${
                              isSelected
                                ? "ring-2 ring-wood-600 ring-offset-2 scale-110"
                                : "border-cream-300 hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal-800">Số lượng:</span>
                  <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden bg-cream-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 hover:bg-cream-200 text-charcoal-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-charcoal-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 hover:bg-cream-200 text-charcoal-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-cream-200 mt-6 space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-2.5 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>

                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="block text-center text-xs font-semibold text-wood-600 hover:underline pt-1"
                >
                  Xem toàn bộ thông số chi tiết & ảnh lớn →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
