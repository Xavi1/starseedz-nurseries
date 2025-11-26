import { useState, useEffect } from "react";
import {
  fetchSalesReport,
  fetchCustomerReport,
  fetchInventoryReport,
} from "./reportService";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import jsPDF from 'jspdf';
import {RepeatIcon, TrendingUpIcon, XIcon} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit} from 'firebase/firestore';
import { db } from '../firebase';

// TypeScript interfaces
interface SalesDataItem {
  revenue: number;
  orders: number;
  date: string;
}

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

interface ProcessedCustomerData {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  growthData?: Array<{ period: string; new: number; returning: number; total: number }>;
}

interface InventoryCategory {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface InventoryData {
  [category: string]: InventoryCategory;
}

interface OrderItem {
  category?: string;
  price?: number;
  quantity?: number;
}

interface TimelineEntry {
  date: string;
  description: string;
  status: string;
}

interface Order {
  id?: string;
  total?: number;
  subtotal?: number;
  date?: string | Date;
  items?: OrderItem[];
  timeline?: TimelineEntry[];
}

// Add missing data interfaces
interface InventoryReportDataItem {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

// ... (Icon components remain the same)

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const DollarSignIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

const UserPlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const BoxIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
  </svg>
);

// Helper function for date formatting
const formatDateForDisplay = (date: Date, timeframe: string): string => {
  switch (timeframe) {
    case "week":
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    case "month":
    case "quarter":
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case "year":
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const ReportRenderer = () => {
  const [loading] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>("sales");
  const [reportTimeframe, setReportTimeframe] = useState<string>("week");
  const [reportData, setReportData] = useState<{
    sales: { raw: Order[]; processed: SalesDataItem[] } | null;
    customers: ProcessedCustomerData | null;
    inventory: InventoryData | null;
  }>({
    sales: null,
    customers: null,
    inventory: null,
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const salesReport = await fetchSalesReport(reportTimeframe);
        const customers = await fetchCustomerReport(reportTimeframe);
        const inventory = await fetchInventoryReport();

        let rawOrders: Order[] = [];
        let processedSalesData: SalesDataItem[] = [];
        if (salesReport && typeof salesReport === 'object' && 'raw' in salesReport && 'processed' in salesReport) {
          rawOrders = Array.isArray(salesReport.raw) ? salesReport.raw : [];
          processedSalesData = Array.isArray(salesReport.processed) ? salesReport.processed : [];
        }

        setReportData({
          sales: {
            raw: rawOrders,
            processed: processedSalesData,
          },
          customers,
          inventory,
        });
      } catch (error) {
        console.error("❌ [Reports] Failed to fetch report data:", error);
      }
    };
    fetchReportData();
  }, [reportTimeframe]);

  const calculateSalesMetrics = (rawOrders: Order[] | null): SalesMetrics => {
    if (!rawOrders || rawOrders.length === 0)
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const totalRevenue = rawOrders.reduce((sum, order) => {
      const orderTotal = order.total ?? 0;
      return sum + orderTotal;
    }, 0);

    const totalOrders = rawOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
    };
  };

  const salesMetrics = calculateSalesMetrics(reportData.sales?.raw || []);

  // PDF Export Handler
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    if (reportType === 'sales') {
      doc.text('Sales Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Timeframe: ${reportTimeframe}`, 14, 30);
      doc.text(`Total Revenue: $${salesMetrics.totalRevenue.toFixed(2)}`, 14, 40);
      doc.text(`Total Orders: ${salesMetrics.totalOrders}`, 14, 50);
      doc.text(`Avg. Order Value: $${salesMetrics.avgOrderValue.toFixed(2)}`, 14, 60);
      doc.setFontSize(12);
      doc.text('Date', 14, 75);
      doc.text('Revenue', 60, 75);
      doc.text('Orders', 110, 75);
      let y = 85;
      (reportData.sales?.processed || []).forEach((row) => {
        doc.text(row.date, 14, y);
        doc.text(`$${row.revenue.toFixed(2)}`, 60, y);
        doc.text(`${row.orders}`, 110, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save('sales_report.pdf');
    } else if (reportType === 'customers') {
      doc.text('Customer Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Timeframe: ${reportTimeframe}`, 14, 30);
      const customers = reportData.customers;
      doc.text(`New Customers: ${customers?.newCustomers ?? 0}`, 14, 40);
      doc.text(`Returning Customers: ${customers?.returningCustomers ?? 0}`, 14, 50);
      doc.text(`Total Customers: ${customers?.totalCustomers ?? 0}`, 14, 60);
      doc.setFontSize(12);
      doc.text('Period', 14, 75);
      doc.text('New', 60, 75);
      doc.text('Returning', 110, 75);
      let y = 85;
      (customers?.growthData || []).forEach((row) => {
        doc.text(row.period, 14, y);
        doc.text(`${row.new}`, 60, y);
        doc.text(`${row.returning}`, 110, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save('customer_report.pdf');
    } else if (reportType === 'inventory') {
      doc.text('Inventory Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Categories: ${Object.keys(reportData.inventory || {}).length}`, 14, 30);
      doc.text('Category', 14, 45);
      doc.text('In Stock', 60, 45);
      doc.text('Low Stock', 100, 45);
      doc.text('Out of Stock', 150, 45);
      let y = 55;
      Object.entries(reportData.inventory || {}).forEach(([category, stats]) => {
        doc.text(category, 14, y);
        doc.text(`${stats.inStock}`, 60, y);
        doc.text(`${stats.lowStock}`, 100, y);
        doc.text(`${stats.outOfStock}`, 150, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save('inventory_report.pdf');
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csv = '';
    let filename = '';
    if (reportType === 'sales') {
      const rows = reportData.sales?.processed || [];
      if (!rows.length) return;
      const header = ['Date', 'Revenue', 'Orders'];
      csv = [
        header.join(','),
        ...rows.map(row => [
          `"${row.date}"`,
          row.revenue.toFixed(2),
          row.orders
        ].join(','))
      ].join('\r\n');
      filename = 'sales_report.csv';
    } else if (reportType === 'customers') {
      const customers = reportData.customers;
      const header = ['Period', 'New', 'Returning', 'Total'];
      const rows = (customers?.growthData || []).map(row => [
        `"${row.period}"`,
        row.new,
        row.returning,
        row.total
      ].join(','));
      csv = [header.join(','), ...rows].join('\r\n');
      filename = 'customer_report.csv';
    } else if (reportType === 'inventory') {
      const header = ['Category', 'In Stock', 'Low Stock', 'Out of Stock'];
      const rows = Object.entries(reportData.inventory || {}).map(([category, stats]) => [
        `"${category}"`,
        stats.inStock,
        stats.lowStock,
        stats.outOfStock
      ].join(','));
      csv = [header.join(','), ...rows].join('\r\n');
      filename = 'inventory_report.csv';
    }
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Reports</h3>
            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Report Type:</span>
                <select
                  className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  disabled={loading}
                >
                  <option value="sales">Sales Report</option>
                  <option value="customers">Customer Report</option>
                  <option value="inventory">Inventory Report</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Timeframe:</span>
                <select
                  className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                  disabled={loading || reportType === "inventory"}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={loading}
                  onClick={handleExportPDF}
                >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export PDF
                </button>
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={loading}
                  onClick={handleExportCSV}
                >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          {!loading && reportType === "sales" && reportData.sales && (
            <SalesReport
              rawOrders={reportData.sales.raw}
              data={reportData.sales.processed}
              metrics={salesMetrics}
              timeframe={reportTimeframe}
            />
          )}
          {!loading && reportType === "customers" && <CustomerReport data={reportData.customers} />}
          {!loading && reportType === "inventory" && <InventoryReport data={reportData.inventory} />}
        </div>
      </div>
    </div>
  );
};

// 🧾 SALES REPORT
const SalesReport = ({
  data,
  rawOrders,
  metrics,
  timeframe,
}: {
  data: SalesDataItem[] | null;
  rawOrders: Order[] | null;
  metrics: SalesMetrics;
  timeframe: string;
}) => {
  console.log("🔍 [SalesReport] Raw orders:", rawOrders);
  console.log("🔍 [SalesReport] Metrics:", metrics);
  console.log("🔍 [SalesReport] Processed data:", data);
  
  if (!data || !rawOrders)
    return <div className="text-center py-8 text-gray-500">No sales data available.</div>;

  const ordersStatusData = Array.isArray(rawOrders)
    ? Object.entries(
        rawOrders.reduce<Record<string, number>>((acc, order) => {
          const latestStatus =
          Array.isArray(order.timeline) && order.timeline.length > 0
            ? [...order.timeline]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .at(-1)?.status || "Unknown"
            : "Unknown";

          acc[latestStatus] = (acc[latestStatus] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  const categorySalesData = rawOrders.flatMap((order) =>
    (order.items || []).map((item) => ({
      category: item.category || "Uncategorized",
      total: (item.price || 0) * (item.quantity || 1),
    }))
  ).reduce<Record<string, number>>((acc, { category, total }) => {
    acc[category] = (acc[category] || 0) + total;
    return acc;
  }, {});
  
  const categoryChartData = Object.entries(categorySalesData).map(([name, sales]) => ({
    name,
    sales,
  }));

  const chartData = [...(data || [])]
    .map(entry => {
      const dateObj = new Date(entry.date);
      return {
        date: dateObj.toISOString().split('T')[0],
        displayDate: formatDateForDisplay(dateObj, timeframe),
        revenue: Number(entry.revenue) || 0,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: item.displayDate,
      revenue: item.revenue,
    }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={`$${metrics.totalRevenue.toFixed(2)}`} Icon={DollarSignIcon} trend="+12.5%" />
        <MetricCard title="Orders" value={metrics.totalOrders} Icon={ShoppingBagIcon} trend="+8.2%" />
        <MetricCard title="Avg. Order Value" value={`$${metrics.avgOrderValue.toFixed(2)}`} Icon={TagIcon} trend="+4.3%" />
      </div>

      <Section title="Revenue Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Orders by Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ordersStatusData}
                dataKey="value"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
              >
                {ordersStatusData.map((_, i) => (
                  <Cell key={i} fill={["#16a34a", "#8b5cf6", "#3b82f6", "#eab308", "#ef4444"][i % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Sales by Category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>
    </div>
  );
};

// 🧍 CUSTOMER REPORT
const CustomerReport = ({ data }: { data: ProcessedCustomerData | null }) => {
  if (!data) return <div className="text-center py-8 text-gray-500">No customer data available.</div>;
  
  const customerReportData = Array.isArray(data.growthData)
    ? data.growthData.map((d: { period: string; new: number; returning: number }) => ({
        date: d.period,
        new: d.new,
        returning: d.returning
      }))
    : [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="New Customers" value={data.newCustomers} Icon={UserPlusIcon} trend="+15.3%" />
        <MetricCard title="Returning Customers" value={data.returningCustomers} Icon={RepeatIcon} trend="+6.7%" />
        <MetricCard title="Churn Rate" value="1.8%" Icon={TrendingUpIcon} trend="-0.3%" />
      </div>
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerReportData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="new" name="New Customers" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="returning" name="Returning Customers" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Segments</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'New', value: 35 }, { name: 'Repeat', value: 45 }, { name: 'High Value', value: 20 }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#16a34a" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Retention</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ month: 'Jan', retention: 65 }, { month: 'Feb', retention: 68 }, { month: 'Mar', retention: 71 }, { month: 'Apr', retention: 69 }, { month: 'May', retention: 74 }, { month: 'Jun', retention: 78 }, { month: 'Jul', retention: 82 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="retention" name="Retention Rate (%)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRetention)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 📦 INVENTORY REPORT
const InventoryReport = ({ data }: { data: InventoryData | null }) => {
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [outOfStockAlerts, setOutOfStockAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);

  // Firebase: Real-time low stock and out of stock alerts
  useEffect(() => {
    const inventoryRef = collection(db, 'products');

    const topSellingQuery = query(
  collection(db, 'products'),
  orderBy('sales', 'desc'),
  limit(5)
  );
    
    // Query for low stock items (stock <= 10)
    const lowStockQuery = query(
      inventoryRef,
      where('stock', '<=', 10),
      where('stock', '>', 0),
      orderBy('stock', 'asc')
    );

    // Query for out of stock items (stock === 0)
    const outOfStockQuery = query(
      inventoryRef,
      where('stock', '==', 0)
    );

     const unsubscribeTopSelling = onSnapshot(topSellingQuery, (snapshot) => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTopSellingProducts(products);
  });

    const unsubscribeLowStock = onSnapshot(lowStockQuery, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLowStockAlerts(alerts);
    });

    const unsubscribeOutOfStock = onSnapshot(outOfStockQuery, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOutOfStockAlerts(alerts);
      setLoadingAlerts(false);
    });

    return () => {
      unsubscribeLowStock();
      unsubscribeOutOfStock();
      unsubscribeTopSelling(); 
    };
  }, []);

  if (!data) return <div className="text-center py-8 text-gray-500">No inventory data available.</div>;

  const totalProducts = Object.values(data).reduce(
    (sum: number, cat: InventoryCategory) => sum + cat.inStock + cat.lowStock + cat.outOfStock,
    0
  );

  // Convert the inventory data to the format needed for the chart
const inventoryReportData = Object.entries(data).map(([category, stats]) => ({
  category,
  inStock: Number(stats.inStock || 0),
  lowStock: Number(stats.lowStock || 0),
  outOfStock: Number(stats.outOfStock || 0),
}));
console.log("Inventory chart data:", inventoryReportData);

  // Calculate inventory value data from Firebase data
  const inventoryValueData = Object.entries(data).map(([category, stats]) => ({
    name: category,
    value: (stats.inStock + stats.lowStock + stats.outOfStock) * 25, // Assuming average value of $25 per item
  }));

  // Generate top products data from inventory data
  const topProductsData = [...lowStockAlerts, ...outOfStockAlerts]
  .filter(product => product.name) // Only products with names
  .map(product => ({
    name: product.name,
    sales: product.popularity || product.rating || (product.isBestSeller ? 100 : 50), // Use bestSeller flag, rating, or fallback
    stock: product.stock || 0
  }))
  .sort((a, b) => b.sales - a.sales)
  .slice(0, 5);

  // Create line chart data for low stock and out of stock trends using real alerts
  const stockTrendData = [
    ...lowStockAlerts.map(alert => ({
      category: alert.name || alert.category || 'Unknown Product',
      lowStock: alert.stock || 0,
      outOfStock: 0,
      productName: alert.name || 'Unknown',
      currentStock: alert.stock || 0
    })),
    ...outOfStockAlerts.map(alert => ({
      category: alert.name || alert.category || 'Unknown Product',
      lowStock: 0,
      outOfStock: 1,
      productName: alert.name || 'Unknown',
      currentStock: 0
    }))
  ].slice(0, 10); // Limit to top 10 for better visualization

  // Calculate metrics from real Firebase data
  const totalLowStockItems = lowStockAlerts.reduce((sum, alert) => sum + (alert.stock || 0), 0);
  const totalOutOfStockItems = outOfStockAlerts.length;
  const totalLowStockProducts = lowStockAlerts.length;

  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-500">
                Total Products
              </h4>
              <BoxIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalProducts}</p>
            <p className="mt-1 text-sm text-gray-600">
              Across {Object.keys(data).length} categories
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-500">
                Low Stock Items
              </h4>
              <AlertCircleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {loadingAlerts ? '...' : totalLowStockProducts}
            </p>
            <p className="mt-1 text-sm text-yellow-600">
              {loadingAlerts ? 'Loading...' : `${totalLowStockProducts} products need attention`}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-500">
                Out of Stock
              </h4>
              <XIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {loadingAlerts ? '...' : totalOutOfStockItems}
            </p>
            <p className="mt-1 text-sm text-red-600">
              {loadingAlerts ? 'Loading...' : `${totalOutOfStockItems} products out of stock`}
            </p>
          </div>
        </div>

        {/* Low Stock Products List */}
        {(lowStockAlerts.length > 0 || outOfStockAlerts.length > 0) && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Products Needing Attention
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                {/* Out of Stock Products */}
                {outOfStockAlerts.slice(0, 5).map((alert, index) => (
                  <div key={`out-${alert.id}`} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <XIcon className="h-5 w-5 text-red-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alert.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-red-600">
                          Out of Stock
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-700">0 in stock</span>
                  </div>
                ))}
                
                {/* Low Stock Products */}
                {lowStockAlerts.slice(0, 5).map((alert, index) => (
                  <div key={`low-${alert.id}`} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alert.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-yellow-600">
                          Low Stock Warning
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-yellow-700">
                      {alert.stock || 0} remaining
                    </span>
                  </div>
                ))}
              </div>
              
              {(lowStockAlerts.length > 5 || outOfStockAlerts.length > 5) && (
                <div className="mt-3 text-sm text-gray-500 text-center">
                  +{Math.max(0, lowStockAlerts.length - 5) + Math.max(0, outOfStockAlerts.length - 5)} more products need attention
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Line Chart for Low Stock and Out of Stock Trends */}
        {stockTrendData.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Stock Alert Trends
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="productName" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        value, 
                        name === 'lowStock' ? 'Low Stock Items' : 'Out of Stock'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="lowStock" 
                      name="Low Stock Items" 
                      fill="#eab308" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="outOfStock" 
                      name="Out of Stock Items" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Inventory Status by Category</h4>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryReportData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                  barGap={6}
                  barCategoryGap="18%"
                >
                  {/* Soft dashed grid lines like screenshot */}
                  <CartesianGrid 
                    strokeDasharray="4 4" 
                    horizontal={true} 
                    vertical={false} 
                    stroke="#d1d5db"
                  />

                  <XAxis 
                    type="number"
                    domain={[0, 'dataMax + 15']}
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />

                  <YAxis
                    dataKey="category"
                    type="category"
                    width={140}
                    axisLine={false}
                    tickLine={false}
                    fontSize={14}
                  />

                  <Tooltip />

                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />

                 <Bar
                    dataKey="inStock"
                    name="In Stock"
                    stackId="a"
                    fill="#16a34a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="lowStock"
                    name="Low Stock"
                    stackId="a"
                    fill="#eab308"
                    radius={[0, 0, 0, 0]} 
                  />
                  <Bar
                    dataKey="outOfStock"
                    name="Out of Stock"
                    stackId="a"
                    fill="#ef4444"
                    radius={[0, 0, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Top Selling Products
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                {topProductsData.map((product, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{
                          width: `${topProductsData.length > 0 ? (product.sales / topProductsData[0].sales * 100) : 0}%`
                        }}></div>
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {product.sales} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Inventory Value
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={inventoryValueData} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      outerRadius={80} 
                      fill="#8884d8" 
                      dataKey="value" 
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#16a34a" />
                      <Cell fill="#22c55e" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#ec4899" />
                    </Pie>
                    <Tooltip formatter={value => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 🧱 Shared Components
const MetricCard = ({ title, value, Icon, trend }: { title: string; value: string | number; Icon: React.FC<{ className?: string }>; trend: string }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex justify-between items-center">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    <p className="mt-1 text-sm text-green-600">{trend}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
    {children}
  </div>
);

export default ReportRenderer;