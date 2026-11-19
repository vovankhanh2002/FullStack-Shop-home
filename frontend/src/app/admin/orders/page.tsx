"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  MapPin,
  Phone,
  ArrowRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { Order, OrderStatus, ApiResponse, PagedResult } from "@/types";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  async function loadOrders() {
    try {
      setLoading(true);
      const url = statusFilter ? `/api/orders/admin?status=${statusFilter}` : "/api/orders/admin";
      const res = await api.get<ApiResponse<PagedResult<Order>>>(url);
      if (res.data?.data) {
        setOrders(res.data.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function handleAdvanceStatus(orderId: string, nextStatus: OrderStatus) {
    try {
      await api.put(`/api/orders/admin/${orderId}/status`, {
        orderStatus: nextStatus,
        paymentStatus: nextStatus === "Completed" ? "Paid" : undefined,
      });
      toast.success("Đã cập nhật trạng thái đơn hàng!");
      loadOrders();
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">
            Quản Lý Đơn Hàng & Giao Lắp
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Theo dõi tiến trình từ xác nhận đơn đến giao và hỗ trợ trải ga giường tận phòng
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-cream-200 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === "" ? "bg-wood-600 text-white font-bold" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter("Pending")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === "Pending" ? "bg-wood-600 text-white font-bold" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            Chờ xác nhận
          </button>
          <button
            onClick={() => setStatusFilter("Confirmed")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === "Confirmed" ? "bg-wood-600 text-white font-bold" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            Đã xác nhận
          </button>
          <button
            onClick={() => setStatusFilter("Delivering")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === "Delivering" ? "bg-wood-600 text-white font-bold" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            Đang giao lắp
          </button>
          <button
            onClick={() => setStatusFilter("Completed")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === "Completed" ? "bg-wood-600 text-white font-bold" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            Hoàn thành
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-cream-200">
            <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 mt-2">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-cream-200">
            <ShoppingBag className="w-12 h-12 text-cream-300 mx-auto mb-2" />
            <p className="text-xs text-charcoal-500">Không có đơn hàng nào trong mục này.</p>
          </div>
        ) : (
          orders.map((order) => {
            const badge = getOrderStatusBadge(order.orderStatus);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4 hover:border-wood-300 transition-all"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cream-100 text-xs">
                  <div>
                    <span className="text-charcoal-500">Mã đơn: </span>
                    <strong className="text-sm font-mono font-bold text-wood-700">{order.orderCode}</strong>
                    <span className="text-charcoal-400 mx-2">•</span>
                    <span className="text-charcoal-500">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-100 border border-cream-200">
                      {order.paymentMethod === "VietQR" ? "VietQR Tự Động" : "COD (Nhận hàng)"}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>

                {/* Delivery and Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-charcoal-700">
                  <div className="space-y-1">
                    <p className="font-bold text-charcoal-900 text-sm">{order.customerName}</p>
                    <p className="flex items-center gap-1.5 text-charcoal-600">
                      <Phone className="w-3.5 h-3.5 text-wood-600" />
                      <span>{order.customerPhone}</span>
                      <span className="text-charcoal-400">•</span>
                      <span>{order.customerEmail}</span>
                    </p>
                    <p className="flex items-start gap-1.5 text-charcoal-600">
                      <MapPin className="w-3.5 h-3.5 text-wood-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {order.shippingAddress}, {order.ward ? `${order.ward}, ` : ""}{order.district}, {order.province}
                      </span>
                    </p>
                    {order.installationNotes && (
                      <p className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] italic">
                        <strong>Ghi chú giao lắp:</strong> &quot;{order.installationNotes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Items preview */}
                  <div className="space-y-1.5 bg-cream-50 p-3 rounded-2xl border border-cream-200">
                    <span className="font-bold text-[11px] text-charcoal-500 uppercase tracking-wider block">
                      Chi tiết sản phẩm ({order.items.length})
                    </span>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="truncate max-w-xs">
                          {item.quantity}x {item.productName} ({item.variantName})
                        </span>
                        <strong className="text-charcoal-900">{formatCurrency(item.totalPrice)}</strong>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-cream-200 flex justify-between font-bold text-xs text-wood-700">
                      <span>Tổng tiền:</span>
                      <span className="text-sm">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="pt-3 border-t border-cream-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-charcoal-500">
                    Cập nhật tiến trình:
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.orderStatus === "Pending" && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, "Confirmed")}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                      >
                        ✓ Xác Nhận Đơn Hàng
                      </button>
                    )}

                    {order.orderStatus === "Confirmed" && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, "Packing")}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Bắt Đầu Đóng Gói</span>
                      </button>
                    )}

                    {order.orderStatus === "Packing" && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, "Delivering")}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Bàn Giao Giao & Lắp Đặt</span>
                      </button>
                    )}

                    {order.orderStatus === "Delivering" && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, "Completed")}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã Hoàn Thành Giao Hàng</span>
                      </button>
                    )}

                    {order.orderStatus !== "Completed" && order.orderStatus !== "Cancelled" && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, "Cancelled")}
                        className="px-3 py-1.5 border border-cream-300 hover:bg-rose-50 hover:text-rose-600 text-charcoal-600 rounded-xl transition-colors font-medium"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
