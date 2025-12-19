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

  // Get table number from URL params (QR code) if available
  useEffect(() => {
    // Support multiple possible param names just in case QR/LINE uses a different one
    const table =
      searchParams.get("table") ||
      searchParams.get("tableNumber") ||
      searchParams.get("table_no");
    if (table) {
      setTableNumber(table);
      setError(null);
    } else {
      // If there's no table in the URL, don't allow checkout
      setTableNumber("");
      setError("Table number not found. Please scan the table QR code again.");
    }
  }, [searchParams]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items.length, router]);

  const createOrder = async () => {
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
        userId: user!.userId || user!._id || "guest",
        displayName: user!.displayName || "Guest",
        tableNumber: tableNumber.trim(),
        items: orderItems,
        paymentMethod: paymentMethod,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create order");
    }

    return await response.json();
  };

  const handleCheckout = async () => {
    if (!tableNumber.trim()) {
      setError("Table number is missing. Please scan the table QR code again.");
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
      const order = await createOrder();

      // Handle payment based on method
      // For PayPay, payment is deferred (pay after meal)
      // For manual, payment is at counter
      dispatch({ type: "CLEAR_CART" });
      if (paymentMethod === "paypay") {
        // PayPay - payment pending, can pay after meal
        router.push(`/checkout/success?orderId=${order.orderId}&payment=paypay&status=pending`);
      } else {
        // Manual payment - order is created, just redirect to success
        router.push(`/checkout/success?orderId=${order.orderId}&payment=manual`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to process order");
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!tableNumber.trim()) {
      setError("Table number is missing. Please scan the table QR code again.");
      return;
    }

    if (!user) {
      setError("Please login to place an order");
      router.push("/login");
      return;
    }

    if (paymentMethod !== "paypay") {
      setError("Pay Now is only available for PayPay payment method");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create order
      const order = await createOrder();

      // Get API base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://sukiyaapi.vercel.app";

      // Process payment immediately
      const paymentResponse = await fetch(`${apiBaseUrl}/api/orders/${order._id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: "paid",
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process payment");
      }

      dispatch({ type: "CLEAR_CART" });
      // Redirect to success page with paid status
      router.push(`/checkout/success?orderId=${order.orderId}&payment=paypay&status=paid`);
    } catch (err) {
      console.error("Pay now error:", err);
      setError(err instanceof Error ? err.message : "Failed to process payment");
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
                readOnly
                placeholder="Table number comes from the QR code"
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-100 px-4 py-3 text-base font-medium text-gray-900 shadow-sm focus:outline-none cursor-not-allowed"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                You don&apos;t need to type the table number. It is automatically set from the table QR code.
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PayPay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypay")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all duration-200 ${
                    paymentMethod === "paypay"
                      ? "border-primary bg-primary/10 shadow-lg scale-105"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="w-16 h-16 bg-[#FF6B35] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">
                    PP
                  </div>
                  <h3 className="font-bold text-lg mb-1">PayPay</h3>
                  <p className="text-sm text-gray-600 text-center">Pay after your meal</p>
                  {paymentMethod === "paypay" && (
                    <div className="mt-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Manual Payment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("manual")}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all duration-200 ${
                    paymentMethod === "manual"
                      ? "border-primary bg-primary/10 shadow-lg scale-105"
                      : "border-gray-200 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-3">
                    💵
                  </div>
                  <h3 className="font-bold text-lg mb-1">Manual Payment</h3>
                  <p className="text-sm text-gray-600 text-center">Pay at the counter</p>
                  {paymentMethod === "manual" && (
                    <div className="mt-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
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

              {paymentMethod === "paypay" ? (
                <>
                  {/* Pay Now Button */}
                  <button
                    onClick={handlePayNow}
                    disabled={isProcessing || !tableNumber.trim()}
                    className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </span>
                    ) : (
                      "Pay Now"
                    )}
                  </button>

                  {/* Place Order (Pay Later) Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || !tableNumber.trim()}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      "Place Order (Pay Later)"
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !tableNumber.trim()}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>
              )}

              <button
                onClick={() => router.back()}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200"
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

