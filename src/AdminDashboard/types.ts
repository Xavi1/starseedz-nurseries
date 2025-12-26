// src/AdminDashboard/types.ts
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customer?: string;
  date?: string | Date | any;
  status?: string;
  total?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  items?: OrderItem[];
  timeline?: { status: string; date?: string; description?: string }[];
  shippingAddress?: any;
  billingAddress?: any;
  [key: string]: any; // Catch-all for loose firebase data
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string[] | string;
  image: string;
  stock: number;
  inStock: boolean;
  featured?: boolean;
  lowStockThreshold: number;
  description?: string;
  longDescription?: string;
  isBestSeller?: boolean;
  rating?: number;
  careInstructions?: any;
  specifications?: any;
  relatedProducts?: any[];
  reviews?: any;
}

export interface Customer {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  lastLogin: string;
  createdAt: string;
  receiveEmails: boolean;
  ordersCount?: number;
  segment?: 'new' | 'repeat' | 'high';
  totalSpent?: number;
  notes?: string;
}

export interface InventoryAlert {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  image: string;
}