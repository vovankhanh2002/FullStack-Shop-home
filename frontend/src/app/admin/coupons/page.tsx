"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { Coupon, ApiResponse } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"Percentage" | "FixedAmount">("Percentage");
  const [value, setValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(1000000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(300000);
  const [usageLimit, setUsageLimit] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  async function loadCoupons() {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Coupon[]>>("/api/coupons");
      if (res.data?.data) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setSubmitting(true);
      await api.post("/api/coupons", {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        value: Number(value),
        minOrderValue: Number(minOrderValue),
        maxDiscountAmount: discountType === "Percentage" ? Number(maxDiscountAmount) : null,
        usageLimit: Number(usageLimit),
        isActive: true,
      });

      toast.success("Tạo mã giảm giá thành công!");
      setCode("");
      setDescription("");
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tạo mã giảm giá.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCoupon(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;

    try {
      await api.delete(`/api/coupons/${id}`);
      toast.success("Đã xóa mã giảm giá!");
      loadCoupons();
    } catch (err) {
      toast.error("Không thể xóa mã giảm giá.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Quản Lý Mã Giảm Giá & Voucher</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">Tạo các chương trình khuyến mãi chăn ga, nệm và combo tân hôn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-wood-600" />
            <span>Tạo Voucher Mới</span>
          </h2>

          <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-charcoal-800 mb-1">Mã giảm giá *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Vd: TANHON500"
                className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-800 mb-1">Mô tả hiển thị</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vd: Giảm 10% tối đa 300.000đ cho đơn chăn ga"
                className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Loại giảm</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-white"
                >
                  <option value="Percentage">Theo phần trăm (%)</option>
                  <option value="FixedAmount">Số tiền cố định (VNĐ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Giá trị giảm</label>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder={discountType === "Percentage" ? "10" : "200000"}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Đơn tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-800 mb-1">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Lưu Mã Giảm Giá"}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 pb-3 border-b border-cream-200">
            Voucher đang kích hoạt ({coupons.length})
          </h2>

          <div className="divide-y divide-cream-100">
            {coupons.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-wood-700 px-2.5 py-0.5 bg-wood-50 border border-wood-200 rounded-lg">
                      {c.code}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {c.discountType === "Percentage" ? `Giảm ${c.value}%` : `Giảm ${formatCurrency(c.value)}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-600 mt-1">{c.description}</p>
                  <p className="text-[10px] text-charcoal-400 mt-0.5">
                    Đơn tối thiểu: {formatCurrency(c.minOrderValue)} • Đã dùng: {c.usageCount}/{c.usageLimit}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Xóa voucher"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
