import MenuItemCard from "@/components/MenuItemCard";
import { IMenuItem } from "@/types/menu-types";

// Get API base URL - use sukiya-api backend
function getApiBaseUrl(): string {
  // If explicitly set in env, use it (for local development: http://localhost:5001)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default to production API URL
  return 'https://sukiyaapi.vercel.app';
}

async function getMenuItems(): Promise<IMenuItem[]> {
  try {
    // Fetch from sukiya-api backend
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/menu`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // For server components, we can use cache: 'no-store' to always get fresh data
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch menu items:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    // Map API response to IMenuItem format
    // API returns: nameEn, nameJp, price, imageUrl, category, subcategory, isActive, etc.
    return data
      .filter((item: any) => item.isActive !== false) // Only show active items
      .map((item: any) => ({
        id: item.id || item._id || '',
        title: item.nameEn || item.nameJp || 'Untitled',
        price: item.price || 0,
        description: item.description || `${item.nameEn || ''} - ${item.nameJp || ''}`.trim() || 'Delicious dish from our kitchen',
        image: item.imageUrl || '/kottu.jpg',
        isAvailable: item.isActive !== false,
        category: item.category || '',
        subcategory: item.subcategory || null,
      }));
  } catch (error) {
    console.error('Error fetching menu items from API:', error);
    return [];
  }
}

export default async function Home() {
  const menuItems = await getMenuItems();

  return (
    <main className="flex min-h-screen bg-background transition-colors duration-300">
      <div className="inner-wrapper flex-col mt-[100px]">
        <h1 className="">Hello!</h1>
        <p>Warmly welcome to our restaurant</p>
        {menuItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 w-full md:grid-cols-3 lg:grid-cols-4 mt-8 md:gap-4">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center text-muted-foreground">
            <p>No menu items available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}
