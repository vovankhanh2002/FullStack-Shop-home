"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats, ApiResponse } from "@/types";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<DashboardStats>>("/api/admin/dashboard");
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-charcoal-500 mt-2">Đang tải số liệu thống kê...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Sản phẩm hoạt động",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "bg-wood-100 text-wood-700",
    },
    {
      title: "Khách hàng đăng ký",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
          Bảng Điều Khiển Quản Trị
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Theo dõi doanh số, tiến độ giao lắp chăn ga gối đệm và đơn hàng thời gian thực
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-charcoal-500 block">{kpi.title}</span>
                <strong className="text-xl md:text-2xl font-bold text-charcoal-900 mt-1 block">
                  {kpi.value}
                </strong>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue 7-Day Chart */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-wood-600" />
            <h2 className="text-sm font-bold text-charcoal-900">Biểu đồ doanh thu 7 ngày gần nhất</h2>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48">
          {stats.revenueChart.map((day, idx) => {
            const maxRev = Math.max(...stats.revenueChart.map((d) => d.revenue), 10000000);
            const heightPercent = Math.max(10, Math.min(100, (day.revenue / maxRev) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono font-bold text-wood-600">
                  {day.revenue > 0 ? `${(day.revenue / 1000000).toFixed(1)}M` : "0"}
                </span>
                <div className="w-full max-w-[40px] bg-cream-200 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    className="w-full bg-wood-500 hover:bg-wood-600 transition-all rounded-t-xl"
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)} (${day.orders} đơn)`}
                  />
                </div>
                <span className="text-[11px] font-medium text-charcoal-600">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900">
            Đơn hàng mới nhất
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-wood-600 hover:text-wood-700 font-bold flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-50 text-charcoal-600 font-semibold border-b border-cream-200">
              <tr>
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Khách hàng</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Thanh toán</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {stats.recentOrders.map((order) => {
                const badge = getOrderStatusBadge(order.orderStatus);
                return (
                  <tr key={order.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-wood-700">{order.orderCode}</td>
                    <td className="p-3">
                      <p className="font-semibold text-charcoal-900">{order.customerName}</p>
                      <p className="text-[11px] text-charcoal-500">{order.customerPhone}</p>
                    </td>
                    <td className="p-3 font-bold text-charcoal-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-100 border border-cream-300">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="p-3 text-charcoal-500">{formatDate(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
