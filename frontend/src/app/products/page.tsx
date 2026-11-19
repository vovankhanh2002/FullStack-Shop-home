"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, ArrowUpDown, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import { api } from "@/lib/api";
import { ProductList, Category, ApiResponse, PagedResult } from "@/types";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductList | null>(null);

  // Read URL query parameters
  const search = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";
  const material = searchParams.get("material") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const pageIndex = parseInt(searchParams.get("page") || "1", 10);

  const materials = ["Tencel", "Cotton", "Cao su", "Microfiber", "Gỗ Sồi"];

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get<ApiResponse<Category[]>>("/api/categories");
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (categorySlug) params.set("categorySlug", categorySlug);
        if (material) params.set("material", material);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sortBy) params.set("sortBy", sortBy);
        params.set("pageIndex", pageIndex.toString());
        params.set("pageSize", "12");

        const res = await api.get<ApiResponse<PagedResult<ProductList>>>(`/api/products?${params.toString()}`);
        if (res.data?.data) {
          setProducts(res.data.data.items);
          setTotalCount(res.data.data.totalCount);
          setTotalPages(res.data.data.totalPages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, categorySlug, material, minPrice, maxPrice, sortBy, pageIndex]);

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    router.push(`/products?${params.toString()}`);
  }

  function clearAllFilters() {
    router.push("/products");
  }

  const hasActiveFilters = categorySlug || material || minPrice || maxPrice || search;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb / Title */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">
          {categorySlug
            ? categories.find((c) => c.slug === categorySlug)?.name || "Bộ Sưu Tập"
            : "Tất Cả Sản Phẩm Chăn Ga Gối Đệm & Nội Thất"}
        </h1>
        <p className="text-xs md:text-sm text-charcoal-500 mt-1">
          Tìm thấy <strong className="text-wood-600">{totalCount}</strong> sản phẩm cao cấp phù hợp với tổ ấm của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-900">
                <Filter className="w-4 h-4 text-wood-600" />
                Bộ lọc tìm kiếm
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-rose-600 hover:underline font-semibold"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold text-charcoal-900 mb-2">Danh mục</h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => updateQuery("category", "")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    !categorySlug ? "bg-wood-50 text-wood-700 font-bold" : "text-charcoal-600 hover:bg-cream-50"
                  }`}
                >
                  Tất cả danh mục
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateQuery("category", c.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                      categorySlug === c.slug
                        ? "bg-wood-50 text-wood-700 font-bold"
                        : "text-charcoal-600 hover:bg-cream-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            <div className="pt-4 border-t border-cream-100">
              <h4 className="text-xs font-bold text-charcoal-900 mb-2">Chất liệu</h4>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => {
                  const active = material === m;
                  return (
                    <button
                      key={m}
                      onClick={() => updateQuery("material", active ? "" : m)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        active
                          ? "border-wood-600 bg-wood-600 text-white font-bold"
                          : "border-cream-300 text-charcoal-700 hover:border-wood-400 bg-cream-50"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-cream-100">
              <h4 className="text-xs font-bold text-charcoal-900 mb-2">Khoảng giá</h4>
              <div className="space-y-1.5 text-xs text-charcoal-700">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("minPrice");
                    params.delete("maxPrice");
                    router.push(`/products?${params.toString()}`);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cream-50"
                >
                  Tất cả mức giá
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("minPrice");
                    params.set("maxPrice", "2000000");
                    router.push(`/products?${params.toString()}`);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cream-50"
                >
                  Dưới 2.000.000đ
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("minPrice", "2000000");
                    params.set("maxPrice", "5000000");
                    router.push(`/products?${params.toString()}`);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cream-50"
                >
                  Từ 2.000.000đ - 5.000.000đ
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("minPrice", "5000000");
                    params.delete("maxPrice");
                    router.push(`/products?${params.toString()}`);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-cream-50"
                >
                  Trên 5.000.000đ
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active filter chips & Sort dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-cream-200">
            <div className="flex flex-wrap items-center gap-2">
              {categorySlug && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-100 text-charcoal-800 text-xs rounded-full">
                  Danh mục: {categories.find((c) => c.slug === categorySlug)?.name}
                  <button onClick={() => updateQuery("category", "")}>
                    <X className="w-3 h-3 text-charcoal-500 hover:text-charcoal-900" />
                  </button>
                </span>
              )}
              {material && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-100 text-charcoal-800 text-xs rounded-full">
                  Chất liệu: {material}
                  <button onClick={() => updateQuery("material", "")}>
                    <X className="w-3 h-3 text-charcoal-500 hover:text-charcoal-900" />
                  </button>
                </span>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-500" />
              <span className="text-charcoal-600 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => updateQuery("sortBy", e.target.value)}
                className="bg-cream-50 border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-900 focus:outline-none focus:border-wood-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Xem nhiều nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-charcoal-500 mt-2">Đang tải sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200">
              <p className="font-serif text-lg text-charcoal-900 font-bold">Không tìm thấy sản phẩm</p>
              <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
                Không có sản phẩm nào phù hợp với các tiêu chí lọc đã chọn. Hãy thử xóa bớt bộ lọc.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-5 py-2 bg-wood-600 text-white text-xs font-semibold rounded-full hover:bg-wood-700 transition-colors"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => updateQuery("page", Math.max(1, pageIndex - 1).toString())}
                disabled={pageIndex <= 1}
                className="p-2 rounded-lg border border-cream-300 bg-white hover:bg-cream-50 text-charcoal-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-1.5 text-xs font-medium bg-cream-100 rounded-lg">
                Trang {pageIndex} / {totalPages}
              </span>
              <button
                onClick={() => updateQuery("page", Math.min(totalPages, pageIndex + 1).toString())}
                disabled={pageIndex >= totalPages}
                className="p-2 rounded-lg border border-cream-300 bg-white hover:bg-cream-50 text-charcoal-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-wood-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
