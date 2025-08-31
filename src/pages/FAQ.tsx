import React from 'react';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black-700 mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-black-700 mb-2">What are your business hours?</h2>
            <p className="text-gray-700">Monday to Friday: 9:00 AM - 6:00 PM<br />Saturday: 8:00 AM - 7:00 PM<br />Sunday: 10:00 AM - 5:00 PM</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black-700 mb-2">What are areas for pickup?</h2>
            <p className="text-gray-700">Central Couva. See our Contact page for a map and more details.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black-700 mb-2">Does the prcie includethe trays?</h2>
            <p className="text-gray-700">No the trays are not included with te price.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black-700 mb-2">How long would it take after placing the order?</h2>
            <p className="text-gray-700">It would take 3 - 4 weeks to grow after placing the order.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black-700 mb-2">How do I care for my plants?</h2>
            <p className="text-gray-700">Each product page includes a care guide. For more tips, feel free to contact us or ask in-store.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
