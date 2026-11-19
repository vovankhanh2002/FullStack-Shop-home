"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Tag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { ApiResponse, ApplyCouponResponse } from "@/types";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubTotal,
    getShippingFee,
    getTotalAmount,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const subTotal = getSubTotal();
  const shippingFee = getShippingFee();
  const totalAmount = getTotalAmount();

  // Free shipping progress calculation (Threshold: 1,000,000đ)
  const freeShippingThreshold = 1000000;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subTotal);
  const freeShipPercent = Math.min(100, (subTotal / freeShippingThreshold) * 100);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setApplying(true);
      const res = await api.post<ApiResponse<ApplyCouponResponse>>("/api/coupons/apply", {
        code: couponCode.trim(),
        subTotal,
      });

      if (res.data?.data?.valid) {
        applyCoupon(
          {
            id: "",
            code: couponCode.toUpperCase(),
            description: res.data.data.message,
            discountType: "FixedAmount",
            value: res.data.data.discountAmount,
            minOrderValue: 0,
            usageLimit: 0,
            usageCount: 0,
            isActive: true,
          },
          res.data.data.discountAmount
        );
        toast.success(res.data.data.message);
        setCouponCode("");
      } else {
        toast.error(res.data?.data?.message || "Mã không hợp lệ.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể áp dụng mã giảm giá.");
    } finally {
      setApplying(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-cream-200 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-wood-600" />
              <h2 className="text-sm md:text-base font-bold text-charcoal-900">
                Giỏ hàng của bạn ({items.length})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full hover:bg-cream-200 text-charcoal-500 hover:text-charcoal-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-4 py-3 bg-cream-100 border-b border-cream-200">
            <div className="flex items-center gap-2 text-xs text-charcoal-700 font-medium mb-1.5">
              <Truck className="w-4 h-4 text-wood-600 flex-shrink-0" />
              {remainingForFreeShip > 0 ? (
                <span>
                  Mua thêm <strong className="text-wood-600">{formatCurrency(remainingForFreeShip)}</strong> để được{" "}
                  <strong className="text-emerald-600 uppercase">Miễn phí giao hàng</strong>!
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  🎉 Chúc mừng! Bạn đã được MIỄN PHÍ GIAO HÀNG & LẮP ĐẶT!
                </span>
              )}
            </div>
            <div className="w-full h-2 bg-cream-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-wood-500 transition-all duration-300 rounded-full"
                style={{ width: `${freeShipPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-cream-100">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                <p className="text-sm text-charcoal-500">Giỏ hàng của bạn đang trống.</p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-5 py-2 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700 transition-colors"
                >
                  Khám phá chăn ga ngay
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="pt-3 first:pt-0 flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0 relative">
                    <Image src={getImageUrl(item.imageUrl)} alt={item.productName} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.productSlug}`}
                        onClick={closeCart}
                        className="text-xs font-semibold text-charcoal-900 hover:text-wood-600 line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-charcoal-500 hover:text-rose-500 transition-colors p-0.5"
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Variant badge */}
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-500">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-cream-300 inline-block"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        {item.colorName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-cream-200 text-charcoal-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-cream-200 text-charcoal-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-wood-600">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-cream-200 bg-cream-50 space-y-3">
              {/* Coupon input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mã: <strong>{appliedCoupon.code}</strong> (-{formatCurrency(discountAmount)})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">
                    Gỡ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Mã giảm giá (vd: HOMEWELCOME)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-cream-300 rounded-xl focus:outline-none focus:border-wood-400 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="px-3 py-1.5 bg-wood-600 text-white text-xs font-medium rounded-xl hover:bg-wood-700 disabled:opacity-50 transition-colors"
                  >
                    {applying ? "..." : "Áp dụng"}
                  </button>
                </form>
              )}

              {/* Price details */}
              <div className="space-y-1.5 text-xs text-charcoal-600 border-t border-cream-200 pt-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-medium text-charcoal-900">{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-charcoal-900">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatCurrency(shippingFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-charcoal-900 pt-2 border-t border-cream-200">
                  <span>Tổng cộng:</span>
                  <span className="text-base text-wood-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 bg-wood-600 hover:bg-wood-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <span>Tiến Hành Đặt Hàng</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
