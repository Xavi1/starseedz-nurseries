import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { ChevronRightIcon, HomeIcon, TrashIcon, ShoppingCartIcon, PlusIcon, MinusIcon, ArrowLeftIcon, CreditCardIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react';
// Define cart item type
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}
export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Mock cart data - in a real app this would come from context/state management
  useEffect(() => {
    // Simulate API call to get cart items
    const fetchCartItems = () => {
      setLoading(true);
      // Mock data
      const mockCartItems: CartItem[] = [{
        id: 1,
        name: 'Monstera Deliciosa',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        category: 'Indoor Plants',
        quantity: 1
      }, {
        id: 3,
        name: 'Fiddle Leaf Fig',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1616500163246-0ffbb872f4de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        category: 'Indoor Plants',
        quantity: 2
      }, {
        id: 8,
        name: 'Gardening Tool Set',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1585513553738-84971d9c2f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        category: 'Garden Tools',
        quantity: 1
      }];
      setTimeout(() => {
        setCartItems(mockCartItems);
        setLoading(false);
      }, 500);
    };
    fetchCartItems();
  }, []);
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => item.id === id ? {
      ...item,
      quantity: newQuantity
    } : item));
  };
  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  // Calculate cart totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;
  if (loading) {
    return <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your cart...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <span className="text-green-700 font-medium">Shopping Cart</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-8">
          Shopping Cart
        </h1>
        {cartItems.length === 0 ? <div className="text-center py-16 bg-gray-50 rounded-lg">
            <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Looks like you haven't added any plants to your cart yet.
            </p>
            <div className="mt-6">
              <Link to="/shop" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800">
                Continue Shopping
              </Link>
            </div>
          </div> : <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Cart Items */}
            <div className="lg:col-span-7">
              <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
                {cartItems.map(item => <div key={item.id} className="py-6 sm:flex">
                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-md border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-center object-cover" />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-gray-900">
                            <Link to={`/product/${item.id}`} className="hover:text-green-700">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="ml-4 text-base font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.category}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-500 hover:text-gray-600" disabled={item.quantity <= 1}>
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1 text-gray-900">
                            {item.quantity}
                          </span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-500 hover:text-gray-600">
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center">
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>)}
              </div>
              <div className="mt-6">
                <Link to="/shop" className="flex items-center text-green-700 hover:text-green-800">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </div>
            {/* Order Summary */}
            <div className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="bg-gray-50 rounded-lg px-6 py-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="flow-root">
                  <div className="divide-y divide-gray-200">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base text-gray-600">Subtotal</dt>
                      <dd className="text-base font-medium text-gray-900">
                        ${subtotal.toFixed(2)}
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base text-gray-600">Shipping</dt>
                      <dd className="text-base font-medium text-gray-900">
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base text-gray-600">Tax</dt>
                      <dd className="text-base font-medium text-gray-900">
                        ${tax.toFixed(2)}
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-lg font-medium text-gray-900">
                        Total
                      </dt>
                      <dd className="text-lg font-bold text-green-700">
                        ${total.toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button type="button" className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none">
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </button>
                </div>
                {/* Shipping notice */}
                {subtotal < 50 && <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <TruckIcon className="h-4 w-4 mr-2 text-green-700" />
                    Add ${(50 - subtotal).toFixed(2)} more to qualify for free
                    shipping
                  </div>}
                {/* Trust badges */}
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
              </div>
              {/* Coupon code */}
              <div className="mt-6">
                <div className="flex space-x-4">
                  <input type="text" placeholder="Coupon code" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                  <button type="button" className="flex-shrink-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>}
      </main>
      <Footer />
    </div>;
};