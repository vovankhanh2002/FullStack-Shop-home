import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ShopHome - Nội Thất, Chăn Ga Gối Đệm & Decor Phòng Ngủ",
  description: "Trải nghiệm không gian phòng ngủ chuẩn Scandinavian. Chăn ga Tencel 60s, nệm cao su thiên nhiên 100%, gối công thái học và giường gỗ sồi nhập khẩu.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-wood-200 selection:text-wood-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster position="top-right" richColors closeButton theme="light" />
      </body>
    </html>
  );
}
