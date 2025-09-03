// =============================
// AdminDashboard.tsx
// =============================
// Senior Developer Notes:
// This file implements the main admin dashboard for the e-commerce app, including navigation, analytics, orders, products, customers, reports, and settings.
// It uses React functional components, hooks for state, and Lucide icons for UI.
//
// Key Concepts:
// - React hooks for state and UI control
// - Modular mock data for charts, tables, and detail views
// - Conditional rendering for multi-tab navigation
// - Inline documentation for maintainability and onboarding
// =============================
import React, { useState } from 'react';
import { useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { LayoutDashboardIcon, ShoppingBagIcon, PackageIcon, UsersIcon, BarChartIcon, SettingsIcon, MenuIcon, XIcon, SearchIcon, BellIcon, ChevronDownIcon, TrendingUpIcon, ClockIcon, UserCheckIcon, DollarSignIcon, ChevronRightIcon, FilterIcon, AlertCircleIcon, PlusIcon, TagIcon, BoxIcon, CreditCardIcon, TruckIcon, TrashIcon, EditIcon, DownloadIcon, PrinterIcon, CheckCircleIcon, UserPlusIcon, StarIcon, MessageCircleIcon, RefreshCwIcon, EyeIcon, KeyIcon, RepeatIcon, HeartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
export const AdminDashboard = () => {
  // Type for dashboard recent orders
  type DashboardOrder = {
    id: string;
    customer: string;
    date: string;
    status: string;
    total: number;
    paymentMethod: string;
    shippingMethod: string;
  };
  // =============================
  // State Management
  // =============================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [reportType, setReportType] = useState('sales');
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [activeSettingsTab, setActiveSettingsTab] = useState('store');

  // Dashboard Firebase Data
  const [dashboardStats, setDashboardStats] = useState<{
    totalSales: number;
    pendingOrders: number;
    activeCustomers: number;
    recentOrders: DashboardOrder[];
  }>({
    totalSales: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    recentOrders: [],
  });

  useEffect(() => {
    if (activeNav !== 'dashboard') return;
    // Fetch orders
    const fetchDashboardData = async () => {
      // Orders
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      let totalSales = 0;
      let pendingOrders = 0;
      let recentOrders: any[] = [];
      ordersSnap.forEach(doc => {
        const data = doc.data();
        totalSales += typeof data.total === 'number' ? data.total : 0;
        if (data.status === 'Pending') pendingOrders++;
        recentOrders.push({
          id: doc.id,
          customer: data.shippingAddress?.firstName + ' ' + data.shippingAddress?.lastName,
          date: data.date || '',
          status: data.status || '',
          total: data.total || 0,
          paymentMethod: data.paymentMethod?.type || '',
          shippingMethod: data.shippingMethod || '',
        });
      });
      // Sort recentOrders by date desc
      recentOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      recentOrders = recentOrders.slice(0, 5);

      // Customers
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const activeCustomers = usersSnap.size;

      setDashboardStats({
        totalSales,
        pendingOrders,
        activeCustomers,
        recentOrders,
      });
    };
    fetchDashboardData();
  }, [activeNav]);
  // =============================
  // Mock Data Definitions
  // =============================
  // Mock data for charts
  const salesData = [{
  // salesData: monthly sales for dashboard chart
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
  // topProductsData: top-selling products for dashboard chart
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
  // Extended data for reports
  const salesReportData = [{
  // salesReportData: extended sales data for reports
    date: '2023-07-01',
    revenue: 1240,
    orders: 28,
    avgOrderValue: 44.29
  }, {
    date: '2023-07-02',
    revenue: 1580,
    orders: 32,
    avgOrderValue: 49.38
  }, {
    date: '2023-07-03',
    revenue: 1890,
    orders: 37,
    avgOrderValue: 51.08
  }, {
    date: '2023-07-04',
    revenue: 2390,
    orders: 45,
    avgOrderValue: 53.11
  }, {
    date: '2023-07-05',
    revenue: 1950,
    orders: 38,
    avgOrderValue: 51.32
  }, {
    date: '2023-07-06',
    revenue: 2130,
    orders: 41,
    avgOrderValue: 51.95
  }, {
    date: '2023-07-07',
    revenue: 2590,
    orders: 49,
    avgOrderValue: 52.86
  }];
  const customerReportData = [{
  // customerReportData: extended customer data for reports
    date: '2023-07-01',
    new: 12,
    returning: 16,
    churnRate: 2.1
  }, {
    date: '2023-07-02',
    new: 15,
    returning: 17,
    churnRate: 1.8
  }, {
    date: '2023-07-03',
    new: 18,
    returning: 19,
    churnRate: 1.9
  }, {
    date: '2023-07-04',
    new: 22,
    returning: 23,
    churnRate: 1.7
  }, {
    date: '2023-07-05',
    new: 17,
    returning: 21,
    churnRate: 2.0
  }, {
    date: '2023-07-06',
    new: 19,
    returning: 22,
    churnRate: 1.8
  }, {
    date: '2023-07-07',
    new: 24,
    returning: 25,
    churnRate: 1.6
  }];
  const inventoryReportData = [{
  // inventoryReportData: extended inventory data for reports
    category: 'Indoor Plants',
    inStock: 145,
    lowStock: 12,
    outOfStock: 3
  }, {
    category: 'Outdoor Plants',
    inStock: 98,
    lowStock: 8,
    outOfStock: 2
  }, {
    category: 'Succulents',
    inStock: 72,
    lowStock: 5,
    outOfStock: 1
  }, {
    category: 'Garden Tools',
    inStock: 53,
    lowStock: 7,
    outOfStock: 4
  }, {
    category: 'Pots & Planters',
    inStock: 87,
    lowStock: 9,
    outOfStock: 2
  }];
  // Customer activity data
  const customerActivity = [{
  // customerActivity: recent customer actions for dashboard
    id: 1,
    type: 'signup',
    customer: 'David Anderson',
    time: '10 minutes ago',
    details: 'New customer signed up via email'
  }, {
    id: 2,
    type: 'review',
    customer: 'Lisa Martinez',
    time: '45 minutes ago',
    details: 'Left a 5-star review for "Monstera Deliciosa"'
  }, {
    id: 3,
    type: 'inquiry',
    customer: 'Robert Johnson',
    time: '1 hour ago',
    details: 'Asked about plant care for fiddle leaf fig'
  }, {
    id: 4,
    type: 'signup',
    customer: 'Jennifer Wilson',
    time: '2 hours ago',
    details: 'New customer signed up via Google'
  }, {
    id: 5,
    type: 'review',
    customer: 'Thomas Brown',
    time: '3 hours ago',
    details: 'Left a 4-star review for "Snake Plant"'
  }];
  // Inventory alerts data
  const inventoryAlerts = [{
  // inventoryAlerts: low stock and out-of-stock alerts
    id: 1,
    product: 'Monstera Deliciosa',
    sku: 'PLT-001',
    stock: 3,
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 2,
    product: 'Ceramic Pot - Large',
    sku: 'POT-012',
    stock: 2,
    threshold: 10,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 3,
    product: 'Pruning Shears',
    sku: 'TLS-005',
    stock: 4,
    threshold: 8,
    image: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 4,
    product: 'Potting Soil - 5L',
    sku: 'SOL-002',
    stock: 6,
    threshold: 15,
    image: 'https://images.unsplash.com/photo-1562847961-8f766d3b8289?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }];
  // Mock data for recent orders
  const recentOrders = [{
  // recentOrders: latest orders for dashboard and orders tab
    id: 'ORD-7892',
    customer: 'Emma Johnson',
    date: '2023-07-15',
    status: 'Delivered',
    total: '$125.99',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard Shipping'
  }, {
    id: 'ORD-7891',
    customer: 'Michael Brown',
    date: '2023-07-14',
    status: 'Shipped',
    total: '$89.50',
    paymentMethod: 'PayPal',
    shippingMethod: 'Express Shipping'
  }, {
    id: 'ORD-7890',
    customer: 'Sarah Davis',
    date: '2023-07-14',
    status: 'Pending',
    total: '$210.75',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard Shipping'
  }, {
    id: 'ORD-7889',
    customer: 'James Wilson',
    date: '2023-07-13',
    status: 'Delivered',
    total: '$45.25',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard Shipping'
  }, {
    id: 'ORD-7888',
    customer: 'Patricia Moore',
    date: '2023-07-12',
    status: 'Cancelled',
    total: '$178.60',
    paymentMethod: 'PayPal',
    shippingMethod: 'Express Shipping'
  }];
  // Extended orders data for Orders tab
  const allOrders = [...recentOrders, {
  // allOrders: extended orders for orders tab
    id: 'ORD-7887',
    customer: 'Robert Taylor',
    date: '2023-07-11',
    status: 'Delivered',
    total: '$67.25',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard Shipping'
  }, {
    id: 'ORD-7886',
    customer: 'Jennifer Martinez',
    date: '2023-07-11',
    status: 'Processing',
    total: '$134.50',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express Shipping'
  }, {
    id: 'ORD-7885',
    customer: 'William Anderson',
    date: '2023-07-10',
    status: 'Shipped',
    total: '$92.75',
    paymentMethod: 'PayPal',
    shippingMethod: 'Standard Shipping'
  }, {
    id: 'ORD-7884',
    customer: 'Elizabeth Thomas',
    date: '2023-07-09',
    status: 'Delivered',
    total: '$215.99',
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express Shipping'
  }, {
    id: 'ORD-7883',
    customer: 'David Rodriguez',
    date: '2023-07-08',
    status: 'Cancelled',
    total: '$56.25',
    paymentMethod: 'PayPal',
    shippingMethod: 'Standard Shipping'
  }];
  // Products data for Products tab
  const products = [{
  // products: product catalog for products tab
    id: 1,
    name: 'Monstera Deliciosa',
    sku: 'PLT-001',
    category: 'Indoor Plants',
    price: 39.99,
    stock: 24,
    lowStockThreshold: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 2,
    name: 'Snake Plant',
    sku: 'PLT-002',
    category: 'Indoor Plants',
    price: 24.99,
    stock: 32,
    lowStockThreshold: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae2b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 3,
    name: 'Fiddle Leaf Fig',
    sku: 'PLT-003',
    category: 'Indoor Plants',
    price: 49.99,
    stock: 18,
    lowStockThreshold: 5,
    featured: false,
    image: 'https://images.unsplash.com/photo-1616500163246-0ffbb872f4de?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 4,
    name: 'Peace Lily',
    sku: 'PLT-004',
    category: 'Indoor Plants',
    price: 29.99,
    stock: 21,
    lowStockThreshold: 5,
    featured: false,
    image: 'https://images.unsplash.com/photo-1616784754051-4769c7a8cf5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 5,
    name: 'Lavender Plant',
    sku: 'PLT-005',
    category: 'Outdoor Plants',
    price: 15.99,
    stock: 45,
    lowStockThreshold: 10,
    featured: true,
    image: 'https://images.unsplash.com/photo-1590585735278-6edaff1c0c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 6,
    name: 'Rosemary Herb',
    sku: 'PLT-006',
    category: 'Outdoor Plants',
    price: 12.99,
    stock: 38,
    lowStockThreshold: 10,
    featured: false,
    image: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 7,
    name: 'Echeveria Succulent',
    sku: 'PLT-007',
    category: 'Succulents',
    price: 9.99,
    stock: 56,
    lowStockThreshold: 15,
    featured: true,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 8,
    name: 'Gardening Tool Set',
    sku: 'TLS-001',
    category: 'Garden Tools',
    price: 34.99,
    stock: 12,
    lowStockThreshold: 5,
    featured: false,
    image: 'https://images.unsplash.com/photo-1585513553738-84971d9c2f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 9,
    name: 'Ceramic Pot - Medium',
    sku: 'POT-001',
    category: 'Pots & Planters',
    price: 19.99,
    stock: 27,
    lowStockThreshold: 8,
    featured: true,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }, {
    id: 10,
    name: 'Potting Soil - 10L',
    sku: 'SOL-001',
    category: 'Garden Supplies',
    price: 14.99,
    stock: 42,
    lowStockThreshold: 10,
    featured: false,
    image: 'https://images.unsplash.com/photo-1562847961-8f766d3b8289?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
  }];
  // Customers data for Customers tab
  const customers = [{
  // customers: customer list for customers tab
  // =============================
  // Utility Functions
  // =============================
    id: 1,
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    ordersCount: 8,
    totalSpend: '$425.75',
    lastActive: '2023-07-15',
    segment: 'repeat',
    phone: '(555) 123-4567',
    address: '123 Main St, Portland, OR 97201',
    createdAt: '2022-03-12',
    notes: 'Prefers succulents and indoor plants. Interested in plant care workshops.'
  }, {
    id: 2,
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    ordersCount: 3,
    totalSpend: '$189.50',
    lastActive: '2023-07-14',
    segment: 'repeat',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Portland, OR 97202',
    createdAt: '2022-06-24',
    notes: 'Buys plants as gifts. Interested in gift wrapping services.'
  }, {
    id: 3,
    name: 'Sarah Davis',
    email: 'sarah.davis@example.com',
    ordersCount: 12,
    totalSpend: '$876.25',
    lastActive: '2023-07-14',
    segment: 'high',
    phone: '(555) 345-6789',
    address: '789 Pine St, Portland, OR 97203',
    createdAt: '2021-11-05',
    notes: 'Gardening enthusiast. Interested in rare plants and special orders.'
  }, {
    id: 4,
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    ordersCount: 2,
    totalSpend: '$75.25',
    lastActive: '2023-07-13',
    segment: 'new',
    phone: '(555) 456-7890',
    address: '101 Cedar Rd, Portland, OR 97204',
    createdAt: '2023-06-18',
    notes: 'New plant parent. Interested in beginner-friendly plants.'
  }, {
    id: 5,
    name: 'Patricia Moore',
    email: 'patricia.moore@example.com',
    ordersCount: 5,
    totalSpend: '$312.85',
    lastActive: '2023-07-12',
    segment: 'repeat',
    phone: '(555) 567-8901',
    address: '202 Maple Dr, Portland, OR 97205',
    createdAt: '2022-09-30',
    notes: 'Prefers outdoor plants and garden supplies.'
  }, {
    id: 6,
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    ordersCount: 1,
    totalSpend: '$67.25',
    lastActive: '2023-07-11',
    segment: 'new',
    phone: '(555) 678-9012',
    address: '303 Birch Ln, Portland, OR 97206',
    createdAt: '2023-07-01',
    notes: 'First-time customer. Purchased a snake plant.'
  }, {
    id: 7,
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@example.com',
    ordersCount: 7,
    totalSpend: '$523.75',
    lastActive: '2023-07-11',
    segment: 'high',
    phone: '(555) 789-0123',
    address: '404 Elm St, Portland, OR 97207',
    createdAt: '2022-01-15',
    notes: 'Collector of rare plants. Interested in plant swaps and events.'
  }];
  // Status badge color mapper
  type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;

  // getStatusBadgeClass: returns CSS class for order status badge
const getStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
  // Get activity icon based on type
  type ActivityType = 'signup' | 'review' | 'inquiry' | string;

  // getActivityIcon: returns icon for customer activity type
const getActivityIcon = (type: ActivityType): JSX.Element => {
  switch (type) {
    case 'signup':
      return <UserPlusIcon className="h-5 w-5 text-green-500" />;
    case 'review':
      return <StarIcon className="h-5 w-5 text-yellow-500" />;
    case 'inquiry':
      return <MessageCircleIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <BellIcon className="h-5 w-5 text-gray-500" />;
  }
};

  // Navigation items
  const navItems = [{
  // navItems: sidebar navigation configuration
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
  // Filter orders by status
  const filteredOrders = orderStatusFilter === 'all' ? allOrders : allOrders.filter(order => order.status.toLowerCase() === orderStatusFilter.toLowerCase());
  // filteredOrders: orders filtered by status
  // Filter products by category
  const filteredProducts = productCategoryFilter === 'all' ? products : products.filter(product => product.category === productCategoryFilter);
  // filteredProducts: products filtered by category
  // Filter customers by segment
  const filteredCustomers = customerSegmentFilter === 'all' ? customers : customers.filter(customer => customer.segment === customerSegmentFilter);
  // filteredCustomers: customers filtered by segment
  // Get product categories for filter
  const productCategories = ['all', ...new Set(products.map(product => product.category))];
  // productCategories: unique product categories for filter dropdown
  // Get current report data based on type
  const getReportData = () => {
  // getReportData: returns report data based on selected type
    switch (reportType) {
      case 'sales':
        return salesReportData;
      case 'customers':
        return customerReportData;
      case 'inventory':
        return inventoryReportData;
      default:
        return salesReportData;
    }
  };
  // Render order detail view
  const renderOrderDetail = () => {
  // =============================
  // Order Detail View
  // =============================
  // Renders detailed view for a selected order
    if (!selectedOrder) return null;
    const order = allOrders.find(o => o.id === selectedOrder);
    if (!order) return null;
    return <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order {order.id}
          </h3>
          <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-5">
          {/* Order Timeline */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Order Timeline
            </h4>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-0.5 bg-gray-200"></div>
              </div>
              <div className="relative flex flex-col space-y-6">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full h-8 w-8 flex items-center justify-center z-10">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Order Placed
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.date} at 10:23 AM
                    </p>
                  </div>
                </div>
                {order.status !== 'Cancelled' && <>
                    <div className="flex items-center">
                      <div className={`${order.status === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                        <CreditCardIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Payment Confirmed
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.date} at 10:30 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`${order.status === 'Pending' || order.status === 'Processing' ? 'bg-gray-300' : 'bg-green-500'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                        <BoxIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Order Processed
                        </p>
                        {order.status !== 'Pending' && order.status !== 'Processing' ? <p className="text-xs text-gray-500">
                            {order.date} at 2:15 PM
                          </p> : <p className="text-xs text-gray-500">Pending</p>}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                        <TruckIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Order Shipped
                        </p>
                        {order.status === 'Shipped' || order.status === 'Delivered' ? <p className="text-xs text-gray-500">
                            {new Date(new Date(order.date).getTime() + 86400000).toISOString().split('T')[0]}{' '}
                            at 9:30 AM
                          </p> : <p className="text-xs text-gray-500">Pending</p>}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`${order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Delivered
                        </p>
                        {order.status === 'Delivered' ? <p className="text-xs text-gray-500">
                            {new Date(new Date(order.date).getTime() + 172800000).toISOString().split('T')[0]}{' '}
                            at 2:45 PM
                          </p> : <p className="text-xs text-gray-500">Pending</p>}
                      </div>
                    </div>
                  </>}
                {order.status === 'Cancelled' && <div className="flex items-center">
                    <div className="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center z-10">
                      <XIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Order Cancelled
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.date} at 11:45 AM
                      </p>
                    </div>
                  </div>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Customer Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">
                  {order.customer}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  customer@example.com
                </p>
                <p className="text-sm text-gray-600 mt-1">(555) 123-4567</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Shipping Address
                  </p>
                  <p className="text-sm text-gray-600 mt-1">123 Main Street</p>
                  <p className="text-sm text-gray-600">Portland, OR 97201</p>
                </div>
              </div>
            </div>
            {/* Payment & Shipping */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Payment & Shipping
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.paymentMethod}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Shipping Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.shippingMethod}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    TRK-{order.id.split('-')[1]}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${parseFloat(order.total.replace('$', '')).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm font-medium text-gray-900">$5.00</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-sm font-medium text-gray-900">
                      $
                      {(parseFloat(order.total.replace('$', '')) * 0.08).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      $
                      {(parseFloat(order.total.replace('$', '')) + 5 + parseFloat(order.total.replace('$', '')) * 0.08).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Order Items */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Order Items
            </h4>
            <div className="bg-gray-50 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Monstera Deliciosa
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $39.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $39.99
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Ceramic Pot - Medium
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      2
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $19.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $39.98
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Potting Soil - 5L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $12.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $12.99
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>;
  };
  // Render product detail view
  const renderProductDetail = () => {
  // =============================
  // Product Detail View
  // =============================
  // Renders detailed view for a selected product
    if (!selectedProduct) return null;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return null;
    return <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {product.name}
          </h3>
          <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Image */}
            <div className="md:col-span-1">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-center object-cover" />
              </div>
            </div>
            {/* Product Details */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.category}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.stock} units
                    {product.stock <= product.lowStockThreshold && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.featured ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock Threshold
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.lowStockThreshold} units
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  This {product.name} is a beautiful addition to any home or
                  garden. Perfect for both beginners and experienced plant
                  enthusiasts.
                </p>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales History
                </h4>
                <div className="mt-2 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{
                    date: '2023-05-15',
                    sales: 5
                  }, {
                    date: '2023-05-22',
                    sales: 8
                  }, {
                    date: '2023-05-29',
                    sales: 12
                  }, {
                    date: '2023-06-05',
                    sales: 10
                  }, {
                    date: '2023-06-12',
                    sales: 15
                  }, {
                    date: '2023-06-19',
                    sales: 18
                  }, {
                    date: '2023-06-26',
                    sales: 14
                  }, {
                    date: '2023-07-03',
                    sales: 20
                  }, {
                    date: '2023-07-10',
                    sales: 16
                  }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={false} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit Product
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  };
  // Render customer detail view
  const renderCustomerDetail = () => {
  // =============================
  // Customer Detail View
  // =============================
  // Renders detailed view for a selected customer
    if (!selectedCustomer) return null;
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return null;
    return <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {customer.name}
          </h3>
          <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Info */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-green-700">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {customer.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {customer.segment === 'new' && 'New Customer'}
                      {customer.segment === 'repeat' && 'Repeat Customer'}
                      {customer.segment === 'high' && 'High Value Customer'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.address}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Since
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Notes
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">{customer.notes}</p>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <MessageCircleIcon className="h-4 w-4 mr-2" />
                    Email
                  </button>
                  <button className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
            {/* Customer Details */}
            <div className="md:col-span-2">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">Orders</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {customer.ordersCount}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Total Spent
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {customer.totalSpend}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Last Active
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {new Date(customer.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {/* Order History */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Order History
                </h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allOrders.filter(o => o.customer === customer.name).map(order => <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700 hover:text-green-900">
                              <a href="#" onClick={e => {
                          e.preventDefault();
                          setSelectedCustomer(null);
                          setSelectedOrder(order.id);
                          setActiveNav('orders');
                        }}>
                                {order.id}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(order.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {order.total}
                            </td>
                          </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Activity Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Activity Timeline
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center ml-6">
                      <div className="h-full w-0.5 bg-gray-200"></div>
                    </div>
                    <div className="relative space-y-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                            <ShoppingBagIcon className="h-4 w-4 text-green-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Placed order #ORD-7892
                          </p>
                          <p className="text-xs text-gray-500">
                            2023-07-15 at 10:23 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center z-10">
                            <StarIcon className="h-4 w-4 text-yellow-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Left a 5-star review for "Monstera Deliciosa"
                          </p>
                          <p className="text-xs text-gray-500">
                            2023-07-10 at 3:45 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                            <MessageCircleIcon className="h-4 w-4 text-blue-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Sent an inquiry about plant care
                          </p>
                          <p className="text-xs text-gray-500">
                            2023-07-05 at 11:20 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                            <UserPlusIcon className="h-4 w-4 text-green-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Created account
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(customer.createdAt).toLocaleDateString()}{' '}
                            at 2:15 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  };
  // Render dashboard content
  const renderDashboardContent = () => <>
      {/* Metrics cards - Firebase data */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
                      ${dashboardStats.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                    <div className="text-lg font-medium text-gray-900">{dashboardStats.pendingOrders}</div>
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
                      {dashboardStats.activeCustomers}
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
        {/* Revenue Growth - Placeholder */}
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
                      {/* TODO: Calculate growth from previous period */}
                      --
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
        {/* Average Order Value - Placeholder */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Order Value
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {/* TODO: Calculate average order value */}
                      --
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
        {/* Repeat Customers - Placeholder */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RepeatIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Repeat Customers
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">--</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View details
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
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
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
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Inventory Alerts Widget (NEW) */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <AlertCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Inventory Alerts
            </h3>
            <a href="#" className="text-sm font-medium text-green-700 hover:text-green-900">
              View all inventory
            </a>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {inventoryAlerts.map(item => <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.product} className="h-10 w-10 rounded-md object-cover" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product}
                        </p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.stock}{' '}
                          <span className="text-gray-500">
                            / {item.threshold}
                          </span>
                        </p>
                        <p className="text-xs text-red-500">Low stock</p>
                      </div>
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <RefreshCwIcon className="h-3.5 w-3.5 mr-1" />
                        Restock
                      </button>
                    </div>
                  </div>
                </li>)}
            </ul>
          </div>
        </div>
        {/* Customer Activity Feed (NEW) */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Customer Activity
            </h3>
            <a href="#" className="text-sm font-medium text-green-700 hover:text-green-900">
              View all activity
            </a>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {customerActivity.map(activity => <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.customer}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                </li>)}
            </ul>
          </div>
        </div>
      </div>
      {/* Recent Orders Table */}
      {/* Recent Orders Table - Firebase data */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Orders
            </h3>
            <a href="#" onClick={e => {
            e.preventDefault();
            setActiveNav('orders');
          }} className="text-sm font-medium text-green-700 hover:text-green-900">
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
                {dashboardStats.recentOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.date ? new Date(order.date).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-green-700 hover:text-green-900" onClick={e => {
                    e.preventDefault();
                    setSelectedOrder(order.id);
                    setActiveNav('orders');
                  }}>
                        View
                      </a>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>;
  // Render orders content
  const renderOrdersContent = () => <>
      {selectedOrder ? renderOrderDetail() : <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Orders
              </h3>
              <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Status:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <DownloadIcon className="h-4 w-4 mr-1.5" />
                    Export CSV
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PrinterIcon className="h-4 w-4 mr-1.5" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input id="select-all" name="select-all" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                    </div>
                  </th>
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
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input id={`select-${order.id}`} name={`select-${order.id}`} type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                      </div>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedOrder(order.id)} className="text-green-700 hover:text-green-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <EditIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <select className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500">
                  <option>Bulk Actions</option>
                  <option>Update Status</option>
                  <option>Delete Selected</option>
                </select>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Apply
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{filteredOrders.length}</span>{' '}
                  results
                </span>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-700">
                    1
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </a>
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>}
    </>;
  // Render products content
  const renderProductsContent = () => <>
      {selectedProduct ? renderProductDetail() : <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Products
              </h3>
              <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
                <div className="relative rounded-md shadow-sm max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md" placeholder="Search products" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Category:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)}>
                    {productCategories.map(category => <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>)}
                  </select>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input id="select-all-products" name="select-all-products" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input id={`select-product-${product.id}`} name={`select-product-${product.id}`} type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock}
                        {product.stock <= product.lowStockThreshold && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Low
                          </span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.featured ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Featured
                        </span> : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedProduct(product.id)} className="text-green-700 hover:text-green-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-red-700">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <select className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500">
                  <option>Bulk Actions</option>
                  <option>Mark as Featured</option>
                  <option>Update Stock</option>
                  <option>Delete Selected</option>
                </select>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Apply
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{filteredProducts.length}</span>{' '}
                  results
                </span>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-700">
                    1
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </a>
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>}
    </>;
  // Render customers content
  const renderCustomersContent = () => <>
      {selectedCustomer ? renderCustomerDetail() : <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customers
              </h3>
              <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
                <div className="relative rounded-md shadow-sm max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md" placeholder="Search customers" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Segment:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={customerSegmentFilter} onChange={e => setCustomerSegmentFilter(e.target.value)}>
                    <option value="all">All Customers</option>
                    <option value="new">New Customers</option>
                    <option value="repeat">Repeat Customers</option>
                    <option value="high">High Value</option>
                  </select>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spend
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map(customer => <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-green-700">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {customer.ordersCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {customer.totalSpend}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(customer.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.segment === 'new' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>}
                      {customer.segment === 'repeat' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Repeat
                        </span>}
                      {customer.segment === 'high' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          High Value
                        </span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedCustomer(customer.id)} className="text-green-700 hover:text-green-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MessageCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <select className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500">
                  <option>Bulk Actions</option>
                  <option>Export Selected</option>
                  <option>Send Email</option>
                </select>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Apply
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">
                    {filteredCustomers.length}
                  </span>{' '}
                  of <span className="font-medium">{customers.length}</span>{' '}
                  results
                </span>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                  </a>
                  <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-50 text-sm font-medium text-green-700">
                    1
                  </a>
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>}
    </>;
  // Render reports content
  const renderReportsContent = () => <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reports
            </h3>
            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Report Type:</span>
                <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="sales">Sales Report</option>
                  <option value="customers">Customer Report</option>
                  <option value="inventory">Inventory Report</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Timeframe:</span>
                <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={reportTimeframe} onChange={e => setReportTimeframe(e.target.value)}>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export PDF
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {reportType === 'sales' && <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </h4>
                    <DollarSignIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    $11,780
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    +12.5% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Orders
                    </h4>
                    <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">270</p>
                  <p className="mt-1 text-sm text-green-600">
                    +8.2% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Avg. Order Value
                    </h4>
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    $43.63
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    +4.3% from previous period
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Revenue Over Time
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesReportData} margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Orders by Status
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{
                        name: 'Delivered',
                        value: 180
                      }, {
                        name: 'Shipped',
                        value: 45
                      }, {
                        name: 'Processing',
                        value: 28
                      }, {
                        name: 'Pending',
                        value: 12
                      }, {
                        name: 'Cancelled',
                        value: 5
                      }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => 
  percent !== undefined ? `${name}: ${(percent * 100).toFixed(0)}%` : `${name}: 0%`
                                                    }>
                            <Cell fill="#16a34a" />
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#eab308" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Sales by Category
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{
                      name: 'Indoor Plants',
                      sales: 4250
                    }, {
                      name: 'Outdoor Plants',
                      sales: 3200
                    }, {
                      name: 'Succulents',
                      sales: 2100
                    }, {
                      name: 'Garden Tools',
                      sales: 1450
                    }, {
                      name: 'Pots & Planters',
                      sales: 780
                    }]} margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5
                    }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{
                        fontSize: 12
                      }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {reportType === 'customers' && <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      New Customers
                    </h4>
                    <UserPlusIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">127</p>
                  <p className="mt-1 text-sm text-green-600">
                    +15.3% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Returning Customers
                    </h4>
                    <RepeatIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">143</p>
                  <p className="mt-1 text-sm text-green-600">
                    +6.7% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Churn Rate
                    </h4>
                    <TrendingUpIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">1.8%</p>
                  <p className="mt-1 text-sm text-green-600">
                    -0.3% from previous period
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Customer Growth
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={customerReportData} margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
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
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Segments
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{
                        name: 'New',
                        value: 35
                      }, {
                        name: 'Repeat',
                        value: 45
                      }, {
                        name: 'High Value',
                        value: 20
                      }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
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
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Retention
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{
                      month: 'Jan',
                      retention: 65
                    }, {
                      month: 'Feb',
                      retention: 68
                    }, {
                      month: 'Mar',
                      retention: 71
                    }, {
                      month: 'Apr',
                      retention: 69
                    }, {
                      month: 'May',
                      retention: 74
                    }, {
                      month: 'Jun',
                      retention: 78
                    }, {
                      month: 'Jul',
                      retention: 82
                    }]} margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0
                    }}>
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
            </div>}
          {reportType === 'inventory' && <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Products
                    </h4>
                    <BoxIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">482</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Across 8 categories
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Low Stock Items
                    </h4>
                    <AlertCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">41</p>
                  <p className="mt-1 text-sm text-yellow-600">
                    8.5% of inventory
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Out of Stock
                    </h4>
                    <XIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
                  <p className="mt-1 text-sm text-red-600">2.5% of inventory</p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Inventory Status by Category
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryReportData} margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inStock" name="In Stock" stackId="a" fill="#16a34a" />
                        <Bar dataKey="lowStock" name="Low Stock" stackId="a" fill="#eab308" />
                        <Bar dataKey="outOfStock" name="Out of Stock" stackId="a" fill="#ef4444" />
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
                      {topProductsData.map((product, index) => <div key={index} className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1 ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{
                          width: `${product.sales / topProductsData[0].sales * 100}%`
                        }}></div>
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium text-gray-900">
                            {product.sales} units
                          </span>
                        </div>)}
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
                          <Pie data={[{
                        name: 'Indoor Plants',
                        value: 12500
                      }, {
                        name: 'Outdoor Plants',
                        value: 8750
                      }, {
                        name: 'Succulents',
                        value: 4200
                      }, {
                        name: 'Garden Tools',
                        value: 7800
                      }, {
                        name: 'Pots & Planters',
                        value: 5400
                      }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                            <Cell fill="#16a34a" />
                            <Cell fill="#22c55e" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#ec4899" />
                          </Pie>
                          <Tooltip formatter={value => `$${value}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
  // Render settings content
  const renderSettingsContent = () => <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Settings
        </h3>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['store', 'users', 'payment', 'notifications', 'security'].map(tab => <button key={tab} onClick={() => setActiveSettingsTab(tab)} className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeSettingsTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab === 'store' && 'Store Settings'}
                {tab === 'users' && 'User Management'}
                {tab === 'payment' && 'Payment Methods'}
                {tab === 'notifications' && 'Notifications'}
                {tab === 'security' && 'Security'}
              </button>)}
        </nav>
      </div>
      <div className="p-4 sm:p-6">
        {activeSettingsTab === 'store' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Store Information
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
                    Store Name
                  </label>
                  <div className="mt-1">
                    <input type="text" name="store-name" id="store-name" defaultValue="Starseedz Nurseries" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input type="email" name="store-email" id="store-email" defaultValue="info@starseedz.com" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input type="text" name="store-phone" id="store-phone" defaultValue="(555) 123-4567" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <div className="mt-1">
                    <select id="currency" name="currency" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>CAD ($)</option>
                      <option>AUD ($)</option>
                      <option>TTD ($)</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="store-address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input type="text" name="store-address" id="store-address" defaultValue="123 Main Street, Portland, OR 97201" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Store Logo
              </h4>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1585676623595-7761e1c5f38b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Store logo" className="h-full w-full object-cover" />
                </div>
                <div className="ml-5">
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Change
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Remove
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, or GIF. Max size 1MB.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Tax Settings
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700">
                    Tax Rate (%)
                  </label>
                  <div className="mt-1">
                    <input type="text" name="tax-rate" id="tax-rate" defaultValue="8.5" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="tax-name" className="block text-sm font-medium text-gray-700">
                    Tax Name
                  </label>
                  <div className="mt-1">
                    <input type="text" name="tax-name" id="tax-name" defaultValue="Sales Tax" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Shipping Methods
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Standard Shipping
                    </h5>
                    <p className="text-sm text-gray-500">3-5 business days</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-4">
                      $5.00
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Express Shipping
                    </h5>
                    <p className="text-sm text-gray-500">1-2 business days</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-4">
                      $15.00
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Add Shipping Method
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-5 flex justify-end">
              <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Cancel
              </button>
              <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Save Changes
              </button>
            </div>
          </div>}
        {activeSettingsTab === 'users' && <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  User Management
                </h4>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-green-700">
                              A
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Admin User
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        admin@greenthumb.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Administrator
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-700">
                              J
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              John Smith
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        john@greenthumb.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Manager
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-pink-700">
                              S
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Sarah Johnson
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        sarah@greenthumb.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Staff
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                User Roles
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Administrator
                    </h5>
                    <p className="text-sm text-gray-500">
                      Full access to all settings and data
                    </p>
                  </div>
                  <div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Manager
                    </h5>
                    <p className="text-sm text-gray-500">
                      Can manage products, orders, and customers
                    </p>
                  </div>
                  <div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Staff</h5>
                    <p className="text-sm text-gray-500">
                      Can view orders and manage inventory
                    </p>
                  </div>
                  <div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Add Role
                  </button>
                </div>
              </div>
            </div>
          </div>}
        {activeSettingsTab === 'payment' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        Credit Card
                      </h5>
                      <p className="text-sm text-gray-500">
                        Accept Visa, Mastercard, Amex, Discover
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-4">
                      Enabled
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-16 bg-blue-100 rounded flex items-center justify-center">
                      <span className="font-bold text-blue-700">PayPal</span>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        PayPal
                      </h5>
                      <p className="text-sm text-gray-500">
                        Accept payments via PayPal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-4">
                      Enabled
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-16 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="font-bold text-yellow-700">Apple</span>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        Apple Pay
                      </h5>
                      <p className="text-sm text-gray-500">
                        Accept payments via Apple Pay
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-4">
                      Disabled
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Add Payment Method
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Payment Processor
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="processor" className="block text-sm font-medium text-gray-700">
                    Processor
                  </label>
                  <div className="mt-1">
                    <select id="processor" name="processor" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <option>Stripe</option>
                      <option>Square</option>
                      <option>Authorize.net</option>
                      <option>Braintree</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                    Mode
                  </label>
                  <div className="mt-1">
                    <select id="mode" name="mode" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <option>Test Mode</option>
                      <option>Live Mode</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <div className="mt-1">
                    <input type="password" name="api-key" id="api-key" defaultValue="sk_test_51KGjT..." className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
        {activeSettingsTab === 'notifications' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Email Notifications
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      New Order
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when a new order is placed
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Order Status Update
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when an order status changes
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Low Stock Alert
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when product stock is low
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Customer Registration
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when a new customer registers
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                SMS Notifications
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Order Status Updates
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send SMS when order status changes
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Delivery Notifications
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send SMS when order is delivered
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Admin Notifications
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="notification-email" className="block text-sm font-medium text-gray-700">
                    Notification Email
                  </label>
                  <div className="mt-1">
                    <input type="email" name="notification-email" id="notification-email" defaultValue="admin@greenthumb.com" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
        {activeSettingsTab === 'security' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Two-Factor Authentication
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Enable Two-Factor Authentication
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Password Settings
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Require Strong Passwords
                    </h5>
                    <p className="text-sm text-gray-500">
                      Passwords must include letters, numbers, and special
                      characters
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Password Expiry
                    </h5>
                    <p className="text-sm text-gray-500">
                      Force users to reset password periodically
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                API Access
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      API Access
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                      Allow external applications to access your store data
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <KeyIcon className="h-4 w-4 mr-1.5" />
                    Manage API Keys
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Session Settings
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <div className="mt-1">
                    <input type="number" name="session-timeout" id="session-timeout" defaultValue="30" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>;
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
          // Reset detail views when changing tabs
          setSelectedOrder(null);
          setSelectedProduct(null);
          setSelectedCustomer(null);
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
            <h1 className="text-2xl font-bold text-gray-900">
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'orders' && 'Orders'}
              {activeNav === 'products' && 'Products'}
              {activeNav === 'customers' && 'Customers'}
              {activeNav === 'reports' && 'Reports'}
              {activeNav === 'settings' && 'Settings'}
            </h1>
            {activeNav !== 'settings' && activeNav !== 'reports' && !selectedOrder && !selectedProduct && !selectedCustomer && <div className="mt-3 sm:mt-0 sm:ml-4">
                  <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>}
          </div>
          <div className="mt-6">
            {activeNav === 'dashboard' && renderDashboardContent()}
            {activeNav === 'orders' && renderOrdersContent()}
            {activeNav === 'products' && renderProductsContent()}
            {activeNav === 'customers' && renderCustomersContent()}
            {activeNav === 'reports' && renderReportsContent()}
            {activeNav === 'settings' && renderSettingsContent()}
          </div>
        </main>
      </div>
    </div>;
};