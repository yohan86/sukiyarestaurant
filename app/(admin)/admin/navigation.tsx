"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminNavigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-purple-50 border-b border-white/50 shadow-lg sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 md:h-24">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#06C755] via-[#00C300] to-[#06C755] bg-clip-text text-transparent drop-shadow-sm">
                🍱 Sukiya Admin
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-3 md:space-x-4 flex-1">
              <NavLink href="/admin" pathname={pathname}>
                Dashboard
              </NavLink>
              <NavLink href="/admin/orders" pathname={pathname}>
                Orders
              </NavLink>
              <NavLink href="/admin/menu" pathname={pathname}>
                Menu
              </NavLink>
              {(user?.role === "admin" || user?.role === "manager") && (
                <NavLink href="/admin/users" pathname={pathname}>
                  Users
                </NavLink>
              )}
              <NavLink href="/admin/profile" pathname={pathname}>
                Profile
              </NavLink>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <Link
                    href="/admin/profile"
                    className="hidden sm:flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-[#06C755] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#06C755] to-[#00C300] flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{user.displayName}</span>
                      <span className="text-xs text-gray-500">{user.role}</span>
                    </div>
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] flex items-center gap-2"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-white/50 bg-gradient-to-b from-blue-50 to-purple-50 backdrop-blur-sm">
        <div className="px-3 pt-3 pb-4 space-y-2">
          <MobileNavLink href="/admin" pathname={pathname}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink href="/admin/orders" pathname={pathname}>
            Orders
          </MobileNavLink>
          <MobileNavLink href="/admin/menu" pathname={pathname}>
            Menu
          </MobileNavLink>
          {(user?.role === "admin" || user?.role === "manager") && (
            <MobileNavLink href="/admin/users" pathname={pathname}>
              Users
            </MobileNavLink>
          )}
          <MobileNavLink href="/admin/profile" pathname={pathname}>
            Profile
          </MobileNavLink>
          {user && (
            <Link
              href="/admin/profile"
              className="px-5 py-4 text-sm text-gray-600 font-medium border-t border-white/50 flex items-center gap-3 hover:bg-white/50 transition-colors duration-200"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#06C755] to-[#00C300] flex items-center justify-center text-white font-bold shadow-md">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">{user.displayName}</span>
                <span className="text-xs text-gray-500">{user.role}</span>
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-5 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all duration-200 active:scale-95 touch-manipulation min-h-[56px] flex items-center justify-center gap-2 mt-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  pathname,
}: {
  href: string;
  children: React.ReactNode;
  pathname: string | null;
}) {
  const isActive =
    pathname === href || (href !== "/admin" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={`inline-flex items-center px-5 md:px-6 py-3 md:py-3.5 rounded-xl text-base md:text-lg font-bold transition-all duration-200 touch-manipulation active:scale-95 min-h-[48px] md:min-h-[52px] ${
        isActive
          ? "bg-gradient-to-r from-[#06C755] to-[#00C300] text-white shadow-lg active:shadow-xl"
          : "text-gray-700 active:text-gray-900 active:bg-white/70 backdrop-blur-sm border border-white/50"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  pathname,
}: {
  href: string;
  children: React.ReactNode;
  pathname: string | null;
}) {
  const isActive =
    pathname === href || (href !== "/admin" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={`block px-5 py-4 rounded-xl text-lg font-bold transition-all duration-200 touch-manipulation active:scale-95 min-h-[56px] flex items-center ${
        isActive
          ? "bg-gradient-to-r from-[#06C755] to-[#00C300] text-white shadow-lg active:shadow-xl"
          : "text-gray-700 active:bg-white active:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}


