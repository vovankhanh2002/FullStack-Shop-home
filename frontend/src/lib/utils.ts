import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus, PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getOrderStatusBadge(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return { text: "Chờ xác nhận", bg: "bg-amber-100 text-amber-800 border-amber-200" };
    case "Confirmed":
      return { text: "Đã xác nhận", bg: "bg-blue-100 text-blue-800 border-blue-200" };
    case "Packing":
      return { text: "Đang đóng gói", bg: "bg-purple-100 text-purple-800 border-purple-200" };
    case "Delivering":
      return { text: "Đang giao lắp", bg: "bg-cyan-100 text-cyan-800 border-cyan-200" };
    case "Completed":
      return { text: "Hoàn thành", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "Cancelled":
      return { text: "Đã hủy", bg: "bg-rose-100 text-rose-800 border-rose-200" };
    default:
      return { text: status, bg: "bg-zinc-100 text-zinc-800 border-zinc-200" };
  }
}

export function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "Paid":
      return { text: "Đã thanh toán", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "Pending":
      return { text: "Chờ thanh toán", bg: "bg-amber-100 text-amber-800 border-amber-200" };
    case "Failed":
      return { text: "Thất bại", bg: "bg-rose-100 text-rose-800 border-rose-200" };
    case "Refunded":
      return { text: "Đã hoàn tiền", bg: "bg-zinc-100 text-zinc-800 border-zinc-200" };
    default:
      return { text: status, bg: "bg-zinc-100 text-zinc-800 border-zinc-200" };
  }
}

export function getImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000&auto=format&fit=crop";
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
  return `${apiUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

