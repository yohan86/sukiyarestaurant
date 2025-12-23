"use client";

import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="text-gray-600 mb-4">Checkout functionality is being developed.</p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        Go Back
      </button>
    </div>
  );
}
