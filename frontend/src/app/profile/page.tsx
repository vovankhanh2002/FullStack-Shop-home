"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, Mail, Phone, LogOut, ArrowRight, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";
import { Order, ApiResponse } from "@/types";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/profile");
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<Order[]>>("/api/orders/my-orders");
        if (res.data?.data) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-wood-600 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-charcoal-900">{user.fullName}</h1>
            <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
            {user.phoneNumber && (
              <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{user.phoneNumber}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="px-4 py-2 border border-cream-300 hover:bg-rose-50 hover:text-rose-600 text-charcoal-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Orders History Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-wood-600" />
            <h2 className="text-base font-bold text-charcoal-900">Lịch sử đơn hàng của bạn</h2>
          </div>
          <span className="text-xs text-charcoal-500">{orders.length} đơn hàng</span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 mt-2">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Package className="w-12 h-12 text-cream-300 mx-auto" />
            <p className="text-xs text-charcoal-500">Bạn chưa có đơn hàng nào tại ShopHome.</p>
            <Link
              href="/products"
              className="inline-block px-5 py-2 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700 transition-colors"
            >
              Khám phá sản phẩm chăn ga ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = getOrderStatusBadge(order.orderStatus);
              return (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-cream-200 hover:border-wood-300 transition-all bg-cream-50/50 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cream-200 text-xs">
                    <div>
                      <span className="text-charcoal-500">Mã đơn: </span>
                      <strong className="text-wood-700 font-mono font-bold">{order.orderCode}</strong>
                      <span className="text-charcoal-400 mx-2">•</span>
                      <span className="text-charcoal-500">{formatDate(order.createdAt)}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.bg}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5 text-xs text-charcoal-700">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="truncate max-w-md">
                          {item.quantity}x {item.productName} ({item.variantName})
                        </span>
                        <span className="font-semibold text-charcoal-900">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs">
                    <div>
                      <span className="text-charcoal-500">Tổng thanh toán: </span>
                      <strong className="text-sm font-bold text-wood-600">
                        {formatCurrency(order.totalAmount)}
                      </strong>
                    </div>

                    <Link
                      href={`/orders/${order.orderCode}`}
                      className="px-3.5 py-1.5 bg-white border border-cream-300 hover:border-wood-500 hover:text-wood-600 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Xem chi tiết đơn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
