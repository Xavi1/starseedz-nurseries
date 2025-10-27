import React, { useState, useEffect } from "react";
import { DollarSignIcon, TruckIcon, ReceiptCentIcon, CheckCircleIcon } from 'lucide-react';
import { fetchOrderByNumber, fetchUserOrders, Order, OrderItem } from '../components/orderHelpers';

interface OrderSummaryCardProps {
  orderNumber?: string;
  status?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string | string[];
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  orderNumber,
  status,
    items = [],
  subtotal = 0,
  shipping = 0,
  tax = 0,
  total = 0,
}) => {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'Processing'
                ? 'bg-blue-100 text-blue-800'
                : status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          )}
        </div>
        {orderNumber && <p className="text-sm text-gray-500 mt-1">{orderNumber}</p>}
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
                      {item.category|| 'Item'}
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
                    <span className="mr-2">Category: {item.category}</span>
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
          <span className="font-medium text-gray-900">${Number(subtotal || 0).toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <TruckIcon className="w-4 h-4 mr-1" />Shipping
          </span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? 'Free' : `$${Number(shipping || 0).toFixed(2)}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <ReceiptCentIcon className="w-4 h-4 mr-1" />Tax
          </span>
          <span className="font-medium text-gray-900">{Number(tax || 0).toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-base font-bold border-t border-gray-200 pt-3 mt-2">
          <span className="flex items-center gap-1 text-gray-900">
            <CheckCircleIcon className="w-5 h-5 mr-1 text-green-600" />Total
          </span>
          <span className="text-green-700">${Number(total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;