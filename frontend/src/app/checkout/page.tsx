"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, OrderDto, PaymentMethod, ApplyCouponResponse } from "@/types";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    getSubTotal,
    getShippingFee,
    getTotalAmount,
    clearCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const user = useAuthStore((state) => state.user);

  const [customerName, setCustomerName] = useState(user?.fullName || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || "");
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [province, setProvince] = useState("TP. Hồ Chí Minh");
  const [district, setDistrict] = useState("Quận 7");
  const [ward, setWard] = useState("Phường Tân Phong");
  const [installationNotes, setInstallationNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subTotal = getSubTotal();
  const shippingFee = getShippingFee();
  const totalAmount = getTotalAmount();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-cream-300 mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Giỏ hàng của bạn đang trống</h1>
        <p className="text-xs text-charcoal-500 mt-2">
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi thực hiện thanh toán.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block px-6 py-2.5 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700 transition-colors"
        >
          Khám phá sản phẩm chăn ga ngay
        </Link>
      </div>
    );
  }

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

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    try {
      setSubmitting(true);

      // Validate GUID format for product IDs
      const isGuid = (val: string) =>
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);

      const invalidItems = items.filter((i) => !isGuid(i.productId));
      if (invalidItems.length > 0) {
        toast.error("Sản phẩm trong giỏ có dữ liệu tạm cũ. Vui lòng bấm gỡ sản phẩm đó và thêm lại vào giỏ hàng!");
        setSubmitting(false);
        return;
      }

      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        installationNotes: installationNotes.trim(),
        paymentMethod: paymentMethod === "VietQR" ? "VietQR" : "COD",
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId && isGuid(i.variantId) ? i.variantId : null,
          quantity: i.quantity,
        })),
      };

      const res = await api.post<ApiResponse<OrderDto>>("/api/orders", payload);
      if (res.data?.data) {
        const order = res.data.data;
        clearCart();
        toast.success("Đặt hàng thành công! Đang chuyển đến trang xác nhận.");
        router.push(`/orders/${order.orderCode}`);
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || err.message;
      toast.error(serverMessage || "Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8 text-center max-w-xl mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
          Thông Tin Giao Hàng & Thanh Toán
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Miễn phí vận chuyển & hỗ trợ giao lắp tận phòng cho đơn hàng từ 1.000.000đ
        </p>
      </div>

      <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer & Delivery Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Box */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-wood-100 text-wood-700 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Thông tin người nhận</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">
                  Họ và tên người nhận <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Vd: Nguyễn Thu Hà"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Vd: 0987654321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-charcoal-800 mb-1">
                  Email nhận thông báo đơn hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Vd: thuha@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Box */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-wood-100 text-wood-700 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Địa chỉ nhận hàng & Giao lắp</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Tỉnh / Thành phố</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="TP. Hồ Chí Minh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Quận / Huyện</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Quận 7"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Phường / Xã</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Phường Tân Phong"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-charcoal-800 mb-1">
                  Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Vd: Căn hộ 15.02, Tháp B, Chung cư Sunrise City, 27 Nguyễn Hữu Thọ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-charcoal-800 mb-1">
                  Ghi chú giao hàng & lắp đặt (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={installationNotes}
                  onChange={(e) => setInstallationNotes(e.target.value)}
                  placeholder="Vd: Nhà chung cư có thang máy, nhờ shipper gọi trước 30 phút, giao sau 18h..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-wood-100 text-wood-700 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Phương thức thanh toán</span>
            </h2>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod("COD")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === "COD"
                    ? "border-wood-600 bg-wood-50/60 ring-1 ring-wood-500"
                    : "border-cream-200 hover:bg-cream-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 text-wood-600 focus:ring-wood-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-wood-600" />
                    <span className="text-xs font-bold text-charcoal-900">
                      Thanh toán khi nhận hàng & lắp đặt (COD)
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">
                    Kiểm tra sản phẩm, chất lượng đường may sợi vải và nệm trước khi thanh toán cho nhân viên giao hàng.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("VietQR")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === "VietQR"
                    ? "border-wood-600 bg-wood-50/60 ring-1 ring-wood-500"
                    : "border-cream-200 hover:bg-cream-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "VietQR"}
                  onChange={() => setPaymentMethod("VietQR")}
                  className="mt-1 text-wood-600 focus:ring-wood-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-wood-600" />
                    <span className="text-xs font-bold text-charcoal-900">
                      Chuyển khoản VietQR tự động (Nhanh chóng & Không tiền mặt)
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">
                    Quét mã QR chuẩn Napas247 qua ứng dụng ngân hàng, số tiền và nội dung chuyển khoản tự động điền sẵn.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-6 lg:sticky lg:top-28">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 pb-3 border-b border-cream-200">
            Tóm tắt đơn hàng ({items.length} món)
          </h2>

          {/* Items list */}
          <div className="max-h-64 overflow-y-auto divide-y divide-cream-100 pr-1 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="pt-3 first:pt-0 flex gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0 relative">
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-charcoal-900 truncate">{item.productName}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 mt-0.5">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full border border-cream-300"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      {item.colorName}
                    </span>
                    <span>•</span>
                    <span>SL: {item.quantity}</span>
                  </div>
                  <p className="text-xs font-bold text-wood-600 mt-1">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon field */}
          <div className="pt-4 border-t border-cream-200">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mã: <strong>{appliedCoupon.code}</strong> (-{formatCurrency(discountAmount)})</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Gỡ mã
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Mã giảm giá (vd: HOMEWELCOME)"
                  className="flex-1 px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-wood-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={applying || !couponCode.trim()}
                  className="px-4 py-2 bg-wood-600 text-white text-xs font-semibold rounded-xl hover:bg-wood-700 disabled:opacity-50 transition-colors"
                >
                  {applying ? "..." : "Áp dụng"}
                </button>
              </div>
            )}
          </div>

          {/* Calculation breakdown */}
          <div className="space-y-2 text-xs text-charcoal-600 pt-2 border-t border-cream-200">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-semibold text-charcoal-900">{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển & lắp đặt:</span>
              <span className="font-semibold text-charcoal-900">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">Miễn phí</span>
                ) : (
                  formatCurrency(shippingFee)
                )}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Giảm giá khuyến mãi:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-charcoal-900 pt-3 border-t border-cream-200">
              <span>Tổng thanh toán:</span>
              <span className="text-xl text-wood-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
          >
            <span>{submitting ? "Đang xử lý đơn hàng..." : "Xác Nhận Đặt Hàng"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-charcoal-500 text-center leading-relaxed">
            Bằng việc nhấn đặt hàng, bạn đồng ý với các chính sách vận chuyển, bảo hành và 30 đêm ngủ thử của ShopHome.
          </p>
        </div>
      </form>
    </div>
  );
}
