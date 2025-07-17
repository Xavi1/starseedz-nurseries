import { Link } from 'react-router-dom';
import { CreditCardIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react';

export const Checkout = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Checkout</h1>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <input type="text" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" required>
              <option value="card">Credit/Debit Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Place Order
          </button>
        </form>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-green-700 mr-2" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center">
              <TruckIcon className="h-5 w-5 text-green-700 mr-2" />
              <span>Fast delivery</span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link to="/cart" className="text-green-700 hover:text-green-800 underline">Back to Cart</Link>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
