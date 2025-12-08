"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext'; 
// Assuming you have components for Button and router hook
// NOTE: Adjust these imports based on your actual component names/locations
import { useRouter } from 'next/navigation'; 
import { Button } from '@/components/ui/button'; 
import { ICartItem } from '@/types/cart-types'; // Import for item type

const CartDrawer: React.FC = () => {
    // 🌟 1. Access State and Dispatch from both Contexts 🌟
    const { items, totalCartAmount, dispatch } = useCart();
    const { isCartDrawerOpen, setIsCartDrawerOpen } = useUI();
    const router = useRouter(); 

    // Define the close handler using the setter from useUI
    const handleClose = () => setIsCartDrawerOpen(false);

    // --- Action Handlers ---

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id, newQuantity },
        });
    };
    
    // Handler for the '+' button (Increase Quantity)
    const handleIncrease = (item: ICartItem) => {
        handleUpdateQuantity(item.id, item.quantity + 1);
    };

    // Handler for the '-' button (Decrease Quantity/Remove)
    const handleDecrease = (item: ICartItem) => {
        // Reducer handles removal if quantity hits 0
        handleUpdateQuantity(item.id, item.quantity - 1);
    };

    // Handler for removing item entirely
    const handleRemove = (id: string) => {
        dispatch({
            type: 'REMOVE_ITEM',
            payload: { id },
        });
    };

    // Handler for Proceed to Checkout
    const handleProceed = () => {
        handleClose(); // Close the drawer first
        router.push('/cart'); // Navigate to the dedicated cart page
    }

    // --- Styling and Conditional Rendering ---
    
    // Base CSS for fixed position, transition, and shape
    const baseClasses = `
        fixed bottom-0 left-0 right-0 z-50 
        bg-white transform transition-transform duration-300 ease-in-out 
        shadow-2xl rounded-t-2xl max-h-[80vh] overflow-y-auto p-4
    `;

    // Toggle class for animation
    const drawerClasses = `${baseClasses} ${isCartDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`;

    // Render empty cart state if open
    if (items.length === 0) {
        return (
            <div className={drawerClasses}>
                <div className="text-center py-6">
                    <h3 className="text-lg font-semibold text-gray-700">Your cart is empty.</h3>
                    <Button onClick={handleClose} className="mt-3">
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={drawerClasses}>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                    🛒 Current Order ({items.length} items)
                </h2>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                    Close [X]
                </Button>
            </div>
            
            {/* Item List */}
            <div className="space-y-4 max-h-[55vh] overflow-y-auto">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className="flex items-center justify-between border-b last:border-b-0 py-2"
                    >
                        <span className="flex-1 font-medium pr-2">{item.title}</span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mx-4">
                            <Button size="icon" onClick={() => handleDecrease(item)}> - </Button>
                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                            <Button size="icon" onClick={() => handleIncrease(item)}> + </Button>
                        </div>
                        
                        <span className="text-lg font-semibold w-20 text-right">
                            ¥{item.totalAmount.toFixed(0)} {/* Using Yen for Sukiya */}
                        </span>
                    </div>
                ))}
            </div>

            {/* Grand Total & Action Buttons */}
            <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Grand Total:</h3>
                    <span className="text-xl font-bold text-red-600">
                        ¥{totalCartAmount.toFixed(0)}
                    </span>
                </div>
                
                <div className="flex space-x-3">
                    <Button 
                        onClick={handleProceed} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                        Proceed to Checkout
                    </Button>
                    <Button 
                        onClick={handleClose} 
                        variant="outline"
                        className="flex-1 border-gray-300"
                    >
                        Add More (Close)
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;