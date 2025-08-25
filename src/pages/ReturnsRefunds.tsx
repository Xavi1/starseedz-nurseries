import React from 'react';

const ReturnsRefunds: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow">
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Returns & Refunds Policy</h1>
    <p className="mb-4 text-gray-700">
      We want you to be completely satisfied with your purchase. If you are not happy with your order, please review our returns and refunds policy below.
    </p>
    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">Returns</h2>
    <ul className="list-disc pl-6 mb-4 text-gray-700">
      <li>Returns are accepted within 14 days of delivery.</li>
      <li>Items must be unused, in original packaging, and in the same condition as received.</li>
      <li>Plants must be healthy and undamaged.</li>
      <li>Custom or sale items are not eligible for return.</li>
    </ul>
    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">How to Initiate a Return</h2>
    <ol className="list-decimal pl-6 mb-4 text-gray-700">
      <li>Contact our support team at <a href="mailto:support@starseedz.com" className="text-green-700 underline">support@starseedz.com</a> with your order number and reason for return.</li>
      <li>We will provide instructions and a return shipping label if eligible.</li>
      <li>Pack your items securely and send them back using the provided label.</li>
    </ol>
    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">Refunds</h2>
    <ul className="list-disc pl-6 mb-4 text-gray-700">
      <li>Once your return is received and inspected, we will notify you of the approval or rejection of your refund.</li>
      <li>If approved, your refund will be processed to your original payment method within 5-7 business days.</li>
      <li>Shipping costs are non-refundable unless the return is due to our error.</li>
    </ul>
    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">Exchanges</h2>
    <ul className="list-disc pl-6 mb-4 text-gray-700">
      <li>We only replace items if they are defective or damaged upon arrival.</li>
      <li>Contact us within 48 hours of delivery for exchange requests.</li>
    </ul>
    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">Questions?</h2>
    <p className="text-gray-700">If you have any questions about returns or refunds, please contact us at <a href="mailto:support@starseedz.com" className="text-green-700 underline">support@starseedz.com</a>.</p>
  </div>
);

export default ReturnsRefunds;
