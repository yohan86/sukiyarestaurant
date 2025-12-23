"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import PayPayCheckoutModal from "@/components/PayPayCheckoutModal";

type PaymentMethod = "manual" | "paypay";
type PayPayTiming = "now" | "after";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCartAmount, dispatch } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("manual");
  const [payPayTiming, setPayPayTiming] = useState<PayPayTiming>("after");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPayPayModal, setShowPayPayModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push("/");
      return;
    }

    // Set table number from user email/login if available
    if (isAuthenticated && user) {
      // Try to get table number from user data
      if (user.tableId) {
        setTableNumber(user.tableId);
      } else if (user.userId?.startsWith("table_")) {
        // Extract table number from userId (format: table_5)
        const tableId = user.userId.replace("table_", "");
        setTableNumber(tableId);
      } else if (user.email) {
        // If user has email, you might want to extract table from email or use a default
        // For now, we'll leave it empty for manual entry
      }
    }
  }, [items, router, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber.trim()) {
      setError("Please enter your table number");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // For manual payment, create order directly
    // PayPay will be handled by the modal
    await createOrder();
  };

  const createOrder = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get user info
      const userId = user?.userId || `table_${tableNumber.trim()}`;
      const displayName = user?.displayName || user?.email || `Table ${tableNumber.trim()}`;

      // Transform cart items to order format
      const orderItems = items.map((item) => {
        const orderItem: {
          itemId: string;
          quantity: number;
          addons?: Array<{ itemId: string; quantity: number }>;
        } = {
          itemId: item.id,
          quantity: item.quantity,
        };

        // Add addons if any
        if (item.addons && item.addons.length > 0) {
          orderItem.addons = item.addons.map((addon) => ({
            itemId: addon.id,
            quantity: addon.quantity,
          }));
        }

        return orderItem;
      });

      // Determine payment method for API
      let apiPaymentMethod: string;
      if (paymentMethod === "paypay") {
        apiPaymentMethod = payPayTiming === "now" ? "paypay_now" : "paypay_after";
      } else {
        apiPaymentMethod = "manual";
      }

      // Create order - use separate backend API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://sukiyaapi.vercel.app";
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          displayName,
          tableNumber: tableNumber.trim(),
          items: orderItems,
          paymentMethod: apiPaymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to place order");
      }

      const orderData = await response.json();
      setCreatedOrderId(orderData.orderId);

      // Clear cart and redirect
      dispatch({ type: "CLEAR_CART" });
      const successUrl = `/checkout/success?orderId=${orderData.orderId}&payment=${paymentMethod}&status=${orderData.paymentStatus || "pending"}`;
      router.push(successUrl);
    } catch (err) {
      console.error("Order submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to place order");
      setIsSubmitting(false);
    }
  };

  const handlePayPayModalClose = () => {
    setShowPayPayModal(false);
    // Reset payment method if user cancels
    if (!createdOrderId) {
      setPaymentMethod("manual");
    }
  };

  const handlePayPayPaymentComplete = async (timing: "now" | "after") => {
    // Create order with PayPay payment method
    if (!tableNumber.trim() || items.length === 0) {
      setError("Please fill in all required fields");
      setShowPayPayModal(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const userId = user?.userId || `table_${tableNumber.trim()}`;
      const displayName = user?.displayName || user?.email || `Table ${tableNumber.trim()}`;

      const orderItems = items.map((item) => {
        const orderItem: {
          itemId: string;
          quantity: number;
          addons?: Array<{ itemId: string; quantity: number }>;
        } = {
          itemId: item.id,
          quantity: item.quantity,
        };

        if (item.addons && item.addons.length > 0) {
          orderItem.addons = item.addons.map((addon) => ({
            itemId: addon.id,
            quantity: addon.quantity,
          }));
        }

        return orderItem;
      });

      const apiPaymentMethod = timing === "now" ? "paypay_now" : "paypay_after";
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://sukiyaapi.vercel.app";
      
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          displayName,
          tableNumber: tableNumber.trim(),
          items: orderItems,
          paymentMethod: apiPaymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to place order");
      }

      const orderData = await response.json();
      setCreatedOrderId(orderData.orderId);

      // Close modal
      setShowPayPayModal(false);

      // If "Pay Now", redirect to payment page
      if (timing === "now") {
        dispatch({ type: "CLEAR_CART" });
        router.push(`/payment/${orderData.orderId}`);
      } else {
        // If "After Dining", redirect to success
        dispatch({ type: "CLEAR_CART" });
        router.push(`/checkout/success?orderId=${orderData.orderId}&payment=paypay&status=pending`);
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to place order");
      setShowPayPayModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <main className="flex min-h-screen bg-background transition-colors duration-300">
        <div className="inner-wrapper flex-col mt-[100px] py-4 px-2">
          <div className="max-w-6xl mx-auto w-full">
            <div className="mb-4">
              <h1 className="text-4xl font-medium mb-2">Checkout</h1>
              <p className="text-gray-600 font-normal">Review your order and complete your purchase</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Cart Items */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-orange-400 p-4">
                    <h2 className="text-2xl font-medium mb-4">Order Items</h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border-b border-orange-200 pb-4 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{item.title}</h3>
                              <p className="text-sm text-gray-600 mb-2 font-normal">{item.description}</p>
                              {item.addons && item.addons.length > 0 && (
                                <div className="ml-4 mt-2 space-y-1">
                                  {item.addons.map((addon) => (
                                    <p key={addon.id} className="text-sm text-gray-500">
                                      + {addon.quantity}x {addon.title}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-medium">
                                ¥{(item.totalAmount + (item.addons?.reduce((sum, a) => sum + a.totalAmount, 0) || 0)).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500 font-normal">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Number */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-orange-400 p-4">
                    <h2 className="text-2xl font-medium mb-4">Table Information</h2>
                    <div>
                      <label htmlFor="tableNumber" className="block text-sm font-normal text-gray-700 mb-2">
                        Table ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="tableNumber"
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        required
                        className="w-full rounded-xl border-2 border-orange-300 bg-white px-4 py-3 text-base font-normal text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
                        placeholder="Enter your table number"
                        disabled={isSubmitting}
                      />
                      {isAuthenticated && user?.email && (
                        <p className="mt-2 text-sm text-gray-500">
                          Logged in as: {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-orange-400 p-4">
                    <h2 className="text-2xl font-medium mb-4">Payment Method</h2>
                    <div className="flex flex-row gap-4">
                      {/* Manual Payment Option */}
                      <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-orange-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="manual"
                          checked={paymentMethod === "manual"}
                          onChange={() => setPaymentMethod("manual")}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500 mb-2"
                          disabled={isSubmitting}
                        />
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <span className="text-lg font-medium">Pay at Counter</span>
                          </div>
                          <p className="text-sm text-gray-600 font-normal mt-1">Pay when ready</p>
                        </div>
                      </label>

                      {/* PayPay Payment Option */}
                      <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-orange-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypay"
                          checked={paymentMethod === "paypay"}
                          onChange={() => {
                            setPaymentMethod("paypay");
                            // Open PayPay popup immediately when selected
                            if (!isSubmitting) {
                              setShowPayPayModal(true);
                            }
                          }}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500 mb-2"
                          disabled={isSubmitting}
                        />
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <span className="text-lg font-medium">PayPay</span>
                          </div>
                          <p className="text-sm text-gray-600 font-normal mt-1">Pay with PayPay</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-orange-400 p-4 sticky top-24">
                    <h2 className="text-2xl font-medium mb-4">Order Summary</h2>
                    
                    <div className="space-y-3 mb-4">
                      {items.map((item) => {
                        const itemTotal = item.totalAmount + (item.addons?.reduce((sum, a) => sum + a.totalAmount, 0) || 0);
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="font-normal">{item.quantity}x {item.title}</span>
                            <span className="font-medium">¥{itemTotal.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-orange-200 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-medium">Total</span>
                        <span className="text-2xl font-medium text-orange-600">¥{totalCartAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !tableNumber.trim()}
                      className="w-full py-4 bg-orange-500 text-white rounded-xl font-medium text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-orange-600"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Placing Order...
                        </span>
                      ) : (
                        "Place Order"
                      )}
                    </button>

                    <Link
                      href="/"
                      className="block w-full mt-3 py-3 text-center bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors border-2 border-gray-300"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* PayPay Payment Modal */}
      {showPayPayModal && (
        <PayPayCheckoutModal
          isOpen={showPayPayModal}
          onClose={handlePayPayModalClose}
          orderId={createdOrderId || undefined}
          amount={totalCartAmount}
          onPaymentComplete={handlePayPayPaymentComplete}
        />
      )}
    </>
  );
}
