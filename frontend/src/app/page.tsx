"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  Moon,
  Truck,
  CheckCircle2,
  Star,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { HotspotLookbook } from "@/components/hotspot-lookbook";
import { QuickViewModal } from "@/components/quick-view-modal";
import { api } from "@/lib/api";
import { ProductList, Category, ApiResponse, PagedResult, HotspotPoint } from "@/types";
import { formatCurrency, getImageUrl } from "@/lib/utils";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductList[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<ProductList[]>([]);
  const [activeTab, setActiveTab] = useState<"featured" | "new" | "flash">("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);

  // Hotspots for "Shop the Look"
  const [hotspots, setHotspots] = useState<HotspotPoint[]>([
    {
      id: 1,
      title: "Bộ Chăn Ga Tencel 60s Eco Silk - Sand Beige",
      price: 2450000,
      slug: "bo-chan-ga-tencel-60s-eco-silk-sand-beige",
      topPercent: 62,
      leftPercent: 48,
    },
    {
      id: 2,
      title: "Gối Foam Công Thái Học Nâng Đỡ Đốt Sống Cổ - ErgoRest",
      price: 650000,
      slug: "goi-foam-cong-thai-hoc-ergorest",
      topPercent: 42,
      leftPercent: 38,
    },
    {
      id: 3,
      title: "Đèn Ngủ Thân Gốm Tỏa Sáng Dịu Mắt - Ceramic Glow",
      price: 580000,
      slug: "den-ngu-than-gom-ceramic-glow",
      topPercent: 35,
      leftPercent: 82,
    },
  ]);

  // Flash Sale countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get<ApiResponse<Category[]>>("/api/categories"),
          api.get<ApiResponse<PagedResult<ProductList>>>("/api/products?pageSize=12"),
        ]);

        if (catRes.data?.data) {
          setCategories(catRes.data.data);
        }

        if (prodRes.data?.data) {
          const all = prodRes.data.data.items;
          setFeaturedProducts(all.filter((p) => p.isFeatured));
          setFlashSaleProducts(all.filter((p) => p.isFlashSale));

          // Bind real Product IDs to hotspots
          setHotspots((prev) =>
            prev.map((h) => {
              const matched = all.find((p) => p.slug === h.slug);
              return matched ? { ...h, productId: matched.id } : h;
            })
          );
        }
      } catch (err) {
        console.error("Lỗi nạp dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter items based on active tab
  const displayedProducts =
    activeTab === "featured"
      ? featuredProducts
      : activeTab === "new"
      ? featuredProducts.filter((p) => p.isNew)
      : flashSaleProducts;

  // Default hotspots for "Shop the Look"
  const defaultHotspots: HotspotPoint[] = [
    {
      id: 1,
      title: "Bộ Chăn Ga Tencel 60s Eco Silk - Sand Beige",
      price: 2450000,
      slug: "bo-chan-ga-tencel-60s-eco-silk-sand-beige",
      topPercent: 62,
      leftPercent: 48,
    },
    {
      id: 2,
      title: "Gối Foam Công Thái Học Nâng Đỡ Đốt Sống Cổ - ErgoRest",
      price: 650000,
      slug: "goi-foam-cong-thai-hoc-ergorest",
      topPercent: 42,
      leftPercent: 38,
    },
    {
      id: 3,
      title: "Đèn Ngủ Thân Gốm Tỏa Sáng Dịu Mắt - Ceramic Glow",
      price: 580000,
      slug: "den-ngu-than-gom-ceramic-glow",
      topPercent: 35,
      leftPercent: 82,
    },
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. Hero Lookbook Slider Banner */}
      <section className="relative bg-cream-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wood-100 text-wood-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Bộ Sưu Tập Thu Đông 2026</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-900 leading-[1.15]">
              Nâng Niu Giấc Ngủ <br />
              <span className="text-wood-600 italic font-normal">Trong Từng Thớ Vải Tencel</span>
            </h1>

            <p className="text-sm md:text-base text-charcoal-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Khám phá không gian phòng ngủ chuẩn Scandinavian với chất liệu Tencel 60s sinh học siêu mịn màng, nệm cao su thiên nhiên nâng đỡ 7 vùng cột sống.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/products?category=chan-ga-goi"
                className="px-6 py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs md:text-sm rounded-full shadow-lg hover:shadow-xl transition-all transform active:scale-95"
              >
                Khám Phá Bộ Sưu Tập
              </Link>
              <Link
                href="/lookbook"
                className="px-6 py-3 bg-white hover:bg-cream-100 text-charcoal-800 font-bold text-xs md:text-sm rounded-full border border-cream-300 shadow-sm transition-all"
              >
                Mua Theo Không Gian
              </Link>
            </div>

            {/* Quick stats */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-cream-300 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <p className="font-serif text-xl font-bold text-wood-600">100%</p>
                <p className="text-[11px] text-charcoal-500">Tencel sinh học</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-wood-600">10 Năm</p>
                <p className="text-[11px] text-charcoal-500">Bảo hành nệm</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-wood-600">30 Đêm</p>
                <p className="text-[11px] text-charcoal-500">Ngủ thử đổi trả</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop"
                alt="Phòng ngủ chuẩn Bắc Âu ShopHome"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-wood-600">Gợi ý không gian</p>
                  <p className="text-xs font-bold text-charcoal-900">Phòng ngủ Scandinavian Warm Sand</p>
                </div>
                <Link
                  href="/lookbook"
                  className="px-3 py-1.5 bg-wood-600 text-white text-[11px] font-bold rounded-lg hover:bg-wood-700 transition-colors"
                >
                  Xem ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Cards */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
            Danh Mục Chuyên Biệt
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500 mt-1">
            Mỗi chi tiết đều được chăm chút kỹ lưỡng cho tổ ấm của bạn
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl p-4 border border-cream-200 hover:border-wood-300 hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 bg-cream-100 relative border-2 border-cream-200 group-hover:border-wood-500 transition-colors">
                {cat.imageUrl && (
                  <Image
                    src={getImageUrl(cat.imageUrl)}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
              </div>
              <h3 className="text-xs md:text-sm font-bold text-charcoal-900 group-hover:text-wood-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">{cat.productCount} sản phẩm</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Countdown Section */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-wood-700 via-wood-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/20 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-charcoal-950 flex items-center justify-center font-bold">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wide">
                    Flash Sale Chăn Ga Giờ Vàng
                  </h2>
                  <p className="text-xs text-wood-100">Ưu đãi giảm sâu tới 35% duy nhất hôm nay</p>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-medium text-wood-100 mr-1">Kết thúc sau:</span>
                <span className="w-7 h-7 rounded-lg bg-white text-charcoal-950 font-bold font-mono text-xs flex items-center justify-center">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="font-bold">:</span>
                <span className="w-7 h-7 rounded-lg bg-white text-charcoal-950 font-bold font-mono text-xs flex items-center justify-center">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="font-bold">:</span>
                <span className="w-7 h-7 rounded-lg bg-amber-400 text-charcoal-950 font-bold font-mono text-xs flex items-center justify-center">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Product Tabs Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
              Sản Phẩm Tuyển Chọn
            </h2>
            <p className="text-xs md:text-sm text-charcoal-500 mt-1">
              Được yêu thích bởi hơn 10.000+ gia đình Việt Nam
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center p-1 bg-cream-200 rounded-full text-xs font-semibold">
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === "featured"
                  ? "bg-wood-600 text-white shadow-md"
                  : "text-charcoal-700 hover:text-wood-600"
              }`}
            >
              Nổi Bật Nhất
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === "new"
                  ? "bg-wood-600 text-white shadow-md"
                  : "text-charcoal-700 hover:text-wood-600"
              }`}
            >
              Hàng Mới Về
            </button>
            <button
              onClick={() => setActiveTab("flash")}
              className={`px-4 py-2 rounded-full transition-all ${
                activeTab === "flash"
                  ? "bg-wood-600 text-white shadow-md"
                  : "text-charcoal-700 hover:text-wood-600"
              }`}
            >
              Đang Giảm Giá
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-wood-600 text-wood-600 hover:bg-wood-600 hover:text-white font-bold text-xs md:text-sm transition-all"
          >
            <span>Xem Tất Cả Sản Phẩm Chăn Ga Gối Đệm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Interactive "Shop The Look" Lookbook Section */}
      <section className="max-w-7xl mx-auto px-4">
        <HotspotLookbook
          lookbookImage="https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop"
          title="Không Gian Phòng Ngủ Master Warm Scandinavian"
          subtitle="Sự kết hợp hoàn hảo giữa chất liệu lụa Tencel mềm mát và ánh đèn gốm ấm áp dịu mắt"
          hotspots={hotspots}
        />
      </section>

      {/* 6. Promotional Bedroom Bundle Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-cream-100 rounded-3xl p-8 border border-cream-200 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase">
              Combo Tiết Kiệm -15%
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
              Trọn Gói Phòng Ngủ Tân Hôn & Gia Đình Trẻ
            </h3>
            <p className="text-xs md:text-sm text-charcoal-600 leading-relaxed">
              Tiết kiệm ngay 1.500.000đ khi sắm đồng bộ: 01 Bộ chăn ga Tencel 60s + 01 Nệm cao su thiên nhiên 15cm + 02 Gối công thái học chống mỏi cổ. Miễn phí vận chuyển và hỗ trợ trải ga tận giường!
            </p>
            <div className="space-y-2 text-xs text-charcoal-700">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đồng bộ màu sắc & chất liệu sang trọng chuẩn khách sạn 5 sao</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tặng kèm 01 vỏ gối ôm đồng bộ trị giá 350.000đ</span>
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products/bo-chan-ga-tencel-60s-eco-silk-sand-beige"
                className="inline-flex items-center gap-2 px-6 py-3 bg-wood-600 hover:bg-wood-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition-all"
              >
                <span>Xem Ngay Combo Ưu Đãi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?q=80&w=1000&auto=format&fit=crop"
              alt="Combo phòng ngủ gia đình"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews / Testimonials */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
            Khách Hàng Nói Gì Về ShopHome
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500 mt-1">
            Đánh giá chân thực từ những người đã trải nghiệm giấc ngủ ngon cùng chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Chị Minh Thư (Thảo Điền, Q.2)",
              product: "Bộ Chăn Ga Tencel 60s Sand Beige",
              comment:
                "Vải sờ vào mướt và mát lịm luôn, nằm phòng máy lạnh không bị bí da. Cả nhà mình từ ngày đổi qua ga này ngủ ngon giấc hẳn. Nhân viên giao hàng rất lịch sự!",
              rating: 5,
            },
            {
              name: "Anh Hoàng Nam (Vinhomes Smart City)",
              product: "Nệm Cao Su Thiên Nhiên PureRest 15cm",
              comment:
                "Mình bị đau lưng kinh niên, nằm nệm cao su này 2 tuần thấy đỡ hẳn. Nệm đàn hồi vừa phải, không bị lún trũng. Chính sách ngủ thử 30 đêm làm mình rất yên tâm.",
              rating: 5,
            },
            {
              name: "Cô Bích Ngọc (Ba Đình, Hà Nội)",
              product: "Gối Công Thái Học & Ruột Chăn Lông Vũ",
              comment:
                "Gối lượn sóng ôm trọn phần gáy, sáng dậy không còn bị cứng cổ. Chăn siêu nhẹ mà rất ấm. Sẽ tiếp tục ủng hộ ShopHome cho phòng ngủ của các cháu!",
              rating: 5,
            },
          ].map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed italic mb-4">
                  &quot;{rev.comment}&quot;
                </p>
              </div>
              <div className="pt-3 border-t border-cream-100">
                <p className="text-xs font-bold text-charcoal-900">{rev.name}</p>
                <p className="text-[11px] text-wood-600 font-medium">{rev.product}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
