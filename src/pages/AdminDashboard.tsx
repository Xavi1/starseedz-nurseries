import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboardIcon, ShoppingBagIcon, PackageIcon, UsersIcon, BarChartIcon, SettingsIcon, MenuIcon, XIcon, SearchIcon, BellIcon, ChevronDownIcon, TrendingUpIcon, ClockIcon, UserCheckIcon, DollarSignIcon, ChevronRightIcon, FilterIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
export const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  // Mock data for charts
  const salesData = [{
    month: 'Jan',
    sales: 4000
  }, {
    month: 'Feb',
    sales: 3000
  }, {
    month: 'Mar',
    sales: 5000
  }, {
    month: 'Apr',
    sales: 4500
  }, {
    month: 'May',
    sales: 6000
  }, {
    month: 'Jun',
    sales: 5500
  }, {
    month: 'Jul',
    sales: 7000
  }];
  const topProductsData = [{
    name: 'Snake Plant',
    sales: 78
  }, {
    name: 'Monstera',
    sales: 65
  }, {
    name: 'Potting Soil',
    sales: 52
  }, {
    name: 'Fiddle Leaf Fig',
    sales: 48
  }, {
    name: 'Ceramic Pot',
    sales: 38
  }];
  // Mock data for recent orders
  const recentOrders = [{
    id: 'ORD-7892',
    customer: 'Emma Johnson',
    date: '2023-07-15',
    status: 'Delivered',
    total: '$125.99'
  }, {
    id: 'ORD-7891',
    customer: 'Michael Brown',
    date: '2023-07-14',
    status: 'Shipped',
    total: '$89.50'
  }, {
    id: 'ORD-7890',
    customer: 'Sarah Davis',
    date: '2023-07-14',
    status: 'Pending',
    total: '$210.75'
  }, {
    id: 'ORD-7889',
    customer: 'James Wilson',
    date: '2023-07-13',
    status: 'Delivered',
    total: '$45.25'
  }, {
    id: 'ORD-7888',
    customer: 'Patricia Moore',
    date: '2023-07-12',
    status: 'Cancelled',
    total: '$178.60'
  }];
  // Status badge color mapper
  const getStatusBadgeClass = status => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  // Navigation items
  const navItems = [{
    id: 'dashboard',
    name: 'Dashboard',
    icon: <LayoutDashboardIcon className="w-5 h-5" />
  }, {
    id: 'orders',
    name: 'Orders',
    icon: <ShoppingBagIcon className="w-5 h-5" />
  }, {
    id: 'products',
    name: 'Products',
    icon: <PackageIcon className="w-5 h-5" />
  }, {
    id: 'customers',
    name: 'Customers',
    icon: <UsersIcon className="w-5 h-5" />
  }, {
    id: 'reports',
    name: 'Reports',
    icon: <BarChartIcon className="w-5 h-5" />
  }, {
    id: 'settings',
    name: 'Settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];
  return <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center">
            <span className="text-xl font-bold text-green-700">
              Admin Panel
            </span>
          </Link>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map(item => <a key={item.id} href="#" className={`
                group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors
                ${activeNav === item.id ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'}
              `} onClick={e => {
          e.preventDefault();
          setActiveNav(item.id);
        }}>
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </a>)}
        </nav>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button className="md:hidden px-4 text-gray-500 focus:outline-none" onClick={() => setSidebarOpen(true)}>
                  <MenuIcon className="h-6 w-6" />
                </button>
                <div className="flex-1 flex items-center md:ml-0">
                  <div className="max-w-lg w-full lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input id="search" name="search" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-sm" placeholder="Search" type="search" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </div>
                </button>
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      A
                    </div>
                    <span className="hidden md:flex md:items-center ml-2">
                      <span className="text-sm font-medium text-gray-700 mr-1">
                        Admin User
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
          {/* Metrics cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Sales */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSignIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Sales
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          $24,780.50
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                    View all
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            {/* Pending Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Orders
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          18
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                    View all
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            {/* Active Customers */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheckIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Customers
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          1,257
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                    View all
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            {/* Revenue Growth */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUpIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue Growth
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          +12.5%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                    View report
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* Charts section */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Sales Over Time Chart */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sales Over Time
                </h3>
                <div className="flex items-center">
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5
                }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} activeDot={{
                    r: 8
                  }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Top Products Chart */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Top Products
                </h3>
                <div className="flex items-center">
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option>By Sales</option>
                    <option>By Revenue</option>
                  </select>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5
                }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" name="Units Sold" fill="#16a34a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Recent Orders Table */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Orders
                </h3>
                <a href="#" className="text-sm font-medium text-green-700 hover:text-green-900">
                  View all orders
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {order.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-green-700 hover:text-green-900">
                            View
                          </a>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Previous
                    </a>
                    <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Next
                    </a>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to{' '}
                        <span className="font-medium">5</span> of{' '}
                        <span className="font-medium">24</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Previous</span>
                          <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                        </a>
                        <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                          1
                        </a>
                        <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-700">
                          2
                        </a>
                        <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                          3
                        </a>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                        <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                          8
                        </a>
                        <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Next</span>
                          <ChevronRightIcon className="h-5 w-5" />
                        </a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};