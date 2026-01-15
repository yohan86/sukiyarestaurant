"use client";

export default function PayPayConnectButton() {
  return (
    <button
      onClick={() => window.location.href = "/api/paypay/request-token"}
      className="px-4 py-2 bg-red-600 text-white rounded"
    >
      Pay with PayPay
    </button>
  );
}
