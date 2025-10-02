
import React from "react";

interface OrderItem {
  id?: number;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
}

interface OrderSummaryCardProps {
  items?: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ items = [], subtotal, shipping, tax, total }) => (
  <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
    <div className="p-5 border-b border-gray-100">
      <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
    </div>
    <ul className="divide-y divide-gray-100">
      {Array.isArray(items) && items.length > 0 ? (
        items.map((item, index) => (
          <li key={item.id ?? index} className="flex items-center py-4">
            <div className="w-15 h-15 min-w-[60px] min-h-[60px] rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name || "Product"} className="w-[60px] h-[60px] object-cover object-center" />
              ) : (
                <div className="w-[60px] h-[60px] bg-gray-100" />
              )}
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-gray-900 truncate max-w-[120px]">{item.name || "Unnamed Item"}</span>
                <span className="ml-2 text-sm text-gray-700 font-normal">x{item.quantity ?? 0} × ${item.price?.toFixed(2) ?? "0.00"}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Line total: <span className="font-medium text-gray-900">${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</span></div>
            </div>
          </li>
        ))
      ) : (
        <li className="py-4 text-sm text-gray-500">No items available</li>
      )}
    </ul>
    <div className="px-5 pt-4 pb-2 space-y-2 border-t border-gray-100">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium text-gray-900">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Tax</span>
        <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-base font-bold border-t border-gray-200 pt-3 mt-2">
        <span className="text-gray-900">Total</span>
        <span className="text-green-700">${total.toFixed(2)}</span>
      </div>
    </div>
  </div>
);

export default OrderSummaryCard;
