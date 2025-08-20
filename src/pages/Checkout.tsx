import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon, ShoppingCartIcon, CreditCardIcon, ShieldCheckIcon, TruckIcon, CheckIcon, ChevronLeftIcon, ChevronDownIcon, AlertCircleIcon } from 'lucide-react';
import { useCart  } from '../context/CartContext';
import { CheckoutSteps } from '../components/CheckoutSteps';
// Define cart item type (same as in Cart.tsx)
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}
// Checkout steps
type CheckoutStep = 'shipping' | 'payment' | 'review';
// Address type (from Account.tsx)
type Address = {
  id: string;
  name: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  administrativeUnit: string;
  phone: string;
  email?: string;
};

export const Checkout = () => {
  const { cart, resetCartState } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    id: '',
    name: '',
    isDefault: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    administrativeUnit: '',
    zipCode: '',
    country: 'Trinidad and Tobago'
  });
  // Saved addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Get current user from Firebase Auth
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user && user.uid) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch addresses from Firestore
  useEffect(() => {
    if (!userId) return;
    setAddressesLoading(true);
    const q = collection(db, 'users', userId, 'addresses');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id })) as Address[];
      setAddresses(data);
      setAddressesLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);
  const [billingInfo, setBillingInfo] = useState({
    id: '',
    name: '',
    isDefault: false,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    administrativeUnit: '',
    zipCode: '',
    country: 'Trinidad and Tobago'
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: ''
  });
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  // Calculate cart totals
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = shippingMethod === 'express' ? 14.99 : subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;
  const validateShippingInfo = () => {
    const errors: Record<string, string> = {};
    if (!shippingInfo.firstName) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName) errors.lastName = 'Last name is required';
    if (!shippingInfo.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      errors.email = 'Email is invalid';
    }
    if (!shippingInfo.phone) errors.phone = 'Phone number is required';
    if (!shippingInfo.address) errors.address = 'Address is required';
    if (!shippingInfo.city) errors.city = 'City is required';
  // removed state/province validation
    if (!shippingInfo.zipCode) errors.zipCode = 'ZIP code is required';
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const validatePaymentInfo = () => {
    const errors: Record<string, string> = {};
    if (!paymentInfo.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Card number must be 16 digits';
    }
    if (!paymentInfo.nameOnCard) errors.nameOnCard = 'Name on card is required';
    if (!paymentInfo.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) {
      errors.expiryDate = 'Format must be MM/YY';
    }
    if (!paymentInfo.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingInfo()) {
      if (useShippingForBilling) {
        setBillingInfo({
          id: shippingInfo.id || '',
          name: shippingInfo.name || '',
          isDefault: shippingInfo.isDefault || false,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          phone: shippingInfo.phone || '',
          address: shippingInfo.address,
          apartment: shippingInfo.apartment,
          city: shippingInfo.city,
          administrativeUnit: shippingInfo.administrativeUnit || '',
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country
        });
      }
      setCurrentStep('payment');
      window.scrollTo(0, 0);
    }
  };
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePaymentInfo()) {
      setCurrentStep('review');
      window.scrollTo(0, 0);
    }
  };
const handlePlaceOrder = async () => {
  if (!auth.currentUser) {
    throw new Error("You must be logged in to place an order.");
  }

  try {
    // Deduct stock for each product in the cart
    for (const item of cart) {
      const productRef = doc(db, "products", String(item.product.id));
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        const newStock = Math.max(currentStock - item.quantity, 0);
        const updateData: { stock: number; inStock?: boolean } = { stock: newStock };
        if (newStock === 0) {
          updateData.inStock = false;
        }
        await updateDoc(productRef, updateData);
      }
    }

    // Generate custom order number
    const customOrderNumber = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    // Create the order document with the custom order number
    const orderRef = await addDoc(collection(db, "orders"), {
      orderNumber: customOrderNumber,
      userId: auth.currentUser.uid,
      date: new Date().toISOString(),
      total: total,
      status: "pending",
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        category: item.product.category
      })),
      shippingAddress: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        address: shippingInfo.address,
        apartment: shippingInfo.apartment || '',
        city: shippingInfo.city,
        state: shippingInfo.administrativeUnit || '',
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country
      },
      billingAddress: useShippingForBilling
        ? {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            address: shippingInfo.address,
            apartment: shippingInfo.apartment || '',
            city: shippingInfo.city,
            state: shippingInfo.administrativeUnit || '',
            zipCode: shippingInfo.zipCode,
            country: shippingInfo.country
          }
        : {
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            address: billingInfo.address,
            apartment: billingInfo.apartment || '',
            city: billingInfo.city,
            state: billingInfo.administrativeUnit || '',
            zipCode: billingInfo.zipCode,
            country: billingInfo.country
          },
      paymentMethod: {
        type: "Credit Card", // You could make this dynamic based on payment type
        last4: paymentInfo.cardNumber.slice(-4)
      },
      shippingMethod: shippingMethod === 'express' 
        ? 'Express Shipping (1-2 business days)' 
        : 'Standard Shipping (3-5 business days)',
      trackingNumber: "", // Will be added when shipped
      timeline: [
        {
          status: "Order Placed",
          date: new Date().toISOString(),
          description: "Your order has been received"
        }
      ],
      subtotal: subtotal,
      shipping: shipping,
      tax: tax
    });

    // Optionally, you can still store the Firestore document ID if needed
    // await updateDoc(orderRef, { id: orderRef.id });

    // Clear the cart after successful order placement
    resetCartState();
    setOrderPlaced(true);
  } catch (error) {
    console.error("Error placing order: ", error);
    alert("There was an issue placing your order. Please try again.");
  }
};
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
    const {
      name,
      value
    } = e.target;
    setter((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };
  if (loading) {
    return <div className="min-h-screen bg-white">
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </main>
        
      </div>;
  }
  if (orderPlaced) {
    return <div className="min-h-screen bg-white">
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-8 w-8 text-green-700" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
              Thank you for your order!
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Order #
              {Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}
            </p>
            <p className="mt-6 text-base text-gray-500">
              We've sent a confirmation email to {shippingInfo.email} with your
              order details.
            </p>
            <div className="mt-8">
              <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        
      </div>;
  }
  return <div className="min-h-screen bg-white">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <Link to="/cart" className="text-gray-500 hover:text-gray-700">
            Shopping Cart
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <span className="text-green-700 font-medium">Checkout</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-8">
          Checkout
        </h1>
        {/* Checkout Steps */}
        <CheckoutSteps currentStep={currentStep} />
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Main content */}
          <div className="lg:col-span-7">
            {/* Shipping Information */}
            {currentStep === 'shipping' && <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Information
                </h2>
                {/* Saved Address Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Use a saved address</label>
                  {addressesLoading ? (
                    <div className="text-gray-500 text-sm">Loading addresses...</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-gray-500 text-sm">No saved addresses found. Add one in your <Link to="/account" className="text-green-700 underline">Account</Link>.</div>
                  ) : (
                    <select
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      value={selectedAddressId}
                      onChange={e => {
                        const id = e.target.value;
                        setSelectedAddressId(id);
                        const addr = addresses.find(a => a.id === id);
                        if (addr) {
                          setShippingInfo(prev => ({
                            ...prev,
                            id: addr.id,
                            name: addr.name,
                            isDefault: addr.isDefault,
                            firstName: addr.firstName,
                            lastName: addr.lastName,
                            phone: addr.phone,
                            address: addr.address,
                            apartment: addr.apartment,
                            city: addr.city,
                            administrativeUnit: addr.administrativeUnit,
                            email: addr.email || prev.email,
                            // Keep state, zipCode, country as is (user may want to edit)
                          }));
                        }
                      }}
                    >
                      <option value="">Select a saved address...</option>
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.name} ({addr.address}, {addr.city}{addr.administrativeUnit ? ', ' + addr.administrativeUnit : ''})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input type="text" id="firstName" name="firstName" value={shippingInfo.firstName} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.firstName && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.firstName}
                        </p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input type="text" id="lastName" name="lastName" value={shippingInfo.lastName} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.lastName && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.lastName}
                        </p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input type="email" id="email" name="email" value={shippingInfo.email} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.email && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.email}
                        </p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.phone && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.phone}
                        </p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input type="text" id="address" name="address" value={shippingInfo.address} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.address ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.address && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.address}
                        </p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input type="text" id="apartment" name="apartment" value={shippingInfo.apartment} onChange={e => handleInputChange(e, setShippingInfo)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input type="text" id="city" name="city" value={shippingInfo.city} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.city ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.city && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.city}
                        </p>}
                    </div>
                    <div>
                      <label htmlFor="administrativeUnit" className="block text-sm font-medium text-gray-700">
                        Administrative Unit
                      </label>
                      <input type="text" id="administrativeUnit" name="administrativeUnit" value={shippingInfo.administrativeUnit} onChange={e => handleInputChange(e, setShippingInfo)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input type="text" id="apartment" name="apartment" value={shippingInfo.apartment} onChange={e => handleInputChange(e, setShippingInfo)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input type="text" id="city" name="city" value={shippingInfo.city} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.city ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.city && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.city}
                        </p>}
                    </div>
                    {/* State/Province removed */}
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP / Postal code
                      </label>
                      <input type="text" id="zipCode" name="zipCode" value={shippingInfo.zipCode} onChange={e => handleInputChange(e, setShippingInfo)} className={`mt-1 block w-full border ${shippingErrors.zipCode ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {shippingErrors.zipCode && <p className="mt-1 text-sm text-red-600">
                          {shippingErrors.zipCode}
                        </p>}
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <select id="country" name="country" value={shippingInfo.country} onChange={e => handleInputChange(e, setShippingInfo)} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                        <option value="United States">Trinidad and Tobago</option>
                        <option value="Canada">Canada</option>
                        <option value="Mexico">Mexico</option>
                      </select>
                    </div>
                  </div>
                  {/* Shipping Method */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Shipping Method
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <input id="standard-shipping" name="shippingMethod" type="radio" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300" />
                        <label htmlFor="standard-shipping" className="ml-3 block text-sm font-medium text-gray-700">
                          Standard Shipping (3-5 business days)*
                        </label>
                        <span className="ml-auto text-sm font-medium text-gray-900">
                          {subtotal > 50 ? 'Free' : '$9.99'}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <input id="express-shipping" name="shippingMethod" type="radio" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300" />
                        <label htmlFor="express-shipping" className="ml-3 block text-sm font-medium text-gray-700">
                          Express Shipping (1-2 business days)*
                        </label>
                        <span className="ml-auto text-sm font-medium text-gray-900">
                          $14.99
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Billing Information */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Billing Information
                    </h3>
                    <div className="mt-4">
                      <div className="flex items-center">
                        <input id="same-as-shipping" name="sameAsShipping" type="checkbox" checked={useShippingForBilling} onChange={() => setUseShippingForBilling(!useShippingForBilling)} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <label htmlFor="same-as-shipping" className="ml-2 text-sm text-gray-700">
                          Same as shipping address
                        </label>
                      </div>
                    </div>
                      {/* Billing Address Form (only shown when "Same as shipping" is unchecked) */}
  {!useShippingForBilling && (
    <div className="mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        Billing Address
      </h4>
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div>
          <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input 
            type="text" 
            id="billingFirstName" 
            name="firstName" 
            value={billingInfo.firstName} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input 
            type="text" 
            id="billingLastName" 
            name="lastName" 
            value={billingInfo.lastName} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input 
            type="text" 
            id="billingAddress" 
            name="address" 
            value={billingInfo.address} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="billingApartment" className="block text-sm font-medium text-gray-700">
            Apartment, suite, etc. (optional)
          </label>
          <input 
            type="text" 
            id="billingApartment" 
            name="apartment" 
            value={billingInfo.apartment} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input 
            type="text" 
            id="billingCity" 
            name="city" 
            value={billingInfo.city} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
          />
        </div>
  {/* State/Province removed */}
        <div>
          <label htmlFor="billingZipCode" className="block text-sm font-medium text-gray-700">
            ZIP / Postal code
          </label>
          <input 
            type="text" 
            id="billingZipCode" 
            name="zipCode" 
            value={billingInfo.zipCode} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <select 
            id="billingCountry" 
            name="country" 
            value={billingInfo.country} 
            onChange={e => handleInputChange(e, setBillingInfo)} 
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
          </select>
        </div>
      </div>
    </div>
  )}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button type="button" onClick={() => navigate('/cart')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                      <ChevronLeftIcon className="mr-1 h-4 w-4" />
                      Return to cart
                    </button>
                    <button type="submit" className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>}
            {/* Payment Information */}
            {currentStep === 'payment' && <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Information
                </h2>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Card number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" value={paymentInfo.cardNumber} onChange={e => {
                      // Format card number with spaces
                      const value = e.target.value.replace(/\s/g, '');
                      if (/^\d*$/.test(value) && value.length <= 16) {
                        const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                        handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            value: formattedValue,
                            name: 'cardNumber'
                          }
                        }, setPaymentInfo);
                      }
                    }} className={`mt-1 block w-full border ${paymentErrors.cardNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      {paymentErrors.cardNumber && <p className="mt-1 text-sm text-red-600">
                          {paymentErrors.cardNumber}
                        </p>}
                    </div>
                    <div>
                      <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">
                        Name on card
                      </label>
                      <input type="text" id="nameOnCard" name="nameOnCard" value={paymentInfo.nameOnCard} onChange={e => handleInputChange(e, setPaymentInfo)} className={`mt-1 block w-full border ${paymentErrors.nameOnCard ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                      {paymentErrors.nameOnCard && <p className="mt-1 text-sm text-red-600">
                          {paymentErrors.nameOnCard}
                        </p>}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                          Expiry date (MM/YY)
                        </label>
                        <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" value={paymentInfo.expiryDate} onChange={e => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        const month = value.slice(0, 2);
                        const year = value.slice(2);
                        const formattedValue = year ? `${month}/${year}` : month;
                        handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            value: formattedValue,
                            name: 'expiryDate'
                          }
                        }, setPaymentInfo);
                      }
                    }} className={`mt-1 block w-full border ${paymentErrors.expiryDate ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                        {paymentErrors.expiryDate && <p className="mt-1 text-sm text-red-600">
                            {paymentErrors.expiryDate}
                          </p>}
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input type="text" id="cvv" name="cvv" placeholder="123" value={paymentInfo.cvv} onChange={e => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            value,
                            name: 'cvv'
                          }
                        }, setPaymentInfo);
                      }
                    }} className={`mt-1 block w-full border ${paymentErrors.cvv ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                        {paymentErrors.cvv && <p className="mt-1 text-sm text-red-600">
                            {paymentErrors.cvv}
                          </p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button type="button" onClick={() => setCurrentStep('shipping')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                      <ChevronLeftIcon className="mr-1 h-4 w-4" />
                      Back to shipping
                    </button>
                    <button type="submit" className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Review Order
                    </button>
                  </div>
                </form>
              </div>}
            {/* Order Review */}
            {currentStep === 'review' && <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Review Your Order
                </h2>
                <div className="border-t border-b border-gray-200 py-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Items in your order
                  </h3>
                  <div className="divide-y divide-gray-200">
                    {cart.map(item => <div key={item.product.id} className="py-4 flex">
                        <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md border border-gray-200">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-center object-cover" />
                        </div>
                        <div className="ml-4 flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </h4>
                            <p className="text-sm font-medium text-gray-900">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.product.category}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>)}
                  </div>
                </div>
                <div className="border-b border-gray-200 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-medium text-gray-900">
                      Shipping Information
                    </h3>
                    <button type="button" onClick={() => setCurrentStep('shipping')} className="text-sm text-green-700 hover:text-green-800">
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </p>
                    <p>{shippingInfo.address}</p>
                    {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
                    <p>
                      {shippingInfo.city}{shippingInfo.administrativeUnit ? ', ' + shippingInfo.administrativeUnit : ''} {shippingInfo.zipCode}
                    </p>
                    <p>{shippingInfo.country}</p>
                    <p className="mt-2">{shippingInfo.email}</p>
                    <p>{shippingInfo.phone}</p>
                    <p className="mt-2 font-medium">
                      {shippingMethod === 'express' ? 'Express Shipping (1-2 business days)' : 'Standard Shipping (3-5 business days)'}
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-200 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-medium text-gray-900">
                      Payment Information
                    </h3>
                    <button type="button" onClick={() => setCurrentStep('payment')} className="text-sm text-green-700 hover:text-green-800">
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                    <p>{paymentInfo.nameOnCard}</p>
                    <p>Expires {paymentInfo.expiryDate}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setCurrentStep('payment')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ChevronLeftIcon className="mr-1 h-4 w-4" />
                    Back to payment
                  </button>
                  <button type="button" onClick={handlePlaceOrder} className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Place Order
                  </button>
                </div>
              </div>}
          </div>
          {/* Order Summary */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg px-6 py-6 sticky top-20">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="flow-root">
                <div className="divide-y divide-gray-200">
                  {cart.map(item => (
          <div key={item.product.id} className="py-4 flex">
            <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md border border-gray-200">
              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-center object-cover" />
            </div>
            <div className="ml-4 flex-1 flex flex-col">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </h4>
                <p className="text-sm font-medium text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>
                    </div>
                    ))}
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
                    <dt className="text-lg font-medium text-gray-900">Total</dt>
                    <dd className="text-lg font-bold text-green-700">
                      ${total.toFixed(2)}
                    </dd>
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
              {/* Trust badges */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-green-700 mr-2" />
                    <span className="text-sm text-gray-500">
                      Secure payment processing
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-green-700 mr-2" />
                    <span className="text-sm text-gray-500">
                      Fast shipping on all orders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};