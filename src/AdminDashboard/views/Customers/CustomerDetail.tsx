// CustomerDetail.tsx
import React from 'react';
import { 
  XIcon, 
  MessageCircleIcon, 
  RefreshCwIcon,
  ShoppingBagIcon,
  StarIcon,
  UserPlusIcon 
} from 'lucide-react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

interface Order {
  id: string;
  userId?: string;
  total?: number;
  status?: string;
  shippingAddress?: {
    email?: string;
  };
  timeline?: Array<{
    status?: string;
    date?: string;
  }>;
}

interface Customer {
  id: string;
  uid?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  lastLogin?: string;
  createdAt?: string;
  receiveEmails?: boolean;
  notes?: string;
  ordersCount?: number;
  totalSpent?: number;
  segment?: 'new' | 'repeat' | 'high';
}

interface CustomerDetailProps {
  selectedCustomer: string | null;
  allCustomers: Customer[];
  customerOrders: Order[];
  currentPage: number;
  ordersPerPage: number;
  setSelectedCustomer: (customerId: string | null) => void;
  setSelectedOrder: (orderId: string) => void;
  setActiveNav: (nav: string) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setAllCustomers: (customers: Customer[]) => void;
  getStatusBadgeClass: (status: string) => string;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  selectedCustomer,
  allCustomers,
  customerOrders,
  currentPage,
  ordersPerPage,
  setSelectedCustomer,
  setSelectedOrder,
  setActiveNav,
  setCurrentPage,
  setAllCustomers,
  getStatusBadgeClass
}) => {
  const customer = allCustomers.find((c) => c.id === selectedCustomer);
  
  if (!customer) return null;

  const handleUpdateCustomer = async () => {
    try {
      const customerRef = doc(db, 'users', customer.id);
      await updateDoc(customerRef, {
        lastLogin: new Date().toISOString()
      });
      
      // Refresh customers list by refetching
      const customersCollection = collection(db, 'users');
      const customersSnapshot = await getDocs(customersCollection);
      
      // Fetch all orders again to recalculate metrics
      const ordersCollection = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCollection);
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        total: doc.data().total,
        shippingAddress: doc.data().shippingAddress
      }));

      // Recalculate customer metrics
      const customersData = await Promise.all(customersSnapshot.docs.map(async (doc) => {
        const customerData = doc.data();
        const customerOrders = orders.filter(order => 
          order.userId === doc.id || 
          order.shippingAddress?.email === customerData.email
        );
        const totalSpent = customerOrders.reduce((sum, order) => 
          sum + (typeof order.total === 'number' ? order.total : 0), 0);

        let segment: 'new' | 'repeat' | 'high' = 'new';
        if (customerOrders.length > 0) {
          if (totalSpent > 500) {
            segment = 'high';
          } else if (customerOrders.length > 1) {
            segment = 'repeat';
          }
        }

        return {
          id: doc.id,
          uid: customerData.uid,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          location: customerData.location,
          lastLogin: customerData.lastLogin,
          createdAt: customerData.createdAt,
          receiveEmails: customerData.receiveEmails,
          ordersCount: customerOrders.length,
          totalSpent,
          segment
        };
      }));

      setAllCustomers(customersData);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedCustomer(null);
    setSelectedOrder(orderId);
    setActiveNav("orders");
  };

  const renderPagination = () => {
    const totalOrders = customerOrders.length;
    const totalPages = Math.ceil(totalOrders / ordersPerPage) || 1;
    let pageNumbers = [];
    
    if (totalPages <= 5) {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        pageNumbers = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    
    return (
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          type="button"
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Previous"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {pageNumbers.map((num, idx) =>
          typeof num === 'number' ? (
            <button
              key={num}
              type="button"
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                num === currentPage 
                  ? 'bg-green-50 text-green-700 border-green-500 z-10' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setCurrentPage(num)}
              aria-current={num === currentPage ? 'page' : undefined}
            >
              {num}
            </button>
          ) : (
            <span 
              key={idx} 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none"
            >
              …
            </span>
          )
        )}
        
        <button
          type="button"
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {customer.name || `${customer.firstName} ${customer.lastName}`}
        </h3>
        <button 
          onClick={() => setSelectedCustomer(null)} 
          className="text-gray-400 hover:text-gray-500"
        >
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
                    {customer.firstName?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {customer.firstName || 'Unknown'} {customer.lastName || ''}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Customer ID: {customer.uid || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {customer.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {customer.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {customer.location || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Preferences
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {customer.receiveEmails ? 'Subscribed to emails' : 'Not subscribed to emails'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Created
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {customer.lastLogin ? new Date(customer.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Notes
                </h4>
                <p className="mt-1 text-sm text-gray-600">{customer.notes || 'No notes'}</p>
              </div>
              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => customer.email && (window.location.href = `mailto:${customer.email}`)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={!customer.email}
                >
                  <MessageCircleIcon className="h-4 w-4 mr-2" />
                  Email
                </button>
                <button 
                  onClick={handleUpdateCustomer}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Update Info
                </button>
              </div>
            </div>
          </div>
          
          {/* Customer Details */}
          <div className="md:col-span-2">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {customer.ordersCount || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-500">
                  Total Spent
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${customer.totalSpent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-500">
                  Last Active
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-500">
                  Segment
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 capitalize">
                  {customer.segment || 'new'}
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
                    {customerOrders.length > 0 ? (
                      customerOrders
                        .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                        .map((order) => {
                          const latestEntry =
                            order.timeline && order.timeline.length > 0
                              ? order.timeline[order.timeline.length - 1]
                              : null;

                          const status = latestEntry?.status || order.status || "Pending";
                          const date = latestEntry?.date || null;
                          const total = typeof order.total === "number" ? order.total : 0;

                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700 hover:text-green-900">
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleOrderClick(order.id);
                                  }}
                                  className="hover:underline"
                                >
                                  {order.id}
                                </a>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {date ? new Date(date).toLocaleDateString() : "—"}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                ${total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-12 h-12 text-gray-300 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <p className="font-medium text-gray-900">No orders found</p>
                            <p className="mt-1">
                              This customer hasn't placed any orders yet.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {customerOrders.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <span className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * ordersPerPage, customerOrders.length)}</span> of{' '}
                        <span className="font-medium">{customerOrders.length}</span> results
                      </span>
                    </div>
                    <div className="flex items-center">
                      {renderPagination()}
                    </div>
                  </div>
                </div>
              )}
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
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}{' '}
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
    </div>
  );
};

export default CustomerDetail;