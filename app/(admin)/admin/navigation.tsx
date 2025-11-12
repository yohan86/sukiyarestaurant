"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🍱 Sukiya Admin
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink href="/admin" pathname={pathname}>
                Dashboard
              </NavLink>
              <NavLink href="/admin/orders" pathname={pathname}>
                Orders
              </NavLink>
              <NavLink href="/admin/menu" pathname={pathname}>
                Menu
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <MobileNavLink href="/admin" pathname={pathname}>
            Dashboard
          </MobileNavLink>
          <MobileNavLink href="/admin/orders" pathname={pathname}>
            Orders
          </MobileNavLink>
          <MobileNavLink href="/admin/menu" pathname={pathname}>
            Menu
          </MobileNavLink>
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
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? "border-green-500 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? "bg-green-50 text-green-700 border-l-4 border-green-500"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}


