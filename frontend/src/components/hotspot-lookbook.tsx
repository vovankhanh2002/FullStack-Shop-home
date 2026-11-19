"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { HotspotPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";

interface HotspotLookbookProps {
  lookbookImage: string;
  title: string;
  subtitle: string;
  hotspots: HotspotPoint[];
}

export function HotspotLookbook({
  lookbookImage,
  title,
  subtitle,
  hotspots,
}: HotspotLookbookProps) {
  const [activeHotspot, setActiveHotspot] = useState<HotspotPoint | null>(hotspots[0] || null);
  const addItem = useCartStore((state) => state.addItem);

  function handleAddHotspotProduct(hotspot: HotspotPoint, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!hotspot.productId) {
      toast.error("Đang nạp dữ liệu sản phẩm, vui lòng mở trang chi tiết để chọn kích thước!");
      return;
    }

    addItem({
      productId: hotspot.productId,
      productName: hotspot.title,
      productSlug: hotspot.slug,
      imageUrl: lookbookImage,
      size: "Tiêu chuẩn",
      colorName: "Mặc định",
      colorHex: "#D4A373",
      unitPrice: hotspot.price,
      originalPrice: hotspot.price * 1.25,
    });

    toast.success(`Đã thêm "${hotspot.title}" vào giỏ hàng!`);
  }

  function handleBuyEntireLook() {
    const validHotspots = hotspots.filter((h) => !!h.productId);
    if (validHotspots.length === 0) {
      toast.error("Đang đồng bộ sản phẩm, vui lòng bấm vào từng sản phẩm để chọn kích thước!");
      return;
    }

    validHotspots.forEach((h) => {
      addItem({
        productId: h.productId!,
        productName: h.title,
        productSlug: h.slug,
        imageUrl: lookbookImage,
        size: "Tiêu chuẩn",
        colorName: "Mặc định",
        colorHex: "#D4A373",
        unitPrice: h.price,
        originalPrice: h.price * 1.25,
      });
    });
    toast.success("Đã thêm các sản phẩm trong không gian vào giỏ hàng!");
  }

  const totalBundlePrice = hotspots.reduce((sum, h) => sum + h.price, 0);

  return (
    <div className="bg-cream-100 rounded-3xl p-4 md:p-8 border border-cream-200">
      <div className="mb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood-100 text-wood-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Shop The Look • Mua Theo Không Gian</span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">{title}</h2>
        <p className="text-xs md:text-sm text-charcoal-600 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Side: Lookbook with Hotspots */}
        <div className="lg:col-span-7 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-cream-300 group">
          <Image
            src={lookbookImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-102"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />

          {/* Hotspot Pins */}
          {hotspots.map((point) => {
            const isActive = activeHotspot?.id === point.id;
            return (
              <div
                key={point.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ top: `${point.topPercent}%`, left: `${point.leftPercent}%` }}
              >
                {/* Pin button with pulsating ripple */}
                <button
                  type="button"
                  onClick={() => setActiveHotspot(point)}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-transform ${
                    isActive ? "scale-125" : "hover:scale-110"
                  }`}
                  aria-label={point.title}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-wood-400 opacity-75 animate-ping" />
                  <span
                    className={`relative inline-flex items-center justify-center rounded-full w-7 h-7 text-xs font-bold shadow-lg transition-colors ${
                      isActive ? "bg-wood-600 text-white" : "bg-white text-wood-700 hover:bg-wood-50"
                    }`}
                  >
                    +
                  </span>
                </button>

                {/* Floating tooltip preview */}
                {isActive && (
                  <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-xl border border-cream-200 z-30 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-xs font-bold text-charcoal-900 line-clamp-1">{point.title}</p>
                    <p className="text-xs font-semibold text-wood-600 mt-0.5">{formatCurrency(point.price)}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Link
                        href={`/products/${point.slug}`}
                        className="flex-1 py-1 text-center bg-cream-100 hover:bg-cream-200 text-[10px] font-semibold text-charcoal-700 rounded-lg transition-colors"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={(e) => handleAddHotspotProduct(point, e)}
                        className="p-1 bg-wood-600 hover:bg-wood-700 text-white rounded-lg transition-colors"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingBag className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: Products in this Look */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-2xl p-5 md:p-6 border border-cream-200 shadow-sm h-full">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-900">
                Sản phẩm trong không gian ({hotspots.length})
              </h3>
              <span className="text-xs text-wood-600 font-medium">Bấm vào điểm chạm để chọn</span>
            </div>

            <div className="space-y-3">
              {hotspots.map((point) => {
                const isSelected = activeHotspot?.id === point.id;
                return (
                  <div
                    key={point.id}
                    onClick={() => setActiveHotspot(point)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-wood-500 bg-wood-50/50 ring-1 ring-wood-400"
                        : "border-cream-200 hover:border-cream-300 hover:bg-cream-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? "bg-wood-600 text-white" : "bg-cream-200 text-charcoal-600"
                        }`}
                      >
                        {point.id}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-charcoal-900 line-clamp-1">{point.title}</h4>
                        <span className="text-xs font-semibold text-wood-600">{formatCurrency(point.price)}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddHotspotProduct(point, e)}
                      className="p-1.5 rounded-lg bg-cream-100 hover:bg-wood-600 hover:text-white text-wood-600 transition-colors"
                      title="Thêm vào giỏ"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bundle Action */}
          <div className="pt-6 border-t border-cream-200 mt-6">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-charcoal-600">Trọn bộ không gian:</span>
              <span className="text-base font-bold text-wood-600">{formatCurrency(totalBundlePrice)}</span>
            </div>

            <button
              onClick={handleBuyEntireLook}
              className="w-full py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Mua Trọn Bộ Không Gian Phòng Ngủ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
