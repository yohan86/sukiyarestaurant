"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import { UIProvider } from "@/context/UIContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { usePathname } from "next/navigation";

function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  
  if (isAdminPage) {
    return null;
  }
  
  return <Header />;
}

function ConditionalCartDrawer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  
  if (isAdminPage) {
    return null;
  }
  
  return <CartDrawer />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <CartProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <ConditionalHeader />
            {children}
            <ConditionalCartDrawer />
          </AuthProvider>
        </ThemeProvider>
      </CartProvider>
    </UIProvider>
  );
}

