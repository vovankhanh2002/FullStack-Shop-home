import { create } from "zustand";

interface WishlistState {
  productIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],

  toggleWishlist: (productId: string) => {
    set((state) => {
      const exists = state.productIds.includes(productId);
      const updated = exists
        ? state.productIds.filter((id) => id !== productId)
        : [...state.productIds, productId];

      if (typeof window !== "undefined") {
        localStorage.setItem("shophome_wishlist", JSON.stringify(updated));
      }
      return { productIds: updated };
    });
  },

  isWishlisted: (productId: string) => {
    return get().productIds.includes(productId);
  },
}));
