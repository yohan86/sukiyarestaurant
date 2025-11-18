import { CartAction, CartState, ICartItem } from "@/types/cart-types";

const calculateTotals = (items:ICartItem[]): {totalCartAmount:number} => {
    const totalCartAmount = items.reduce((total, item)=> total + item.totalAmount, 0);
    return {totalCartAmount};
}

export const initialCartState: CartState = {
    items: [],
    totalCartAmount:0,
}

export const cartReducer = (state:CartState, action:CartAction): CartState => {
    switch(action.type){
        case "ADD_ITEM" : {
            const newItem = action.payload;
            const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
            if(existingItemIndex > -1){
                const updatedItems = [...state.items];
                const existingItem = updatedItems[existingItemIndex];

                const updatedItem:ICartItem = {
                    ...existingItem,
                    quantity: existingItem.quantity + newItem.quantity,
                    totalAmount: existingItem.totalAmount + newItem.totalAmount
                }
                updatedItems[existingItemIndex] = updatedItem;
                return{
                    items:updatedItems,
                    ...calculateTotals(updatedItems)
                }
            }else{
              const updatedItems = [...state.items, newItem];
              return{
                items:updatedItems,
                ...calculateTotals(updatedItems)
              }
            }

        }
        case "UPDATE_QUANTITY": {
            const { id, newQuantity } = action.payload;
            if(newQuantity < 1 ){
                return cartReducer(state, {type: "REMOVE_ITEM", payload:{id}});
            } 
            
            const updatedItems = state.items.map(item =>
                
                (item.id === id) ? {
                    ...item,
                    quantity: newQuantity,
                    totalAmount: item.price * newQuantity
                } : item
                
            );
            return {
                items: updatedItems,
                ...calculateTotals(updatedItems)
            }
                
        }
        case "REMOVE_ITEM": {
            const {id} = action.payload;
            const updatedItems = state.items.filter(item => item.id !== id);
            return{
                items:updatedItems,
                ...calculateTotals(updatedItems)
            }
        }
        case "CLEAR_CART": {
            return initialCartState;
        }
        default: {
            return state;
        }
    }
};