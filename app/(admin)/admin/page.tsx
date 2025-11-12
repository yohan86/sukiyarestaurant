export default function AdminDashboard() {
 
  const stats = {
    totalOrders: 24,
    pendingOrders: 8,
    preparingOrders: 5,
    readyOrders: 3,
    completedOrders: 8,
    totalRevenue: 125000,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

   
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <SummaryCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="📋"
          color="bg-blue-500"
        />
        <SummaryCard
          title="Pending"
          value={stats.pendingOrders}
          icon="⏳"
          color="bg-yellow-500"
        />
        <SummaryCard
          title="Preparing"
          value={stats.preparingOrders}
          icon="👨‍🍳"
          color="bg-orange-500"
        />
        <SummaryCard
          title="Ready"
          value={stats.readyOrders}
          icon="✅"
          color="bg-green-500"
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ¥{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="space-y-3">
          <RecentOrderItem
            orderId="ORD12345"
            table="T05"
            total={4500}
            status="Received"
            time="2 min ago"
          />
          <RecentOrderItem
            orderId="ORD12344"
            table="T03"
            total={3200}
            status="Preparing"
            time="5 min ago"
          />
          <RecentOrderItem
            orderId="ORD12343"
            table="T01"
            total={5800}
            status="Ready"
            time="8 min ago"
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} rounded-full p-3 text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentOrderItem({
  orderId,
  table,
  total,
  status,
  time,
}: {
  orderId: string;
  table: string;
  total: number;
  status: string;
  time: string;
}) {
  const statusColors: Record<string, string> = {
    Received: "bg-blue-100 text-blue-800",
    Preparing: "bg-yellow-100 text-yellow-800",
    Ready: "bg-orange-100 text-orange-800",
    Completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{orderId}</span>
          <span className="text-sm text-gray-500">Table {table}</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{time}</p>
      </div>
      <div className="text-lg font-semibold text-gray-900">
        ¥{total.toLocaleString()}
      </div>
    </div>
  );
}


