"use client";

import { useState } from "react";
import { type Order, updateOrderPaymentStatus } from "@/lib/admin-api";
import StatusBadge from "./StatusBadge";
import StatusSelect from "./StatusSelect";
import PayPayPaymentModal from "./PayPayPaymentModal";

interface OrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void;
  onPaymentStatusChange: (orderId: string, newPaymentStatus: Order["paymentStatus"]) => void;
}

export default function OrderRow({
  order,
  onStatusChange,
  onPaymentStatusChange,
}: OrderRowProps) {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Format date and time
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPaid = order.paymentStatus === "paid";
  const paymentStatusLabel =
    order.paymentStatus === "paid"
      ? "Paid"
      : order.paymentStatus === "pending"
      ? "Pending"
      : "Not recorded";

  const paymentStatusClass =
    order.paymentStatus === "paid"
      ? "bg-green-100 text-green-800 border-green-300"
      : order.paymentStatus === "pending"
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : "bg-gray-100 text-gray-800 border-gray-300";

  const handleMarkAsPaid = async () => {
    if (isUpdatingPayment) return;
    try {
      setIsUpdatingPayment(true);
      const updated = await updateOrderPaymentStatus(order._id, "paid");
      onPaymentStatusChange(order._id, updated.paymentStatus ?? "paid");
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all duration-200 group">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-base font-bold text-gray-900">{order.orderId}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900">{orderDate}</div>
            <div className="text-xs text-gray-500 font-medium">{orderTime}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-bold inline-block">
            {order.tableNumber}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-700 space-y-1">
            {order.items.map((item, index) => (
              <div key={`${item.itemId}-${index}`} className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{item.quantity}x</span>
                <span className="font-medium text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-base font-bold text-gray-900">
            ¥{order.total.toLocaleString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={order.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-2">
            <StatusSelect
              orderId={order._id}
              currentStatus={order.status}
              onStatusChange={(newStatus) => onStatusChange(order._id, newStatus)}
            />

            {/* Payment management for after-dining payments */}
            {(order.paymentMethod === "paypay" || order.paymentMethod === "manual") && (
              <div className="flex items-center gap-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500">Payment</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">
                      {order.paymentMethod === "paypay"
                        ? "PayPay (After dining)"
                        : "Manual (Counter)"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${paymentStatusClass}`}
                    >
                      {paymentStatusLabel}
                    </span>
                  </div>
                </div>

                {!isPaid && (
                  <div className="ml-auto flex flex-col gap-2">
                    {order.paymentMethod === "paypay" && (
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B35] text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
                      >
                        Update Payment
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleMarkAsPaid}
                      disabled={isUpdatingPayment}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#31a354] text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-150"
                    >
                      {isUpdatingPayment ? "Saving..." : "Mark as Paid"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* PayPay Payment Modal - Rendered outside table for valid HTML */}
      {order.paymentMethod === "paypay" && (
        <PayPayPaymentModal
          order={order}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentComplete={(orderId, paymentStatus) => {
            onPaymentStatusChange(orderId, paymentStatus);
          }}
        />
      )}
    </>
  );
}

