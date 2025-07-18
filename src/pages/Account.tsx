import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, PackageIcon, CreditCardIcon, HomeIcon, BellIcon, LogOutIcon, ChevronRightIcon, PencilIcon, PlusIcon, EyeIcon, MapPinIcon, ShieldIcon, ChevronDownIcon } from 'lucide-react';
// Mock order data
const mockOrders = [{
  id: '2023-1542',
  date: 'June 15, 2023',
  total: 124.97,
  status: 'Delivered',
  items: [{
    id: 1,
    name: 'Monstera Deliciosa',
    quantity: 1,
    price: 39.99
  }, {
    id: 3,
    name: 'Fiddle Leaf Fig',
    quantity: 1,
    price: 49.99
  }, {
    id: 8,
    name: 'Gardening Tool Set',
    quantity: 1,
    price: 34.99
  }]
}, {
  id: '2023-0978',
  date: 'April 23, 2023',
  total: 89.98,
  status: 'Delivered',
  items: [{
    id: 2,
    name: 'Snake Plant',
    quantity: 2,
    price: 29.99
  }, {
    id: 7,
    name: 'Organic Plant Food',
    quantity: 1,
    price: 29.99
  }]
}];
// Mock address data
const mockAddresses = [{
  id: 1,
  name: 'Home',
  isDefault: true,
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Green Street',
  apartment: 'Apt 4B',
  city: 'Portland',
  state: 'OR',
  zipCode: '97201',
  country: 'United States',
  phone: '(555) 123-4567'
}, {
  id: 2,
  name: 'Work',
  isDefault: false,
  firstName: 'John',
  lastName: 'Doe',
  address: '456 Office Avenue',
  apartment: 'Suite 300',
  city: 'Portland',
  state: 'OR',
  zipCode: '97204',
  country: 'United States',
  phone: '(555) 987-6543'
}];
// Mock payment methods
const mockPaymentMethods = [{
  id: 1,
  isDefault: true,
  type: 'Visa',
  last4: '4242',
  expiry: '05/25',
  name: 'John Doe'
}, {
  id: 2,
  isDefault: false,
  type: 'Mastercard',
  last4: '8888',
  expiry: '12/24',
  name: 'John Doe'
}];
type AccountTab = 'profile' | 'orders' | 'addresses' | 'payment' | 'preferences';
export const Account = () => {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [editMode, setEditMode] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  // Mock user data
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    birthdate: '1985-06-15'
  });
  // Mock user preferences
  const [preferences, setPreferences] = useState({
    emailMarketing: true,
    orderUpdates: true,
    productRecommendations: false,
    specialOffers: true
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    if (type === 'checkbox') {
      setPreferences({
        ...preferences,
        [name]: checked
      });
    } else {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the updated profile data to a backend API
    setEditMode(false);
    // Show success message (in a real app)
  };
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  return <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
          <span className="text-green-700 font-medium">My Account</span>
        </nav>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="p-6 bg-green-700 text-white">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium">
                      {userData.firstName} {userData.lastName}
                    </h2>
                    <p className="text-sm opacity-80">{userData.email}</p>
                  </div>
                </div>
              </div>
              <nav className="divide-y divide-gray-200">
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-6 py-4 text-sm font-medium ${activeTab === 'profile' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <UserIcon className="h-5 w-5 mr-3" />
                  My Profile
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center px-6 py-4 text-sm font-medium ${activeTab === 'orders' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <PackageIcon className="h-5 w-5 mr-3" />
                  Order History
                </button>
                <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center px-6 py-4 text-sm font-medium ${activeTab === 'addresses' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <MapPinIcon className="h-5 w-5 mr-3" />
                  Addresses
                </button>
                <button onClick={() => setActiveTab('payment')} className={`w-full flex items-center px-6 py-4 text-sm font-medium ${activeTab === 'payment' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <CreditCardIcon className="h-5 w-5 mr-3" />
                  Payment Methods
                </button>
                <button onClick={() => setActiveTab('preferences')} className={`w-full flex items-center px-6 py-4 text-sm font-medium ${activeTab === 'preferences' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <BellIcon className="h-5 w-5 mr-3" />
                  Preferences
                </button>
              </nav>
              <div className="px-6 py-4 border-t border-gray-200">
                <button className="flex items-center text-sm font-medium text-red-600 hover:text-red-700">
                  <LogOutIcon className="h-5 w-5 mr-3" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Profile Tab */}
              {activeTab === 'profile' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      My Profile
                    </h2>
                    {!editMode && <button onClick={() => setEditMode(true)} className="flex items-center text-sm font-medium text-green-700 hover:text-green-800">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit Profile
                      </button>}
                  </div>
                  {editMode ? <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First name
                          </label>
                          <input type="text" id="firstName" name="firstName" value={userData.firstName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last name
                          </label>
                          <input type="text" id="lastName" name="lastName" value={userData.lastName} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input type="email" id="email" name="email" value={userData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </label>
                          <input type="tel" id="phone" name="phone" value={userData.phone} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                        <div>
                          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                            Birthdate
                          </label>
                          <input type="date" id="birthdate" name="birthdate" value={userData.birthdate} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-end space-x-3">
                        <button type="button" onClick={() => setEditMode(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Cancel
                        </button>
                        <button type="submit" className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800">
                          Save Changes
                        </button>
                      </div>
                    </form> : <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                      <dl className="divide-y divide-gray-200">
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Full name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userData.firstName} {userData.lastName}
                          </dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Email address
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userData.email}
                          </dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Phone number
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userData.phone}
                          </dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Birthdate
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {new Date(userData.birthdate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                          </dd>
                        </div>
                      </dl>
                    </div>}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Security
                    </h3>
                    <div className="mt-4 space-y-4">
                      <button className="text-sm text-green-700 font-medium hover:text-green-800">
                        Change Password
                      </button>
                      <div>
                        <p className="text-sm text-gray-500">
                          Last login: June 15, 2023 at 10:34 AM from Portland,
                          OR
                        </p>
                      </div>
                    </div>
                  </div>
                </div>}
              {/* Orders Tab */}
              {activeTab === 'orders' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      Order History
                    </h2>
                  </div>
                  {mockOrders.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-md">
                      <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">
                        No orders yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Your order history will appear here once you make a
                        purchase.
                      </p>
                      <div className="mt-6">
                        <Link to="/shop" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800">
                          Start Shopping
                        </Link>
                      </div>
                    </div> : <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {mockOrders.map(order => <li key={order.id}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-green-700 truncate">
                                    Order #{order.id}
                                  </p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {order.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    ${order.total.toFixed(2)}
                                  </p>
                                  <button onClick={() => toggleOrderDetails(order.id)} className="ml-4 flex items-center text-sm text-gray-500 hover:text-gray-700">
                                    {expandedOrder === order.id ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    Placed on {order.date}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <button className="flex items-center text-green-700 hover:text-green-800">
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View Order Details
                                  </button>
                                </div>
                              </div>
                            </div>
                            {/* Expanded Order Details */}
                            {expandedOrder === order.id && <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 sm:px-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                  Order Items
                                </h4>
                                <ul className="divide-y divide-gray-200">
                                  {order.items.map(item => <li key={item.id} className="py-3 flex justify-between">
                                      <div className="flex items-center">
                                        <p className="text-sm font-medium text-gray-900">
                                          {item.name}
                                        </p>
                                        <p className="ml-2 text-sm text-gray-500">
                                          x{item.quantity}
                                        </p>
                                      </div>
                                      <p className="text-sm font-medium text-gray-900">
                                        ${item.price.toFixed(2)}
                                      </p>
                                    </li>)}
                                </ul>
                              </div>}
                          </li>)}
                      </ul>
                    </div>}
                </div>}
              {/* Addresses Tab */}
              {activeTab === 'addresses' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      My Addresses
                    </h2>
                    <button className="flex items-center text-sm font-medium text-green-700 hover:text-green-800">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add New Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {mockAddresses.map(address => <div key={address.id} className="border border-gray-200 rounded-md p-4 relative">
                        {address.isDefault && <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Default
                          </span>}
                        <h3 className="font-medium text-gray-900">
                          {address.name}
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <p>
                            {address.firstName} {address.lastName}
                          </p>
                          <p>{address.address}</p>
                          {address.apartment && <p>{address.apartment}</p>}
                          <p>
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p>{address.country}</p>
                          <p className="pt-1">{address.phone}</p>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <button className="text-sm text-green-700 font-medium hover:text-green-800">
                            Edit
                          </button>
                          {!address.isDefault && <button className="text-sm text-gray-700 font-medium hover:text-gray-800">
                              Set as default
                            </button>}
                          <button className="text-sm text-red-600 font-medium hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      </div>)}
                  </div>
                </div>}
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      Payment Methods
                    </h2>
                    <button className="flex items-center text-sm font-medium text-green-700 hover:text-green-800">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add New Payment Method
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {mockPaymentMethods.map(payment => <div key={payment.id} className="border border-gray-200 rounded-md p-4 relative">
                        {payment.isDefault && <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Default
                          </span>}
                        <div className="flex items-center">
                          <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center">
                            <span className="font-medium text-gray-900">
                              {payment.type}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-900">
                              {payment.type} ending in {payment.last4}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Expires {payment.expiry}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <button className="text-sm text-green-700 font-medium hover:text-green-800">
                            Edit
                          </button>
                          {!payment.isDefault && <button className="text-sm text-gray-700 font-medium hover:text-gray-800">
                              Set as default
                            </button>}
                          <button className="text-sm text-red-600 font-medium hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      </div>)}
                  </div>
                </div>}
              {/* Preferences Tab */}
              {activeTab === 'preferences' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      Notification Preferences
                    </h2>
                  </div>
                  <form>
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Email Notifications
                          </h3>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input id="orderUpdates" name="orderUpdates" type="checkbox" checked={preferences.orderUpdates} onChange={handleInputChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="orderUpdates" className="font-medium text-gray-700">
                                  Order Updates
                                </label>
                                <p className="text-gray-500">
                                  Receive notifications about your order status
                                  and shipping updates.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input id="productRecommendations" name="productRecommendations" type="checkbox" checked={preferences.productRecommendations} onChange={handleInputChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="productRecommendations" className="font-medium text-gray-700">
                                  Product Recommendations
                                </label>
                                <p className="text-gray-500">
                                  Get personalized product recommendations based
                                  on your purchases.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input id="specialOffers" name="specialOffers" type="checkbox" checked={preferences.specialOffers} onChange={handleInputChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="specialOffers" className="font-medium text-gray-700">
                                  Special Offers
                                </label>
                                <p className="text-gray-500">
                                  Receive special offers, discounts, and
                                  seasonal promotions.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Privacy Settings
                          </h3>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input id="emailMarketing" name="emailMarketing" type="checkbox" checked={preferences.emailMarketing} onChange={handleInputChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="emailMarketing" className="font-medium text-gray-700">
                                  Email Marketing
                                </label>
                                <p className="text-gray-500">
                                  Allow us to send you marketing emails about
                                  our products and services.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button type="submit" className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800">
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>}
            </div>
          </div>
        </div>
      </main>
    </div>;
};