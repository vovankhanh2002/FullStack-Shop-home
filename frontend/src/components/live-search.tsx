"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { ProductList, ApiResponse, PagedResult } from "@/types";
import { formatCurrency, getImageUrl } from "@/lib/utils";

export function LiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<PagedResult<ProductList>>>(
          `/api/products?search=${encodeURIComponent(query.trim())}&pageSize=5`
        );
        if (res.data?.data) {
          setResults(res.data.data.items);
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm chăn ga Tencel, nệm cao su, gối..."
          className="w-full pl-9 pr-9 py-2 text-xs md:text-sm bg-cream-100 border border-cream-300 rounded-full focus:outline-none focus:border-wood-400 focus:bg-white text-charcoal-900 placeholder:text-charcoal-500 transition-all shadow-inner"
        />
        <Search className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-cream-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-cream-50 border-b border-cream-200 flex items-center justify-between text-xs font-medium text-wood-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Gợi ý cho &quot;{query}&quot;
            </span>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
            {results.length === 0 && !loading && (
              <div className="p-6 text-center text-xs text-charcoal-500">
                Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác như &quot;Tencel&quot;, &quot;Nệm&quot;, &quot;Gối&quot;.
              </div>
            )}

            {results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-cream-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-200 flex-shrink-0 relative">
                  <Image
                    src={getImageUrl(product.primaryImageUrl)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-charcoal-900 truncate group-hover:text-wood-600">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-charcoal-500 truncate">{product.material}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-wood-600">
                      {formatCurrency(product.basePrice)}
                    </span>
                    {product.originalPrice > product.basePrice && (
                      <span className="text-[10px] text-charcoal-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="p-2.5 bg-cream-50 text-center border-t border-cream-200">
            <Link
              href={`/products?search=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-wood-600 hover:text-wood-700 hover:underline"
            >
              Xem tất cả kết quả tìm kiếm →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
