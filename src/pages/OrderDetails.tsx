import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useParams } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon, PackageIcon, TruckIcon, CreditCardIcon, CheckCircleIcon, ArrowLeftIcon, PrinterIcon, ShoppingCartIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import OrderSummaryCard from '../components/OrderSummaryCard';
import OrderTrackingWidget from '../components/OrderTrackingWidget';

// Define types
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
  };
  shippingMethod: string;
  trackingNumber?: string;
  timeline: {
    status: string;
    date: string;
    description: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
}

export const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Status flow for orders
  const ORDER_FLOW: Order["status"][] = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  // Helper to generate tracking number
  const generateTrackingNumber = () => 'TRK' + Math.random().toString(36).substring(2, 10);

  // Update order status in Firestore and local state
const updateOrderStatus = async (
  newStatus: Order["status"],
  description: string
) => {
  if (!orderId || !order) return;

  try {
    const newTimelineEvent = {
      status: newStatus,
      date: new Date().toISOString(),
      description,
    };

    const updateData: any = {
      status: newStatus,
      timeline: [...(order.timeline || []), newTimelineEvent],
    };

    if (newStatus === "Shipped") {
      updateData.trackingNumber = generateTrackingNumber();
    }

    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, updateData);

    // ❌ Remove the manual setOrder update
    // Firestore listener will update local state automatically
  } catch (error) {
    console.error("Error updating status:", error);
  }
};



  // Move to next status in the flow
  const moveToNextStatus = async () => {
    console.log("Advance Order button clicked ✅");
    console.log("Current order:", order);

    if (!order) {
      console.warn("No order loaded yet.");
      return;
    }

    const currentIndex = ORDER_FLOW.findIndex(
      (s) => s.toLowerCase() === order.status.toLowerCase()
    );

    console.log("Current status:", order.status, "Index:", currentIndex);

    if (currentIndex === -1) {
      console.warn("Order status not in ORDER_FLOW.");
      return;
    }
    if (currentIndex === ORDER_FLOW.length - 1) {
      console.warn("Order already at final state:", order.status);
      return;
    }

    const nextStatus = ORDER_FLOW[currentIndex + 1];
    console.log("Advancing to:", nextStatus);

    await updateOrderStatus(nextStatus, `Order moved to ${nextStatus}`);
  };

  const cancelOrder = async () => {
    console.log("Cancel Order button clicked ❌");

    if (!orderId || !order) return;

    try {
      const newTimelineEvent = {
        status: "Cancelled",
        date: new Date().toISOString(),
        description: "Order was cancelled by user",
      };

      const orderRef = doc(db, "orders", orderId);

      await updateDoc(orderRef, {
        status: "Cancelled",
        timeline: [...(order.timeline || []), newTimelineEvent],
      });

      // Let Firestore snapshot update local state
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };


  useEffect(() => {
    if (!orderId) return;
    setLoading(true);

    const orderRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(orderRef, (orderSnap) => {
      if (orderSnap.exists()) {
        const data = orderSnap.data();
        setOrder({
          ...data,
          id: orderId,
          date: data.timeline?.[0]?.date || new Date().toISOString(),
          status: (data.status as Order["status"]) || "Pending",
          trackingNumber: data.trackingNumber || "",
          timeline: data.timeline || [],
        } as Order);
      } else {
        setOrder(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);
  if (!order) {
    return <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Order not found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We couldn't find the order you're looking for.
            </p>
            <div className="mt-6">
              <Link to="/account" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800">
                Return to Account
              </Link>
            </div>
          </div>
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* Cancel Confirmation Dialog */}
      <dialog open={showCancelConfirm} className="modal" style={{padding: '2rem', borderRadius: '0.5rem', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <h2 className="text-lg font-bold mb-2">Cancel this order?</h2>
        <p className="mb-4">This action cannot be undone.</p>
        <div className="flex space-x-4">
          <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Keep Order</button>
          <button onClick={() => { setShowCancelConfirm(false); cancelOrder(); }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Cancel Order</button>
        </div>
      </dialog>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <Link to="/account" className="text-gray-500 hover:text-gray-700">
            My Account
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <Link to="/account" className="text-gray-500 hover:text-gray-700" onClick={() => {
          // This would ideally use state management to set the active tab
          // For now, we'll just navigate to the account page
          localStorage.setItem('accountActiveTab', 'orders');
        }}>
            Orders
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <span className="text-green-700 font-medium">Order #{order.id}</span>
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Order #{order.id}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Placed on {order.date}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              className={`inline-flex items-center px-3 py-2 border ${order.status === 'Cancelled' ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} shadow-sm text-sm font-medium rounded-md`}
              disabled={order.status === 'Cancelled'}
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button 
              className={`inline-flex items-center px-3 py-2 border ${order.status === 'Cancelled' ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-transparent text-white bg-green-700 hover:bg-green-800'} shadow-sm text-sm font-medium rounded-md`}
              disabled={order.status === 'Cancelled'}
            >
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              Reorder
            </button>
            <button
              onClick={moveToNextStatus}
              className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
            >
              Advance Order
            </button>
            {order?.status !== "Shipped" && order?.status !== "Cancelled" && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className={`
                h-10 w-10 rounded-full flex items-center justify-center 
                ${order.status.toLowerCase() === 'delivered' ? 'bg-green-100' : 
                  order.status.toLowerCase() === 'cancelled' ? 'bg-red-100' : 
                  order.status.toLowerCase() === 'shipped' ? 'bg-blue-100' : 'bg-yellow-100'}
              `}>
                {order.status.toLowerCase() === 'delivered' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-700" />
                ) : order.status.toLowerCase() === 'cancelled' ? (
                  <XCircleIcon className="h-6 w-6 text-red-700" />
                ) : order.status.toLowerCase() === 'shipped' ? (
                  <TruckIcon className="h-6 w-6 text-blue-700" />
                ) : (
                  <ClockIcon className="h-6 w-6 text-yellow-700" />
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {order.status}
                </h2>
                <p className="text-sm text-gray-500">
                  {order.status === 'Delivered' 
                    ? `Delivered on ${order.timeline[order.timeline.length - 1].date}`
                    : order.status === 'Cancelled'
                    ? `Cancelled on ${order.timeline[order.timeline.length - 1].date}`
                    : 'Your order is being processed'}
                </p>
              </div>
            </div>
          </div>
          {/* Order Timeline */}
          <div className="px-6 py-4">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Order Progress
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {order.timeline.map((event, eventIdx) => <li key={event.date}>
                    <div className="relative pb-8">
                      {eventIdx !== order.timeline.length - 1 ? <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                      <div className="relative flex items-start space-x-3">
                        <div>
                          <div className="relative px-1">
                            <div className="h-8 w-8 bg-green-100 rounded-full ring-8 ring-white flex items-center justify-center">
                              <CheckCircleIcon className="h-5 w-5 text-green-700" />
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 py-1.5">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {event.status}
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <time dateTime={event.date}>{event.date}</time>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Order Items */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Items
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {order.items.map(item => <li key={item.id} className="p-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-center object-cover" />}
                    </div>
                    <div className="ml-6 flex-1 flex flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-medium text-gray-900">
                            <Link to={`/product/${item.id}`} className="hover:text-green-700">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          <p className="text-base font-medium text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button className="text-sm text-green-700 hover:text-green-800">
                            Add to Cart
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>)}
              </ul>
            </div>
            {/* Shipping Information */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Shipping Information
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Shipping Address
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="font-medium">
                      {order.shippingAddress.firstName}{' '}
                      {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                    <p>
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Shipping Method
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="whitespace-pre-line">{order.shippingMethod}</p>
                    {order.trackingNumber && <p className="mt-2">
                        <span className="font-medium">Tracking Number: </span>
                        {order.trackingNumber}
                      </p>}
                  </div>
                </div>
              </div>
            </div>
            {/* Payment Information */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Payment Information
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Payment Method
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      <span className="font-medium">
                        {order.paymentMethod.type}
                      </span>{' '}
                      ending in {order.paymentMethod.last4}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Billing Address
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="font-medium">
                      {order.billingAddress.firstName}{' '}
                      {order.billingAddress.lastName}
                    </p>
                    <p>{order.billingAddress.address}</p>
                    {order.billingAddress.apartment && <p>{order.billingAddress.apartment}</p>}
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state}{' '}
                      {order.billingAddress.zipCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Order Summary & Tracking Card */}
          <div className="mt-8 lg:mt-0 lg:col-span-5 flex flex-col gap-6">
            <OrderSummaryCard
              items={order.items}
              subtotal={order.subtotal}
              shipping={order.shipping}
              tax={order.tax}
              total={order.total}
            />
            <OrderTrackingWidget
              status={order.status}
              estimatedDelivery={order.timeline && order.timeline.length > 0 ? order.timeline[order.timeline.length - 1].date : ''}
              trackingUrl={order.trackingNumber ? `https://track.aftership.com/${order.trackingNumber}` : undefined}
            />
            <div className="mt-2">
              <Link to="/account" className="flex items-center text-sm font-medium text-green-700 hover:text-green-800" onClick={() => {
                localStorage.setItem('accountActiveTab', 'orders');
              }}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>;
};