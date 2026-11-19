"use client";

import { useEffect, useState } from "react";
import { Sparkles, Bed, Lamp, Heart } from "lucide-react";
import { HotspotLookbook } from "@/components/hotspot-lookbook";
import { api } from "@/lib/api";
import { Lookbook, ApiResponse, HotspotPoint } from "@/types";

export default function LookbookPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [lookRes, prodRes] = await Promise.all([
          api.get<ApiResponse<Lookbook[]>>("/api/lookbooks"),
          api.get<ApiResponse<any>>("/api/products?pageSize=20"),
        ]);
        if (lookRes.data?.data) {
          setLookbooks(lookRes.data.data);
        }
        if (prodRes.data?.data?.items) {
          setProducts(prodRes.data.data.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const p1 = products.find((p) => p.slug === "bo-chan-ga-tencel-60s-eco-silk-sand-beige");
  const p2 = products.find((p) => p.slug === "goi-foam-cong-thai-hoc-ergorest");
  const p3 = products.find((p) => p.slug === "den-ngu-than-gom-ceramic-glow");
  const pNavy = products.find((p) => p.slug === "bo-ga-giuong-cotton-satin-hoang-gia-royal-navy");
  const pChangi = products.find((p) => p.slug === "ruot-chan-long-vu-nhan-tao-microfiber-soft");

  const defaultLookbookData = {
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop",
    title: "Không Gian Phòng Ngủ Master Warm Scandinavian",
    subtitle: "Sự kết hợp hoàn hảo giữa chất liệu lụa Tencel mềm mát và ánh đèn gốm ấm áp dịu mắt",
    hotspots: [
      {
        id: 1,
        productId: p1?.id,
        title: "Bộ Chăn Ga Tencel 60s Eco Silk - Sand Beige",
        price: 2450000,
        slug: "bo-chan-ga-tencel-60s-eco-silk-sand-beige",
        topPercent: 62,
        leftPercent: 48,
      },
      {
        id: 2,
        productId: p2?.id,
        title: "Gối Foam Công Thái Học Nâng Đỡ Đốt Sống Cổ - ErgoRest",
        price: 650000,
        slug: "goi-foam-cong-thai-hoc-ergorest",
        topPercent: 42,
        leftPercent: 38,
      },
      {
        id: 3,
        productId: p3?.id,
        title: "Đèn Ngủ Thân Gốm Tỏa Sáng Dịu Mắt - Ceramic Glow",
        price: 580000,
        slug: "den-ngu-than-gom-ceramic-glow",
        topPercent: 35,
        leftPercent: 82,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood-100 text-wood-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Lookbook & Cảm Hứng Phòng Ngủ</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal-900">
          Mua Theo Không Gian • Shop The Look
        </h1>
        <p className="text-xs md:text-sm text-charcoal-600 leading-relaxed">
          Không cần tốn thời gian tự phối đồ. Các chuyên gia nội thất của ShopHome đã thiết kế sẵn các không gian phòng ngủ đồng bộ từ màu sắc, chất liệu chăn ga đến ánh sáng dịu êm.
        </p>
      </div>

      {/* Main Interactive Lookbook */}
      <HotspotLookbook
        lookbookImage={defaultLookbookData.image}
        title={defaultLookbookData.title}
        subtitle={defaultLookbookData.subtitle}
        hotspots={defaultLookbookData.hotspots}
      />

      {/* Second Lookbook Idea */}
      <HotspotLookbook
        lookbookImage="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?q=80&w=1200&auto=format&fit=crop"
        title="Không Gian Phòng Ngủ Khách Sạn 5 Sao - Royal Navy"
        subtitle="Tone màu xanh Navy trầm tĩnh mang đến cảm giác thư thái và đẳng cấp sang trọng"
        hotspots={[
          {
            id: 1,
            productId: pNavy?.id,
            title: "Bộ Ga Giường Cotton Satin Hoàng Gia - Royal Navy",
            price: 1890000,
            slug: "bo-ga-giuong-cotton-satin-hoang-gia-royal-navy",
            topPercent: 65,
            leftPercent: 50,
          },
          {
            id: 2,
            productId: pChangi?.id,
            title: "Ruột Chăn Lông Vũ Nhân Tạo 4 Mùa - Microfiber Soft",
            price: 1250000,
            slug: "ruot-chan-long-vu-nhan-tao-microfiber-soft",
            topPercent: 55,
            leftPercent: 75,
          },
        ]}
      />
    </div>
  );
}
