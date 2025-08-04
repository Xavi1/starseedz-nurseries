// Simple modal component
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        {children}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, PackageIcon, CreditCardIcon, HomeIcon, BellIcon, LogOutIcon, ChevronRightIcon, PencilIcon, PlusIcon, EyeIcon, MapPinIcon, ShieldIcon, ChevronDownIcon, HeartIcon } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { updateUserProfile, getUserById } from '../firebaseHelpers';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

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

type AccountTab = 'profile' | 'orders' | 'addresses' | 'payment' | 'preferences' | 'wishlist';

type PaymentMethod = {
  id: number;
  isDefault: boolean;
  type: string;
  last4: string;
  expiry: string;
  name: string;
};
export const Account = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment form validation state
const [paymentErrors, setPaymentErrors] = useState({
  cardNumber: '',
  name: '',
  expiry: '',
  cvc: '',
  general: ''
});

// Card number validation
const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and non-digits
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Check length based on card type
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }
  
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit = digit % 10 + 1;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Get card type from number
const getCardType = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.match(/^4/)) return 'Visa';
  if (cleanNumber.match(/^5[1-5]/) || cleanNumber.match(/^2[2-7]/)) return 'Mastercard';
  if (cleanNumber.match(/^3[47]/)) return 'American Express';
  if (cleanNumber.match(/^6(?:011|5)/)) return 'Discover';
  
  return 'Visa'; // Default
};

// Format card number for display
const formatCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  const cardType = getCardType(cleanValue);
  
  if (cardType === 'American Express') {
    return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  } else {
    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
};

// Format expiry date
const formatExpiryDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length >= 2) {
    return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
  }
  return cleanValue;
};

// Validate expiry date
const validateExpiryDate = (expiry: string): boolean => {
  const cleanExpiry = expiry.replace(/\D/g, '');
  if (cleanExpiry.length !== 4) return false;
  
  const month = parseInt(cleanExpiry.substring(0, 2), 10);
  const year = parseInt('20' + cleanExpiry.substring(2, 4), 10);
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

// Validate CVC
const validateCVC = (cvc: string, cardType: string): boolean => {
  const cleanCVC = cvc.replace(/\D/g, '');
  if (cardType === 'American Express') {
    return cleanCVC.length === 4;
  } else {
    return cleanCVC.length === 3;
  }
};

// Validate name
const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
};

// Enhanced payment form change handler
const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  let formattedValue = value;
  
  // Format inputs as user types
  if (name === 'cardNumber') {
    formattedValue = formatCardNumber(value);
    // Auto-detect card type
    const detectedType = getCardType(value);
    setPaymentForm(prev => ({ ...prev, type: detectedType }));
  } else if (name === 'expiry') {
    formattedValue = formatExpiryDate(value);
  } else if (name === 'cvc') {
    formattedValue = value.replace(/\D/g, '').substring(0, 4);
  }
  
  if (type === 'checkbox') {
    const target = e.target as HTMLInputElement;
    setPaymentForm(prev => ({ ...prev, [name]: target.checked }));
  } else {
    setPaymentForm(prev => ({ ...prev, [name]: formattedValue }));
  }
  
  // Clear specific field error when user starts typing
  if (paymentErrors[name as keyof typeof paymentErrors]) {
    setPaymentErrors(prev => ({ ...prev, [name]: '', general: '' }));
  }
};

// Enhanced payment form validation
const validatePaymentForm = (): boolean => {
  const errors = {
    cardNumber: '',
    name: '',
    expiry: '',
    cvc: '',
    general: ''
  };
  
  let isValid = true;
  
  // Validate card number
  if (!paymentForm.cardNumber.trim()) {
    errors.cardNumber = 'Card number is required';
    isValid = false;
  } else if (!validateCardNumber(paymentForm.cardNumber)) {
    errors.cardNumber = 'Please enter a valid card number';
    isValid = false;
  }
  
  // Validate name
  if (!paymentForm.name.trim()) {
    errors.name = 'Cardholder name is required';
    isValid = false;
  } else if (!validateName(paymentForm.name)) {
    errors.name = 'Please enter a valid name (letters and spaces only)';
    isValid = false;
  }
  
  // Validate expiry
  if (!paymentForm.expiry.trim()) {
    errors.expiry = 'Expiry date is required';
    isValid = false;
  } else if (!validateExpiryDate(paymentForm.expiry)) {
    errors.expiry = 'Please enter a valid expiry date (MM/YY)';
    isValid = false;
  }
  
  // Validate CVC
  if (!paymentForm.cvc.trim()) {
    errors.cvc = 'CVC is required';
    isValid = false;
  } else if (!validateCVC(paymentForm.cvc, paymentForm.type)) {
    const expectedLength = paymentForm.type === 'American Express' ? 4 : 3;
    errors.cvc = `CVC must be ${expectedLength} digits`;
    isValid = false;
  }
  
  setPaymentErrors(errors);
  return isValid;
};

// Enhanced payment form submit handler
let handlePaymentSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate form
  if (!validatePaymentForm()) {
    return;
  }
  
  try {
    const cleanCardNumber = paymentForm.cardNumber.replace(/\D/g, '');
    const last4 = cleanCardNumber.slice(-4);
    
    if (paymentForm.id) {
      // Update existing payment method
      setPaymentMethods(paymentMethods.map(pm => 
        pm.id === paymentForm.id ? {
          ...pm,
          isDefault: paymentForm.isDefault,
          type: paymentForm.type,
          last4,
          expiry: paymentForm.expiry,
          name: paymentForm.name
        } : pm
      ));
    } else {
      // Add new payment method
      const newId = Math.max(...paymentMethods.map(p => p.id), 0) + 1;
      setPaymentMethods([...paymentMethods, {
        id: newId,
        isDefault: paymentForm.isDefault,
        type: paymentForm.type,
        last4,
        expiry: paymentForm.expiry,
        name: paymentForm.name
      }]);
    }
    
    // Clear form and close modal
    setPaymentForm({
      id: 0,
      isDefault: false,
      type: 'Visa',
      cardNumber: '',
      name: `${userData.firstName} ${userData.lastName}`,
      expiry: '',
      cvc: ''
    });
    setPaymentErrors({
      cardNumber: '',
      name: '',
      expiry: '',
      cvc: '',
      general: ''
    });
    setShowPaymentModal(false);
  } catch (error) {
    setPaymentErrors(prev => ({
      ...prev,
      general: 'An error occurred while saving the payment method. Please try again.'
    }));
  }
};
  

  // Payment method handlers
 handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.cardNumber || !paymentForm.name || !paymentForm.expiry || !paymentForm.cvc) {
      return;
    }
    const last4 = paymentForm.cardNumber.slice(-4);
    if (paymentForm.id) {
      setPaymentMethods(paymentMethods.map(pm => 
        pm.id === paymentForm.id ? {
          ...paymentForm,
          last4,
          type: paymentForm.type
        } : pm
      ));
    } else {
      const newId = Math.max(...paymentMethods.map(p => p.id), 0) + 1;
      setPaymentMethods([...paymentMethods, {
        id: newId,
        isDefault: paymentForm.isDefault,
        type: paymentForm.type,
        last4,
        expiry: paymentForm.expiry,
        name: paymentForm.name
      }]);
    }
    setShowPaymentModal(false);
  };

  const handleEditPayment = (payment: PaymentMethod) => {
    setPaymentForm({
      id: payment.id,
      isDefault: payment.isDefault,
      type: payment.type,
      cardNumber: `**** **** **** ${payment.last4}`,
      name: payment.name,
      expiry: payment.expiry,
      cvc: ''
    });
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (id: number) => {
    setDeletePaymentId(id);
    setDeletePaymentConfirmOpen(true);
  };

  const confirmDeletePayment = () => {
    if (deletePaymentId !== null) {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== deletePaymentId));
      setDeletePaymentId(null);
      setDeletePaymentConfirmOpen(false);
    }
  };

  const handleSetDefaultPayment = (id: number) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const [editMode, setEditMode] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { clearCart } = useCart();
  // User data (email will sync with logged-in user)
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '(555) 123-4567',
    birthdate: '1985-06-15'
  });

  // Fetch user profile from Firestore on login, or create if not found
  useEffect(() => {
    // Only run on mount or when currentUser changes
    const fetchOrCreateUserProfile = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const userProfile = await getUserById(currentUser.uid);
          if (userProfile) {
            setUserData({
              firstName: userProfile.firstname || '',
              lastName: userProfile.lastname || '',
              email: userProfile.email || currentUser.email || '',
              phone: userProfile.phone || '',
              birthdate: userProfile.birthdate || ''
            });
          } else {
            // If no profile exists, create one with available info (from auth only, not userData), using uid as doc id
            const newUser = {
              firstname: currentUser.displayName ? currentUser.displayName.split(' ')[0] : '',
              lastname: currentUser.displayName ? currentUser.displayName.split(' ').slice(1).join(' ') : '',
              email: currentUser.email || '',
              phone: '',
              birthdate: '',
              address: '',
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUser, { merge: true });
            setUserData({
              firstName: newUser.firstname,
              lastName: newUser.lastname,
              email: newUser.email,
              phone: newUser.phone,
              birthdate: newUser.birthdate
            });
          }
        } catch (err) {
          setUserData(prev => ({ ...prev, email: currentUser.email || '' }));
        }
      }
    };
    fetchOrCreateUserProfile();
  }, [currentUser]);
  // Mock user preferences
  const [preferences, setPreferences] = useState({
    emailMarketing: true,
    orderUpdates: true,
    productRecommendations: false,
    specialOffers: true
  });

  // Payment modal states
  const [paymentForm, setPaymentForm] = useState({
    id: 0,
    isDefault: false,
    type: 'Visa',
    cardNumber: '',
    name: `${userData.firstName} ${userData.lastName}`,
    expiry: '',
    cvc: ''
  });
  const [deletePaymentId, setDeletePaymentId] = useState<number | null>(null);
  const [deletePaymentConfirmOpen, setDeletePaymentConfirmOpen] = useState(false);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: 0,
    name: '',
    isDefault: false,
    firstName: 'John',
    lastName: 'Doe',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '(555) 123-4567'
  });
  const [addresses, setAddresses] = useState(mockAddresses);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock validation: require all fields, new === confirm, current !== new
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('Please fill in all fields.');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.current === passwordForm.new) {
      setPasswordError('New password must be different from current password.');
      return;
    }
    // Simulate success
    setPasswordSuccess('Password changed successfully!');
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess('');
    }, 1200);
  };
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && currentUser.uid) {
      setProfileSaving(true);
      try {
        await updateUserProfile(currentUser.uid, {
          firstname: userData.firstName,
          lastname: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          birthdate: userData.birthdate
        });
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 1500);
      } catch (err) {
        // Optionally show an error message here
      }
      setProfileSaving(false);
    }
    setEditMode(false);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressForm.id) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.id === addressForm.id ? addressForm : addr
      ));
    } else {
      // Add new address
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      setAddresses([...addresses, { ...addressForm, id: newId }]);
    }
    setShowAddressModal(false);
  };

  const handleEditAddress = (address: typeof mockAddresses[0]) => {
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefaultAddress = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      clearCart();
      clearWishlist();
      await signOut(auth);
      navigate('/'); // Redirect to homepage
    } catch (error) {
      alert('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login', { state: { from: window.location.pathname }, replace: false  });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!currentUser) {
    return null; // Or a loading spinner
  }

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
                <button onClick={() => setActiveTab('wishlist')} className={`w-full flex items-center px-6 py-4 text-sm font-medium ${activeTab === 'wishlist' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <HeartIcon className="h-5 w-5 mr-3" />
                  My Wishlist
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
                <button className="flex items-center text-sm font-medium text-red-600 hover:text-red-700" onClick={handleLogout}>
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
                        <button type="submit" className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60" disabled={profileSaving}>
                          {profileSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        {profileSaveSuccess && (
                          <span className="ml-3 text-green-700 text-sm font-medium">Profile saved!</span>
                        )}
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
                      <button
                        className="text-sm text-green-700 font-medium hover:text-green-800"
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change Password
                      </button>
                      <div>
                        <p className="text-sm text-gray-500">
                          Last login: June 15, 2023 at 10:34 AM from Portland, OR
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Change Password Modal */}
                  <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="current" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          id="current"
                          name="current"
                          value={passwordForm.current}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          autoComplete="current-password"
                        />
                      </div>
                      <div>
                        <label htmlFor="new" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          id="new"
                          name="new"
                          value={passwordForm.new}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          autoComplete="new-password"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          id="confirm"
                          name="confirm"
                          value={passwordForm.confirm}
                          onChange={handlePasswordChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          autoComplete="new-password"
                        />
                      </div>
                      {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
                      {passwordSuccess && <div className="text-green-700 text-sm">{passwordSuccess}</div>}
                      <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowPasswordModal(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800">Change Password</button>
                      </div>
                    </form>
                  </Modal>
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
                                  <Link
                                    to={`/order-details`}
                                    className="flex items-center text-green-700 hover:text-green-800"
                                  >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View Order Details
                                  </Link>
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
              {/* My Wishlist Tab*/}
              {activeTab === 'wishlist' && <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-medium text-gray-900">
        My Wishlist
      </h2>
    </div>
    {wishlist.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-md">
        <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Your wishlist is empty
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't added any items to your wishlist yet.
        </p>
        <div className="mt-6">
          <Link 
            to="/wishlist" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800"
          >
            View Wishlist
          </Link>
        </div>
      </div>
    ) : (
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {wishlist.map(product => (
            <li key={product.id} className="p-4 flex items-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-16 w-16 object-cover rounded-md"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <button 
                onClick={() => removeFromWishlist(product.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-200">
          <Link 
            to="/wishlist" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-800"
          >
            View Full Wishlist
          </Link>
        </div>
      </div>
    )}
  </div>}
               {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      My Addresses
                    </h2>
                    <button 
                      onClick={() => {
                        setAddressForm({
                          id: 0,
                          name: '',
                          isDefault: false,
                          firstName: userData.firstName,
                          lastName: userData.lastName,
                          address: '',
                          apartment: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: 'United States',
                          phone: userData.phone
                        });
                        setShowAddressModal(true);
                      }} 
                      className="flex items-center text-sm font-medium text-green-700 hover:text-green-800"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add New Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {addresses.map(address => (
                      <div key={address.id} className="border border-gray-200 rounded-md p-4 relative">
                        {address.isDefault && (
                          <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                        <h3 className="font-medium text-gray-900">
                          {address.name}
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <p>{address.firstName} {address.lastName}</p>
                          <p>{address.address}</p>
                          {address.apartment && <p>{address.apartment}</p>}
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                          <p className="pt-1">{address.phone}</p>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <button 
                            onClick={() => handleEditAddress(address)}
                            className="text-sm text-green-700 font-medium hover:text-green-800"
                          >
                            Edit
                          </button>
                          {!address.isDefault && (
                            <button 
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="text-sm text-gray-700 font-medium hover:text-gray-800"
                            >
                              Set as default
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-sm text-red-600 font-medium hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-medium text-gray-900">
        Payment Methods
      </h2>
      <button 
        onClick={() => {
          setPaymentForm({
            id: 0,
            isDefault: false,
            type: 'Visa',
            cardNumber: '',
            name: `${userData.firstName} ${userData.lastName}`,
            expiry: '',
            cvc: ''
          });
          setShowPaymentModal(true);
        }} 
        className="flex items-center text-sm font-medium text-green-700 hover:text-green-800"
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Add New Payment Method
      </button>
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {paymentMethods.map(payment => (
        <div key={payment.id} className="border border-gray-200 rounded-md p-4 relative">
          {payment.isDefault && (
            <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Default
            </span>
          )}
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
              <p className="text-sm text-gray-500">
                {payment.name}
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={() => handleEditPayment(payment)}
              className="text-sm text-green-700 font-medium hover:text-green-800"
            >
              Edit
            </button>
            {!payment.isDefault && (
              <button 
                onClick={() => handleSetDefaultPayment(payment.id)}
                className="text-sm text-gray-700 font-medium hover:text-gray-800"
              >
                Set as default
              </button>
            )}
            <button 
              onClick={() => handleDeletePayment(payment.id)}
              className="text-sm text-red-600 font-medium hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
                {/* Add/Edit Payment Method Modal */}
<Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
  <h2 className="text-lg font-semibold mb-4 text-gray-900">
    {paymentForm.id ? 'Edit Payment Method' : 'Add New Payment Method'}
  </h2>
  {paymentErrors.general && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-600">{paymentErrors.general}</p>
    </div>
  )}
  <form onSubmit={handlePaymentSubmit} className="space-y-4">
    <div className="grid grid-cols-1 gap-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Card Type
        </label>
        <select
          id="type"
          name="type"
          value={paymentForm.type}
          onChange={handlePaymentFormChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          required
        >
          <option value="Visa">Visa</option>
          <option value="Mastercard">Mastercard</option>
          <option value="American Express">American Express</option>
          <option value="Discover">Discover</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={paymentForm.cardNumber}
          onChange={handlePaymentFormChange}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${
            paymentErrors.cardNumber 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
          }`}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
          required
        />
        {paymentErrors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{paymentErrors.cardNumber}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name on Card
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={paymentForm.name}
          onChange={handlePaymentFormChange}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${
            paymentErrors.name 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
          }`}
          required
        />
        {paymentErrors.name && (
          <p className="mt-1 text-sm text-red-600">{paymentErrors.name}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            value={paymentForm.expiry}
            onChange={handlePaymentFormChange}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${
              paymentErrors.expiry 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="MM/YY"
            maxLength={5}
            required
          />
          {paymentErrors.expiry && (
            <p className="mt-1 text-sm text-red-600">{paymentErrors.expiry}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            name="cvc"
            value={paymentForm.cvc}
            onChange={handlePaymentFormChange}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${
              paymentErrors.cvc 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder={paymentForm.type === 'American Express' ? '1234' : '123'}
            maxLength={4}
            required
          />
          {paymentErrors.cvc && (
            <p className="mt-1 text-sm text-red-600">{paymentErrors.cvc}</p>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex items-center">
          <input
            id="isDefault"
            name="isDefault"
            type="checkbox"
            checked={paymentForm.isDefault}
            onChange={handlePaymentFormChange}
            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
            Set as default payment method
          </label>
        </div>
      </div>
    </div>
    
    <div className="mt-6 flex items-center justify-end space-x-3">
      <button 
        type="button" 
        onClick={() => {
          setShowPaymentModal(false);
          setPaymentErrors({
            cardNumber: '',
            name: '',
            expiry: '',
            cvc: '',
            general: ''
          });
        }} 
        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Save Payment Method
      </button>
    </div>
  </form>
</Modal>

        {/* Delete Payment Method Confirmation Modal */}
        <Modal open={deletePaymentConfirmOpen} onClose={() => {
          setDeletePaymentId(null);
          setDeletePaymentConfirmOpen(false);
        }}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Confirm Delete Payment Method
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this payment method? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setDeletePaymentId(null);
                setDeletePaymentConfirmOpen(false);
              }}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeletePayment}
              className="bg-red-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Payment Method
            </button>
          </div>
        </Modal>
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

          {/* Address Modal */}
        <Modal open={showAddressModal} onClose={() => setShowAddressModal(false)}>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {addressForm.id ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Address Nickname (e.g., Home, Work)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm({...addressForm, firstName: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm({...addressForm, lastName: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  type="text"
                  id="apartment"
                  name="apartment"
                  value={addressForm.apartment}
                  onChange={(e) => setAddressForm({...addressForm, apartment: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={addressForm.zipCode}
                  onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setShowAddressModal(false)} 
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-green-700 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-green-800"
              >
                Save Address
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>;
};