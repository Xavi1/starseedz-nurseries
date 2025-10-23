import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface OrderItem {
  id?: string;
  productName?: string;
  name?: string;
  price: number;
  quantity: number;
}

interface OrderItemsProps {
  orderNumber: string;
}

export default function OrderItems({ orderNumber }: OrderItemsProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!orderNumber) {
          setError('No order number provided');
          setLoading(false);
          return;
        }

        // Query orders collection where orderNumber field matches
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('orderNumber', '==', orderNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Get the first matching order
          const orderDoc = querySnapshot.docs[0];
          const orderData = orderDoc.data();
          const items = orderData?.items || [];
          setOrderItems(items);
        } else {
          setError('Order not found');
        }
        
      } catch (err) {
        console.error('Error fetching order items:', err);
        setError('Failed to load order items');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [orderNumber]);

  // ... rest of your component remains the same
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateItemTotal = (price: number, quantity: number): number => {
    return price * quantity;
  };

  if (loading) {
    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Order Items
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p>Loading order items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Order Items
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Order Items
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p>No order items found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Order Items
      </h4>
      <div className="bg-gray-50 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.productName || item.name || 'Unnamed Product'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {item.quantity || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(item.price || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(calculateItemTotal(item.price || 0, item.quantity || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}