import React, { useEffect, useCallback } from 'react';
import { SearchIcon, PlusIcon, EyeIcon, EditIcon, MessageCircleIcon, ChevronRightIcon } from 'lucide-react';
import CustomerDetail from './CustomerDetail';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import CustomerEditModal from './CustomerEditModal';

// Define proper types
interface Customer {
  id: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  lastLogin?: any;
  createdAt?: any;
  receiveEmails?: boolean;
  ordersCount: number;
  totalSpent: number;
  segment: 'new' | 'repeat' | 'high';
}

interface CustomersViewProps {
  editingCustomer: Customer | null;
  setEditingCustomer: (customer: Customer | null) => void;
  selectedCustomer: string | null;
  renderCustomerDetail: () => JSX.Element;
  setSelectedCustomer: (id: string) => void;
  customerSearchQuery: string;
  setCustomerSearchQuery: (query: string) => void;
  customersCurrentPage: number;
  setCustomersCurrentPage: (page: number) => void;
  customerSegmentFilter: string;
  setCustomerSegmentFilter: (filter: string) => void;
  handleAddCustomer: () => void;
  paginatedCustomers: Customer[];
  customers: Customer[];
  setAllCustomers: (customers: Customer[]) => void;
  activeNav: string;
}

const CustomersView: React.FC<CustomersViewProps> = ({
  editingCustomer,
  setEditingCustomer,
  selectedCustomer,
  renderCustomerDetail,
  setSelectedCustomer,
  customerSearchQuery,
  setCustomerSearchQuery,
  customersCurrentPage,
  setCustomersCurrentPage,
  customerSegmentFilter,
  setCustomerSegmentFilter,
  handleAddCustomer,
  paginatedCustomers,
  customers,
  setAllCustomers,
  activeNav
}) => {
  const fetchCustomers = useCallback(async () => {
    if (activeNav !== 'customers') return;
    
    try {
      // Fetch customers
      const customersCollection = collection(db, 'users');
      const customersSnapshot = await getDocs(customersCollection);
      
      // Fetch all orders
      const ordersCollection = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCollection);
      const orders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          total: data.total,
          shippingAddress: data.shippingAddress
        };
      });

      const customersData = await Promise.all(customersSnapshot.docs.map(async (doc) => {
        const customerData = doc.data();
        
        // Get all orders for this customer
        const customerOrders = orders.filter(order => 
          order.userId === doc.id || 
          (order.shippingAddress && 
           order.shippingAddress.email === customerData.email)
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
        } as Customer;
      }));

      setAllCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [activeNav, setAllCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const renderCustomersContent = () => <>
        {editingCustomer && (
      <CustomerEditModal 
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSave={() => {
          setEditingCustomer(null);
          fetchCustomers();
        }}
      />
    )}
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
                <input
                  type="text"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search customers"
                  value={customerSearchQuery}
                  onChange={e => { setCustomerSearchQuery(e.target.value); setCustomersCurrentPage(1); }}
                  aria-label="Search customers"
                />
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
              <button onClick={handleAddCustomer} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
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
              {paginatedCustomers.map(customer => <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-green-700">
                            {customer.firstName?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {`${customer.firstName || ''} ${customer.lastName || ''}`}
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
                    ${customer.totalSpent?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
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
                      <button 
                        onClick={() => setEditingCustomer(customer)} 
                        className="text-gray-500 hover:text-gray-700"
                      >
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
            {/* Bulk Actions Section - Left side */}
            <div className="flex items-center mb-4 sm:mb-0">
              <select 
                className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                aria-label="Bulk actions"
              >
                <option>Bulk Actions</option>
                <option>Export Selected</option>
                <option>Send Email</option>
              </select>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Apply
              </button>
            </div>

            {/* Pagination & Results Section - Right side */}
            <div className="flex items-center">
              {(() => {
                // --- Pagination logic for Customers ---
                const pageSize = 10;
                const totalCustomers = customers.length;
                const totalPages = Math.ceil(totalCustomers / pageSize) || 1;
                const startIdx = (customersCurrentPage - 1) * pageSize;
                const endIdx = Math.min(startIdx + pageSize, totalCustomers);
                let pageNumbers = [];
                if (totalPages <= 5) {
                  pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else {
                  if (customersCurrentPage <= 3) {
                    pageNumbers = [1, 2, 3, 4, '...', totalPages];
                  } else if (customersCurrentPage >= totalPages - 2) {
                    pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pageNumbers = [1, '...', customersCurrentPage - 1, customersCurrentPage, customersCurrentPage + 1, '...', totalPages];
                  }
                }
                return <>
                  <span className="text-sm text-gray-700 mr-4">
                    Showing <span className="font-medium">{totalCustomers === 0 ? 0 : startIdx + 1}</span> to{' '}
                    <span className="font-medium">{endIdx}</span> of{' '}
                    <span className="font-medium">{totalCustomers}</span>{' '}
                    results
                  </span>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      type="button"
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${customersCurrentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setCustomersCurrentPage(Math.max(1, customersCurrentPage - 1))}
                      disabled={customersCurrentPage === 1}
                      aria-label="Previous"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                    </button>
                    {pageNumbers.map((num, idx) =>
                      typeof num === 'number' ? (
                        <button
                          key={num}
                          type="button"
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === customersCurrentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                          onClick={() => setCustomersCurrentPage(num)}
                          aria-current={num === customersCurrentPage ? 'page' : undefined}
                        >
                          {num}
                        </button>
                      ) : (
                        <span key={idx} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
                      )
                    )}
                    <button
                      type="button"
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${customersCurrentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setCustomersCurrentPage(Math.min(totalPages, customersCurrentPage + 1))}
                      disabled={customersCurrentPage === totalPages}
                      aria-label="Next"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </>
              })()}
            </div>
          </div>
        </div>
      </div>}
  </>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Customers</h2>
      {renderCustomersContent()}
    </div>
  );
};

export default CustomersView;