"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Moon,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { ProductDetail, ProductVariant, ApiResponse } from "@/types";
import { formatCurrency, formatDate, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { toast } from "sonner";

interface ProductDetailClientProps {
  slug: string;
  initialProduct?: ProductDetail | null;
}

export function ProductDetailClient({ slug, initialProduct }: ProductDetailClientProps) {
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(initialProduct || null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    initialProduct?.variants && initialProduct.variants.length > 0 ? initialProduct.variants[0] : null
  );
  const [activeImage, setActiveImage] = useState<string>(initialProduct?.primaryImageUrl || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "care" | "warranty" | "reviews">("desc");
  const [loading, setLoading] = useState<boolean>(!initialProduct);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  useEffect(() => {
    async function loadProduct() {
      if (initialProduct && initialProduct.slug === slug) {
        return;
      }
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<ProductDetail>>(`/api/products/${slug}`);
        if (res.data?.data) {
          const p = res.data.data;
          setProduct(p);
          setActiveImage(p.primaryImageUrl);
          if (p.variants && p.variants.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadProduct();
    }
  }, [slug, initialProduct]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Không tìm thấy sản phẩm</h1>
        <p className="text-xs text-charcoal-500 mt-2">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị ẩn.</p>
        <Link
          href="/products"
          className="mt-6 inline-block px-6 py-2.5 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700"
        >
          Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const displayPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const discountPercent =
    displayOriginalPrice > displayPrice ? Math.round((1 - displayPrice / displayOriginalPrice) * 100) : 0;

  // Trích xuất danh sách kích thước và màu sắc duy nhất
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ name: v.colorName, hex: v.colorHex })))
  ).map((str) => JSON.parse(str) as { name: string; hex: string });

  function handleAddToCart() {
    if (!product) return;

    addItem(
      {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: selectedVariant?.imageUrl || activeImage,
        variantId: selectedVariant?.id,
        size: selectedVariant?.size || "Tiêu chuẩn",
        colorName: selectedVariant?.colorName || "Mặc định",
        colorHex: selectedVariant?.colorHex || "#D4A373",
        unitPrice: displayPrice,
        originalPrice: displayOriginalPrice,
      },
      quantity
    );

    toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng!`);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  // Toàn bộ ảnh chi tiết và gallery
  const allImages = [
    product.primaryImageUrl,
    ...(product.images ? product.images.map((i) => i.imageUrl) : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-charcoal-500 mb-6">
        <Link href="/" className="hover:text-wood-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-wood-600">
          Sản phẩm
        </Link>
        <span>/</span>
        <Link href={`/products?category=${product.categorySlug}`} className="hover:text-wood-600">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Hero Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-100 border border-cream-200 shadow-inner">
            <Image
              src={getImageUrl(activeImage)}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full shadow-md">
                -{discountPercent}% GIẢM
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden relative border-2 flex-shrink-0 transition-all ${
                    activeImage === img
                      ? "border-wood-600 ring-2 ring-wood-200"
                      : "border-cream-200 hover:border-cream-400"
                  }`}
                >
                  <Image src={getImageUrl(img)} alt={`${product.name} ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase options */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood-100 text-wood-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {product.material}
              </span>
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(wishlisted ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích!");
                }}
                className="p-2 rounded-full border border-cream-200 hover:bg-cream-100 text-charcoal-700 hover:text-rose-500 transition-colors"
                title="Yêu thích"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900 mt-2 leading-snug">
              {product.name}
            </h1>

            {/* Rating & Warranty */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 mt-2.5">
              <div className="flex items-center gap-1">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
                <strong className="text-charcoal-900 font-bold">{product.averageRating.toFixed(1)}</strong>
                <span>({product.reviewCount} đánh giá khách hàng)</span>
              </div>
              <span>•</span>
              <span className="text-wood-600 font-semibold">Bảo hành: {product.warrantyMonths} tháng</span>
            </div>

            {/* Price Box */}
            <div className="mt-4 p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-wood-600">
                {formatCurrency(displayPrice)}
              </span>
              {displayOriginalPrice > displayPrice && (
                <span className="text-sm text-charcoal-500 line-through">
                  {formatCurrency(displayOriginalPrice)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Tiết kiệm {formatCurrency(displayOriginalPrice - displayPrice)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs md:text-sm text-charcoal-600 mt-4 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Size Variants */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <label className="block text-xs font-bold text-charcoal-900 mb-2">
                  Kích thước giường:
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const isSelected = selectedVariant?.size === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const match =
                            product.variants.find(
                              (v) =>
                                v.size === s &&
                                (selectedVariant ? v.colorName === selectedVariant.colorName : true)
                            ) || product.variants.find((v) => v.size === s);
                          if (match) setSelectedVariant(match);
                        }}
                        className={`px-3.5 py-1.5 text-xs rounded-xl border font-semibold transition-all ${
                          isSelected
                            ? "border-wood-600 bg-wood-50 text-wood-700 shadow-sm ring-1 ring-wood-500"
                            : "border-cream-300 text-charcoal-700 hover:border-wood-400 bg-cream-50"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Variants */}
            {colors.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-900 mb-2">
                  <span>Màu sắc:</span>
                  <span className="font-normal text-wood-600">{selectedVariant?.colorName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {colors.map((c) => {
                    const isSelected = selectedVariant?.colorName === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          const match =
                            product.variants.find(
                              (v) =>
                                v.colorName === c.name &&
                                (selectedVariant ? v.size === selectedVariant.size : true)
                            ) || product.variants.find((v) => v.colorName === c.name);
                          if (match) setSelectedVariant(match);
                        }}
                        className={`w-7 h-7 rounded-full border transition-all ${
                          isSelected
                            ? "ring-2 ring-wood-600 ring-offset-2 scale-110"
                            : "border-cream-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Status */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs font-bold text-charcoal-900">Số lượng:</span>
              <div className="flex items-center border border-cream-300 rounded-xl overflow-hidden bg-cream-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-cream-200 text-charcoal-700"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-charcoal-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-cream-200 text-charcoal-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Còn hàng (Sẵn sàng giao ngay)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-xl border-2 border-wood-600 text-wood-600 hover:bg-wood-50 font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm Vào Giỏ</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-xl bg-wood-600 hover:bg-wood-700 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>Mua Ngay Trọn Bộ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Service Guarantee Badges */}
          <div className="pt-6 border-t border-cream-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px] text-charcoal-600">
            <div className="p-2 rounded-xl bg-cream-50">
              <ShieldCheck className="w-4 h-4 text-wood-600 mx-auto mb-1" />
              <span className="font-semibold block">Bảo hành 10 năm</span>
            </div>
            <div className="p-2 rounded-xl bg-cream-50">
              <Moon className="w-4 h-4 text-wood-600 mx-auto mb-1" />
              <span className="font-semibold block">30 Đêm ngủ thử</span>
            </div>
            <div className="p-2 rounded-xl bg-cream-50">
              <Truck className="w-4 h-4 text-wood-600 mx-auto mb-1" />
              <span className="font-semibold block">Freeship từ 1 triệu</span>
            </div>
            <div className="p-2 rounded-xl bg-cream-50">
              <RotateCcw className="w-4 h-4 text-wood-600 mx-auto mb-1" />
              <span className="font-semibold block">Đổi trả 1-1 tại nhà</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-cream-200 overflow-x-auto pb-2 text-xs md:text-sm font-semibold">
          {[
            { id: "desc", label: "Mô tả chi tiết" },
            { id: "specs", label: "Thông số kích thước & Chất liệu" },
            { id: "care", label: "Hướng dẫn giặt ủi & Bảo quản" },
            { id: "warranty", label: "Chính sách bảo hành & Ngủ thử" },
            { id: "reviews", label: `Đánh giá (${product.reviews?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-wood-600 text-white shadow-md font-bold"
                  : "text-charcoal-600 hover:text-wood-600 hover:bg-cream-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-6 text-xs md:text-sm text-charcoal-700 leading-relaxed">
          {activeTab === "desc" && (
            <div className="prose max-w-none space-y-4">
              <div className="whitespace-pre-line">{product.description}</div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-2xl divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 p-3 bg-cream-50 font-bold">
                <span>Thông số</span>
                <span>Chi tiết</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-charcoal-500">Chất liệu:</span>
                <span className="font-semibold text-charcoal-900">{product.material}</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-charcoal-500">Thương hiệu / Dòng sản phẩm:</span>
                <span className="font-semibold text-charcoal-900">{product.brand}</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-charcoal-500">Thời gian bảo hành:</span>
                <span className="font-semibold text-charcoal-900">{product.warrantyMonths} tháng</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-charcoal-500">Kích thước hỗ trợ:</span>
                <span className="font-semibold text-charcoal-900">{sizes.join(", ")}</span>
              </div>
            </div>
          )}

          {activeTab === "care" && (
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
              <h4 className="font-bold text-charcoal-900">Hướng dẫn giặt ủi và bảo quản chăn ga gối đệm:</h4>
              <p>
                {product.careInstructions ||
                  "Giặt máy chế độ nhẹ bằng nước lạnh dưới 30 độ C. Không dùng chất tẩy rửa clo mạnh. Phơi khô dưới bóng râm thoáng mát, tránh ánh nắng mặt trời trực tiếp gay gắt."}
              </p>
            </div>
          )}

          {activeTab === "warranty" && (
            <div className="space-y-4">
              <div className="p-4 bg-wood-50 rounded-2xl border border-wood-200">
                <h4 className="font-bold text-wood-800">Chính sách 30 Đêm Ngủ Thử (Sleep Trial):</h4>
                <p className="mt-1 text-charcoal-700">
                  ShopHome cam kết mang đến trải nghiệm hài lòng tuyệt đối. Nếu trong 30 đêm đầu tiên bạn cảm thấy nệm
                  hoặc chăn ga chưa thực sự phù hợp với thói quen ngủ của mình, chúng tôi hỗ trợ đổi sang sản phẩm khác
                  hoàn toàn miễn phí tại nhà.
                </p>
              </div>
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <h4 className="font-bold text-charcoal-900">Bảo hành chính hãng:</h4>
                <p className="mt-1 text-charcoal-700">
                  Sản phẩm được bảo hành {product.warrantyMonths} tháng đối với các lỗi kỹ thuật phát sinh từ nhà sản
                  xuất (như xẹp lún quá 2.5cm đối với nệm, bung chỉ đường may đối với chăn ga gối).
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-charcoal-900">{rev.customerName}</span>
                      <span className="text-[11px] text-charcoal-500">{formatDate(rev.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-amber-400 mb-1.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-charcoal-700 italic">&quot;{rev.comment}&quot;</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-charcoal-500">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
