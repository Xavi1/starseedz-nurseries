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
import { getReportSummary } from './reportService';

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
}

interface InventoryCategory {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface InventoryData {
  [category: string]: InventoryCategory;
}

interface ReportData {
  sales: SalesDataItem[] | null;
  customers: ProcessedCustomerData | null;
  inventory: InventoryData | null;
}

interface SalesReportProps {
  timeframe?: string;
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
  id: string;
  total?: number;
  subtotal?: number;
  date?: string | Date;
  items?: OrderItem[];
  timeline?: TimelineEntry[];
}

// Icon components
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

const ReportRenderer = () => {
  const [reportType, setReportType] = useState<string>("sales");
  const [reportTimeframe, setReportTimeframe] = useState<string>("week");
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData>({
    sales: null,
    customers: null,
    inventory: null,
  });

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        switch (reportType) {
          case "sales": {
            const salesData = await fetchSalesReport(reportTimeframe);
            setReportData((prev) => ({ ...prev, sales: salesData as SalesDataItem[] }));
            break;
          }
          case "customers": {
            const customerData = await fetchCustomerReport(reportTimeframe);
            setReportData((prev) => ({ ...prev, customers: customerData as ProcessedCustomerData }));
            break;
          }
          case "inventory": {
            const inventoryData = await fetchInventoryReport();
            setReportData((prev) => ({ ...prev, inventory: inventoryData as InventoryData }));
            break;
          }
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, reportTimeframe]);

  const calculateSalesMetrics = (data: SalesDataItem[] | null): SalesMetrics => {
    if (!data || data.length === 0) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, avgOrderValue };
  };

  const salesMetrics = calculateSalesMetrics(reportData.sales);

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
                >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export PDF
                </button>
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={loading}
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
          {!loading && reportType === "sales" && <SalesReport data={reportData.sales} metrics={salesMetrics} />}
          {!loading && reportType === "customers" && <CustomerReport data={reportData.customers} />}
          {!loading && reportType === "inventory" && <InventoryReport data={reportData.inventory} />}
        </div>
      </div>
    </div>
  );
};

// 🧾 SALES REPORT (mirrors internal layout)
const SalesReport = ({ data, metrics }: { data: SalesDataItem[] | null; metrics: SalesMetrics }) => {
  if (!data || data.length === 0)
    return <div className="text-center py-8 text-gray-500">No orders available.</div>;

  // 🔹 Group orders by status
  // Safely extract the most recent status from timeline[]
  const ordersStatusData = Array.isArray(data)
    ? Object.entries(
        data.reduce<Record<string, number>>((acc, order) => {
          const timeline = order?.timeline;
          const latestStatus =
            Array.isArray(timeline) && timeline.length > 0
              ? timeline[timeline.length - 1].status || "Unknown"
              : "Unknown";

          acc[latestStatus] = (acc[latestStatus] || 0) + 1;
          console.log("🥧 Orders by Status (from timeline):", ordersStatusData);
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [];

  // 🔹 Group total revenue by product category
  const categorySalesData = (data as any[]).reduce((acc, order) => {
    (order.items || []).forEach((item: { category?: string; price?: number; quantity?: number }) => {
  const category = item.category || 'Uncategorized';
  acc[category] = (acc[category] || 0) + (item.price || 0) * (item.quantity || 1);
});
    return acc;
  }, {});

  const categoryChartData = Object.entries(categorySalesData).map(([name, sales]) => ({
    name,
    sales,
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
          <AreaChart data={data}>
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
                label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard title="New Customers" value={data.newCustomers} Icon={UserPlusIcon} trend="+15.3%" />
      <MetricCard title="Returning Customers" value={data.returningCustomers} Icon={UserPlusIcon} trend="+6.7%" />
      <MetricCard title="Churn Rate" value="1.8%" Icon={UserPlusIcon} trend="-0.3%" />
    </div>
  );
};

// 📦 INVENTORY REPORT
const InventoryReport = ({ data }: { data: InventoryData | null }) => {
  if (!data) return <div className="text-center py-8 text-gray-500">No inventory data available.</div>;

  const totalProducts = Object.values(data).reduce(
    (sum, cat) => sum + cat.inStock + cat.lowStock + cat.outOfStock,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard title="Total Products" value={totalProducts} Icon={BoxIcon} trend="Across categories" />
      <MetricCard title="Low Stock Items" value="41" Icon={AlertCircleIcon} trend="8.5% of inventory" />
      <MetricCard title="Out of Stock" value="12" Icon={AlertCircleIcon} trend="2.5% of inventory" />
    </div>
  );
};

// 🧱 Shared Components
const MetricCard = ({ title, value, Icon, trend }: { title: string; value: any; Icon: any; trend: string }) => (
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
