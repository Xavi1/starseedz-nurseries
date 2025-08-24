import React, { useState } from 'react';
import DashboardOverview from './DashboardOverview';
import OrdersList from './Orders/OrdersList';
import ProductsList from './Products/ProductsList';
import CustomersList from './Customers/CustomersList';
import SalesReport from './Reports/SalesReport';
import StoreSettings from './Settings/StoreSettings';

const navItems = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'orders', name: 'Orders' },
  { id: 'products', name: 'Products' },
  { id: 'customers', name: 'Customers' },
  { id: 'reports', name: 'Reports' },
  { id: 'settings', name: 'Settings' },
];

const AdminDashboard = () => {
  // --- Dashboard Data & Handlers ---
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reportType, setReportType] = useState('sales');
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [activeSettingsTab, setActiveSettingsTab] = useState('store');

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
    { month: 'Jul', sales: 7000 }
  ];
  const topProductsData = [
    { name: 'Snake Plant', sales: 78 },
    { name: 'Monstera', sales: 65 },
    { name: 'Potting Soil', sales: 52 },
    { name: 'Fiddle Leaf Fig', sales: 48 },
    { name: 'Ceramic Pot', sales: 38 }
  ];
  const inventoryAlerts = [
    { id: 1, product: 'Monstera Deliciosa', sku: 'PLT-001', stock: 3, threshold: 5, image: '' },
    { id: 2, product: 'Ceramic Pot - Large', sku: 'POT-012', stock: 2, threshold: 10, image: '' }
  ];
  const customerActivity = [
    { id: 1, type: 'signup', customer: 'David Anderson', time: '10 minutes ago', details: 'New customer signed up via email' }
  ];
  const recentOrders = [
    { id: 'ORD-7892', customer: 'Emma Johnson', date: '2023-07-15', status: 'Delivered', total: '$125.99', paymentMethod: 'Credit Card', shippingMethod: 'Standard Shipping' }
  ];
  const allOrders = [...recentOrders];
  const filteredOrders = orderStatusFilter === 'all' ? allOrders : allOrders.filter(order => order.status.toLowerCase() === orderStatusFilter.toLowerCase());
  const products = [
    { id: 1, name: 'Monstera Deliciosa', sku: 'PLT-001', category: 'Indoor Plants', price: 39.99, stock: 24, lowStockThreshold: 5, featured: true, image: '' }
  ];
  const filteredProducts = productCategoryFilter === 'all' ? products : products.filter(product => product.category === productCategoryFilter);
  const customers = [
    { id: 1, name: 'Emma Johnson', email: 'emma.johnson@example.com', ordersCount: 8, totalSpend: '$425.75', lastActive: '2023-07-15', segment: 'repeat', phone: '', address: '', createdAt: '', notes: '' }
  ];
  const filteredCustomers = customerSegmentFilter === 'all' ? customers : customers.filter(customer => customer.segment === customerSegmentFilter);
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getActivityIcon = (type) => null;
  const getReportData = () => [];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg w-64 p-4 space-y-4 fixed top-0 left-0 h-full z-30 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}> 
        <div className="flex items-center justify-between mb-6">
          <span className="font-bold text-xl">Admin</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map(item => (
            <button key={item.id} className={`block w-full text-left px-4 py-2 rounded-lg ${activeNav === item.id ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveNav(item.id)}>
              {item.name}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-64">
        {/* Top nav */}
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button className="md:hidden text-lg" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="font-bold text-lg">Starseedz Nurseries Dashboard</span>
          <div className="flex items-center space-x-4">
            {/* Add notification/user icons here if needed */}
          </div>
        </header>
        <main className="p-4">
          {activeNav === 'dashboard' && (
            <DashboardOverview
              salesData={salesData}
              topProductsData={topProductsData}
              inventoryAlerts={inventoryAlerts}
              customerActivity={customerActivity}
              recentOrders={recentOrders}
              getStatusBadgeClass={getStatusBadgeClass}
              getActivityIcon={getActivityIcon}
              setActiveNav={setActiveNav}
              setSelectedOrder={setSelectedOrder}
            />
          )}
          {activeNav === 'orders' && (
            <OrdersList
              allOrders={allOrders}
              filteredOrders={filteredOrders}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              getStatusBadgeClass={getStatusBadgeClass}
            />
          )}
          {activeNav === 'products' && (
            <ProductsList
              products={products}
              filteredProducts={filteredProducts}
              productCategoryFilter={productCategoryFilter}
              setProductCategoryFilter={setProductCategoryFilter}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
            />
          )}
          {activeNav === 'customers' && (
            <CustomersList
              customers={customers}
              filteredCustomers={filteredCustomers}
              customerSegmentFilter={customerSegmentFilter}
              setCustomerSegmentFilter={setCustomerSegmentFilter}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
            />
          )}
          {activeNav === 'reports' && (
            <SalesReport
              reportType={reportType}
              setReportType={setReportType}
              reportTimeframe={reportTimeframe}
              setReportTimeframe={setReportTimeframe}
              getReportData={getReportData}
            />
          )}
          {activeNav === 'settings' && (
            <StoreSettings
              activeSettingsTab={activeSettingsTab}
              setActiveSettingsTab={setActiveSettingsTab}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
