import MenuItemCard from "@/components/MenuItemCard";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-background transition-colors duration-300">
      <div className="inner-wrapper flex-col mt-[100px]">
        <h1 className="">Hello!</h1>
        <p>Warmly welcome to our restaurant</p>
        <div className="grid grid-cols-2 gap-2 w-full md:grid-cols-3 lg:grid-cols-4 mt-8 md:gap-4">
          <MenuItemCard />
          <MenuItemCard />
          <MenuItemCard />
          <MenuItemCard />
          
        </div>
      </div>
      
    </main>
  );
}
