import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db';

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    // Use native MongoDB driver for more reliable querying
    const db = await getMongoDb();

    // Fetch orders
    const orders = await db
      .collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all order items
    const orderItemsMap = new Map();
    if (orders.length > 0) {
      const orderIds = orders.map((order) => order._id);
      const orderItems = await db
        .collection('order_items')
        .find({ orderId: { $in: orderIds } })
        .toArray();

      // Group items by orderId
      orderItems.forEach((item) => {
        const orderIdStr = item.orderId.toString();
        if (!orderItemsMap.has(orderIdStr)) {
          orderItemsMap.set(orderIdStr, []);
        }
        orderItemsMap.get(orderIdStr).push(item);
      });
    }

    // Transform to match frontend format
    const transformedOrders = orders.map((order) => {
      const orderIdStr = order._id.toString();
      const items = (orderItemsMap.get(orderIdStr) || []).map((item: any) => ({
        itemId: item.itemId.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      return {
        _id: order._id.toString(),
        id: order._id.toString(),
        orderId: order.orderId,
        userId: order.userId,
        displayName: order.displayName,
        tableNumber: order.tableNumber,
        items: items,
        total: order.total,
        status: order.status,
        createdAt:
          order.createdAt instanceof Date
            ? order.createdAt.toISOString()
            : new Date(order.createdAt).toISOString(),
        updatedAt:
          order.updatedAt instanceof Date
            ? order.updatedAt.toISOString()
            : new Date(order.updatedAt).toISOString(),
      };
    });

    return NextResponse.json(transformedOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

