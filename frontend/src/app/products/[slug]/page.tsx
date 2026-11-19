import type { Metadata, ResolvingMetadata } from "next";
import { ProductDetailClient } from "./product-detail-client";
import { ProductDetail } from "@/types";
import { getImageUrl } from "@/lib/utils";

interface ProductPageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Fetch thông tin sản phẩm an toàn từ Server
 * Hỗ trợ cả khi chạy trong Docker container (http://backend:8080) và khi chạy trên máy Host (http://localhost:5002)
 */
async function getProduct(slug: string): Promise<ProductDetail | null> {
  const candidateUrls = [
    process.env.INTERNAL_API_URL ? `${process.env.INTERNAL_API_URL}/api/products/${slug}` : null,
    `http://backend:8080/api/products/${slug}`,
    `http://localhost:5002/api/products/${slug}`,
    process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}` : null,
  ].filter(Boolean) as string[];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          return json.data;
        }
      }
    } catch {
      // Bỏ qua thử URL tiếp theo
    }
  }

  return null;
}

/**
 * 1. DYNAMIC METADATA CHO SEO & SOCIAL SHARE (Facebook, Zalo, Google Bot)
 */
export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | ShopHome",
      description: "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.",
    };
  }

  const title = `${product.name} - ${product.material} | ShopHome`;
  const description =
    product.shortDescription ||
    `Mua ngay ${product.name} chính hãng ${product.brand}. Chất liệu ${product.material}, bảo hành ${product.warrantyMonths} tháng, cam kết 30 đêm ngủ thử.`;
  const imageUrl = getImageUrl(product.primaryImageUrl);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `http://localhost:3002/products/${params.slug}`,
      siteName: "ShopHome - Nội Thất & Chăn Ga Cao Cấp",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    keywords: [
      product.name,
      product.material,
      product.brand,
      product.categoryName,
      "chăn ga gối đệm",
      "nội thất phòng ngủ",
      "ShopHome",
    ],
  };
}

/**
 * 2. SERVER COMPONENT RENDER
 * Render trực tiếp dữ liệu sản phẩm từ Server xuống Client, giúp trang tải tức thì mà không bị giật lag spinner!
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  return <ProductDetailClient slug={params.slug} initialProduct={product} />;
}
