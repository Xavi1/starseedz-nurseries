// Shared interfaces for AdminDashboard

export interface Order {
  id: string;
  customerId: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}
