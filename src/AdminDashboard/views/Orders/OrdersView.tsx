// src/AdminDashboard/views/Orders/OrdersView.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
  DownloadIcon, 
  PrinterIcon, 
  EyeIcon, 
  EditIcon, 
  XIcon, 
  CheckCircleIcon, 
  CreditCardIcon, 
  BoxIcon, 
  TruckIcon 
} from 'lucide-react';
import OrderDetail from './OrderDetail';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { Order } from '../../types';

// Import components for order detail view
import OrderSummaryCard from '../../components/OrderSummaryCard';
import OrderTrackingWidget from '../../components/OrderTrackingWidget';
import OrderItems from './OrderItems';

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

  // Render order detail view
  const renderOrderDetail = () => {
    // =============================
    // Order Detail View
    // =============================
    // Renders detailed view for a selected order
    if (!selectedOrder) return null;
    const order = orders.find(o => o.id === selectedOrder);
    if (!order) return null;
    
    console.log('OrderSummaryCard props:', {
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total
    });

    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order: {order.id}
          </h3>
          <button 
            onClick={() => setSelectedOrder(null)} 
            className="text-gray-400 hover:text-gray-500"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-4 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Timeline */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Order Timeline
              </h4>
              <div className="relative px-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 bg-gray-200"></div>
                </div>
                <div className="relative flex flex-col space-y-8">
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-full h-8 w-8 flex items-center justify-center z-10">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Order Placed
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                  
                  {order.status !== 'Cancelled' && (
                    <>
                      <div className="flex items-center">
                        <div className={`${order.status === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                          <CreditCardIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Payment Confirmed
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.date)}
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
                          {order.status !== 'Pending' && order.status !== 'Processing' ? (
                            <p className="text-xs text-gray-500">
                              {formatDate(order.date)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">Pending</p>
                          )}
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
                          {order.status === 'Shipped' || order.status === 'Delivered' ? (
                            <p className="text-xs text-gray-500">
                              {formatDate(new Date(new Date(order.date).getTime() + 86400000))}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">Pending</p>
                          )}
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
                          {order.status === 'Delivered' ? (
                            <p className="text-xs text-gray-500">
                              {formatDate(new Date(new Date(order.date).getTime() + 172800000))}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">Pending</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {order.status === 'Cancelled' && (
                    <div className="flex items-center">
                      <div className="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center z-10">
                        <XIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Order Cancelled
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.date)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary And Tracking */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                ORDER SUMMARY AND TRACKING
              </h4>
              <div className="flex flex-col space-y-4">
                <OrderSummaryCard
                  orderNumber={order.orderNumber || 'N/A'}
                  status={order.status || 'Unknown'}
                  items={order.items ?? []}
                  subtotal={order.subtotal ?? 0}
                  shipping={order.shipping ?? 0}
                  tax={order.tax ?? 0}
                  total={order.total ?? 0}
                />
                <OrderTrackingWidget
                  status={order.status}
                  estimatedDelivery={order.timeline && order.timeline.length > 0 ? order.timeline[order.timeline.length - 1].date : ''}
                  trackingUrl={order.trackingNumber ? `https://track.aftership.com/${order.trackingNumber}` : undefined}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                  {order.customerEmail || 'customer@example.com'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.customerPhone || '(555) 123-4567'}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Shipping Address
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shippingAddress?.street || '123 Main Street'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.city || 'Portland'}, {order.shippingAddress?.state || 'OR'} {order.shippingAddress?.zipCode || '97201'}
                  </p>
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
                    {order.trackingNumber || `TRK-${order.id.split('-')[1]}`}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(() => {
                        const totalNum = typeof order.total === 'number'
                          ? order.total
                          : parseFloat(String(order.total).replace('$', ''));
                        return `$${totalNum.toFixed(2)}`;
                      })()}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm font-medium text-gray-900">$5.00</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(() => {
                        const totalNum = typeof order.total === 'number'
                          ? order.total
                          : parseFloat(String(order.total).replace('$', ''));
                        return `$${(totalNum * 0.08).toFixed(2)}`;
                      })()}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(() => {
                        const totalNum = typeof order.total === 'number'
                          ? order.total
                          : parseFloat(String(order.total).replace('$', ''));
                        return `$${(totalNum + 5 + totalNum * 0.08).toFixed(2)}`;
                      })()}
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
              <OrderItems orderNumber={selectedOrder} />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => handlePrintInvoice(order)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </button>
            <button 
              onClick={() => handleDownloadPDF(order)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If an order is selected, show the detail view
  if (selectedOrder) {
    return renderOrderDetail();
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
                  <StatusBadge status={order.status} />
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