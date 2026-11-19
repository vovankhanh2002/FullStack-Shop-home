"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  Package,
  Shield,
} from "lucide-react";
import { Topbar } from "./topbar";
import { LiveSearch } from "./live-search";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItemsCount());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();

  const navLinks = [
    { name: "Trang Chủ", href: "/" },
    { name: "Chăn Ga Gối", href: "/products?category=chan-ga-goi" },
    { name: "Nệm Cao Cấp", href: "/products?category=nem-ngu" },
    { name: "Gối & Ruột Chăn", href: "/products?category=goi-ruot-chan" },
    { name: "Giường Ngủ", href: "/products?category=giuong-ngu" },
    { name: "Đèn & Decor", href: "/products?category=decor-phong-ngu" },
    { name: "Mua Theo Không Gian", href: "/lookbook", highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 transition-all">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 text-charcoal-700 hover:text-wood-600 transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex flex-col flex-shrink-0 group">
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-wood-600 group-hover:text-wood-700 transition-colors">
            Shop<span className="text-charcoal-900 font-sans italic font-normal">Home</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-charcoal-500 font-sans font-medium -mt-1">
            Bedding & Decor
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
          <LiveSearch />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Wishlist */}
          <Link
            href="/products"
            className="relative p-2 text-charcoal-700 hover:text-wood-600 rounded-full hover:bg-cream-100 transition-colors"
            title="Danh sách yêu thích"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-cream-100 text-charcoal-700 transition-colors text-xs font-semibold"
                >
                  <div className="w-7 h-7 rounded-full bg-wood-500 text-white flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 hidden sm:inline-block" />
                </button>

                {userDropdownOpen && (
                  <div
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 text-xs text-charcoal-700 animate-in fade-in"
                  >
                    <div className="px-3 py-2 border-b border-cream-100">
                      <p className="font-bold text-charcoal-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-charcoal-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-cream-100 transition-colors"
                    >
                      <Package className="w-4 h-4 text-wood-600" />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-cream-100 text-wood-600 font-bold transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Quản trị hệ thống (Admin)</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors border-t border-cream-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-charcoal-700 hover:text-wood-600 hover:bg-cream-100 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3 py-2 bg-wood-600 hover:bg-wood-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
            aria-label="Giỏ hàng"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-charcoal-950 text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold">Giỏ hàng</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <LiveSearch />
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:block border-t border-cream-200/60 bg-cream-50/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`py-1.5 transition-colors relative flex items-center gap-1 ${
                  active ? "text-wood-600 font-bold" : "hover:text-wood-600"
                } ${link.highlight ? "text-wood-600" : ""}`}
              >
                {link.highlight && <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                <span>{link.name}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-wood-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-200 bg-white p-4 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-semibold text-charcoal-800 hover:bg-cream-100 hover:text-wood-600"
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-wood-600 hover:bg-wood-50"
            >
              🛡️ Quản trị Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
