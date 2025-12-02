"use client";

import { useEffect, useState } from "react";
import MenuItemCard from "@/components/MenuItemCard";
import { IMenuItem } from "@/types/menu-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/menu`);
        if (!res.ok) throw new Error("Failed to fetch menu items");
        const data: IMenuItem[] = await res.json();
        setMenuItems(data.filter(item => item.isActive));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch menu items");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  if (loading) return <p className="text-center mt-12">Loading menu...</p>;
  if (error) return <p className="text-center mt-12 text-red-600">{error}</p>;
  if (!menuItems.length) return <p className="text-center mt-12">No menu items available.</p>;

  return (
    <main className="flex min-h-screen bg-background transition-colors duration-300">
      <div className="inner-wrapper flex-col mt-[100px] w-full px-4">
        <h1 className="text-3xl font-bold">Welcome to Our Restaurant!</h1>
        <p className="mt-2 text-gray-700">Enjoy our fresh and delicious menu items</p>

        <div className="grid grid-cols-2 gap-2 w-full md:grid-cols-3 lg:grid-cols-4 mt-8 md:gap-4">
          {menuItems.map(item => (
            <MenuItemCard
              key={item._id}
              item={{
                id: item.id,
                title: item.nameEn,
                price: item.price,
                image: item.imageUrl,
                description: item.nameJp,
                isAvailable: item.isActive,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
