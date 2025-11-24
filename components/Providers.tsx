"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Header/>
            {children}
            <CartDrawer />
          </AuthProvider>
        </ThemeProvider>
      </CartProvider>
    </UIProvider>
  );
}

