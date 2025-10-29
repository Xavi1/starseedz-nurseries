import React, { useState, useEffect } from 'react';
import { 
  fetchSalesReport, 
  fetchCustomerReport, 
  fetchInventoryReport 
} from './reportService';

const ReportRenderer = () => {
  const [reportType, setReportType] = useState('sales');
  const [reportTimeframe, setReportTimeframe] = useState('week');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    sales: null,
    customers: null,
    inventory: null
  });

  // Fetch report data when type or timeframe changes
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        let data;
        switch (reportType) {
          case 'sales':
            data = await fetchSalesReport(reportTimeframe);
            setReportData(prev => ({ ...prev, sales: data }));
            break;
          case 'customers':
            data = await fetchCustomerReport(reportTimeframe);
            setReportData(prev => ({ ...prev, customers: data }));
            break;
          case 'inventory':
            data = await fetchInventoryReport();
            setReportData(prev => ({ ...prev, inventory: data }));
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, reportTimeframe]);

  // Calculate metrics based on fetched data
  const calculateSalesMetrics = (data) => {
    if (!data || data.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    }
    
    const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalRevenue, totalOrders, avgOrderValue };
  };

  const salesMetrics = calculateSalesMetrics(reportData.sales);

  const renderReportsContent = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reports
            </h3>
            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Report Type:</span>
                <select 
                  className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" 
                  value={reportType} 
                  onChange={e => setReportType(e.target.value)}
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
                  onChange={e => setReportTimeframe(e.target.value)}
                  disabled={loading || reportType === 'inventory'}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export PDF
                </button>
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
          
          {!loading && reportType === 'sales' && (
            <SalesReport 
              data={reportData.sales} 
              metrics={salesMetrics}
              timeframe={reportTimeframe}
            />
          )}
          
          {!loading && reportType === 'customers' && (
            <CustomerReport 
              data={reportData.customers}
              timeframe={reportTimeframe}
            />
          )}
          
          {!loading && reportType === 'inventory' && (
            <InventoryReport 
              data={reportData.inventory}
            />
          )}
        </div>
      </div>
    </div>
  );

  return renderReportsContent();
};

// Sales Report Component
const SalesReport = ({ data, metrics, timeframe }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No sales data available for the selected timeframe.</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
            <DollarSignIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-green-600">+12.5% from previous period</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Orders</h4>
            <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.totalOrders}</p>
          <p className="mt-1 text-sm text-green-600">+8.2% from previous period</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Avg. Order Value</h4>
            <TagIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${metrics.avgOrderValue.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-green-600">+4.3% from previous period</p>
        </div>
      </div>
      
      {/* Your existing chart components with dynamic data */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Revenue Over Time</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Add other chart components with dynamic data */}
    </div>
  );
};

// Customer Report Component
const CustomerReport = ({ data, timeframe }) => {
  if (!data) {
    return <div className="text-center py-8 text-gray-500">No customer data available.</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">New Customers</h4>
            <UserPlusIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.newCustomers}</p>
          <p className="mt-1 text-sm text-green-600">+15.3% from previous period</p>
        </div>
        
        {/* Add other customer metrics */}
      </div>
      
      {/* Your existing customer charts with dynamic data */}
    </div>
  );
};

// Inventory Report Component
const InventoryReport = ({ data }) => {
  if (!data) {
    return <div className="text-center py-8 text-gray-500">No inventory data available.</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Total Products</h4>
            <BoxIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {Object.values(data).reduce((sum, category) => 
              sum + category.inStock + category.lowStock + category.outOfStock, 0
            )}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Across {Object.keys(data).length} categories
          </p>
        </div>
        
        {/* Add other inventory metrics */}
      </div>
      
      {/* Your existing inventory charts with dynamic data */}
    </div>
  );
};

export default ReportRenderer;