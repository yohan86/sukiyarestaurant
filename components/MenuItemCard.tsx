"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";
import { IMenuItem } from "@/types/menu-types"

interface ItemDetails {
    isOpen:boolean;
    isClose: ()=> void;
    item:IMenuItem;
}

const  MenuItemDetail: React.FC<ItemDetails> = ({isOpen, isClose, item}) => {
    const [dishQuantity, setDishQuantity] = useState(1);
    const [amount, setAmount] = useState(item.price);
    
    if(!isOpen) return null;
    //increase quntity
    const IncreaseQuantity = ()=> {
        setDishQuantity( prev => prev + 1 );
        setAmount( prev => prev +item.price );
    };
    //decrease quantity
    const DecreaseQuantity = ()=> {
        setDishQuantity( prev => prev > 1? prev - 1 : 1 );
        setAmount( prev => dishQuantity > 1? prev - item.price : item.price );
    };

    return(
        <div className="model fixed flex inset-0 items-center justify-center bg-black bg-opacity-70 z-10"
        onClick={isClose}
        >
            <div className="relative  max-w-[95%] w-full max-h-[90vh] md:w-[560px]">
            <div className="bg-white w-full h-full rounded-tr-[42px] overflow-hidden overflow-y-auto shadow-[4px_5px_13px_#695f5f]"
             onClick={(e) => e.stopPropagation()}
            >

                <div className="flex flex-col relative gap-2">
                    <div className="relative w-full h-[175px] md:h-[280px]">
                        <Image 
                        src="/kottu.jpg" 
                        alt={item.title} 
                        fill style={{objectFit:"cover"}}
                        />
                        <div className="bg-red-500 bg-opacity-90 text-white font-bold px-2 py-1 absolute right-0 bottom-0">Price: <span>{item.price}&yen;</span></div>
                    </div>
                    <div className="item-intro block w-full px-2 text-[#666]">
                        <h3 className="text-primary font-bold text-2xl my-3">{item.title}</h3>
                        
                        <p>{item.description}</p>
                    </div>
                    <div className="flex inset-x-2 bottom-2 items-center justify-between py-3 px-2 mt-3 bg-primary">
                        <div>
                            <div className="flex flex-col">
                                <div className="flex items-center justify-center space-x-2">
                                    <span className="text-white font-semibold">Dishes</span>
                                    <button className="flex bg-yellow-500 text-white w-6 h-6 justify-center items-center leading-none " onClick={DecreaseQuantity}><span className="h-[22px] text-[18px] leading-1">-</span></button>
                                    <span className="min-w-[20px] text-center  text-white">{dishQuantity}</span>
                                    <button className="flex bg-yellow-500 text-white w-6 h-6 justify-center items-center leading-none text-[18px]" 
                                    onClick={IncreaseQuantity}>
                                       <span className="h-[22px] text-[18px] leading-1">+</span>
                                    </button>
                                </div>

                                <span className="flex mt-1 text-white font-semibold">Amount: <span className=" ml-1 text-white  font-bold">{amount} &yen;</span></span>
                            </div>
                        </div>
                        <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <Button className=" text-white">Add Order</Button>
                        </div>
                        
                    </div>
                </div>
                
                
            </div>
                <span 
                className="flex absolute w-5 h-5 top-[-15px] right-0 bg-primary text-white p-1 indend-0 text-[12px] items-center justify-center rounded-[50%]"
                onClick={isClose}
                >X</span>
            </div>
        </div>
    )
};

const MenuItemCard = () => {
    const [isModelOpen, setIsModelOpen] = useState(false);
    const isOpen = ()=> setIsModelOpen(true);
    const isClose = ()=> setIsModelOpen(false);
    const item = {
         id:"12",
         title:"Kaiseki Ryori",
         price:125,
         image:"/kottu.jpg",
         description: "Lorem ipsumneque eum id maxime reiciendis tempora! Iste, eveniet architecto quis, doloribus maiores blanditiis eos facere consequatur perferendis, veritatis consequuntur possimus aspernatur assumenda veniam voluptatum quos! Animi, nobis! At quae quo recusandae, quaerat dolorum iusto vel facilis.Perspiciatis consequatur repudiandae exercitationem assumenda neque! Minima, fugiat laborum sapiente rerum, rem eum minus voluptate ea amet, beatae facilis esse voluptatem maiores dolorum velit magni eligendi vel quaerat consectetur quo?",
         isAvailable:true, 
    }
    return(
        <>
        <div 
        className="flex flex-col relative gap-2 w-[100%] h-[220px] md:h-[285px] bg-primary shadow-[4px_5px_13px_#695f5f] mb-4 rounded-tr-[42px] overflow-hidden pb-13"
        onClick={isOpen}
        >
            <div className="relative w-full h-[105px] md:h-[175px]">
                <Image 
                src="/kottu.jpg" 
                alt="" 
                fill style={{objectFit:"cover"}}
                />
            </div>
            <div className="item-intro px-2 text-white">
                <h3 className="font-bold">Kaiseki Ryori</h3>
                <div>Price: <span>125</span>&yen;</div>
            </div>
            <div className="flex absolute inset-x-2 bottom-2 h-10 justify-center">
                <Button className="text-white">Order Dish</Button>
            </div>
        </div>
        <MenuItemDetail isOpen={isModelOpen} isClose={isClose} item={item} />
        </>
    )
};

export default MenuItemCard;