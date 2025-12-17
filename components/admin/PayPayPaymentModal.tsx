"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { type Order, updateOrderPaymentStatus } from "@/lib/admin-api";

interface PayPayPaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (orderId: string, paymentStatus: "paid") => void;
}

export default function PayPayPaymentModal({
  order,
  isOpen,
  onClose,
  onPaymentComplete,
}: PayPayPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate QR code data - PayPay payment link format
  // In production, this would be a real PayPay payment link
  // For now, we'll create a payment URL with order details
  const paymentUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/payment/${order.orderId}`;
  
  // Generate QR code using a QR code API service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;

  // Format order date and time
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleMarkAsPaid = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const updated = await updateOrderPaymentStatus(order._id, "paid");
      onPaymentComplete(order._id, "paid");
      onClose();
    } catch (err) {
      console.error("Failed to update payment status:", err);
      setError(err instanceof Error ? err.message : "Failed to mark payment as paid");
    } finally {
      setIsProcessing(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/50 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FF6B35] via-[#FF6B35] to-[#FF6B35] px-6 md:px-8 py-6 md:py-7 flex items-center justify-between rounded-t-3xl shadow-lg z-10">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              PayPay Payment
            </h2>
            <p className="text-base md:text-lg text-white/95 mt-2 font-medium">
              Order {order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-all duration-200 p-3 md:p-4 hover:bg-white/30 rounded-full backdrop-blur-sm min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <svg
              className="w-7 h-7 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8">
          {/* Order Details */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Order ID
                </p>
                <p className="text-lg font-bold text-gray-900">{order.orderId}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Table Number
                </p>
                <p className="text-lg font-bold text-gray-900">Table {order.tableNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Customer
                </p>
                <p className="text-lg font-bold text-gray-900">{order.displayName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Order Date
                </p>
                <p className="text-sm font-medium text-gray-700">{orderDate}</p>
                <p className="text-sm font-medium text-gray-700">{orderTime}</p>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <div className="bg-gradient-to-r from-[#FF6B35]/10 via-[#FF6B35]/5 to-[#FF6B35]/10 rounded-2xl p-6 border-2 border-[#FF6B35]/20">
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 text-center">
                Total Amount
              </p>
              <p className="text-4xl md:text-5xl font-black text-[#FF6B35] text-center">
                ¥{order.total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Scan to Pay with PayPay
            </h3>
            <div className="flex flex-col items-center">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gray-200 mb-4">
                <img
                  src={qrCodeUrl}
                  alt="PayPay QR Code"
                  className="w-64 h-64 md:w-80 md:h-80"
                />
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 max-w-md">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Instructions
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Open the PayPay app on your smartphone</li>
                  <li>Tap the "Scan" button in PayPay</li>
                  <li>Point your camera at the QR code above</li>
                  <li>Confirm the payment amount: ¥{order.total.toLocaleString()}</li>
                  <li>Complete the payment in PayPay</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {order.items.map((item, index) => {
                const itemTotal = item.quantity * item.price;
                return (
                  <div
                    key={`${item.itemId}-${index}`}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ¥{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ¥{itemTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleMarkAsPaid}
              disabled={isProcessing || order.paymentStatus === "paid"}
              className="flex-1 py-4 bg-gradient-to-r from-[#31a354] to-[#31a354] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : order.paymentStatus === "paid" ? (
                "Payment Already Completed"
              ) : (
                "Mark Payment as Completed"
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to document body to avoid hydration errors
  return createPortal(modalContent, document.body);
}

