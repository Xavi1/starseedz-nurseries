import React from "react";
import {
  XCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
} from "lucide-react";

// Sample data
const order = {
  id: "0009226",
  date: "2025-09-30T15:26:00",
  status: "Delivered",
  items: [
    {
      id: 1,
      name: "Basil Herb Plant",
      price: 30.0,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80",
    },
  ],
  shippingAddress: {
    name: "Xavier Kasmally",
    address: "123 Green Street\nSuite 300\nCouva, Couva–Tabaquite–Talparo 000000\nTrinidad and Tobago",
  },
  shippingMethod: "Standard Shipping (3-5 business days)",
  trackingNumber: "TRKsaywpent",
  billingAddress: {
    name: "Xavier Kasmally",
    address: "123 Green Street\nSuite 300\nCouva, Couva–Tabaquite–Talparo 000000\nTrinidad and Tobago",
  },
  paymentMethod: {
    type: "Cash on Delivery",
    last4: "",
  },
  subtotal: 30.0,
  shipping: 9.99,
  tax: 2.1,
  total: 42.09,
  timeline: [
    {
      status: "Placed",
      date: "2025-09-28T10:00:00",
      description: "Order placed by customer",
    },
    {
      status: "Processed",
      date: "2025-09-29T12:00:00",
      description: "Order processed by admin",
    },
    {
      status: "Shipped",
      date: "2025-09-30T09:00:00",
      description: "Order shipped via courier",
    },
    {
      status: "Delivered",
      date: "2025-09-30T15:26:00",
      description: "Order delivered to customer",
    },
  ],
  estimatedDelivery: "2025-09-30T15:26:00",
};

const ORDER_FLOW = ["Placed", "Processed", "Shipped", "Delivered"];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getStepIndex = (status: string) => {
  return ORDER_FLOW.findIndex((s) => s === status);
};

export default function AdminOrderDetails() {
  const currentStep = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Order: <span className="text-green-700">{order.id}</span>
          </h1>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <XCircleIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        {/* Main Content */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Order Items */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Items
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="p-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-medium text-gray-900">
                            {item.name}
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
                  </li>
                ))}
              </ul>
            </div>
            {/* Shipping Information */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                  <div className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Shipping Method
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{order.shippingMethod}</p>
                    <p className="mt-2">
                      <span className="font-medium">Tracking Number: </span>
                      {order.trackingNumber}
                    </p>
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
                      </span>
                      {order.paymentMethod.last4
                        ? ` ending in ${order.paymentMethod.last4}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Billing Address
                  </h3>
                  <div className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                    <p className="font-medium">{order.billingAddress.name}</p>
                    <p>{order.billingAddress.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Sidebar */}
          <div className="mt-8 lg:mt-0 lg:col-span-5 flex flex-col gap-6">
            {/* Order Timeline (compact) */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Progress
                </h2>
              </div>
              <div className="px-6 py-4">
                <ul className="space-y-6">
                  {order.timeline.map((event, idx) => (
                    <li key={event.date} className="flex items-center">
                      <span
                        className={`flex items-center justify-center h-8 w-8 rounded-full ${
                          idx <= currentStep
                            ? "bg-green-100"
                            : "bg-gray-200"
                        }`}
                      >
                        {idx <= currentStep ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-700" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </span>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {event.status}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(event.date)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {event.description}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Order Summary Card */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                {/* Product Thumbnails */}
                <ul className="mb-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded mr-3 border border-gray-200"
                      />
                      <span className="text-sm text-gray-900 font-medium">
                        {item.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        x {item.quantity} &nbsp; ${item.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Cost Breakdown */}
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900">
                    ${order.shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">
                    ${order.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-bold py-2 mt-2 border-t border-gray-200">
                  <span className="text-gray-900 flex items-center">
                    Total
                    <CheckCircleIcon className="h-5 w-5 text-green-700 ml-2" />
                  </span>
                  <span className="text-green-700">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            {/* Tracking Card */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Tracking
                </h2>
              </div>
              <div className="px-6 py-4">
                {/* Horizontal Progress */}
                <ol className="flex items-center justify-between w-full mb-4">
                  {ORDER_FLOW.map((step, idx) => (
                    <li key={step} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                          idx < currentStep
                            ? "bg-green-600"
                            : idx === currentStep
                            ? "bg-green-100"
                            : "bg-gray-200"
                        }`}
                      >
                        {idx < currentStep ? (
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        ) : idx === currentStep ? (
                          <ClockIcon className="h-5 w-5 text-green-700" />
                        ) : (
                          <span className="block w-3 h-3 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          idx <= currentStep
                            ? "text-green-700"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                      {idx < 3 && (
                        <div
                          className={`w-8 h-0.5 ${
                            idx < currentStep
                              ? "bg-green-600"
                              : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </li>
                  ))}
                </ol>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Estimated Delivery</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(order.estimatedDelivery)}
                    </p>
                  </div>
                  <a
                    href={`https://track.aftership.com/${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-700 text-white text-xs font-semibold rounded-md shadow hover:bg-green-800 transition"
                  >
                    Track Package <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            {/* Navigation */}
            <div className="mt-2">
              <a
                href="/account"
                className="flex items-center text-sm font-medium text-green-700 hover:text-green-800"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Orders
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
