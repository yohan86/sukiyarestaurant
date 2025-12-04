"use client";
import { useCart } from "@/context/CartContext"
import { useUI } from "@/context/UIContext";
import { TiShoppingCart } from "react-icons/ti";

const CartButton:React.FC= () => {
    const {items} = useCart();
    const {isCartDrawerOpen, setIsCartDrawerOpen} = useUI();
    
    const toggleDrawer= ()=> {
        setIsCartDrawerOpen(!isCartDrawerOpen);
    }

  return (
    <div>
        <div className="flex flex-row" onClick={toggleDrawer}>
            <TiShoppingCart size="25" className="text-white" />
            <sup className="h-[22px] top-[-14px] bg-red-500 rounded-full text-white p-[6px] leading-[9px]">{items.length}</sup>
        </div>
    </div>
  )
}

export default CartButton