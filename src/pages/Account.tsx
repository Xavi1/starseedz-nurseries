import { Link } from 'react-router-dom';
import { useState } from 'react';
// import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const mockOrders = [
  {
    id: 'ORD-1001',
    date: '2025-07-10',
    total: 49.99,
    status: 'Delivered',
    items: 2,
  },
  {
    id: 'ORD-1002',
    date: '2025-06-28',
    total: 29.99,
    status: 'Shipped',
    items: 1,
  },
];

export default function Account() {
  const [loggedIn, setLoggedIn] = useState(false);
  // const { cart } = useCart();
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>
        {!loggedIn ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
            <p className="mb-6 text-gray-600">Sign in or create an account to view your orders and wishlist.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="px-6 py-2 rounded-md bg-green-700 text-white font-medium hover:bg-green-800">Sign Up</Link>
              <button onClick={() => setLoggedIn(true)} className="px-6 py-2 rounded-md border border-green-700 text-green-700 font-medium hover:bg-green-700 hover:text-white transition">Log In (Demo)</button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Orders Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h2>
              {mockOrders.length === 0 ? (
                <p className="text-gray-500">You have no orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Order #</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Items</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {mockOrders.map(order => (
                        <tr key={order.id}>
                          <td className="px-4 py-2 font-mono text-green-700">{order.id}</td>
                          <td className="px-4 py-2">{order.date}</td>
                          <td className="px-4 py-2">{order.items}</td>
                          <td className="px-4 py-2">${order.total.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            {/* Wishlist Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="text-gray-500">Your wishlist is empty.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {wishlist.map(item => (
                    <li key={item.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border" />
                        <div>
                          <Link to={`/product/${item.id}`} className="font-medium text-gray-900 hover:text-green-700">{item.name}</Link>
                          <div className="text-sm text-gray-500">{Array.isArray(item.category) ? item.category.join(', ') : item.category}</div>
                        </div>
                      </div>
                      <div className="text-green-700 font-semibold">${item.price.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <div className="text-center">
              <button onClick={() => setLoggedIn(false)} className="mt-6 px-6 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100">Log Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
