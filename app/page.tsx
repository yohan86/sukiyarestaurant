import MenuItemCard from "@/components/MenuItemCard";
import SpecialOffers from "@/components/SpecialOffers";
import {MockData as data} from "@/lib/mock-data";
import PayPayConnectButton from "@/components/PayPayConnectButton";

export default function Home() {

  const offers = data.filter(item => item.offers).length;
  return (
    <main className="flex min-h-screen bg-background transition-colors duration-300">
      <div className="inner-wrapper flex-col mt-[100px]">
        <h1 className="">Hello!</h1>
        <p>Warmly welcome to our restaurant</p>
        <div className="grid grid-cols-2 gap-2 w-full md:grid-cols-3 lg:grid-cols-4 mt-8 md:gap-4">
          {data.map((item)=>(
            <MenuItemCard key={item.id} {...item} />
          ))}

          
        </div>
        {offers > 0 &&
          <div className="special-offers-section mt-12">
            <h2 className="text-2xl font-bold mb-4">Special Offers ({offers} Dishes)</h2>
            <div className="grid grid-cols-2 gap-2 w-full md:grid-cols-3 lg:grid-cols-4 mt-4 md:gap-4">
              {data.filter(item=>item.offers).map(item=>(
                <SpecialOffers key={item.id} {...item} />
              ))}
            </div>
          </div>
        }
      </div>


        <PayPayConnectButton />
      
    </main>
  );
}
