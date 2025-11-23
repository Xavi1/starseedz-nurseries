import React from 'react';

// Icon components (you'll need to import these from your icon library)
const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

interface SettingsPanelProps {
  activeSettingsTab: string;
  onTabChange: (tab: string) => void;
}

// Individual tab components
const StoreSettings: React.FC = () => {
  const [logoPreview, setLogoPreview] = React.useState<string>(
    "https://images.unsplash.com/photo-1585676623595-7761e1c5f38b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  );
  const [formData, setFormData] = React.useState({
    storeName: "Starseedz Nurseries",
    storeEmail: "info@starseedz.com",
    storePhone: "(555) 123-4567",
    currency: "USD ($)",
    storeAddress: "Couva, Couva-Tabaquite-Talparo Regional Corporation, Trinidad and Tobago",
    taxRate: "8.5",
    taxName: "Sales Tax"
  });
  const [isDirty, setIsDirty] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Store initial data for reset functionality
  const initialFormData = React.useRef(formData);
  const initialLogoPreview = React.useRef(logoPreview);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }

      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PNG, JPG, or GIF file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);

      // Here you would typically upload the file to your server
      console.log('Selected file:', file.name);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setIsDirty(true);
  };

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make API calls here:
      // await saveStoreSettings(formData);
      // if (logoPreview !== initialLogoPreview.current) {
      //   await uploadStoreLogo(logoPreview);
      // }
      
      console.log('Settings saved:', formData);
      console.log('Logo updated:', logoPreview ? 'Yes' : 'No');
      
      // Update initial data reference
      initialFormData.current = { ...formData };
      initialLogoPreview.current = logoPreview;
      setIsDirty(false);
      
      // Show success message
      alert('Settings saved successfully!');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to initial state
    setFormData({ ...initialFormData.current });
    setLogoPreview(initialLogoPreview.current);
    setIsDirty(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log('Changes cancelled');
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Store Information
        </h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <div className="mt-1">
              <input 
                type="text" 
                name="store-name" 
                id="store-name" 
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1">
              <input 
                type="email" 
                name="store-email" 
                id="store-email" 
                value={formData.storeEmail}
                onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input 
                type="text" 
                name="store-phone" 
                id="store-phone" 
                value={formData.storePhone}
                onChange={(e) => handleInputChange('storePhone', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <div className="mt-1">
              <select 
                id="currency" 
                name="currency" 
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>CAD ($)</option>
                <option>AUD ($)</option>
                <option>TTD ($)</option>
              </select>
            </div>
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="store-address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1">
              <input 
                type="text" 
                name="store-address" 
                id="store-address" 
                value={formData.storeAddress}
                onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Logo section remains the same */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Store Logo
        </h4>
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
            {logoPreview ? (
              <img src={logoPreview} alt="Store logo" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <span className="text-xs text-gray-500">No logo</span>
              </div>
            )}
          </div>
          <div className="ml-5">
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept=".png,.jpg,.jpeg,.gif"
                className="hidden"
              />
              <button 
                onClick={handleChangeClick}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Change
              </button>
              <button 
                onClick={handleRemoveLogo}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Remove
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, or GIF. Max size 1MB.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Tax Settings
        </h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700">
              Tax Rate (%)
            </label>
            <div className="mt-1">
              <input 
                type="text" 
                name="tax-rate" 
                id="tax-rate" 
                value={formData.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="tax-name" className="block text-sm font-medium text-gray-700">
              Tax Name
            </label>
            <div className="mt-1">
              <input 
                type="text" 
                name="tax-name" 
                id="tax-name" 
                value={formData.taxName}
                onChange={(e) => handleInputChange('taxName', e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Shipping Methods section remains the same */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Shipping Methods
        </h4>
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                Standard Shipping
              </h5>
              <p className="text-sm text-gray-500">3-5 business days</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-4">
                $5.00
              </span>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <EditIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                Express Shipping
              </h5>
              <p className="text-sm text-gray-500">1-2 business days</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-4">
                $15.00
              </span>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <EditIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add Shipping Method
            </button>
          </div>
        </div>
      </div>
      
      <div className="pt-5 flex justify-end">
        <button 
          type="button" 
          onClick={handleCancel}
          disabled={isLoading}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={handleSaveChanges}
          disabled={!isDirty || isLoading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = React.useState([
    {
      name: 'Admin User',
      email: 'admin@greenthumb.com',
      role: 'Administrator',
      status: 'Active',
      color: 'green',
      initial: 'A',
    },
    {
      name: 'John Smith',
      email: 'john@greenthumb.com',
      role: 'Manager',
      status: 'Active',
      color: 'blue',
      initial: 'J',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@greenthumb.com',
      role: 'Staff',
      status: 'Active',
      color: 'pink',
      initial: 'S',
    },
  ]);
  const [showModal, setShowModal] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', role: 'Staff', status: 'Active' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setUsers([
      ...users,
      {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        color: 'gray',
        initial: form.name.charAt(0).toUpperCase(),
      },
    ]);
    setForm({ name: '', email: '', role: 'Staff', status: 'Active' });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">User Management</h4>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => setShowModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, idx) => (
                <tr key={user.email + idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full bg-${user.color}-100 flex items-center justify-center`}>
                        <span className={`text-lg font-medium text-${user.color}-700`}>
                          {user.initial}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : user.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{user.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-gray-500 hover:text-gray-700"><EditIcon className="h-5 w-5" /></button>
                      <button className="text-gray-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal for Add User */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="mr-2 px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Add User</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          User Roles
        </h4>
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                Administrator
              </h5>
              <p className="text-sm text-gray-500">
                Full access to all settings and data
              </p>
            </div>
            <div>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <EditIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                Manager
              </h5>
              <p className="text-sm text-gray-500">
                Can manage products, orders, and customers
              </p>
            </div>
            <div>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <EditIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Staff</h5>
              <p className="text-sm text-gray-500">
                Can view orders and manage inventory
              </p>
            </div>
            <div>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                <EditIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentMethods: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Payment Methods
      </h4>
      <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-gray-700" />
            </div>
            <div className="ml-4">
              <h5 className="text-sm font-medium text-gray-900">
                Credit Card
              </h5>
              <p className="text-sm text-gray-500">
                Accept Visa, Mastercard, Amex, Discover
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-4">
              Enabled
            </span>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              <EditIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-16 bg-blue-100 rounded flex items-center justify-center">
              <span className="font-bold text-blue-700">PayPal</span>
            </div>
            <div className="ml-4">
              <h5 className="text-sm font-medium text-gray-900">
                PayPal
              </h5>
              <p className="text-sm text-gray-500">
                Accept payments via PayPal
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-4">
              Enabled
            </span>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              <EditIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-16 bg-yellow-100 rounded flex items-center justify-center">
              <span className="font-bold text-yellow-700">Apple</span>
            </div>
            <div className="ml-4">
              <h5 className="text-sm font-medium text-gray-900">
                Apple Pay
              </h5>
              <p className="text-sm text-gray-500">
                Accept payments via Apple Pay
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-4">
              Disabled
            </span>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              <EditIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Payment Processor
      </h4>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="processor" className="block text-sm font-medium text-gray-700">
            Processor
          </label>
          <div className="mt-1">
            <select id="processor" name="processor" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
              <option>Stripe</option>
              <option>Square</option>
              <option>Authorize.net</option>
              <option>Braintree</option>
            </select>
          </div>
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
            Mode
          </label>
          <div className="mt-1">
            <select id="mode" name="mode" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
              <option>Test Mode</option>
              <option>Live Mode</option>
            </select>
          </div>
        </div>
        <div className="sm:col-span-6">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <div className="mt-1">
            <input type="password" name="api-key" id="api-key" defaultValue="sk_test_51KGjT..." className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotificationSettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Email Notifications
      </h4>
      <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              New Order
            </h5>
            <p className="text-sm text-gray-500">
              Send email when a new order is placed
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Order Status Update
            </h5>
            <p className="text-sm text-gray-500">
              Send email when an order status changes
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Low Stock Alert
            </h5>
            <p className="text-sm text-gray-500">
              Send email when product stock is low
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Customer Registration
            </h5>
            <p className="text-sm text-gray-500">
              Send email when a new customer registers
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        SMS Notifications
      </h4>
      <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Order Status Updates
            </h5>
            <p className="text-sm text-gray-500">
              Send SMS when order status changes
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Delivery Notifications
            </h5>
            <p className="text-sm text-gray-500">
              Send SMS when order is delivered
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Admin Notifications
      </h4>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="notification-email" className="block text-sm font-medium text-gray-700">
            Notification Email
          </label>
          <div className="mt-1">
            <input type="email" name="notification-email" id="notification-email" defaultValue="admin@greenthumb.com" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SecuritySettings: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Two-Factor Authentication
      </h4>
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Enable Two-Factor Authentication
            </h5>
            <p className="text-sm text-gray-500 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Password Settings
      </h4>
      <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Require Strong Passwords
            </h5>
            <p className="text-sm text-gray-500">
              Passwords must include letters, numbers, and special characters
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              Password Expiry
            </h5>
            <p className="text-sm text-gray-500">
              Force users to reset password periodically
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        API Access
      </h4>
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              API Access
            </h5>
            <p className="text-sm text-gray-500 mt-1">
              Allow external applications to access your store data
            </p>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <KeyIcon className="h-4 w-4 mr-1.5" />
            Manage API Keys
          </button>
        </div>
      </div>
    </div>
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Session Settings
      </h4>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
            Session Timeout (minutes)
          </label>
          <div className="mt-1">
            <input type="number" name="session-timeout" id="session-timeout" defaultValue="30" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ activeSettingsTab, onTabChange }) => {
  return (
    <div>
      {activeSettingsTab === 'store' && <StoreSettings />}
      {activeSettingsTab === 'users' && <UserManagement />}
      {activeSettingsTab === 'payment' && <PaymentMethods />}
      {activeSettingsTab === 'notifications' && <NotificationSettings />}
      {activeSettingsTab === 'security' && <SecuritySettings />}
    </div>
  );
};

export default SettingsPanel;