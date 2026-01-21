import React from 'react';


// Match AdminDashboard order type
type DashboardOrder = {
  id: string;
  customer: string;
  date: string;
  status: string;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
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
};

export const OrdersList: React.FC<OrdersListProps> = ({
  allOrders,
  filteredOrders,
  orderStatusFilter,
  setOrderStatusFilter,
  selectedOrder,
  setSelectedOrder,
  getStatusBadgeClass,
  onEditOrder
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
        
        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {allOrders.length} orders
          {orderStatusFilter && ` (filtered by ${orderStatusFilter})`}
        </p>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedOrder(order.id)}
                className={`cursor-pointer hover:bg-gray-50 ${selectedOrder === order.id ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customer || 'Unknown Customer'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.date ? new Date(order.date).toLocaleDateString() : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <button
                    type="button"
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Edit Order"
                    onClick={e => {
                      e.stopPropagation();
                      onEditOrder && onEditOrder(order);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {orderStatusFilter 
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