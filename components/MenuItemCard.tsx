"use client";

import { useState } from "react";
import Image from "next/image";
import MenuItemDetail from "./MenuItemDetail";
import { Button } from "./ui/button";

interface MenuItem {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  isAvailable: boolean;
}

interface Props {
  item: MenuItem;
}

const MenuItemCard: React.FC<Props> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const open = () => setIsModalOpen(true);
  const close = () => setIsModalOpen(false);

  return (
    <>
      <div
        className="flex flex-col relative gap-2 bg-primary rounded-xl overflow-hidden shadow-md cursor-pointer"
        onClick={open}
      >
        <div className="relative w-full h-44">
          <Image src={item.image} alt={item.title} fill style={{ objectFit: "cover" }} />
        </div>
        <div className="p-2 text-white">
          <h3 className="font-bold">{item.title}</h3>
          <p>¥{item.price}</p>
        </div>
        <div className="p-2">
          <Button onClick={open}>Order Dish</Button>
        </div>
      </div>
      <MenuItemDetail isOpen={isModalOpen} isClose={close} item={item} />
    </>
  );
};

export default MenuItemCard;
