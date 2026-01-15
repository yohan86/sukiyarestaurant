"use client";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext"
import { useRouter } from "next/navigation";
import QuantityControl from "./QuantityControl";
import { Button } from "./ui/button";
import { useState } from "react";
import QRCode from "qrcode";

const CartDrawer = () => {
    const {items, totalCartAmount, dispatch} = useCart();
    const {isCartDrawerOpen, setIsCartDrawerOpen} = useUI();
    const router = useRouter();

    const [qrUrl, setQrUrl] = useState<string | null>(null);
const [qrImage, setQrImage] = useState<string | null>(null);

//PAYPAY START
  const [loading, setLoading] = useState(false);

  const payWithPayPay = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/paypay-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: totalCartAmount,
          description: "Checkout order payment"
        })
      });

        const data = await res.json();
    const deeplink = data?.raw?.data?.deeplink;

    if (!deeplink) {
      alert("PayPay did not return a deeplink");
      return;
    }

    // Generate QR image from deeplink
    const qrUrl = await QRCode.toDataURL(deeplink);
    setQrImage(qrUrl);

      // Automatic redirect to PayPay
     // window.location.href = url;
     setQrUrl(qrUrl);


    } catch (err) {
      console.error("PayPay error", err);
      alert("Payment request failed");
    }

    setLoading(false);
  };
    //END PAYPAY

    const handleClose = ()=> setIsCartDrawerOpen(false);

    const removeItem = (id:string)=> {
        dispatch({
            type:"REMOVE_ITEM",
            payload:{id},
        })
    };
    
    const baseClasses = `
        fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 
        bg-primary max-h-[80vh] overflow-y-auto pt-2 p-4 border-t-2 border-yellow-500
    `;
    const drawerClasses = `${baseClasses} ${isCartDrawerOpen? "translate-y-0": "translate-y-full"}`;

    if(items.length === 0) {
        return(
            <div className={drawerClasses}>
                <div className="relative">
                    <span 
                    className="flex absolute w-5 h-5 top-[-15px] right-0 bg-red-600 text-white p-1 indend-0 text-[12px] items-center justify-center rounded-[50%]"
                    onClick={handleClose}
                    >X</span>
                    <div className="flex flex-col items-center justify-center text-white gap-2">
                        <h3 className="">Cart is empty</h3>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className={drawerClasses}>
            <div className="relative">
                <span 
                className="flex absolute w-5 h-5 top-0 right-0 bg-red-600 text-white p-1 indend-0 text-[12px] items-center justify-center rounded-[50%]"
                onClick={handleClose}
                >X</span>
                <h3 className="text-white text-[16px] mb-2">Cart Summary</h3>
                <ul className="cart-items-wrapper">
                {items.map(item=>(
                    <li key={item.id} className="w-full shadow-[1px_3px_15px_#282525] p-4 mb-6">
                        <div className="">
                            <h3 className="text-white text-[18px] mb-2 pb-1 border-b border-[#232222]">{item.title}-{item.price}&yen;</h3>
                        </div>
                        <ul className="flex flex-row gap-5 justify-between">
                            <li className="flex">
                                <QuantityControl item={item} /> 
                            </li>
                            <li>
                                <button 
                                className="bg-red-600 text-white rounded-3xl py-1 px-3"
                                onClick={()=>removeItem(item.id)}
                                >Remove</button>
                            </li>
                        </ul>
                    </li>
                ))}
                </ul>

                <div className="cart-summary">
                    <div className="w-full shadow-[1px_3px_15px_#282525] p-6 py-3 mb-6">
                        <div className="text-white text-3xl font-semibold py-1">Total: {totalCartAmount}&yen;</div>
                        <div className="btn-wrapper flex gap-2">
                            <Button onClick={handleClose}>Add More</Button>
                            <Button variant="red" onClick={payWithPayPay}>Proceed</Button>
                            <h2 className="text-center font-semibold mb-3">Scan with PayPay</h2>
      <img src={qrImage!} alt="PayPay QR" className="w-20 h-auto" />
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>

    )
}

export default CartDrawer;