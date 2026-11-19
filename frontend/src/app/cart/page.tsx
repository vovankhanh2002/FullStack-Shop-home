"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency, getImageUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubTotal, getShippingFee, getTotalAmount } = useCartStore();

  const subTotal = getSubTotal();
  const shippingFee = getShippingFee();
  const totalAmount = getTotalAmount();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-cream-300 mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Giỏ hàng của bạn đang trống</h1>
        <p className="text-xs text-charcoal-500 mt-2">Hãy khám phá bộ sưu tập chăn ga gối đệm ấm áp tại ShopHome.</p>
        <Link
          href="/products"
          className="mt-6 inline-block px-6 py-2.5 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700 transition-colors"
        >
          Khám phá sản phẩm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900 mb-6">
        Giỏ Hàng Của Bạn ({items.length} món)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of items */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm divide-y divide-cream-100">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="py-4 first:pt-0 last:pb-0 flex gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-cream-100 flex-shrink-0 relative">
                <Image src={getImageUrl(item.imageUrl)} alt={item.productName} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-sm font-bold text-charcoal-900 hover:text-wood-600 line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-charcoal-500 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-500">
                  <span>Kích thước: <strong>{item.size}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-cream-300"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    {item.colorName}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-cream-300 rounded-xl overflow-hidden bg-cream-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="p-1.5 hover:bg-cream-200 text-charcoal-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-charcoal-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="p-1.5 hover:bg-cream-200 text-charcoal-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-wood-600">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order total sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 pb-3 border-b border-cream-200">
            Tóm tắt chi phí
          </h2>

          <div className="space-y-2.5 text-xs text-charcoal-600">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-semibold text-charcoal-900">{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển & lắp đặt:</span>
              <span className="font-semibold text-charcoal-900">
                {shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatCurrency(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-charcoal-900 pt-3 border-t border-cream-200">
              <span>Tổng cộng:</span>
              <span className="text-xl text-wood-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3.5 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            <span>Tiến Hành Đặt Hàng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
