"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  QrCode,
  Copy,
  ArrowRight,
  ShieldCheck,
  Home,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Order, ApiResponse } from "@/types";
import { formatCurrency, formatDate, getOrderStatusBadge, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function OrderConfirmationPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<Order>>(`/api/orders/${orderCode}`);
        if (res.data?.data) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (orderCode) {
      loadOrder();
    }
  }, [orderCode]);

  // SePay Auto-Polling: Tự động kiểm tra trạng thái mỗi 3 giây khi đơn ở trạng thái chờ thanh toán
  useEffect(() => {
    if (!order || order.paymentStatus === "Paid") return;

    const intervalId = setInterval(async () => {
      try {
        const res = await api.get<ApiResponse<Order>>(`/api/orders/${orderCode}`);
        if (res.data?.data) {
          const updated = res.data.data;
          if (updated.paymentStatus === "Paid") {
            setOrder(updated);
            toast.success("Thanh toán thành công! Đơn hàng đã được xác nhận tự động qua SePay.");
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Polling payment status error:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [orderCode, order?.paymentStatus]);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  }

  // Giả lập bắn Webhook SePay khi test trên môi trường Localhost
  async function handleSimulatePayment() {
    if (!order) return;
    try {
      setSimulating(true);
      await api.post("/api/payment/simulate-sepay", {
        orderCode: order.orderCode,
        amount: order.totalAmount,
      });
      toast.info("Đã kích hoạt giả lập SePay! Hệ thống đang đối soát dữ liệu...");
    } catch (err: any) {
      toast.error("Giả lập thanh toán thất bại.");
    } finally {
      setSimulating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Không tìm thấy đơn hàng</h1>
        <p className="text-xs text-charcoal-500 mt-2">Mã đơn hàng không chính xác hoặc đã bị xóa.</p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-2.5 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700"
        >
          Trở về trang chủ
        </Link>
      </div>
    );
  }

  const badge = getOrderStatusBadge(order.orderStatus);

  // Cấu hình VietQR tự động khớp nội dung SePay
  const qrBank = "MB";
  const qrAccount = "0901234567";
  const qrAccountName = "SHOPHOME VIETNAM";
  const qrAmount = Math.round(order.totalAmount);
  const qrDescription = order.orderCode; // SePay tự động bắt chính xác mã đơn hàng
  const vietQrUrl = `https://img.vietqr.io/image/${qrBank}-${qrAccount}-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(qrDescription)}&accountName=${encodeURIComponent(qrAccountName)}`;

  // Timeline các bước đơn hàng
  const steps = [
    { title: "Chờ xác nhận", desc: "Hệ thống tiếp nhận đơn" },
    { title: "Đã xác nhận", desc: "Bộ phận CSKH kiểm tra" },
    { title: "Đang đóng gói", desc: "Chuẩn bị nệm & chăn ga" },
    { title: "Đang giao lắp", desc: "Tài xế giao tận phòng" },
    { title: "Hoàn thành", desc: "Bắt đầu 30 đêm ngủ thử" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Success Hero Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-xs md:text-sm text-charcoal-600 mt-1.5 leading-relaxed">
          Cảm ơn bạn đã tin tưởng lựa chọn ShopHome. Mã đơn hàng của bạn là{" "}
          <strong className="text-wood-600 font-mono font-bold">{order.orderCode}</strong>
        </p>

        <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full text-xs font-bold border border-cream-200 bg-cream-50">
          <span>Trạng thái:</span>
          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${badge.bg}`}>
            {badge.text}
          </span>
        </div>
      </div>

      {/* SePay / VietQR Box */}
      {order.paymentMethod === "VietQR" && (
        <>
          {order.paymentStatus === "Paid" ? (
            /* ĐÃ THANH TOÁN THÀNH CÔNG */
            <div className="bg-emerald-50 rounded-3xl p-6 md:p-8 border border-emerald-200 shadow-md text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-emerald-900 flex items-center justify-center gap-2">
                <span>Đã Thanh Toán Thành Công Qua SePay VietQR!</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </h2>
              <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                Hệ thống SePay đã tự động xác nhận số tiền <strong>{formatCurrency(order.totalAmount)}</strong> cho mã đơn{" "}
                <strong className="font-mono">{order.orderCode}</strong>. Đơn hàng đang được bộ phận kho đóng gói và xếp lịch giao tận phòng.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                <span>Thời gian xác nhận: {formatDate(order.confirmedAt || order.createdAt)}</span>
              </div>
            </div>
          ) : (
            /* CHỜ THANH TOÁN (QR CODE & POLLING) */
            <div className="bg-gradient-to-r from-wood-50 via-cream-50 to-amber-50 rounded-3xl p-6 md:p-8 border border-wood-200 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wood-200/60 pb-4">
                <div className="flex items-center gap-2.5 text-wood-800">
                  <QrCode className="w-5 h-5 text-wood-600" />
                  <h2 className="text-base font-bold uppercase tracking-wide">
                    Thanh Toán Chuyển Khoản Qua VietQR Tự Động (SePay)
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-wood-700 self-start sm:self-auto">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wood-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-wood-600" />
                  </span>
                  <span>Đang đợi quét mã... (Tự động cập nhật)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* QR Image */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-wood-200 shadow-inner">
                  <div className="relative w-56 h-56">
                    <Image src={vietQrUrl} alt="Mã VietQR Thanh Toán" fill className="object-contain" priority />
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-2 text-center">
                    Mở ứng dụng Mobile Banking bất kỳ (VCB, MB, Techcombank, ACB...) và quét mã để thanh toán tức thì.
                  </p>
                </div>

                {/* Bank Transfer Details */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-cream-200">
                    <div>
                      <span className="text-charcoal-500 block">Ngân hàng thụ hưởng:</span>
                      <strong className="text-sm text-charcoal-900 font-bold">MB Bank (Quân Đội)</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-cream-200">
                    <div>
                      <span className="text-charcoal-500 block">Số tài khoản:</span>
                      <strong className="text-sm font-mono font-bold text-wood-700">{qrAccount}</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard(qrAccount, "Số tài khoản")}
                      className="p-1.5 rounded-lg bg-cream-100 hover:bg-wood-100 text-charcoal-700 transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-cream-200">
                    <div>
                      <span className="text-charcoal-500 block">Số tiền chính xác:</span>
                      <strong className="text-base font-bold text-wood-600">{formatCurrency(order.totalAmount)}</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard(qrAmount.toString(), "Số tiền")}
                      className="p-1.5 rounded-lg bg-cream-100 hover:bg-wood-100 text-charcoal-700 transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-cream-200">
                    <div>
                      <span className="text-charcoal-500 block">Nội dung chuyển khoản (bắt buộc):</span>
                      <strong className="text-xs font-mono font-bold text-charcoal-900">{qrDescription}</strong>
                    </div>
                    <button
                      onClick={() => copyToClipboard(qrDescription, "Nội dung chuyển khoản")}
                      className="p-1.5 rounded-lg bg-cream-100 hover:bg-wood-100 text-charcoal-700 transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nút giả lập thanh toán cho Môi trường Test / Dev */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={simulating}
                      className="w-full py-2 px-3 rounded-xl bg-wood-100 hover:bg-wood-200 text-wood-800 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-wood-300 transition-all disabled:opacity-50"
                    >
                      {simulating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      )}
                      <span>[Test Dev] Mô phỏng bắn Webhook SePay thanh toán ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Details & Delivery Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ordered items */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 pb-3 border-b border-cream-200">
            Sản phẩm đã đặt ({order.items.length})
          </h3>

          <div className="divide-y divide-cream-100 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex gap-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0 relative">
                  {item.imageUrl ? (
                    <Image src={getImageUrl(item.imageUrl)} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-cream-400 m-auto" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-charcoal-900 truncate">{item.productName}</h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">{item.variantName}</p>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-charcoal-600">
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </span>
                    <strong className="text-wood-600 font-bold">{formatCurrency(item.totalPrice)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="pt-4 border-t border-cream-200 space-y-2 text-xs text-charcoal-600">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-semibold text-charcoal-900">{formatCurrency(order.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold text-charcoal-900">
                {order.shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : formatCurrency(order.shippingFee)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Giảm giá voucher:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-charcoal-900 pt-3 border-t border-cream-200">
              <span>Tổng thanh toán:</span>
              <span className="text-xl text-wood-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Information Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 pb-3 border-b border-cream-200">
            Thông tin người nhận & Địa chỉ
          </h3>

          <div className="space-y-3 text-xs text-charcoal-700">
            <div>
              <span className="text-charcoal-500 block">Họ tên:</span>
              <strong className="text-charcoal-900 text-sm">{order.customerName}</strong>
            </div>

            <div>
              <span className="text-charcoal-500 block">Số điện thoại:</span>
              <strong className="text-charcoal-900">{order.customerPhone}</strong>
            </div>

            <div>
              <span className="text-charcoal-500 block">Email:</span>
              <strong className="text-charcoal-900">{order.customerEmail}</strong>
            </div>

            <div>
              <span className="text-charcoal-500 block">Địa chỉ giao lắp:</span>
              <strong className="text-charcoal-900">
                {order.shippingAddress}, {order.ward ? `${order.ward}, ` : ""}{order.district}, {order.province}
              </strong>
            </div>

            {order.installationNotes && (
              <div>
                <span className="text-charcoal-500 block">Ghi chú giao hàng & lắp đặt:</span>
                <p className="p-2.5 rounded-xl bg-cream-50 border border-cream-200 italic text-[11px]">
                  &quot;{order.installationNotes}&quot;
                </p>
              </div>
            )}

            <div>
              <span className="text-charcoal-500 block">Phương thức thanh toán:</span>
              <strong className="text-wood-700">
                {order.paymentMethod === "VietQR" ? "Chuyển khoản VietQR tự động (SePay)" : "Thanh toán khi nhận hàng (COD)"}
              </strong>
            </div>

            <div>
              <span className="text-charcoal-500 block">Thời gian đặt hàng:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-cream-200">
            <Link
              href="/"
              className="w-full py-2.5 bg-cream-100 hover:bg-wood-600 hover:text-white text-charcoal-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
