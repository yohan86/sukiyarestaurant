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

    // Priority 1: Get table number from URL query params (e.g., /checkout?table=5)
    const tableFromUrl = searchParams.get("table") || searchParams.get("tableNumber");
    if (tableFromUrl) {
      setTableNumber(tableFromUrl);

      // If not authenticated, redirect to login with table number preserved
      if (!isAuthenticated) {
        const loginUrl = `/login?redirect=/checkout&table=${encodeURIComponent(tableFromUrl)}`;
        router.push(loginUrl);
        return;
      }
      return;
    }

    // Priority 2: Set table number from local storage
    const savedTableNumber = localStorage.getItem("active_table_number");
    if (savedTableNumber) {
      setTableNumber(savedTableNumber);
    }
    // Priority 3: Set table number from authenticated user if available
    else if (isAuthenticated && user) {
    // Set table number from user email/login if available
    if (isAuthenticated && user) {
      // Try to get table number from user data
      if (user.userId?.startsWith("table_")) {
        // Extract table number from userId (format: table_5)
        const tableId = user.userId.replace("table_", "");
        setTableNumber(tableId);
      }
      // Note: tableId property doesn't exist on AuthUser type
      // Table number can be extracted from userId or entered manually
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
      <main className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 transition-colors duration-300">
        <div className="inner-wrapper flex-col mt-[100px] py-6 px-4 md:px-6">
          <div className="max-w-6xl mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-semibold mb-3 text-gray-900">Checkout</h1>
              <p className="text-gray-600 text-base">Review your order and complete your purchase</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Cart Items */}
                  <div className="bg-white rounded-2xl shadow-md border-2 border-orange-300/50 p-6 hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Order Items
                    </h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border-b border-orange-100 pb-4 last:border-b-0 hover:bg-orange-50/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-800 mb-1">{item.title}</h3>
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                              {item.addons && item.addons.length > 0 && (
                                <div className="ml-4 mt-2 space-y-1.5">
                                  {item.addons.map((addon) => (
                                    <p key={addon.id} className="text-sm text-gray-500 flex items-center gap-1">
                                      <span className="text-orange-500">+</span>
                                      <span>{addon.quantity}x {addon.title}</span>
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                              <p className="font-semibold text-lg text-orange-600">
                                ¥{(item.totalAmount + (item.addons?.reduce((sum, a) => sum + a.totalAmount, 0) || 0)).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded-full inline-block">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Number */}
                  <div className="bg-white rounded-2xl shadow-md border-2 border-orange-300/50 p-6 hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Table Information
                    </h2>
                    <div>
                      <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-3">
                        Table ID <span className="text-red-500 font-semibold">*</span>
                      </label>
                      <input
                        id="tableNumber"
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        required
                        className="w-full rounded-xl border-2 border-orange-200 bg-white px-5 py-3.5 text-base font-normal text-gray-900 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all duration-200 hover:border-orange-300"
                        placeholder="Enter your table number"
                        disabled={isSubmitting}
                      />
                      {isAuthenticated && user?.email && (
                        <p className="mt-3 text-sm text-gray-600 flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Logged in as: <span className="font-medium">{user.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-2xl shadow-md border-2 border-orange-300/50 p-6 hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payment Method
                    </h2>
                    <div className="flex flex-row gap-4">
                      {/* Manual Payment Option */}
                      <label className={`flex-1 flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        paymentMethod === "manual" 
                          ? "border-orange-500 bg-orange-50 shadow-md" 
                          : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="manual"
                          checked={paymentMethod === "manual"}
                          onChange={() => setPaymentMethod("manual")}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500 mb-3"
                          disabled={isSubmitting}
                        />
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <span className="text-lg font-semibold text-gray-800">Pay at Counter</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Pay when ready</p>
                        </div>
                      </label>

                      {/* PayPay Payment Option */}
                      <label className={`flex-1 flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        paymentMethod === "paypay" 
                          ? "border-orange-500 bg-orange-50 shadow-md" 
                          : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                      }`}>
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
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500 mb-3"
                          disabled={isSubmitting}
                        />
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <span className="text-lg font-semibold text-gray-800">PayPay</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Pay with PayPay</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-md border-2 border-orange-300/50 p-6 sticky top-24 hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Order Summary
                    </h2>
                    
                    <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-2">
                      {items.map((item) => {
                        const itemTotal = item.totalAmount + (item.addons?.reduce((sum, a) => sum + a.totalAmount, 0) || 0);
                        return (
                          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-b-0">
                            <span className="font-normal text-gray-700">{item.quantity}x {item.title}</span>
                            <span className="font-semibold text-gray-900">¥{itemTotal.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t-2 border-orange-200 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-xl font-semibold text-gray-800">Total</span>
                        <span className="text-2xl font-bold text-orange-600">¥{totalCartAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !tableNumber.trim()}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
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
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Place Order</span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/"
                      className="block w-full mt-3 py-3 text-center bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300"
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
