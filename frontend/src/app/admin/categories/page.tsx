"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit2, Layers, X, Upload, Loader2, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { Category, ApiResponse } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Category[]>>("/api/categories");
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function startEditCategory(c: Category) {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || "");
    setImageUrl(c.imageUrl || "");
  }

  function cancelEdit() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageUrl("");
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<ApiResponse<string>>("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.data) {
        setImageUrl(res.data.data);
        toast.success("Tải ảnh danh mục lên thành công!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tải ảnh thất bại.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmitCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || null,
          displayOrder: editingCategory.displayOrder,
        });
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await api.post("/api/categories", {
          name: name.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || null,
          displayOrder: categories.length + 1,
        });
        toast.success("Tạo danh mục thành công!");
      }
      cancelEdit();
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Đã xóa danh mục!");
      if (editingCategory?.id === id) {
        cancelEdit();
      }
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể xóa danh mục đang có sản phẩm.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal-900">Quản Lý Danh Mục Sản Phẩm</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">Phân nhóm chăn ga, nệm, gối, giường và phụ kiện decor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create / Edit Category Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-cream-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-2">
              {editingCategory ? (
                <>
                  <Edit2 className="w-4 h-4 text-wood-600" />
                  <span>Sửa Danh Mục: <span className="text-wood-600">{editingCategory.name}</span></span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-wood-600" />
                  <span>Thêm Danh Mục Mới</span>
                </>
              )}
            </h2>
            {editingCategory && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[11px] font-semibold text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1 px-2 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hủy sửa</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitCategory} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-charcoal-800 mb-1">Tên danh mục *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vd: Chăn Ga Tencel Lụa"
                className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-800 mb-1">Mô tả ngắn</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vải sinh học cao cấp, thoáng khí..."
                className="w-full px-3 py-2 rounded-xl border border-cream-300 focus:outline-none focus:border-wood-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-800 mb-1">Ảnh đại diện danh mục (Tải từ máy)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-charcoal-800 font-semibold text-xs transition-colors">
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-wood-600" />
                  ) : (
                    <Upload className="w-4 h-4 text-wood-600" />
                  )}
                  <span>{uploadingImage ? "Đang tải lên..." : "Chọn ảnh từ máy"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cream-300">
                    <Image src={getImageUrl(imageUrl)} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting
                  ? "Đang lưu..."
                  : editingCategory
                  ? "Cập Nhật Danh Mục"
                  : "Thêm Danh Mục"}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 font-semibold hover:bg-cream-100 transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-900 pb-3 border-b border-cream-200">
            Danh sách danh mục hiện có ({categories.length})
          </h2>

          <div className="divide-y divide-cream-100">
            {categories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-cream-100 flex-shrink-0 relative">
                    {c.imageUrl && <Image src={getImageUrl(c.imageUrl)} alt={c.name} fill className="object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal-900">{c.name}</h4>
                    <p className="text-[11px] text-charcoal-500">/{c.slug} • {c.productCount} sản phẩm</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEditCategory(c)}
                    className="p-1.5 text-wood-700 hover:bg-wood-100 rounded-lg transition-colors"
                    title="Sửa danh mục"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
