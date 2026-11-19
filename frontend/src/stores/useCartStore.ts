import { create } from "zustand";
import { CartItem, Coupon } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId: string | undefined) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon, discount: number) => void;
  removeCoupon: () => void;
  getSubTotal: () => number;
  getShippingFee: () => number;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  appliedCoupon: null,
  discountAmount: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (item, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      let updatedItems: CartItem[];
      if (existingIndex > -1) {
        updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        updatedItems = [...state.items, { ...item, quantity }];
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("shophome_cart", JSON.stringify(updatedItems));
      }

      return { items: updatedItems, isOpen: true };
    });
  },

  updateQuantity: (productId, variantId, quantity) => {
    set((state) => {
      let updatedItems: CartItem[];
      if (quantity <= 0) {
        updatedItems = state.items.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        );
      } else {
        updatedItems = state.items.map((i) =>
          i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
        );
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("shophome_cart", JSON.stringify(updatedItems));
      }

      return { items: updatedItems };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => {
      const updatedItems = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("shophome_cart", JSON.stringify(updatedItems));
      }

      return { items: updatedItems };
    });
  },

  clearCart: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("shophome_cart");
    }
    set({ items: [], appliedCoupon: null, discountAmount: 0 });
  },

  applyCoupon: (coupon, discount) => {
    set({ appliedCoupon: coupon, discountAmount: discount });
  },

  removeCoupon: () => {
    set({ appliedCoupon: null, discountAmount: 0 });
  },

  getSubTotal: () => {
    return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getShippingFee: () => {
    const subTotal = get().getSubTotal();
    if (subTotal === 0) return 0;
    return subTotal >= 1000000 ? 0 : 50000;
  },

  getTotalAmount: () => {
    const subTotal = get().getSubTotal();
    const shippingFee = get().getShippingFee();
    const discount = get().discountAmount;
    return Math.max(0, subTotal + shippingFee - discount);
  },

  getTotalItemsCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
