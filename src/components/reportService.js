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
    let q = query(ordersCollection, orderBy("date", "asc"));

    // Apply timeframe filter
    const dateFilter = getDateFilter(timeframe);
    if (dateFilter) {
      // Convert to ISO string for proper date comparison
      const dateString = dateFilter.toISOString();
      
      console.log("📅 [fetchSalesReport] Applying date filter:", dateString);
      console.log("📅 [fetchSalesReport] Current date:", new Date().toISOString());
      console.log("📅 [fetchSalesReport] Days difference:", Math.floor((new Date() - dateFilter) / (1000 * 60 * 60 * 24)));
      
      q = query(ordersCollection, where("date", ">=", dateString), orderBy("date", "asc"));
    } else {
      console.log("📅 [fetchSalesReport] No date filter applied (fetching all orders)");
    }

    console.log("🚀 [fetchSalesReport] Running Firestore query...");
    const snapshot = await getDocs(q);
    console.log("✅ [fetchSalesReport] Query complete. Documents found:", snapshot.size);

    // Debug: Check what dates are actually being returned
    if (!snapshot.empty) {
      const dates = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.date) {
          // Handle both Timestamp and Date objects
          const dateObj = data.date.toDate ? data.date.toDate() : new Date(data.date);
          return dateObj.toISOString();
        }
        return 'no-date';
      });
      console.log("📅 [fetchSalesReport] Date range in results:", {
        first: dates[0],
        last: dates[dates.length - 1],
        total: dates.length
      });
    } else {
      console.log("⚠️ [fetchSalesReport] No documents found with the current filter");
      console.log("🔍 [fetchSalesReport] Timeframe used:", timeframe);
      console.log("🔍 [fetchSalesReport] Filter date:", dateFilter ? dateFilter.toISOString() : 'none');
    }

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      let date;
      
      try {
        // Handle the specific date format from Firebase
        if (typeof data.date === 'string') {
          // Parse the Firebase date string format
          const [datePart, timePart] = data.date.split('T');
          const [year, month, day] = datePart.split('-');
          const [hours, minutes, secondsMs] = timePart.split(':');
          const seconds = secondsMs.split('.')[0];
          date = new Date(year, month - 1, day, hours, minutes, seconds);
        } else if (data.date && data.date.toDate) {
          // Handle Firestore Timestamp
          date = data.date.toDate();
        } else {
          date = new Date(data.date);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn("⚠️ Invalid date for order:", doc.id, data.date);
          date = new Date(); // Fallback to current date
        }
      } catch (error) {
        console.warn("⚠️ Date conversion error for order:", doc.id, error);
        date = new Date(); // Fallback to current date
      }
      
      return {
        id: doc.id,
        ...data,
        date: date,
      };
    });

    console.log("🧾 [fetchSalesReport] Orders retrieved:", orders.length);
    if (orders.length > 0) {
      console.log("🧾 [fetchSalesReport] First order:", {
        id: orders[0].id,
        date: orders[0].date.toISOString(),
        total: orders[0].total
      });
      console.log("🧾 [fetchSalesReport] Last order:", {
        id: orders[orders.length - 1].id,
        date: orders[orders.length - 1].date.toISOString(),
        total: orders[orders.length - 1].total
      });
    }
    
    console.log("🧮 [fetchSalesReport] Processing sales data...");
    const processedData = processSalesData(orders, timeframe);
    console.log("✅ [fetchSalesReport] Processed data points:", processedData.length);
    if (processedData.length > 0) {
      console.log("✅ [fetchSalesReport] First data point:", processedData[0]);
      console.log("✅ [fetchSalesReport] Last data point:", processedData[processedData.length - 1]);
    }

    return processedData;
  } catch (error) {
    console.error("❌ [fetchSalesReport] Error fetching sales report:", error);
    throw error;
  }
};


// Fetch customer report data
export const fetchCustomerReport = async (timeframe) => {
  try {
    console.log("👥 [fetchCustomerReport] Fetching for timeframe:", timeframe);
    
    const customersCollection = collection(db, 'customers');
    let q = query(customersCollection);
    
    const dateFilter = getDateFilter(timeframe);
    if (dateFilter) {
      const dateString = dateFilter.toISOString();
      q = query(q, where('createdAt', '>=', dateString));
      console.log("📅 [fetchCustomerReport] Filtering from:", dateString);
    }
    
    const snapshot = await getDocs(q);
    console.log("✅ [fetchCustomerReport] Customers found:", snapshot.size);
    
    const customerData = snapshot.docs.map(doc => {
      const data = doc.data();
      let createdAt;
      
      try {
        createdAt = new Date(data.createdAt);
        if (isNaN(createdAt.getTime())) {
          console.warn("⚠️ Invalid date for customer:", doc.id, data.createdAt);
          createdAt = new Date();
        }
      } catch (error) {
        console.warn("⚠️ Date conversion error for customer:", doc.id, error);
        createdAt = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: createdAt,
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

  console.log("🔧 [getDateFilter] Input timeframe:", timeframe, "Type:", typeof timeframe);

  switch (timeframe) {
    case '7d':
    case 'week':
    case 'last7days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      console.log("📅 [getDateFilter] Week filter: Last 7 days");
      break;
    case '30d':
    case 'month':
    case 'last30days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      console.log("📅 [getDateFilter] Month filter: Last 30 days");
      break;
    case '90d':
    case 'quarter':
    case 'last90days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      console.log("📅 [getDateFilter] Quarter filter: Last 90 days");
      break;
    case 'ytd':
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      console.log("📅 [getDateFilter] Year filter: Year to date");
      break;
    case 'all':
      console.log("📅 [getDateFilter] All time filter: No date restriction");
      return null;
    default:
      console.warn('⚠️ [getDateFilter] Unknown timeframe:', timeframe, '- defaulting to last 7 days');
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
  }

  console.log(`📅 [getDateFilter] Final filter date: ${startDate.toISOString()}`);
  console.log(`📅 [getDateFilter] Days from now: ${Math.floor((now - startDate) / (1000 * 60 * 60 * 24))}`);
  
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
        // For all time, group by month
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
    // Try to parse dates for proper sorting
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateA - dateB;
    }
    return a.date.localeCompare(b.date);
  });

  console.log("✅ [processSalesData] Grouped into", result.length, "data points");
  console.log("✅ [processSalesData] Total revenue:", result.reduce((sum, item) => sum + item.revenue, 0));
  console.log("✅ [processSalesData] Sample data:", result.slice(0, 3));

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
  
  console.log("👥 [processCustomerData] New:", newCustomers.length, "Returning:", returningCustomers.length);
  
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
      salesDataPoints: salesData?.length || 0,
      totalRevenue: salesData?.reduce((sum, item) => sum + item.revenue, 0) || 0,
      totalOrders: salesData?.reduce((sum, item) => sum + item.orders, 0) || 0,
      newCustomers: customerData?.newCustomers || 0,
      returningCustomers: customerData?.returningCustomers || 0,
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