"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Phone, MapPin, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    try {
      setLoading(true);
      const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });

      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        setAuth(user, accessToken, refreshToken);
        toast.success(`Đăng ký thành công! Chào mừng ${user.fullName} đến với ShopHome.`);
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-cream-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-bold text-wood-600">
              Shop<span className="text-charcoal-900 font-sans italic font-normal">Home</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-charcoal-900">Đăng Ký Tài Khoản</h1>
          <p className="text-xs text-charcoal-500">
            Trải nghiệm dịch vụ chăm sóc giấc ngủ tận tâm từ ShopHome
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Họ và tên *</label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Mật khẩu *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912345678"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Địa chỉ giao hàng</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, quận huyện..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 mt-4"
          >
            <span>{loading ? "Đang tạo tài khoản..." : "Đăng Ký"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-cream-200">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-wood-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
