export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export type UserRole = "Customer" | "Admin";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  productCount: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
  altText?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductList {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  shortDescription: string;
  material: string;
  brand: string;
  warrantyMonths: number;
  basePrice: number;
  originalPrice: number;
  discountPercent: number;
  primaryImageUrl: string;
  viewCount: number;
  reviewCount: number;
  averageRating: number;
  isFeatured: boolean;
  isNew: boolean;
  isFlashSale: boolean;
  variants: ProductVariant[];
}

export interface ProductDetail extends ProductList {
  description: string;
  careInstructions?: string;
  images: ProductImage[];
  reviews: Review[];
}

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantId?: string;
  size: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
}

export type OrderStatus = "Pending" | "Confirmed" | "Packing" | "Delivering" | "Completed" | "Cancelled";
export type PaymentMethod = "COD" | "VietQR";
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  province: string;
  district: string;
  ward?: string;
  installationNotes?: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  couponCode?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  items: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "Percentage" | "FixedAmount";
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface ApplyCouponResponse {
  valid: boolean;
  message: string;
  discountAmount: number;
  finalAmount: number;
}

export interface HotspotPoint {
  id: number;
  productId?: string;
  topPercent: number;
  leftPercent: number;
  title: string;
  price: number;
  slug: string;
}

export interface Lookbook {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  roomType: string;
  description: string;
  hotspotsJson: string;
  displayOrder: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts: ProductList[];
  recentOrders: Order[];
}
