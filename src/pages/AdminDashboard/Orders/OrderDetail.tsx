
import { XIcon, CheckCircleIcon, CreditCardIcon, BoxIcon, TruckIcon, PrinterIcon, DownloadIcon } from 'lucide-react';
import { formatDate } from "../../../utils/formatDate";
import OrderSummaryCard from "../../../components/OrderSummaryCard";
import OrderTrackingWidget from "../../../components/OrderTrackingWidget";
import OrderItems from "../../../components/OrderItems";

// Types for props
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
};
type Order = {
  id: string;
  orderNumber: number;
  customer?: string;
  date?: string | Date;
  status?: "Cancelled" | "Pending" | "Processing" | "Shipped" | "Delivered";
  timeline?: { status: string; date?: string; description?: string }[];
  total?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  items?: OrderItem[];
  trackingNumber?: string;
};
type FullOrder = Order & {
  orderNumber?: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
};
interface OrderDetailProps {
  order: Order;
  fullOrderData?: FullOrder | null;
  selectedOrder: string;
  handlePrintInvoice: (order: Order) => void;
  handleDownloadPDF: (order: Order) => void;
  setSelectedOrder: (id: string | null) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, fullOrderData, handlePrintInvoice, handleDownloadPDF, setSelectedOrder }) => {
  if (!order) return null;
  // Defensive: ensure order.date is defined and valid
    let orderDate: Date | null = null;
    if (order.date) {
      if (typeof order.date === 'string' || typeof order.date === 'number') {
        orderDate = new Date(order.date);
      } else if (order.date instanceof Date) {
        orderDate = order.date;
      }
    }
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Order: {order.id}
        </h3>
        <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-500">
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
                      {orderDate ? formatDate(orderDate) : 'N/A'}
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
                        {orderDate ? formatDate(orderDate) : 'N/A'}
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
                        {orderDate ? formatDate(orderDate) : 'N/A'}
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
                        {orderDate ? formatDate(new Date(orderDate.getTime() + 86400000)) : 'N/A'}
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
                        {orderDate ? formatDate(new Date(orderDate.getTime() + 172800000)) : 'N/A'}
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
                      {formatDate(order.date)}
                    </p>
                  </div>
                </div>}
              </div>
            </div>
          </div>

          {/* Order Summary And Tracking */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              ORDER SUMMARY AND TRACKING
            </h4>
            <div className="flex flex-col space-y-4">
              {fullOrderData && (
                <OrderSummaryCard
                    orderNumber={String(fullOrderData?.orderNumber ?? 'N/A')}
                    status={String(fullOrderData?.status ?? 'Unknown')}
                  items={fullOrderData.items ?? []}
                  subtotal={fullOrderData.subtotal ?? 0}
                  shipping={fullOrderData.shipping ?? 0}
                  tax={fullOrderData.tax ?? 0}
                  total={fullOrderData.total ?? 0}
                />
              )}
              <OrderTrackingWidget
                status={order.status || 'Pending'}
                estimatedDelivery={order.timeline && order.timeline.length > 0 ? order.timeline[order.timeline.length - 1].date || '' : ''}
                trackingUrl={order.trackingNumber ? `https://track.aftership.com/${order.trackingNumber}` : undefined}
              />
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
                    {
                      (() => {
                        const totalNum = typeof order.total === 'number'
                          ? order.total
                          : parseFloat(String(order.total).replace('$', ''));
                        return `$${totalNum.toFixed(2)}`;
                      })()
                    }
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-sm font-medium text-gray-900">$5.00</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="text-sm font-medium text-gray-900">
                    {
                      (() => {
                        const totalNum = typeof order.total === 'number'
                          ? order.total
                          : parseFloat(String(order.total).replace('$', ''));
                        return `$${(totalNum * 0.08).toFixed(2)}`;
                      })()
                    }
                  </p>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Total</p>
                  <p className="text-sm font-medium text-gray-900">
                    {
                      (() => {
                        const totalNum = typeof order.total === 'number'
                          ? order.total
                          : parseFloat(String(order.total).replace('$', ''));
                        return `$${(totalNum + 5 + totalNum * 0.08).toFixed(2)}`;
                      })()
                    }
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
            <OrderItems orderNumber={String(fullOrderData?.orderNumber || order.orderNumber || '')} />
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
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
