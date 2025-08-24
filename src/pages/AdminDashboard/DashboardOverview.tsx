import React from 'react';
import { DollarSignIcon, ClockIcon, UserCheckIcon, ChevronRightIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

type DashboardOverviewProps = {
  salesData: any[];
  topProductsData: any[];
  inventoryAlerts: any[];
  customerActivity: any[];
  recentOrders: any[];
  getStatusBadgeClass: (status: string) => string;
  getActivityIcon: (type: string) => JSX.Element;
  setActiveNav: (nav: string) => void;
  setSelectedOrder: (id: string) => void;
};

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  salesData,
  topProductsData,
  inventoryAlerts,
  customerActivity,
  recentOrders,
  getStatusBadgeClass,
  getActivityIcon,
  setActiveNav,
  setSelectedOrder
}) => (
  <div className="space-y-6">
    {/* Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">${salesData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</p>
          </div>
          <DollarSignIcon className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {recentOrders.filter(order => order.status === 'pending').length}
            </p>
          </div>
          <ClockIcon className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Customers</p>
            <p className="text-2xl font-bold text-gray-900">
              {customerActivity.filter(activity => activity.type === 'login').length}
            </p>
          </div>
          <UserCheckIcon className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{inventoryAlerts.length}</p>
          </div>
          <AlertCircleIcon className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Recent Orders & Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button 
            onClick={() => setActiveNav('orders')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            View all <ChevronRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="space-y-3">
          {recentOrders.slice(0, 5).map((order) => (
            <div 
              key={order.id} 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => setSelectedOrder(order.id)}
            >
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-gray-600">{order.customer}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {customerActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Inventory Alerts */}
    {inventoryAlerts.length > 0 && (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-800">Inventory Alerts</h3>
          <RefreshCwIcon className="h-5 w-5 text-red-600" />
        </div>
        <div className="space-y-2">
          {inventoryAlerts.map((alert, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded">
              <AlertCircleIcon className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">{alert.product}</p>
                <p className="text-xs text-red-600">Only {alert.stock} left in stock</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default DashboardOverview;