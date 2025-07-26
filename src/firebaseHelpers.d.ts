// firebaseHelpers.d.ts
import { Timestamp } from "firebase/firestore";

// ================== INTERFACES ==================
interface User {
  id?: string; // Document ID will be added when retrieved
  createdAt: Timestamp;
  firstname: string;
  lastname: string;
  birthdate: string;
  email: string;
  address: string;
  phone: string;
  // Add other user fields as needed
}

interface Product {
  id?: string; // Document ID will be added when retrieved
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Timestamp;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id?: string; // Document ID will be added when retrieved
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: Timestamp;
}

interface Review {
  id?: string; // Document ID will be added when retrieved
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

// ================== FUNCTION TYPES ==================
export declare const updateUserProfile: (
  userId: string,
  profileData: Partial<User>
) => Promise<void>;

export declare const createUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<string>;

export declare const getUserById: (userId: string) => Promise<User | null>;

export declare const addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<string>;

export declare const getAllProducts: () => Promise<Product[]>;

export declare const getProductById: (productId: string) => Promise<Product | null>;

export declare const createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'> & {
  items: Array<{
    productId: string;
    quantity: number;
  }>
}) => Promise<string>;

export declare const getOrdersByUser: (userId: string) => Promise<Order[]>;

export declare const addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<string>;

export declare const getReviewsByProduct: (productId: string) => Promise<Review[]>;