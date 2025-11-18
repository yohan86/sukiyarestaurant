"use client";

import { type Order } from "@/lib/admin-api";
import StatusBadge from "./StatusBadge";
import StatusSelect from "./StatusSelect";

interface OrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void;
}

export default function OrderRow({ order, onStatusChange }: OrderRowProps) {
  // Format date and time
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
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
        <StatusSelect
          orderId={order._id || (order as any).id}
          currentStatus={order.status}
          onStatusChange={(newStatus) => onStatusChange(order._id || (order as any).id, newStatus)}
        />
      </td>
    </tr>
  );
}


