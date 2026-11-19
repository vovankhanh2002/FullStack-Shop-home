"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  Sparkles,
  X,
  Upload,
  Loader2,
  Check,
  Palette,
  Maximize2,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { ProductList, ProductDetail, Category, ApiResponse, PagedResult } from "@/types";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

interface VariantFormItem {
  id?: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  imageUrl?: string;
}

const QUICK_SIZES = ["1m2 x 2m", "1m4 x 2m", "1m6 x 2m", "1m8 x 2m", "2m x 2m2", "King Size (2m2)", "Bộ Tiêu Chuẩn"];

const QUICK_COLORS = [
  { name: "Be Cát", hex: "#D4A373" },
  { name: "Nâu Gỗ", hex: "#8C5E3C" },
  { name: "Xanh Olive", hex: "#556B2F" },
  { name: "Ghi Xám", hex: "#6B7280" },
  { name: "Trắng Kem", hex: "#FAF9F6" },
  { name: "Hồng Pastel", hex: "#F4B8B8" },
  { name: "Xanh Navy", hex: "#1E3A8A" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  // Edit or Create mode
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form states
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("Tencel 60s");
  const [brand, setBrand] = useState("ShopHome Atelier");
  const [basePrice, setBasePrice] = useState(2500000);
  const [originalPrice, setOriginalPrice] = useState(3200000);
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [isFlashSale, setIsFlashSale] = useState(false);

  // Dynamic Product Variants (Sizes & Colors)
  const [variants, setVariants] = useState<VariantFormItem[]>([
    {
      size: "1m6 x 2m",
      colorName: "Be Cát",
      colorHex: "#D4A373",
      sku: "SH-1620-BE",
      price: 2500000,
      originalPrice: 3200000,
      stockQuantity: 30,
    },
    {
      size: "1m8 x 2m",
      colorName: "Be Cát",
      colorHex: "#D4A373",
      sku: "SH-1820-BE",
      price: 2700000,
      originalPrice: 3450000,
      stockQuantity: 25,
    },
  ]);

  // Temporary inputs to add a new variant
  const [newSize, setNewSize] = useState("1m6 x 2m");
  const [newColorName, setNewColorName] = useState("Be Cát");
  const [newColorHex, setNewColorHex] = useState("#D4A373");
  const [newPrice, setNewPrice] = useState(2500000);
  const [newOriginalPrice, setNewOriginalPrice] = useState(3200000);
  const [newStock, setNewStock] = useState(20);

  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get<ApiResponse<PagedResult<ProductList>>>("/api/products?pageSize=50"),
        api.get<ApiResponse<Category[]>>("/api/categories"),
      ]);

      if (prodRes.data?.data) {
        setProducts(prodRes.data.data.items);
      }
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !categoryId) {
          setCategoryId(catRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenCreate() {
    setEditingProductId(null);
    setName("");
    setShortDescription("");
    setDescription("");
    setMaterial("Tencel 60s");
    setBrand("ShopHome Atelier");
    setBasePrice(2500000);
    setOriginalPrice(3200000);
    setWarrantyMonths(12);
    setPrimaryImageUrl("");
    setGalleryImages([]);
    setIsFeatured(true);
    setIsNew(true);
    setIsFlashSale(false);
    setVariants([
      {
        size: "1m6 x 2m",
        colorName: "Be Cát",
        colorHex: "#D4A373",
        sku: `SH-${Date.now()}-1620`,
        price: 2500000,
        originalPrice: 3200000,
        stockQuantity: 30,
      },
      {
        size: "1m8 x 2m",
        colorName: "Be Cát",
        colorHex: "#D4A373",
        sku: `SH-${Date.now()}-1820`,
        price: 2700000,
        originalPrice: 3450000,
        stockQuantity: 25,
      },
    ]);
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    setModalOpen(true);
  }

  async function handleOpenEdit(p: ProductList) {
    try {
      setEditingProductId(p.id);
      setModalOpen(true);

      const res = await api.get<ApiResponse<ProductDetail>>(`/api/products/${p.slug}`);
      if (res.data?.data) {
        const d = res.data.data;
        setCategoryId(d.categoryId);
        setName(d.name);
        setShortDescription(d.shortDescription || "");
        setDescription(d.description || "");
        setMaterial(d.material);
        setBrand(d.brand);
        setBasePrice(d.basePrice);
        setOriginalPrice(d.originalPrice);
        setWarrantyMonths(d.warrantyMonths);
        setPrimaryImageUrl(d.primaryImageUrl);
        setGalleryImages(d.images ? d.images.map((i) => i.imageUrl) : []);
        setIsFeatured(d.isFeatured);
        setIsNew(d.isNew);
        setIsFlashSale(d.isFlashSale);

        if (d.variants && d.variants.length > 0) {
          setVariants(
            d.variants.map((v) => ({
              id: v.id,
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              sku: v.sku,
              price: v.price,
              originalPrice: v.originalPrice,
              stockQuantity: v.stockQuantity,
              imageUrl: v.imageUrl || d.primaryImageUrl,
            }))
          );
        } else {
          setVariants([
            {
              size: "1m6 x 2m",
              colorName: "Be Cát",
              colorHex: "#D4A373",
              sku: `SH-${Date.now()}-1620`,
              price: d.basePrice,
              originalPrice: d.originalPrice,
              stockQuantity: 20,
            },
          ]);
        }
      }
    } catch (err: any) {
      toast.error("Không thể tải thông tin chi tiết sản phẩm.");
    }
  }

  async function handleUploadPrimary(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPrimary(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<ApiResponse<string>>("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.data) {
        setPrimaryImageUrl(res.data.data);
        toast.success("Tải ảnh sản phẩm chính lên thành công!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải ảnh thất bại.");
    } finally {
      setUploadingPrimary(false);
    }
  }

  async function handleUploadGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingGallery(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await api.post<ApiResponse<string[]>>("/api/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.data) {
        setGalleryImages((prev) => [...prev, ...res.data.data]);
        toast.success(`Đã tải thêm ${res.data.data.length} ảnh phụ!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải ảnh phụ thất bại.");
    } finally {
      setUploadingGallery(false);
    }
  }

  function handleAddVariant() {
    if (!newSize.trim() || !newColorName.trim()) {
      toast.error("Vui lòng nhập kích thước và tên màu sắc.");
      return;
    }

    const item: VariantFormItem = {
      size: newSize.trim(),
      colorName: newColorName.trim(),
      colorHex: newColorHex,
      sku: `SH-${Date.now()}-${newSize.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4)}`,
      price: Number(newPrice) || Number(basePrice),
      originalPrice: Number(newOriginalPrice) || Number(originalPrice),
      stockQuantity: Number(newStock) || 20,
      imageUrl: primaryImageUrl,
    };

    setVariants((prev) => [...prev, item]);
    toast.success(`Đã thêm biến thể: ${newSize} - ${newColorName}`);
  }

  function handleRemoveVariant(idx: number) {
    if (variants.length <= 1) {
      toast.error("Sản phẩm cần có ít nhất 1 biến thể thuộc tính.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmitProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId || !primaryImageUrl.trim()) {
      toast.error("Vui lòng nhập tên, danh mục và tải ảnh chính cho sản phẩm.");
      return;
    }

    if (variants.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 biến thể thuộc tính (kích thước, màu sắc).");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        categoryId,
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        material: material.trim(),
        brand: brand.trim(),
        basePrice: Number(basePrice),
        originalPrice: Number(originalPrice),
        warrantyMonths: Number(warrantyMonths),
        primaryImageUrl: primaryImageUrl.trim(),
        additionalImages: galleryImages,
        isFeatured,
        isNew,
        isFlashSale,
        isActive: true,
        variants: variants.map((v) => ({
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          sku: v.sku || `SH-${Date.now()}`,
          price: Number(v.price) || Number(basePrice),
          originalPrice: Number(v.originalPrice) || Number(originalPrice),
          stockQuantity: Number(v.stockQuantity) || 10,
          imageUrl: v.imageUrl || primaryImageUrl,
        })),
      };

      if (editingProductId) {
        await api.put(`/api/products/${editingProductId}`, payload);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await api.post("/api/products", payload);
        toast.success("Tạo sản phẩm mới thành công!");
      }

      setModalOpen(false);
      setEditingProductId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu sản phẩm thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Đã xóa sản phẩm.");
      loadData();
    } catch (err) {
      toast.error("Xóa sản phẩm thất bại.");
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.material.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">Quản Lý Sản Phẩm</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Quản lý danh sách chăn ga, nệm, gối, biến thể kích thước và màu sắc
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-wood-600 hover:bg-wood-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm, chất liệu, thương hiệu..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-cream-300 text-xs text-charcoal-800 focus:outline-none focus:border-wood-500 shadow-sm"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-500">Đang tải danh sách sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 mx-auto text-charcoal-400" />
            <p className="text-xs text-charcoal-600">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-charcoal-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Hình ảnh</th>
                  <th className="p-3">Tên sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Chất liệu</th>
                  <th className="p-3">Giá bán</th>
                  <th className="p-3">Biến thể</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="p-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-100 relative">
                        <Image src={getImageUrl(p.primaryImageUrl)} alt={p.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-charcoal-900 max-w-xs truncate">
                      {p.name}
                      <span className="block text-[11px] text-wood-600 font-normal">{p.brand}</span>
                    </td>
                    <td className="p-3 text-charcoal-600">{p.categoryName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-wood-50 text-wood-700 border border-wood-200">
                        {p.material}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-wood-600">{formatCurrency(p.basePrice)}</td>
                    <td className="p-3 text-charcoal-500 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-cream-100 text-charcoal-800 text-[11px]">
                        {p.variants?.length || 0} biến thể
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-wood-700 hover:bg-wood-100 rounded-lg transition-colors"
                          title="Chỉnh sửa sản phẩm & biến thể"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-cream-200 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                  {editingProductId ? (
                    <>
                      <Edit2 className="w-5 h-5 text-wood-600" />
                      <span>Chỉnh Sửa Sản Phẩm</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-wood-600" />
                      <span>Thêm Mới Sản Phẩm</span>
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full text-charcoal-400 hover:bg-cream-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="space-y-5 text-xs">
                {/* 1. Thông tin cơ bản */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal-800 mb-1">Tên sản phẩm *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Vd: Bộ Chăn Ga Tencel 60s Eco Silk Hoàng Gia"
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1">Danh mục *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1">Thương hiệu</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="ShopHome Atelier"
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1">Chất liệu vải / khung *</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Tencel 60s, Cotton Ai Cập, Lụa Satin..."
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1">Bảo hành (tháng)</label>
                    <input
                      type="number"
                      value={warrantyMonths}
                      onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1">Giá bán cơ bản (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1">Giá gốc gạch ngang (VNĐ)</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-charcoal-800 mb-1">Mô tả ngắn</label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Bộ sản phẩm dệt từ sợi khuynh diệp sinh học, mềm mát thoáng khí..."
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
                    />
                  </div>
                </div>

                {/* 2. Upload Hình ảnh */}
                <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-4">
                  <div>
                    <label className="block font-semibold text-charcoal-800 mb-1.5 flex items-center justify-between">
                      <span>1. Ảnh đại diện chính *</span>
                      {primaryImageUrl && <span className="text-[11px] text-emerald-600 font-medium">✓ Đã có ảnh</span>}
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-wood-600 hover:bg-wood-700 text-white font-semibold text-xs shadow-sm transition-colors">
                        {uploadingPrimary ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{uploadingPrimary ? "Đang tải lên..." : "Tải ảnh từ máy"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPrimary}
                          onChange={handleUploadPrimary}
                          className="hidden"
                        />
                      </label>
                      {primaryImageUrl && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-wood-500 shadow-sm">
                          <Image src={getImageUrl(primaryImageUrl)} alt="Ảnh chính" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setPrimaryImageUrl("")}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            title="Xóa ảnh"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-cream-200">
                    <label className="block font-semibold text-charcoal-800 mb-1.5 flex items-center justify-between">
                      <span>2. Bộ ảnh chi tiết / Góc chụp phòng ngủ ({galleryImages.length})</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-charcoal-800 font-semibold text-xs transition-colors">
                        {uploadingGallery ? (
                          <Loader2 className="w-4 h-4 animate-spin text-wood-600" />
                        ) : (
                          <Upload className="w-4 h-4 text-wood-600" />
                        )}
                        <span>{uploadingGallery ? "Đang tải..." : "Thêm nhiều ảnh phụ"}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={uploadingGallery}
                          onChange={handleUploadGallery}
                          className="hidden"
                        />
                      </label>
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-cream-300">
                          <Image src={getImageUrl(img)} alt={`Ảnh phụ ${idx}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            title="Xóa"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. QUẢN LÝ BIẾN THỂ THUỘC TÍNH (MÀU SẮC, KÍCH THƯỚC, GIÁ, TỒN KHO) */}
                <div className="p-4 rounded-2xl bg-wood-50/50 border border-wood-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-wood-200/60">
                    <h4 className="font-serif font-bold text-charcoal-900 flex items-center gap-2 text-sm">
                      <Palette className="w-4 h-4 text-wood-600" />
                      <span>Thuộc Tính Biến Thể: Màu Sắc & Kích Thước ({variants.length})</span>
                    </h4>
                    <span className="text-[11px] text-wood-700 font-medium">Bắt buộc tối thiểu 1 biến thể</span>
                  </div>

                  {/* Form thêm nhanh biến thể */}
                  <div className="bg-white p-3.5 rounded-xl border border-cream-200 space-y-3">
                    <p className="font-semibold text-charcoal-800 text-[11px]">
                      + Thêm biến thể mới vào sản phẩm:
                    </p>

                    {/* Quick Size Chips */}
                    <div>
                      <span className="text-[10px] text-charcoal-500 block mb-1">Gợi ý kích cỡ nhanh:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_SIZES.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setNewSize(sz)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                              newSize === sz
                                ? "bg-wood-600 text-white shadow-sm"
                                : "bg-cream-100 text-charcoal-700 hover:bg-cream-200"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Color Chips */}
                    <div>
                      <span className="text-[10px] text-charcoal-500 block mb-1">Gợi ý màu sắc nhanh:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_COLORS.map((col) => (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => {
                              setNewColorName(col.name);
                              setNewColorHex(col.hex);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                              newColorName === col.name
                                ? "border-wood-600 bg-wood-50 text-wood-800 font-bold"
                                : "border-cream-300 bg-white text-charcoal-700 hover:bg-cream-50"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/20"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Input Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 items-end">
                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                          Kích thước
                        </label>
                        <input
                          type="text"
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          placeholder="1m6 x 2m"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-cream-300 text-xs focus:outline-none focus:border-wood-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                          Tên màu & Mã Hex
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-cream-300 cursor-pointer p-0.5"
                            title="Chọn mã màu"
                          />
                          <input
                            type="text"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            placeholder="Be Cát"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-cream-300 text-xs focus:outline-none focus:border-wood-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                          Giá biến thể (VNĐ)
                        </label>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-cream-300 text-xs focus:outline-none focus:border-wood-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-700 mb-0.5">
                          Tồn kho
                        </label>
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-cream-300 text-xs focus:outline-none focus:border-wood-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="py-1.5 px-3 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
                      >
                        + Thêm biến thể
                      </button>
                    </div>
                  </div>

                  {/* Bảng danh sách các biến thể đã thêm */}
                  <div className="overflow-x-auto bg-white rounded-xl border border-cream-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream-50 text-charcoal-600 font-semibold border-b border-cream-200">
                        <tr>
                          <th className="p-2.5">Kích thước</th>
                          <th className="p-2.5">Màu sắc</th>
                          <th className="p-2.5">Giá bán</th>
                          <th className="p-2.5">Tồn kho</th>
                          <th className="p-2.5 text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-cream-50/50">
                            <td className="p-2.5 font-semibold text-charcoal-900">{v.size}</td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cream-100 text-charcoal-800">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                                <span>{v.colorName}</span>
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-wood-600 font-bold">
                              {formatCurrency(v.price)}
                            </td>
                            <td className="p-2.5 font-mono text-charcoal-700">{v.stockQuantity}</td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                title="Xóa biến thể này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Badges & Hiển thị */}
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-wood-600 focus:ring-wood-500"
                    />
                    <span className="font-semibold text-charcoal-800">Sản phẩm Nổi bật</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlashSale}
                      onChange={(e) => setIsFlashSale(e.target.checked)}
                      className="rounded text-wood-600 focus:ring-wood-500"
                    />
                    <span className="font-semibold text-charcoal-800">Bán chạy / Flash Sale</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-cream-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-cream-300 text-charcoal-700 font-semibold rounded-xl hover:bg-cream-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
                  >
                    {submitting
                      ? "Đang lưu..."
                      : editingProductId
                      ? "Cập Nhật Sản Phẩm"
                      : "Lưu Sản Phẩm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
