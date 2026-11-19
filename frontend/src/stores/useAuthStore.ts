import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shophome_access_token", accessToken);
      localStorage.setItem("shophome_refresh_token", refreshToken);
      localStorage.setItem("shophome_user", JSON.stringify(user));
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isAdmin: user.role === "Admin",
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("shophome_access_token");
      localStorage.removeItem("shophome_refresh_token");
      localStorage.removeItem("shophome_user");
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  initAuth: () => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("shophome_access_token");
      const storedUser = localStorage.getItem("shophome_user");
      if (storedToken && storedUser) {
        try {
          const user: User = JSON.parse(storedUser);
          set({
            user,
            accessToken: storedToken,
            isAuthenticated: true,
            isAdmin: user.role === "Admin",
          });
        } catch {
          // invalid json
        }
      }
    }
  },
}));
