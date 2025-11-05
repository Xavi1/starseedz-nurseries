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

// Fetch sales report data from 'orders' collection
export const fetchSalesReport = async (timeframe) => {
  try {
    console.log("📊 [fetchSalesReport] Starting fetch for timeframe:", timeframe);    

    const ordersCollection = collection(db, "orders");
    let q = query(ordersCollection);

    // Apply timeframe filter
    const dateFilter = getDateFilter(timeframe);
    if (dateFilter) {
      console.log("📅 [fetchSalesReport] Applying date filter:", dateFilter); // Remove .toDate()
      q = query(q, where("date", ">=", dateFilter));
    } else {
      console.log("📅 [fetchSalesReport] No date filter applied (fetching all orders)");
    }

    q = query(q, orderBy("date", "asc"));

    console.log("🚀 [fetchSalesReport] Running Firestore query...");
    const snapshot = await getDocs(q);
    console.log("✅ [fetchSalesReport] Query complete. Documents found:", snapshot.size);

    if (snapshot.empty) {
      console.warn("⚠️ [fetchSalesReport] No orders found in the selected timeframe.");
      return [];
    }

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: new Date(doc.data().date), // Convert string to Date object
    }));

    console.log("🧾 [fetchSalesReport] First order sample:", orders[0] || "No data");
    console.log("🧮 [fetchSalesReport] Processing sales data...");
    const processedData = processSalesData(orders, timeframe);
    console.log("✅ [fetchSalesReport] Processed data:", processedData.slice(0, 3));

    return processedData;
  } catch (error) {
    console.error("❌ [fetchSalesReport] Error fetching sales report:", error);
    throw error;
  }
};


// Fetch customer report data
export const fetchCustomerReport = async (timeframe) => {
  try {
    const customersCollection = collection(db, 'users');
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
  
  return filterDate.toISOString();
};

// Process sales data for charts
const processSalesData = (orders, timeframe) => {
  console.log("🔍 [processSalesData] Received orders:", orders.length);

  if (!orders || orders.length === 0) {
    console.warn("⚠️ [processSalesData] No orders to process.");
    return [];
  }

  const groupedData = orders.reduce((acc, order) => {
    const date = new Date(order.date);
    let key;

    switch (timeframe) {
      case "week":
        key = date.toLocaleDateString();
        break;
      case "month":
        key = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case "quarter":
      case "year":
        key = `${date.getMonth() + 1}/1`;
        break;
      default:
        key = date.toLocaleDateString();
    }

    if (!acc[key]) acc[key] = { revenue: 0, orders: 0 };

    acc[key].revenue += order.total || 0;
    acc[key].orders += 1;

    return acc;
  }, {});

  const result = Object.entries(groupedData).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));

  console.log("✅ [processSalesData] Aggregated result (first 3):", result.slice(0, 3));
  return result;
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
export const getReportSummary = async (timeframe = "month") => {
  try {
    console.log("📋 [getReportSummary] Generating report summary for:", timeframe);

    const [salesData, customerData, inventoryData] = await Promise.all([
      fetchSalesReport(timeframe),
      fetchCustomerReport(timeframe),
      fetchInventoryReport(),
    ]);

    console.log("✅ [getReportSummary] Summary data ready:", {
      salesCount: salesData?.length || 0,
      customersCount: customerData?.growthData?.length || 0,
      inventoryCategories: Object.keys(inventoryData || {}).length,
    });

    return {
      sales: salesData,
      customers: customerData,
      inventory: inventoryData,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ [getReportSummary] Error generating report summary:", error);
    throw error;
  }
};
