// Mock API functions for admin dashboard
// These will be replaced with actual API calls later

export type OrderStatus = "Received" | "Preparing" | "Ready" | "Completed";

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  displayName: string;
  tableNumber: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  nameEn: string;
  nameJp: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    _id: "1",
    orderId: "ORD12345",
    userId: "user1",
    displayName: "John Doe",
    tableNumber: "T05",
    items: [
      { itemId: "1", name: "Sukiyaki Set", quantity: 2, price: 1500 },
      { itemId: "2", name: "Miso Soup", quantity: 2, price: 200 },
    ],
    total: 3400,
    status: "Received",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    orderId: "ORD12344",
    userId: "user2",
    displayName: "Jane Smith",
    tableNumber: "T03",
    items: [
      { itemId: "3", name: "Teriyaki Bowl", quantity: 1, price: 1200 },
      { itemId: "4", name: "Salad", quantity: 1, price: 400 },
    ],
    total: 1600,
    status: "Preparing",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    _id: "3",
    orderId: "ORD12343",
    userId: "user3",
    displayName: "Bob Johnson",
    tableNumber: "T01",
    items: [
      { itemId: "5", name: "Premium Set", quantity: 3, price: 2500 },
    ],
    total: 7500,
    status: "Ready",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    _id: "4",
    orderId: "ORD12342",
    userId: "user4",
    displayName: "Alice Brown",
    tableNumber: "T02",
    items: [
      { itemId: "1", name: "Sukiyaki Set", quantity: 1, price: 1500 },
      { itemId: "6", name: "Green Tea", quantity: 2, price: 150 },
    ],
    total: 1800,
    status: "Completed",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
];

// Mock API functions
export async function getOrders(): Promise<Order[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockOrders;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<Order> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  const order = mockOrders.find((o) => o.orderId === orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return order;
}

// Mock menu items data
const mockMenuItems: MenuItem[] = [
  {
    _id: "1",
    nameEn: "Sukiyaki Set",
    nameJp: "すき焼きセット",
    price: 1500,
    imageUrl: "https://via.placeholder.com/150",
    category: "Main Course",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    nameEn: "Teriyaki Bowl",
    nameJp: "照り焼き丼",
    price: 1200,
    imageUrl: "https://via.placeholder.com/150",
    category: "Main Course",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "3",
    nameEn: "Miso Soup",
    nameJp: "味噌汁",
    price: 200,
    imageUrl: "https://via.placeholder.com/150",
    category: "Appetizer",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "4",
    nameEn: "Premium Set",
    nameJp: "プレミアムセット",
    price: 2500,
    imageUrl: "https://via.placeholder.com/150",
    category: "Main Course",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "5",
    nameEn: "Salad",
    nameJp: "サラダ",
    price: 400,
    imageUrl: "https://via.placeholder.com/150",
    category: "Appetizer",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "6",
    nameEn: "Green Tea",
    nameJp: "緑茶",
    price: 150,
    imageUrl: "https://via.placeholder.com/150",
    category: "Drink",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "7",
    nameEn: "Tempura",
    nameJp: "天ぷら",
    price: 800,
    imageUrl: "https://via.placeholder.com/150",
    category: "Appetizer",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "8",
    nameEn: "Matcha Ice Cream",
    nameJp: "抹茶アイスクリーム",
    price: 500,
    imageUrl: "https://via.placeholder.com/150",
    category: "Dessert",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "9",
    nameEn: "Sushi Platter",
    nameJp: "寿司盛り合わせ",
    price: 3000,
    imageUrl: "https://via.placeholder.com/150",
    category: "Main Course",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "10",
    nameEn: "Rice",
    nameJp: "ご飯",
    price: 200,
    imageUrl: "https://via.placeholder.com/150",
    category: "Side Dish",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "11",
    nameEn: "Soda",
    nameJp: "ソーダ",
    price: 250,
    imageUrl: "https://via.placeholder.com/150",
    category: "Drink",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock menu API functions
export async function getMenuItems(): Promise<MenuItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockMenuItems;
}

export async function createMenuItem(item: Omit<MenuItem, "_id" | "createdAt" | "updatedAt">): Promise<MenuItem> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const newItem: MenuItem = {
    ...item,
    _id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockMenuItems.push(newItem);
  return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const item = mockMenuItems.find((m) => m._id === id);
  if (!item) {
    throw new Error("Menu item not found");
  }
  Object.assign(item, updates, { updatedAt: new Date().toISOString() });
  return item;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const itemIndex = mockMenuItems.findIndex((m) => m._id === id);
  if (itemIndex === -1) {
    throw new Error("Menu item not found");
  }
  mockMenuItems.splice(itemIndex, 1);
}

