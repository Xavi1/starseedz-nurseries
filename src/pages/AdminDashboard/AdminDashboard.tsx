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
