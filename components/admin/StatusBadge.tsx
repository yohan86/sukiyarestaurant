type OrderStatus = "Received" | "Preparing" | "Ready" | "Completed";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusStyles: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    Received: {
      bg: "bg-[#E3F2FD]",
      text: "text-[#1976D2]",
      border: "border-[#1976D2]",
    },
    Preparing: {
      bg: "bg-[#FFF3E0]",
      text: "text-[#F57C00]",
      border: "border-[#F57C00]",
    },
    Ready: {
      bg: "bg-[#E8F5E9]",
      text: "text-[#31a354]",
      border: "border-[#31a354]",
    },
    Completed: {
      bg: "bg-[#E8F5E9]",
      text: "text-[#31a354]",
      border: "border-[#31a354]",
    },
  };

  const statusStyle = statusStyles[status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  };

  return (
    <span
      className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} ${className}`}
    >
      {status}
    </span>
  );
}


