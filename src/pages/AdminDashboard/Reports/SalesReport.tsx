import React from 'react';
import { DownloadIcon, CalendarIcon, BarChart3Icon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type SalesReportProps = {
  reportType: string;
  setReportType: (type: string) => void;
  reportTimeframe: string;
  setReportTimeframe: (tf: string) => void;
  getReportData: () => any[];
};

const SalesReport: React.FC<SalesReportProps> = ({
  reportType,
  setReportType,
  reportTimeframe,
  setReportTimeframe,
  getReportData
}) => {
  const reportData = getReportData();
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const totalRevenue = reportData.reduce((sum, item) => sum + (item.revenue || item.value || 0), 0);
  const totalOrders = reportData.reduce((sum, item) => sum + (item.orders || item.count || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BarChart3Icon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Sales Reports</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Report Type Selector */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="revenue">Revenue Report</option>
            <option value="orders">Orders Report</option>
            <option value="products">Product Performance</option>
            <option value="categories">Category Analysis</option>
          </select>

          {/* Timeframe Selector */}
          <select
            value={reportTimeframe}
            onChange={(e) => setReportTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="year">Full Year</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            <DownloadIcon className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            For selected timeframe and report type
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Orders</p>
              <p className="text-2xl font-bold text-green-900">
                {totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BarChart3Icon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Across all products and categories
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {reportType === 'revenue' && 'Revenue Trend'}
          {reportType === 'orders' && 'Orders Overview'}
          {reportType === 'products' && 'Product Performance'}
          {reportType === 'categories' && 'Category Distribution'}
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          {reportType === 'categories' ? (
            <PieChart>
              <Pie
                data={reportData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            </PieChart>
          ) : (
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => reportType === 'revenue' ? [`$${value}`, 'Revenue'] : [value, 'Orders']}
              />
              <Bar 
                dataKey={reportType === 'revenue' ? 'revenue' : 'orders'} 
                fill={reportType === 'revenue' ? '#3b82f6' : '#10b981'} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {reportType === 'categories' ? 'Category' : reportType === 'products' ? 'Product' : 'Date'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {reportType === 'revenue' ? 'Revenue' : 'Orders'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name || item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reportType === 'revenue' ? `$${item.revenue?.toLocaleString()}` : item.orders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {((reportType === 'revenue' ? item.revenue / totalRevenue : item.orders / totalOrders) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {reportData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No report data available</h3>
          <p className="text-gray-500">
            Try selecting a different timeframe or report type.
          </p>
        </div>
      )}
    </div>
  );
};

export default SalesReport;