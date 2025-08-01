import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon, PackageIcon, TruckIcon, CreditCardIcon, CheckCircleIcon, ArrowLeftIcon, PrinterIcon, ShoppingCartIcon } from 'lucide-react';
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
  status: string;
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
// Mock order data
const mockOrders: Record<string, Order> = {
  '2023-1542': {
    id: '2023-1542',
    date: 'June 15, 2023',
    total: 124.97,
    status: 'Delivered',
    items: [{
      id: 1,
      name: 'Monstera Deliciosa',
      quantity: 1,
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }, {
      id: 3,
      name: 'Fiddle Leaf Fig',
      quantity: 1,
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1616500163246-0ffbb872f4de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }, {
      id: 8,
      name: 'Gardening Tool Set',
      quantity: 1,
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1585513553738-84971d9c2f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Green Street',
      apartment: 'Apt 4B',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Green Street',
      apartment: 'Apt 4B',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States'
    },
    paymentMethod: {
      type: 'Visa',
      last4: '4242'
    },
    shippingMethod: 'Standard Shipping (3-5 business days)',
    trackingNumber: 'USP12345678901234',
    timeline: [{
      status: 'Ordered',
      date: 'June 15, 2023, 10:30 AM',
      description: 'Order placed and payment confirmed'
    }, {
      status: 'Processing',
      date: 'June 15, 2023, 2:45 PM',
      description: 'Order is being prepared for shipping'
    }, {
      status: 'Shipped',
      date: 'June 16, 2023, 11:20 AM',
      description: 'Order has been shipped via USPS'
    }, {
      status: 'Delivered',
      date: 'June 18, 2023, 3:15 PM',
      description: 'Package was delivered'
    }],
    subtotal: 124.97,
    shipping: 0,
    tax: 8.75
  },
  '2023-0978': {
    id: '2023-0978',
    date: 'April 23, 2023',
    total: 89.98,
    status: 'Delivered',
    items: [{
      id: 2,
      name: 'Snake Plant',
      quantity: 2,
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1572969057162-d4ef8e6e3c5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }, {
      id: 7,
      name: 'Organic Plant Food',
      quantity: 1,
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Green Street',
      apartment: 'Apt 4B',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Green Street',
      apartment: 'Apt 4B',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States'
    },
    paymentMethod: {
      type: 'Mastercard',
      last4: '8888'
    },
    shippingMethod: 'Express Shipping (1-2 business days)',
    trackingNumber: 'FDX98765432109876',
    timeline: [{
      status: 'Ordered',
      date: 'April 23, 2023, 9:15 AM',
      description: 'Order placed and payment confirmed'
    }, {
      status: 'Processing',
      date: 'April 23, 2023, 11:30 AM',
      description: 'Order is being prepared for shipping'
    }, {
      status: 'Shipped',
      date: 'April 24, 2023, 8:45 AM',
      description: 'Order has been shipped via FedEx'
    }, {
      status: 'Delivered',
      date: 'April 25, 2023, 2:20 PM',
      description: 'Package was delivered'
    }],
    subtotal: 89.97,
    shipping: 14.99,
    tax: 6.3
  }
};
export const OrderDetails = () => {
  const {
    orderId
  } = useParams<{
    orderId: string;
  }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Simulate API call to get order details
    const fetchOrderDetails = () => {
      setLoading(true);
      setTimeout(() => {
        if (orderId && mockOrders[orderId]) {
          setOrder(mockOrders[orderId]);
        }
        setLoading(false);
      }, 500);
    };
    fetchOrderDetails();
  }, [orderId]);
  if (loading) {
    return <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
          </div>
        </main>
      </div>;
  }
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
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800">
              <ShoppingCartIcon className="h-4 w-4 mr-2" />
              Reorder
            </button>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className={`
                h-10 w-10 rounded-full flex items-center justify-center 
                ${order.status === 'Delivered' ? 'bg-green-100' : 'bg-blue-100'}
              `}>
                {order.status === 'Delivered' ? <CheckCircleIcon className="h-6 w-6 text-green-700" /> : <TruckIcon className="h-6 w-6 text-blue-700" />}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {order.status}
                </h2>
                <p className="text-sm text-gray-500">
                  {order.status === 'Delivered' ? `Your order was delivered on ${order.timeline[order.timeline.length - 1].date}` : `Your order is being processed`}
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
                    <p>{order.shippingMethod}</p>
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
          {/* Order Summary */}
          <div className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden sticky top-20">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-base text-gray-600">Subtotal</dt>
                    <dd className="text-base font-medium text-gray-900">
                      ${order.subtotal.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-base text-gray-600">Shipping</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-base text-gray-600">Tax</dt>
                    <dd className="text-base font-medium text-gray-900">
                      ${order.tax.toFixed(2)}
                    </dd>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <dt className="text-lg font-medium text-gray-900">
                      Order Total
                    </dt>
                    <dd className="text-lg font-bold text-green-700">
                      ${order.total.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Need Help?</p>
                  <Link to="/contact" className="text-sm font-medium text-green-700 hover:text-green-800">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-6">
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