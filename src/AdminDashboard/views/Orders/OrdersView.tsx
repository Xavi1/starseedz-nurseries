// src/AdminDashboard/views/Orders/OrdersView.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
  DownloadIcon, 
  PrinterIcon, 
  EyeIcon, 
  EditIcon
} from 'lucide-react';
import OrderDetail from './OrderDetail';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { Order } from '../../types';

interface OrdersViewProps {
  selectedOrder: string | null;
  setSelectedOrder: (id: string | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ 
  selectedOrder, 
  setSelectedOrder, 
  statusFilter, 
  setStatusFilter 
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState('Bulk Actions');

  // Fetch logic moved here
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter || o.timeline?.some(t => t.status === statusFilter));

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * 10, currentPage * 10);

  // Helper function to format dates
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handlers for actions
  const handlePrintInvoice = (order: Order) => {
    console.log('Print invoice for order:', order.id);
    // Implement print logic
  };

  const handleDownloadPDF = (order: Order) => {
    console.log('Download PDF for order:', order.id);
    // Implement PDF download logic
  };

  // If an order is selected, show the detail view
  if (selectedOrder) {
    const order = orders.find(o => o.id === selectedOrder);
    if (!order) return null;
    
    return (
      <OrderDetail
        order={order}
        setSelectedOrder={setSelectedOrder}
        handlePrintInvoice={handlePrintInvoice}
        handleDownloadPDF={handleDownloadPDF}
      />
    );
  }

  // Otherwise show the orders table
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>Bulk Actions</option>
              <option value="print">Print Invoices</option>
              <option value="export">Export to CSV</option>
              <option value="update">Update Status</option>
            </select>
            
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Apply
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrderIds([...selectedOrderIds, order.id]);
                      } else {
                        setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.orderNumber || order.id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof order.total === 'number' ? `$${order.total.toFixed(2)}` : order.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={order.status || 'Pending'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedOrder(order.id)}
                      className="text-green-700 hover:text-green-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Edit order:', order.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Order"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handlePrintInvoice(order)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Print Invoice"
                    >
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(order)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Download PDF"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <select 
            value={bulkAction} 
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Bulk Actions</option>
            <option value="print">Print Invoices</option>
            <option value="export">Export to CSV</option>
            <option value="update">Update Status</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Apply
          </button>
        </div>
        
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default OrdersView;