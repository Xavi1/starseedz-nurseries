// services/reportService.js
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

// Fetch sales report data from 'orders' collection
export const fetchSalesReport = async (timeframe) => {
  try {
    console.log("📊 [fetchSalesReport] Starting fetch for timeframe:", timeframe);    

    const ordersCollection = collection(db, "orders");
    let q = query(ordersCollection, orderBy("date", "asc"));

    // Apply timeframe filter
    const dateFilter = getDateFilter(timeframe);
    if (dateFilter) {
      const dateString = dateFilter.toISOString();
      q = query(ordersCollection, where("date", ">=", dateString), orderBy("date", "asc"));
    }

    console.log("🚀 [fetchSalesReport] Running Firestore query...");
    const snapshot = await getDocs(q);
    console.log("✅ [fetchSalesReport] Query complete. Documents found:", snapshot.size);

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      let date;
      
      try {
        if (typeof data.date === 'string') {
          const [datePart, timePart] = data.date.split('T');
          const [year, month, day] = datePart.split('-');
          const [hours, minutes, secondsMs] = timePart.split(':');
          const seconds = secondsMs.split('.')[0];
          date = new Date(year, month - 1, day, hours, minutes, seconds);
        } else if (data.date && data.date.toDate) {
          date = data.date.toDate();
        } else {
          date = new Date(data.date);
        }
        
        if (isNaN(date.getTime())) {
          console.warn("⚠️ Invalid date for order:", doc.id, data.date);
          date = new Date();
        }
      } catch (error) {
        console.warn("⚠️ Date conversion error for order:", doc.id, error);
        date = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        date: date,
      };
    });

    console.log("🧾 [fetchSalesReport] Orders retrieved:", orders.length);
    
    const processedData = processSalesData(orders, timeframe);
    console.log("✅ [fetchSalesReport] Processed data points:", processedData.length);

    return {
      raw: orders,
      processed: processedData
    };
  } catch (error) {
    console.error("❌ [fetchSalesReport] Error fetching sales report:", error);
    throw error;
  }
};

// Fetch customer report data - UPDATED to use users collection and analyze orders
export const fetchCustomerReport = async (timeframe) => {
  try {
    console.log("👥 [fetchCustomerReport] Fetching for timeframe:", timeframe);
    
    // Get all users
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    console.log("✅ [fetchCustomerReport] Users found:", usersSnapshot.size);
    
    // Get all orders to analyze customer behavior
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);
    console.log("✅ [fetchCustomerReport] Orders found:", ordersSnapshot.size);
    
    // Analyze orders to determine returning customers
    const orderCountByUser = {};
    const firstOrderDateByUser = {};
    
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      const userId = order.userId;
      
      if (userId) {
        // Count orders per user
        orderCountByUser[userId] = (orderCountByUser[userId] || 0) + 1;
        
        // Track first order date
        if (!firstOrderDateByUser[userId]) {
          try {
            let orderDate;
            if (typeof order.date === 'string') {
              orderDate = new Date(order.date);
            } else if (order.date && order.date.toDate) {
              orderDate = order.date.toDate();
            } else {
              orderDate = new Date(order.date);
            }
            firstOrderDateByUser[userId] = orderDate;
          } catch (error) {
            console.warn("⚠️ Date conversion error for order:", doc.id, error);
            firstOrderDateByUser[userId] = new Date();
          }
        }
      }
    });
    
    console.log("📊 [fetchCustomerReport] Order analysis complete. Unique customers with orders:", Object.keys(orderCountByUser).length);
    
    // Process users with order data
    const customerData = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      const userId = doc.id;
      const orderCount = orderCountByUser[userId] || 0;
      const firstOrderDate = firstOrderDateByUser[userId];
      
      let createdAt;
      try {
        // Use lastLogin or fallback to current date
        createdAt = userData.lastLogin ? new Date(userData.lastLogin) : new Date();
        if (isNaN(createdAt.getTime())) {
          createdAt = new Date();
        }
      } catch (error) {
        createdAt = new Date();
      }
      
      return {
        id: userId,
        ...userData,
        createdAt: createdAt,
        orderCount: orderCount,
        previousOrders: orderCount,
        isReturningCustomer: orderCount > 1,
        firstOrderDate: firstOrderDate
      };
    });
    
    return processCustomerData(customerData, timeframe);
  } catch (error) {
    console.error('❌ [fetchCustomerReport] Error:', error);
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
export const getDateFilter = (timeframe) => {
  const now = new Date();
  let startDate;

  switch (timeframe) {
    case '7d':
    case 'week':
    case 'last7days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30d':
    case 'month':
    case 'last30days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '90d':
    case 'quarter':
    case 'last90days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'ytd':
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'all':
      return null;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
  }

  return startDate;
};

// Process sales data for charts
const processSalesData = (orders, timeframe) => {
  console.log("🔍 [processSalesData] Processing", orders.length, "orders for timeframe:", timeframe);

  if (!orders || orders.length === 0) {
    console.warn("⚠️ [processSalesData] No orders to process.");
    return [];
  }

  const groupedData = orders.reduce((acc, order) => {
    const date = new Date(order.date);
    let key;

    switch (timeframe) {
      case "7d":
      case "week":
      case "last7days":
        key = date.toLocaleDateString();
        break;
      case "30d":
      case "month":
      case "last30days":
        key = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case "90d":
      case "quarter":
      case "last90days":
        key = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case "ytd":
      case "year":
        key = date.toLocaleDateString('default', { month: 'short' });
        break;
      case "all":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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

  // Sort results chronologically
  result.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateA - dateB;
    }
    return a.date.localeCompare(b.date);
  });

  console.log("✅ [processSalesData] Grouped into", result.length, "data points");
  return result;
};

// Process customer data - UPDATED for your schema
const processCustomerData = (customerData, timeframe) => {
  console.log("👥 [processCustomerData] Processing", customerData.length, "customers");
  
  // Use orderCount to determine new vs returning
  const newCustomers = customerData.filter(customer => 
    customer.orderCount <= 1
  );
  
  const returningCustomers = customerData.filter(customer => 
    customer.orderCount > 1
  );
  
  console.log("👥 [processCustomerData] New customers (0-1 orders):", newCustomers.length);
  console.log("👥 [processCustomerData] Returning customers (2+ orders):", returningCustomers.length);
  
  // Debug info
  const orderCountDistribution = {};
  customerData.forEach(customer => {
    const count = customer.orderCount || 0;
    orderCountDistribution[count] = (orderCountDistribution[count] || 0) + 1;
  });
  console.log("📊 [processCustomerData] Order count distribution:", orderCountDistribution);
  
  return {
    newCustomers: newCustomers.length,
    returningCustomers: returningCustomers.length,
    growthData: calculateCustomerGrowth(customerData, timeframe),
    totalCustomers: customerData.length,
    // Additional stats for debugging
    _stats: {
      totalUsers: customerData.length,
      usersWithOrders: customerData.filter(c => c.orderCount > 0).length,
      orderCountDistribution: orderCountDistribution
    }
  };
};

// Calculate customer growth over time
const calculateCustomerGrowth = (customerData, timeframe) => {
  if (!customerData || customerData.length === 0) {
    return [];
  }

  const groupedData = customerData.reduce((acc, customer) => {
    const date = new Date(customer.createdAt);
    let key;
    
    switch (timeframe) {
      case '7d':
      case 'week':
      case 'last7days':
        key = date.toLocaleDateString();
        break;
      case '30d':
      case 'month':
      case 'last30days':
        key = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case '90d':
      case 'quarter':
      case 'last90days':
        key = `Week ${Math.floor(date.getDate() / 7) + 1}`;
        break;
      case 'ytd':
      case 'year':
        key = date.toLocaleString('default', { month: 'short' });
        break;
      case 'all':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toLocaleDateString();
    }
    
    if (!acc[key]) {
      acc[key] = { new: 0, returning: 0, total: 0 };
    }
    
    // Use orderCount to determine new vs returning
    if (customer.orderCount <= 1) {
      acc[key].new += 1;
    } else {
      acc[key].returning += 1;
    }
    
    acc[key].total += 1;
    
    return acc;
  }, {});

  const result = Object.entries(groupedData).map(([period, data]) => ({
    period,
    new: data.new,
    returning: data.returning,
    total: data.total
  }));

  return result.sort((a, b) => a.period.localeCompare(b.period));
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

// Function to get report summary
export const getReportSummary = async (timeframe = "month") => {
  try {
    console.log("📋 [getReportSummary] Generating report summary for:", timeframe);

    const [salesData, customerData, inventoryData] = await Promise.all([
      fetchSalesReport(timeframe),
      fetchCustomerReport(timeframe),
      fetchInventoryReport(),
    ]);

    console.log("✅ [getReportSummary] Summary data ready");

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