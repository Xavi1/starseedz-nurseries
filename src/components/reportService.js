// services/reportService.js
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Fetch sales report data
export const fetchSalesReport = async (timeframe) => {
  try {
    const salesCollection = collection(db, 'orders');
    let q = query(salesCollection);
    
    // Add timeframe filter
    const dateFilter = getDateFilter(timeframe);
    if (dateFilter) {
      q = query(q, where('date', '>=', dateFilter));
    }
    
    q = query(q, orderBy('date', 'asc'));
    
    const snapshot = await getDocs(q);
    const salesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date
    }));
    
    return processSalesData(salesData, timeframe);
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

// Fetch customer report data
export const fetchCustomerReport = async (timeframe) => {
  try {
    const customersCollection = collection(db, 'customers');
    let q = query(customersCollection);
    
    const dateFilter = getDateFilter(timeframe);
    if (dateFilter) {
      q = query(q, where('createdAt', '>=', dateFilter));
    }
    
    const snapshot = await getDocs(q);
    const customerData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
    
    return processCustomerData(customerData, timeframe);
  } catch (error) {
    console.error('Error fetching customer report:', error);
    throw error;
  }
};

// Fetch inventory report data
export const fetchInventoryReport = async () => {
  try {
    const inventoryCollection = collection(db, 'products');
    const q = query(inventoryCollection, orderBy('category'));
    
    const snapshot = await getDocs(q);
    const inventoryData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return processInventoryData(inventoryData);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw error;
  }
};

// Helper function to calculate date filters
const getDateFilter = (timeframe) => {
  const now = new Date();
  const filterDate = new Date();
  
  switch (timeframe) {
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      filterDate.setDate(now.getDate() - 30);
      break;
    case 'quarter':
      filterDate.setDate(now.getDate() - 90);
      break;
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }
  
  return Timestamp.fromDate(filterDate);
};

// Process sales data for charts
const processSalesData = (salesData, timeframe) => {
  // Group data by date based on timeframe
  const groupedData = salesData.reduce((acc, sale) => {
    const date = new Date(sale.date);
    let key;
    
    switch (timeframe) {
      case 'week':
        key = date.toLocaleDateString();
        break;
      case 'month':
        key = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case 'quarter':
      case 'year':
        key = `${date.getMonth() + 1}/1`;
        break;
      default:
        key = date.toLocaleDateString();
    }
    
    if (!acc[key]) {
      acc[key] = { revenue: 0, orders: 0 };
    }
    
    acc[key].revenue += sale.amount || 0;
    acc[key].orders += 1;
    
    return acc;
  }, {});
  
  // Convert to array format for Recharts
  return Object.entries(groupedData).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders
  }));
};

// Process customer data
const processCustomerData = (customerData, timeframe) => {
  const newCustomers = customerData.filter(customer => 
    customer.type === 'new' || !customer.previousOrders || customer.previousOrders === 0
  );
  
  const returningCustomers = customerData.filter(customer => 
    customer.type === 'returning' || (customer.previousOrders && customer.previousOrders > 0)
  );
  
  return {
    newCustomers: newCustomers.length,
    returningCustomers: returningCustomers.length,
    growthData: calculateCustomerGrowth(customerData, timeframe)
  };
};

//Calculate customer growth over time
const calculateCustomerGrowth = (customerData, timeframe) => {
  if (!customerData || customerData.length === 0) {
    return [];
  }

  // Group customers by time period
  const groupedData = customerData.reduce((acc, customer) => {
    const date = new Date(customer.createdAt);
    let key;
    
    switch (timeframe) {
      case 'week':
        key = date.toLocaleDateString();
        break;
      case 'month':
        key = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case 'quarter':
        key = `Week ${Math.floor(date.getDate() / 7) + 1}`;
        break;
      case 'year':
        key = date.toLocaleString('default', { month: 'short' });
        break;
      default:
        key = date.toLocaleDateString();
    }
    
    if (!acc[key]) {
      acc[key] = { new: 0, returning: 0, total: 0 };
    }
    
    if (customer.type === 'new' || !customer.previousOrders || customer.previousOrders === 0) {
      acc[key].new += 1;
    } else {
      acc[key].returning += 1;
    }
    
    acc[key].total += 1;
    
    return acc;
  }, {});

  // Convert to array format and sort by date
  const result = Object.entries(groupedData).map(([period, data]) => ({
    period,
    new: data.new,
    returning: data.returning,
    total: data.total
  }));

  // Simple sorting - you might want more sophisticated date sorting
  return result.sort((a, b) => {
    // Basic string comparison - works for consistent date formats
    return a.period.localeCompare(b.period);
  });
};

// Process inventory data
const processInventoryData = (inventoryData) => {
  const categories = {};
  
  inventoryData.forEach(product => {
    const category = product.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = {
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      };
    }
    
    if (product.quantity === 0) {
      categories[category].outOfStock++;
    } else if (product.quantity <= (product.lowStockThreshold || 10)) {
      categories[category].lowStock++;
    } else {
      categories[category].inStock++;
    }
    
    categories[category].totalValue += (product.price || 0) * (product.quantity || 0);
  });
  
  return categories;
};

//function to get report summary
export const getReportSummary = async (timeframe = 'month') => {
  try {
    const [salesData, customerData, inventoryData] = await Promise.all([
      fetchSalesReport(timeframe),
      fetchCustomerReport(timeframe),
      fetchInventoryReport()
    ]);

    return {
      sales: salesData,
      customers: customerData,
      inventory: inventoryData,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating report summary:', error);
    throw error;
  }
};