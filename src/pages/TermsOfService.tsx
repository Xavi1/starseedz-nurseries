export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">Terms of Service</h1>
        <div className="space-y-6 text-gray-700">
          <p>
            By using the Starseedz Nurseries website and services, you agree to the following terms and conditions. Please read them carefully.
          </p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Orders & Payment</h2>
          <ul className="list-disc pl-6">
            <li>All orders are subject to availability and confirmation.</li>
            <li>Payment must be made in full before delivery or pickup.</li>
            <li>Prices are subject to change without notice.</li>
          </ul>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Returns & Refunds</h2>
          <ul className="list-disc pl-6">
            <li>Returns are accepted within 7 days of delivery for damaged or incorrect items only.</li>
            <li>Contact us promptly to arrange a return or exchange.</li>
          </ul>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Privacy</h2>
          <p>Your privacy is important to us. Please see our Privacy Policy for details on how your information is handled.</p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Limitation of Liability</h2>
          <p>Starseedz Nurseries is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Contact</h2>
          <p>If you have any questions about these terms, please contact us via the Contact page.</p>
        </div>
      </div>
    </div>
  );
}
