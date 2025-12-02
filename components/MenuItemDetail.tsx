"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCart } from "@/context/CartContext";

interface MenuItem {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  isAvailable: boolean;
}

interface Props {
  isOpen: boolean;
  isClose: () => void;
  item: MenuItem;
}

const MenuItemDetail: React.FC<Props> = ({ isOpen, isClose, item }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const increase = () => setQuantity(q => q + 1);
  const decrease = () => setQuantity(q => (q > 1 ? q - 1 : 1));
  const addOrder = () => {
    addToCart({ id: item.id, title: item.title, price: item.price, quantity });
    isClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10"
      onClick={isClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-tr-[42px] overflow-hidden shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-64">
          <Image src={item.image} alt={item.title} fill style={{ objectFit: "cover" }} />
          <div className="absolute right-0 bottom-0 bg-red-500 text-white font-bold px-2 py-1">
            ¥{item.price}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
          <p className="text-gray-600 mb-4">{item.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={decrease}>-</Button>
              <span>{quantity}</span>
              <Button onClick={increase}>+</Button>
            </div>
            <Button onClick={addOrder}>Add Order</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;
