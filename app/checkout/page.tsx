"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import AddonSelector from "@/components/AddonSelector";

type PaymentMethod = "paypay" | "manual";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, totalCartAmount, dispatch } = useCart();
  const { user } = useAuth();
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemForAddons, setSelectedItemForAddons] = useState<string | null>(null);

  // Get table number from URL params if available
  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      setTableNumber(table);
    }
  }, [searchParams]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items.length, router]);

  const handleCheckout = async () => {
    if (!tableNumber.trim()) {
      setError("Please enter a table number");
      return;
    }

    // Note: For LINE Mini App, user should be authenticated via LINE login
    // If not authenticated, we can still create order with userId from LINE
    if (!user) {
      setError("Please login to place an order");
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare order items with addons
      const orderItems = items.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        addons: item.addons?.map(addon => ({
          itemId: addon.id,
          quantity: addon.quantity,
        })) || [],
      }));

      // Get API base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://sukiyaapi.vercel.app";

      // Create order
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId || user._id || "guest",
          displayName: user.displayName || "Guest",
          tableNumber: tableNumber.trim(),
          items: orderItems,
          paymentMethod: paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create order");
      }

      const order = await response.json();

      // Handle payment based on method
      if (paymentMethod === "paypay") {
        // TODO: Integrate PayPay payment processing
        // For now, redirect to success page
        dispatch({ type: "CLEAR_CART" });
        router.push(`/checkout/success?orderId=${order.orderId}`);
      } else {
        // Manual payment - order is created, just redirect to success
        dispatch({ type: "CLEAR_CART" });
        router.push(`/checkout/success?orderId=${order.orderId}&payment=manual`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to process order");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <main className="flex min-h-screen bg-background transition-colors duration-300">
      <div className="inner-wrapper flex-col mt-[100px] py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Table Number */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-xl font-bold mb-4">Table Number</h2>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-4">
                {/* PayPay Option */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:bg-primary/5">
                  <input
                    type="radio"
                    name="payment"
                    value="paypay"
                    checked={paymentMethod === "paypay"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center text-white font-bold">
                        PP
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">PayPay (Card Payment)</h3>
                        <p className="text-sm text-gray-600">Pay securely with PayPay</p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Manual Payment Option */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:bg-primary/5">
                  <input
                    type="radio"
                    name="payment"
                    value="manual"
                    checked={paymentMethod === "manual"}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-5 h-5 text-primary focus:ring-primary"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                        💵
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Manual Payment (Over the Counter)</h3>
                        <p className="text-sm text-gray-600">Pay at the counter when your order is ready</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const itemTotal = item.totalAmount + (item.addons?.reduce((sum, addon) => sum + addon.totalAmount, 0) || 0);
                  return (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={item.image || "/kottu.jpg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{item.title}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">¥{itemTotal.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">¥{item.price.toLocaleString()} each</p>
                        </div>
                      </div>
                      
                      {/* Addons Display */}
                      {item.addons && item.addons.length > 0 && (
                        <div className="ml-24 pl-4 border-l-2 border-primary space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Addons:</p>
                          {item.addons.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                + {addon.title} (×{addon.quantity})
                              </span>
                              <span className="font-medium">¥{addon.totalAmount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Addons Button */}
                      <div className="ml-24">
                        <button
                          onClick={() => setSelectedItemForAddons(item.id)}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {item.addons && item.addons.length > 0 ? "Edit Addons" : "Add Addons"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>¥{totalCartAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>¥0</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>¥{totalCartAmount.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isProcessing || !tableNumber.trim()}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : paymentMethod === "paypay" ? (
                  "Pay with PayPay"
                ) : (
                  "Place Order"
                )}
              </button>

              <button
                onClick={() => router.back()}
                className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Addon Selector Modal */}
      {selectedItemForAddons && (
        <AddonSelector
          parentItemId={selectedItemForAddons}
          onClose={() => setSelectedItemForAddons(null)}
        />
      )}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen bg-background transition-colors duration-300">
        <div className="inner-wrapper flex-col mt-[100px] py-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p>Loading...</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

