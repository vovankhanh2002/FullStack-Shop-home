"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/login", {
        email: email.trim(),
        password,
      });

      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        setAuth(user, accessToken, refreshToken);
        toast.success(`Chào mừng ${user.fullName} đã đăng nhập thành công!`);
        router.push(callbackUrl);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(testEmail: string, testPass: string) {
    setEmail(testEmail);
    setPassword(testPass);
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
          <h1 className="text-lg font-bold text-charcoal-900">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-charcoal-500">
            Truy cập tài khoản để theo dõi đơn hàng và ưu đãi dành riêng cho bạn
          </p>
        </div>

        {/* Quick Fill Buttons */}
        <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
          <p className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider text-center">
            ⚡ Tài khoản mẫu thử nghiệm (1-Click điền):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickFill("admin@shophome.vn", "Admin@123")}
              className="py-1.5 px-2 bg-white hover:bg-wood-50 border border-cream-300 rounded-xl text-[11px] font-semibold text-wood-700 flex items-center justify-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => quickFill("khachhang@shophome.vn", "Khach@123")}
              className="py-1.5 px-2 bg-white hover:bg-wood-50 border border-cream-300 rounded-xl text-[11px] font-semibold text-charcoal-700 flex items-center justify-center gap-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Khách Hàng</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shophome.vn"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-cream-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-charcoal-800 mb-1">Mật khẩu</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? "Đang xác thực..." : "Đăng Nhập"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-cream-200">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-wood-600 font-bold hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
