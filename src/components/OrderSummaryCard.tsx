import React, { useState, useEffect } from "react";
import { DollarSignIcon, TruckIcon, ReceiptCentIcon, CheckCircleIcon } from 'lucide-react';
import { fetchOrderByNumber, fetchUserOrders, Order, OrderItem } from '../components/orderHelpers';

interface OrderSummaryCardProps {
  orderNumber?: string;
  userId?: string;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ 
  orderNumber, 
  userId, 
  items: propItems, 
  subtotal: propSubtotal, 
  shipping: propShipping, 
  tax: propTax, 
  total: propTotal 
}) => {
  const [orderData, setOrderData] = useState<{
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    orderNumber?: string;
    status?: string;
  }>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch order data from Firebase
  useEffect(() => {
    const fetchOrderData = async () => {
      // If items are passed as props, use them directly
      if (propItems && propSubtotal !== undefined) {
        const calculatedTotal = propTotal || (propSubtotal + (propShipping || 0) + (propTax || 0));
        setOrderData({
          items: propItems,
          subtotal: propSubtotal,
          shipping: propShipping || 0,
          tax: propTax || 0,
          total: calculatedTotal
        });
        return;
      }

      // If no orderNumber or userId, return early
      if (!orderNumber && !userId) {
        setError("No order number or user ID provided");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let order: Order | null = null;
        
        if (orderNumber) {
          // Fetch specific order by orderNumber
          order = await fetchOrderByNumber(orderNumber);
        } else if (userId) {
          // Fetch user's most recent order
          const orders = await fetchUserOrders(userId);
          order = orders.length > 0 ? orders[0] : null;
        }

        if (order) {
          setOrderData({
            items: order.items,
            subtotal: order.subtotal,
            shipping: order.shipping,
            tax: order.tax,
            total: order.total,
            orderNumber: order.orderNumber,
            status: order.status
          });
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order data:", err);
        setError("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderNumber, userId, propItems, propSubtotal, propShipping, propTax, propTotal]);

  // Use props if provided, otherwise use fetched data
  const items = propItems || orderData.items;
  const subtotal = propSubtotal !== undefined ? propSubtotal : orderData.subtotal;
  const shipping = propShipping !== undefined ? propShipping : orderData.shipping;
  const tax = propTax !== undefined ? propTax : orderData.tax;
  const total = propTotal !== undefined ? propTotal : orderData.total;
  const displayOrderNumber = orderNumber || orderData.orderNumber;

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-15 h-15 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !propItems) {
    return (
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
          {orderData.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              orderData.status === 'Processing' 
                ? 'bg-blue-100 text-blue-800'
                : orderData.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {orderData.status}
            </span>
          )}
        </div>
        {displayOrderNumber && <p className="text-sm text-gray-500 mt-1">{displayOrderNumber}</p>}
      </div>
      
      <ul className="divide-y divide-gray-100">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, index) => (
            <li key={item.id ?? index} className="flex items-center py-4 px-5">
              <div className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name || "Product"} 
                    className="w-[60px] h-[60px] object-cover object-center" 
                  />
                ) : (
                  <div className="w-[60px] h-[60px] bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center">
                      {item.category?.[0] || 'Item'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {item.name || "Unnamed Item"}
                  </span>
                  <span className="ml-2 text-sm text-gray-700 font-normal">
                    x{item.quantity ?? 0} × ${item.price?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.category && item.category.length > 0 && (
                    <span className="mr-2">Category: {item.category[0]}</span>
                  )}
                  <span>Line total: <span className="font-medium text-gray-900">
                    ${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                  </span></span>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="py-4 px-5 text-sm text-gray-500">No items available</li>
        )}
      </ul>
      
      <div className="px-5 pt-4 pb-2 space-y-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <DollarSignIcon className="w-4 h-4 mr-1" />Subtotal
          </span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <TruckIcon className="w-4 h-4 mr-1" />Shipping
          </span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <ReceiptCentIcon className="w-4 h-4 mr-1" />Tax
          </span>
          <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between text-base font-bold border-t border-gray-200 pt-3 mt-2">
          <span className="flex items-center gap-1 text-gray-900">
            <CheckCircleIcon className="w-5 h-5 mr-1 text-green-600" />Total
          </span>
          <span className="text-green-700">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;