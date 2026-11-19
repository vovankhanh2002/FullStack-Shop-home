"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  ArrowLeft,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check admin authority
    if (!isAuthenticated || !isAdmin) {
      router.push("/login?callbackUrl=/admin");
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { name: "Tổng Quan (Dashboard)", href: "/admin", icon: LayoutDashboard },
    { name: "Quản Lý Sản Phẩm", href: "/admin/products", icon: Package },
    { name: "Đơn Hàng & Giao Lắp", href: "/admin/orders", icon: ShoppingBag },
    { name: "Danh Mục", href: "/admin/categories", icon: Layers },
    { name: "Mã Giảm Giá", href: "/admin/coupons", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-cream-200 p-5 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold text-wood-600">
                Shop<span className="text-charcoal-900 font-sans italic font-normal">Home</span>
              </span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-wood-100 text-wood-700 text-[10px] font-bold uppercase tracking-wider mt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Portal</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-wood-600 text-white shadow-md font-bold"
                      : "text-charcoal-700 hover:bg-cream-100 hover:text-wood-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Store link */}
        <div className="pt-6 border-t border-cream-200 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-charcoal-600 hover:bg-cream-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Cửa Hàng (Storefront)</span>
          </Link>

          <div className="p-3 bg-cream-50 rounded-2xl flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-bold text-charcoal-900 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-charcoal-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="p-1 text-charcoal-500 hover:text-rose-600"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
