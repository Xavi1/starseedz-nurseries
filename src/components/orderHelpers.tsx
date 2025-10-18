// helpers/orderHelpers.ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Define the OrderItem interface
export interface OrderItem {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
  category?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  date: string;
  billingAddress: {
    address: string;
    apartment?: string;
    city: string;
    country: string;
    firstName: string;
    lastName: string;
    state: string;
    zipCode: string;
  };
  shippingAddress: {
    address: string;
    apartment?: string;
    city: string;
    country: string;
    firstName: string;
    lastName: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: {
    type: string;
    last4?: string;
  };
  shippingMethod: string;
  timeline: Array<{
    date: string;
    description: string;
    status: string;
  }>;
}

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders: Order[] = [];
    
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        orderNumber: data.orderNumber || `Order #${doc.id}`,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        tax: data.tax || 0,
        total: data.total || (data.subtotal || 0) + (data.shipping || 0) + (data.tax || 0),
        status: data.status || 'Processing',
        date: data.date || new Date().toISOString(),
        billingAddress: data.billingAddress || {},
        shippingAddress: data.shippingAddress || {},
        paymentMethod: data.paymentMethod || { type: 'Unknown' },
        shippingMethod: data.shippingMethod || 'Standard Shipping',
        timeline: data.timeline || []
      } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const fetchOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('orderNumber', '==', orderNumber)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    if (!ordersSnapshot.empty) {
      const doc = ordersSnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        orderNumber: data.orderNumber,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        tax: data.tax || 0,
        total: data.total || (data.subtotal || 0) + (data.shipping || 0) + (data.tax || 0),
        status: data.status || 'Processing',
        date: data.date || new Date().toISOString(),
        billingAddress: data.billingAddress || {},
        shippingAddress: data.shippingAddress || {},
        paymentMethod: data.paymentMethod || { type: 'Unknown' },
        shippingMethod: data.shippingMethod || 'Standard Shipping',
        timeline: data.timeline || []
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching order by number:', error);
    throw error;
  }
};

export const fetchOrdersByStatus = async (userId: string, status: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders: Order[] = [];
    
    ordersSnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        orderNumber: data.orderNumber || `Order #${doc.id}`,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        tax: data.tax || 0,
        total: data.total || (data.subtotal || 0) + (data.shipping || 0) + (data.tax || 0),
        status: data.status || 'Processing',
        date: data.date || new Date().toISOString(),
        billingAddress: data.billingAddress || {},
        shippingAddress: data.shippingAddress || {},
        paymentMethod: data.paymentMethod || { type: 'Unknown' },
        shippingMethod: data.shippingMethod || 'Standard Shipping',
        timeline: data.timeline || []
      } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }
};