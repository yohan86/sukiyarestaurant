import { useCart } from "@/context/CartContext";
import { ICartItem } from "@/types/cart-types";
import { useState } from "react";

interface QuantityContrilProps {
    item: ICartItem
}
const QuantityControl:React.FC<QuantityContrilProps> = ({item}) => {
    const [dishQuantity, setDishQuantity] = useState(item.quantity);
    const {dispatch} = useCart();

const handleQuantity = (newQuantity: number) => {
    dispatch({
        type: "UPDATE_QUANTITY",
        payload: {id:item.id, newQuantity: newQuantity},
    })
}
const increaseQuantity = () => {
    handleQuantity(item.quantity + 1);
}
const decreaseQuantity = () => {
    if(item.quantity > 1){
        handleQuantity(item.quantity - 1 );
    }
}


  return (
    <div className="flex flex-col md:flex-row md:gap-4">
        <div className="flex flex-row items-center justify-center space-x-2">
            <span className="text-white font-semibold">Dishes :</span>
            <div className="flex flex-row">
                <button className="flex bg-yellow-500 text-white w-6 h-6 justify-center items-center leading-none"
                onClick={decreaseQuantity}
                >
                    <span className="h-[22px] text-[18px] leading-1">-</span>
                </button>
                <span className="min-w-[25px] text-center  text-white">{item.quantity}</span>
                <button className="flex bg-yellow-500 text-white w-6 h-6 justify-center items-center leading-none text-[18px]"
                onClick={increaseQuantity}
                >
                    <span className="h-[22px] text-[18px] leading-1">+</span>
                </button>
            </div>
        </div>

        <span className="flex mt-1 text-white font-semibold">Amount: 
            <span className=" ml-1 text-white  font-bold">{item.totalAmount.toFixed(0)} 
            &yen;
        </span></span>
    </div>
  )
}

export default QuantityControl