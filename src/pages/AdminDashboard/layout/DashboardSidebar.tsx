import React from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeNav: string;
  setActiveNav: (id: string) => void;
  setSelectedOrder: (id: string | null) => void;
  setSelectedProduct: (id: number | null) => void;
  setSelectedCustomer: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  navItems,
  activeNav,
  setActiveNav,
  setSelectedOrder,
  setSelectedProduct,
  setSelectedCustomer,
  sidebarOpen,
  setSidebarOpen,
}) => (
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
        <span className="sr-only">Close sidebar</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    <nav className="mt-5 px-2 space-y-1">
      {navItems.map(item => (
        <a
          key={item.id}
          href="#"
          className={`
            group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors
            ${activeNav === item.id ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'}
          `}
          onClick={e => {
            e.preventDefault();
            setActiveNav(item.id);
            setSelectedOrder(null);
            setSelectedProduct(null);
            setSelectedCustomer(null);
          }}
        >
          <span className="mr-3">{item.icon}</span>
          {item.name}
        </a>
      ))}
    </nav>
  </div>
);

export default DashboardSidebar;
