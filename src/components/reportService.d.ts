// Type definitions for reportService
export interface SalesData {
  id: string;
  amount: number;
  date: Date;
  customerId: string;
  products: string[];
  status: string;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  type: 'new' | 'returning';
  previousOrders: number;
}

export interface InventoryData {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  status: string;
}

export interface ProcessedSalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProcessedCustomerData {
  newCustomers: number;
  returningCustomers: number;
  growthData: any[]; // You can define more specific types later
}

export interface ProcessedInventoryData {
  [category: string]: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
}

// Function declarations
export declare function fetchSalesReport(timeframe: string): Promise<ProcessedSalesData[]>;
export declare function fetchCustomerReport(timeframe: string): Promise<ProcessedCustomerData>;
export declare function fetchInventoryReport(): Promise<ProcessedInventoryData>;