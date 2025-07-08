import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { cart, cartCount, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
          <Link to="/shop" className="inline-block px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 mb-6">
            {cart.map(item => (
              <li key={item.product.id} className="flex items-center py-4">
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded mr-4" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.product.name}</h2>
                  <p className="text-gray-500">${item.product.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="ml-4 text-red-600 hover:underline">Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold">Total: ${total.toFixed(2)}</span>
            <button onClick={clearCart} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700">Clear Cart</button>
          </div>
          <button className="w-full px-6 py-3 bg-green-700 text-white rounded font-semibold hover:bg-green-800">Checkout</button>
        </>
      )}
    </div>
  );
};
