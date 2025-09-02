// =============================
// Checkout.tsx
// =============================
// Senior Developer Notes:
// This file implements the main checkout flow for the e-commerce app, including shipping, billing, payment, and order review.
// It uses React functional components, Firebase for backend, and context for cart state.
//
// Key Concepts:
// - React hooks for state and lifecycle
// - Context API for cart management
// - Firebase Firestore for user/address/order data
// - Conditional rendering for multi-step UI
// - Form validation and error handling
// - Inline documentation for maintainability
// =============================
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, serverTimestamp, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon, ShoppingCartIcon, CreditCardIcon,BanknoteIcon, ShieldCheckIcon, TruckIcon, CheckIcon, ChevronLeftIcon, ChevronDownIcon, AlertCircleIcon } from 'lucide-react';
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
  // State to store the placed order number for confirmation UI
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  // State for confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);
  // =============================
  // State Management
  // =============================
  // Access cart state and reset function from context
  // 'cart' contains all items in the user's cart
  // 'resetCartState' clears the cart after order placement
  const { cart, resetCartState } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  // currentStep: controls which checkout step is shown (shipping, payment, review)
  // Tracks which step of the checkout process the user is on
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // cartItems: unused, but could be used for local cart management
  // Unused: could be used for local cart management if needed
  const [loading, setLoading] = useState(false);
  // loading: shows spinner during async actions (e.g. order placement)
  // Loading state for async actions (e.g., placing order)
  const [orderPlaced, setOrderPlaced] = useState(false);
  // orderPlaced: true after successful order placement, triggers confirmation UI
  // True when order is successfully placed
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
  // shippingInfo: stores shipping address info for the order
  // Stores shipping address info for the order
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
  // addresses: list of saved addresses for the user (from Firestore)
  // List of saved addresses for the user (from Firestore)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  // selectedAddressId: tracks which saved address is selected
  // Tracks which saved address is selected
  const [addressesLoading, setAddressesLoading] = useState(true);
  // addressesLoading: loading state for address fetch
  // Loading state for address fetch

  // Get current user from Firebase Auth
  const [userId, setUserId] = useState<string | null>(null);
  // userId: stores the current user's Firebase UID
  // =============================
  // Effects: Auth & Address Fetch
  // =============================
  // Stores the current user's Firebase UID
  useEffect(() => {
  // Listen for authentication state changes and set userId
  // When userId changes, fetch user's saved addresses from Firestore
  // Listen for authentication state changes and set userId
  // Fetch user's saved addresses from Firestore when userId changes
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
  // billingInfo: stores billing address info (can be same as shipping)
  // Stores billing address info (can be same as shipping)
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
  // paymentInfo: stores payment details for credit card payments
  // Stores payment details for credit card payments
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: ''
  });
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  // useShippingForBilling: if true, billing info is copied from shipping info
  // If true, billing info is copied from shipping info
  const [shippingMethod, setShippingMethod] = useState('standard');
  // shippingMethod: tracks selected shipping method (standard/express)
  // Tracks selected shipping method (standard/express)
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
  // shippingErrors: validation errors for shipping form
  // Validation errors for shipping form
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  // paymentErrors: validation errors for payment form
  // Validation errors for payment form
  // Tracks selected payment method
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'cash-on-delivery'>('credit-card'); // New Payment Method State
  // paymentMethod: tracks selected payment method (credit-card/cash-on-delivery)
  // =============================
  // Cart Totals Calculation
  // =============================

  // Calculate cart totals
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  // subtotal: sum of all cart item prices
  // Calculate subtotal from cart items
  const shipping = shippingMethod === 'express' ? 14.99 : subtotal > 50 ? 0 : 9.99;
  // shipping: cost logic (free over $50, express $14.99)
  // Shipping cost logic: free over $50, express is $14.99
  const tax = subtotal * 0.07; // 7% tax rate
  // tax: 7% of subtotal
  // Tax calculation (7%)
  const total = subtotal + shipping + tax;
  // total: final order cost
  // =============================
  // Form Validation Functions
  // =============================
  // Total order cost
  const validateShippingInfo = () => {
  // Validates shipping form fields, sets errors, returns true if valid
  // Validate shipping form fields and set errors
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
  // Validates payment form fields, sets errors, returns true if valid
  // If cash-on-delivery, skips validation
  // Validate payment form fields and set errors
  // If cash-on-delivery, skip validation
    const errors: Record<string, string> = {};
     if (paymentMethod === 'cash-on-delivery') {
    return true; // No validation needed for cash on delivery
  }
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
  // Handles shipping form submission
  // If valid, copies info to billing (if needed) and moves to payment step
  // Handles shipping form submission
  // If valid, copies info to billing (if needed) and moves to payment step
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
  // Handles payment form submission
  // If valid, moves to review step
  // Handles payment form submission
  // If valid, moves to review step
    e.preventDefault();
    if (validatePaymentInfo()) {
      setCurrentStep('review');
      window.scrollTo(0, 0);
    }
  };
  // =============================
  // Order Placement Logic
  // =============================
  // Places the order in Firestore, updates product stock, and resets cart
  // Throws error if user is not logged in
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

    // Generate custom order number (7-digit random)
    const customOrderNumber = Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, "0");

    // Firestore doc ID will just be the number (no spaces or "#")
    const orderDocRef = doc(db, "orders", customOrderNumber);

    // Save order to Firestore
    await setDoc(orderDocRef, {
      orderNumber: `Order #${customOrderNumber}`, // display value
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
        apartment: shippingInfo.apartment || "",
        city: shippingInfo.city,
        state: shippingInfo.administrativeUnit || "",
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country
      },
      billingAddress: useShippingForBilling
        ? {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            address: shippingInfo.address,
            apartment: shippingInfo.apartment || "",
            city: shippingInfo.city,
            state: shippingInfo.administrativeUnit || "",
            zipCode: shippingInfo.zipCode,
            country: shippingInfo.country
          }
        : {
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            address: billingInfo.address,
            apartment: billingInfo.apartment || "",
            city: billingInfo.city,
            state: billingInfo.administrativeUnit || "",
            zipCode: billingInfo.zipCode,
            country: billingInfo.country
          },
      paymentMethod: {
        type: paymentMethod === "cash-on-delivery" ? "Cash on Delivery" : "Credit Card",
        last4: paymentMethod === "credit-card" ? paymentInfo.cardNumber.slice(-4) : ""
      },
      shippingMethod:
        shippingMethod === "express"
          ? "Express Shipping (1-2 business days)"
          : "Standard Shipping (3-5 business days)",
      trackingNumber: "",
      timeline: [
        {
          status: "Order Placed",
          date: new Date().toISOString(),
          description: "Your order has been received"
        }
      ],
      subtotal,
      shipping,
      tax
    });

    // Store the order number for confirmation UI
    setPlacedOrderNumber(`Order #${customOrderNumber}`);

    // Clear cart + show success
    resetCartState();
    setOrderPlaced(true);
  } catch (error) {
    console.error("Error placing order: ", error);
    alert("There was an issue placing your order. Please try again.");
  }
};
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
  // Generic input change handler for forms
  // Updates state for shipping, billing, or payment info
  // Generic input change handler for forms
  // Updates state for shipping, billing, or payment info
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
  // =============================
  // Loading Spinner UI
  // =============================
  // Show loading spinner while async actions are in progress
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
  // =============================
  // Order Confirmation UI
  // =============================
  // Show order confirmation after successful placement
  // Main checkout UI
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-8 w-8 text-green-700" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
              Thank you for your order!
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              {placedOrderNumber}
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
      </div>
    );
  }
  return <div className="min-h-screen bg-white">
      
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
  {/* Shows navigation path for user context */}
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
  {/* Visual indicator of current checkout step */}
        <CheckoutSteps currentStep={currentStep} />
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Main content */}
    {/* Contains all step forms and review logic */}
          <div className="lg:col-span-7">
            {/* Shipping Information */}
            {/* Step 1: Shipping address, method, billing info */}
            {currentStep === 'shipping' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
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
                    {/* Removed duplicate apartment and city fields */}
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
            <option value="Trinidad and Tobago">
              Trinidad and Tobago
            </option>
            <option value="Canada">
              Canada
            </option>
            <option value="Mexico">
              Mexico
            </option>
          </select>
        </div>
      </div>
    </div>
  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeftIcon className="mr-1 h-4 w-4" />
                    Return to cart
                  </button>
                  <button
                    type="submit"
                    className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
            )}
            {/* Payment Information */}
            {/* Step 2: Payment method selection and form */}
           {currentStep === 'payment' && (
  <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto">
    <form onSubmit={handlePaymentSubmit}>
      {/* Payment Information Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h1>
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Payment Method</h2>
        <div className="space-y-4">
          <div className="flex items-center opacity-50 cursor-not-allowed">
            <input
              id="credit-card"
              name="payment-method"
              type="radio"
              checked={paymentMethod === 'credit-card'}
              disabled
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="credit-card" className="ml-3 flex items-center text-sm font-medium text-gray-400">
              <CreditCardIcon className="mr-2 h-5 w-5 text-gray-400" />
              Credit Card
              <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">WIP</span>
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="cash-on-delivery"
              name="payment-method"
              type="radio"
              checked={paymentMethod === 'cash-on-delivery'}
              onChange={() => setPaymentMethod('cash-on-delivery')}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor="cash-on-delivery" className="ml-3 flex items-center text-sm font-medium text-gray-700">
              <BanknoteIcon className="mr-2 h-5 w-5 text-green-600" />
              Cash on Delivery
            </label>
          </div>
        </div>
      </div>
      {/* Conditionally render payment form based on method */}
      {paymentMethod === 'credit-card' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <p className="text-sm text-yellow-700">
              Credit card payments are currently under development. Please select another payment method.
            </p>
          </div>
        </div>
      )}
      {paymentMethod === 'cash-on-delivery' && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-sm text-green-700">
            You'll pay with cash when your order is delivered. No payment information is required now.
          </p>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button type="button" onClick={() => setCurrentStep('shipping')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeftIcon className="mr-1 h-4 w-4" />
          Back to shipping
        </button>
        <button
          type="submit"
          disabled={paymentMethod === 'credit-card'}
          className={`bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${paymentMethod === 'credit-card' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Review Order
        </button>
      </div>
    </form>
  </div>
)}
            {/* Order Review */}
            {/* Step 3: Review all order details before placing */}
            {currentStep === 'review' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
  {/* Review step: show summary of items, shipping, and payment info */}
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
                    {paymentMethod === 'credit-card' ? (
                      <>
                        <p>Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                        <p>{paymentInfo.nameOnCard}</p>
                        <p>Expires {paymentInfo.expiryDate}</p>
                      </>
                    ) : (
                      <p className="text-green-700">
                        You'll pay with cash when your order is delivered. No payment information is required now.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setCurrentStep('payment')} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ChevronLeftIcon className="mr-1 h-4 w-4" />
                    Back to payment
                  </button>
                  <button type="button" onClick={() => setShowConfirm(true)} className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Place Order
                  </button>
                </div>
                {/* Confirmation Dialog */}
                {showConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Order Placement</h3>
                      <p className="text-gray-700 mb-6">Are you sure you want to place this order? This action cannot be undone.</p>
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
                        <button onClick={() => { setShowConfirm(false); handlePlaceOrder(); }} className="px-4 py-2 rounded-md bg-green-700 text-white hover:bg-green-800">Confirm</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Order Summary */}
          {/* Sidebar: shows cart totals, coupon, trust badges */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
  {/* Order summary sidebar: shows cart totals, coupon, and trust badges */}
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