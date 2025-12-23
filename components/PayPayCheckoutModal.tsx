"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PayPayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  amount: number;
  onPaymentComplete: (timing: "now" | "after") => void;
}

export default function PayPayCheckoutModal({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentComplete,
}: PayPayCheckoutModalProps) {
  const router = useRouter();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [paymentTiming, setPaymentTiming] = useState<"now" | "after">("after");

  const qrEndpoint = orderId 
    ? (process.env.NEXT_PUBLIC_PAYPAY_QR_ENDPOINT || 
       `${process.env.NEXT_PUBLIC_API_URL || "https://sukiyaapi.vercel.app"}/api/paypay/qr/${orderId}`)
    : null;

  useEffect(() => {
    if (!isOpen || paymentTiming !== "now" || !orderId) return;
    
    let cancelled = false;
    async function fetchQr() {
      try {
        setQrLoading(true);
        setQrError(null);
        setImageLoadError(false);
        
        const response = await fetch(qrEndpoint);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `QR request failed (${response.status})`);
        }
        
        const data = await response.json();
        const url = data?.qrUrl || data?.paypayQrUrl || data?.paypayQrCode || data?.qrCodeUrl || data?.url;
        
        if (!url) {
          throw new Error("QR URL missing in backend response.");
        }
        
        if (!cancelled) {
          setQrUrl(url);
          setImageLoadError(false);
        }
      } catch (error) {
        if (!cancelled) {
          setQrError(error instanceof Error ? error.message : "Failed to load PayPay QR.");
          setQrUrl(null);
        }
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    }
    
    fetchQr();
    return () => {
      cancelled = true;
    };
  }, [isOpen, qrEndpoint, retryKey, paymentTiming]);

  const handleConfirm = () => {
    // Call the callback with the selected timing
    onPaymentComplete(paymentTiming);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">PayPay Payment</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Choose when you want to pay:</p>
            
            {/* Payment Timing Options */}
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="paymentTiming"
                  value="after"
                  checked={paymentTiming === "after"}
                  onChange={() => setPaymentTiming("after")}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-bold">Pay After Dining</span>
                  </div>
                  <p className="text-sm text-gray-600">Pay with PayPay after enjoying your meal</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="paymentTiming"
                  value="now"
                  checked={paymentTiming === "now"}
                  onChange={() => setPaymentTiming("now")}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-bold">Pay Now</span>
                  </div>
                  <p className="text-sm text-gray-600">Complete payment immediately with PayPay</p>
                </div>
              </label>
            </div>
          </div>

          {/* Pay Now - Show QR Code and Process Payment */}
          {paymentTiming === "now" && (
            <div className="mb-6">
              {qrLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading PayPay QR code...</p>
                </div>
              )}

              {qrError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm mb-2">{qrError}</p>
                  <button
                    onClick={() => {
                      setRetryKey((prev) => prev + 1);
                      setQrError(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {qrUrl && !imageLoadError && (
                <div className="flex flex-col items-center">
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <Image
                      src={qrUrl}
                      alt="PayPay QR Code"
                      width={300}
                      height={300}
                      className="rounded-lg"
                      onError={() => setImageLoadError(true)}
                      onLoad={() => setImageLoadError(false)}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Scan this QR code with your PayPay app to complete payment
                  </p>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Amount: ¥{amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 text-center mb-2">
                    Click "Process Payment" below to complete
                  </p>
                </div>
              )}

              {imageLoadError && (
                <div className="text-center py-4">
                  <p className="text-red-600 mb-2">Failed to load QR code image</p>
                  <button
                    onClick={() => {
                      setRetryKey((prev) => prev + 1);
                      setImageLoadError(false);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              {paymentTiming === "now" ? "Process Payment" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

