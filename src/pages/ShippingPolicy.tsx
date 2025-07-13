export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">Shipping Policy</h1>
        <div className="space-y-6 text-gray-700">
          <p>
            We strive to deliver your plants and products in the best condition and as quickly as possible. Please review our shipping policy below.
          </p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Delivery Area</h2>
          <p>We currently deliver to Central Couva and surrounding areas. For other locations, please contact us before placing your order.</p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Processing Time</h2>
          <p>Orders are processed within 1-2 business days. Custom or pre-order items (such as seedlings) may require 3-4 weeks for preparation.</p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Delivery Fees</h2>
          <p>Delivery is free for orders over $50. A small fee may apply for smaller orders or locations outside our standard area.</p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Order Tracking</h2>
          <p>We will contact you to arrange a convenient delivery time. If you have questions about your order, please contact us.</p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Damaged Items</h2>
          <p>If your order arrives damaged, please notify us within 24 hours with photos so we can resolve the issue promptly.</p>
        </div>
      </div>
    </div>
  );
}
