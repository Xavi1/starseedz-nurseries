// OrdersList.tsx - Enhanced with all UI features
import React from 'react';
import { DownloadIcon, PrinterIcon, EyeIcon, EditIcon, ChevronRightIcon } from 'lucide-react';

// Match AdminDashboard order type
type DashboardOrder = {
  id: string;
  customer: string;
  date: string | Date;
  status: string;
  total: number | string;
  paymentMethod: string;
  shippingMethod: string;
  orderNumber?: string;
};

type OrdersListProps = {
  allOrders: DashboardOrder[];
  filteredOrders: DashboardOrder[];
  orderStatusFilter: string;
  setOrderStatusFilter: (filter: string) => void;
  selectedOrder: string | null;
  setSelectedOrder: (id: string | null) => void;
  getStatusBadgeClass: (status: string) => string;
  onEditOrder?: (order: DashboardOrder) => void;
  onViewOrder?: (id: string, orderNumber?: string) => void;
  onExportCSV?: (orders: DashboardOrder[]) => void;
  onPrintOrders?: (orders: DashboardOrder[]) => void;
  
  // Selection and pagination props
  selectedOrderIds: string[];
  onSelectAllOrders: () => void;
  onSelectOrder: (id: string) => () => void;
  orderBulkAction: string;
  setOrderBulkAction: (action: string) => void;
  onOrderBulkAction: () => void;
  
  // Pagination props
  paginatedOrders: DashboardOrder[];
  ordersCurrentPage: number;
  setOrdersCurrentPage: (page: number) => void;
};

export const OrdersList: React.FC<OrdersListProps> = ({
  allOrders,
  filteredOrders,
  orderStatusFilter,
  setOrderStatusFilter,
  selectedOrder,
  setSelectedOrder,
  getStatusBadgeClass,
  onEditOrder,
  onViewOrder,
  onExportCSV,
  onPrintOrders,
  
  // Selection and pagination
  selectedOrderIds,
  onSelectAllOrders,
  onSelectOrder,
  orderBulkAction,
  setOrderBulkAction,
  onOrderBulkAction,
  
  // Pagination
  paginatedOrders,
  ordersCurrentPage,
  setOrdersCurrentPage,
}) => {
  // Pagination logic
  const pageSize = 10;
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const startIdx = (ordersCurrentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalOrders);
  
  const renderPageNumbers = () => {
    let pageNumbers = [];
    if (totalPages <= 5) {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (ordersCurrentPage <= 3) {
        pageNumbers = [1, 2, 3, 4, '...', totalPages];
      } else if (ordersCurrentPage >= totalPages - 2) {
        pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pageNumbers = [1, '...', ordersCurrentPage - 1, ordersCurrentPage, ordersCurrentPage + 1, '...', totalPages];
      }
    }
    return pageNumbers;
  };

  const pageNumbers = renderPageNumbers();

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with filter */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Orders
          </h3>
          <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Status:</span>
              <select 
                className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" 
                value={orderStatusFilter} 
                onChange={e => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => onExportCSV && onExportCSV(filteredOrders)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <DownloadIcon className="h-4 w-4 mr-1.5" />
                Export CSV
              </button>
              <button
                onClick={() => onPrintOrders && onPrintOrders(filteredOrders)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PrinterIcon className="h-4 w-4 mr-1.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    id="select-all"
                    name="select-all"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={onSelectAllOrders}
                    ref={el => { 
                      if (el) el.indeterminate = selectedOrderIds.length > 0 && selectedOrderIds.length < filteredOrders.length; 
                    }}
                  />
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
            {paginatedOrders.map(order => {
              // Parse total for display
              const totalValue = typeof order.total === 'number' 
                ? order.total 
                : typeof order.total === 'string'
                ? parseFloat(order.total.replace(/[^0-9.-]+/g, '')) || 0
                : 0;

              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        id={`select-${order.id}`}
                        name={`select-${order.id}`}
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={onSelectOrder(order.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${typeof totalValue === 'number' ? totalValue.toLocaleString() : totalValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewOrder) {
                            onViewOrder(order.id, order.orderNumber);
                          } else {
                            setSelectedOrder(order.id);
                          }
                        }} 
                        className="text-green-700 hover:text-green-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditOrder && onEditOrder(order);
                        }} 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer with bulk actions and pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <select
              className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={orderBulkAction}
              onChange={e => setOrderBulkAction(e.target.value)}
              aria-label="Bulk actions"
              disabled={selectedOrderIds.length === 0}
            >
              <option>Bulk Actions</option>
              <option>Export Selected</option>
              <option>Update Status</option>
              <option>Delete Selected</option>
            </select>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={onOrderBulkAction}
              disabled={selectedOrderIds.length === 0 || orderBulkAction === 'Bulk Actions'}
            >
              Apply
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              Showing <span className="font-medium">{totalOrders === 0 ? 0 : startIdx + 1}</span> to{' '}
              <span className="font-medium">{endIdx}</span> of{' '}
              <span className="font-medium">{totalOrders}</span>{' '}
              results
            </span>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                type="button"
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${ordersCurrentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setOrdersCurrentPage(p => Math.max(1, p - 1))}
                disabled={ordersCurrentPage === 1}
                aria-label="Previous"
              >
                <span className="sr-only">Previous</span>
                <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
              </button>
              {pageNumbers.map((num, idx) =>
                typeof num === 'number' ? (
                  <button
                    key={`${num}-${idx}`}
                    type="button"
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === ordersCurrentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                    onClick={() => setOrdersCurrentPage(num)}
                    aria-current={num === ordersCurrentPage ? 'page' : undefined}
                  >
                    {num}
                  </button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
                )
              )}
              <button
                type="button"
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${ordersCurrentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setOrdersCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={ordersCurrentPage === totalPages}
                aria-label="Next"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {orderStatusFilter !== 'all' 
              ? `No orders match the "${orderStatusFilter}" filter.` 
              : 'No orders available.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersList;