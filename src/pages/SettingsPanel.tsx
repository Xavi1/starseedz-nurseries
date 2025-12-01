import React from 'react';

// Note: Removed the StoreSettings import since we're defining it locally
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
      {/* Logo upload section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Store Logo</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="relative">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Store logo"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No logo</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/png,image/jpeg,image/jpg,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleChangeClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Change Logo
            </button>
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Recommended: Square PNG, JPG or GIF, at least 400x400px. Max 1MB.
            </p>
          </div>
        </div>
      </div>

      {/* Store details form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Store Details</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Store Email
            </label>
            <input
              type="email"
              value={formData.storeEmail}
              onChange={(e) => handleInputChange('storeEmail', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Store Phone
            </label>
            <input
              type="tel"
              value={formData.storePhone}
              onChange={(e) => handleInputChange('storePhone', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Store Address
            </label>
            <textarea
              value={formData.storeAddress}
              onChange={(e) => handleInputChange('storeAddress', e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Tax Name
            </label>
            <input
              type="text"
              value={formData.taxName}
              onChange={(e) => handleInputChange('taxName', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Tax Rate (%)
            </label>
            <input
              type="text"
              value={formData.taxRate}
              onChange={(e) => handleInputChange('taxRate', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={!isDirty || isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={!isDirty || isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// Stub implementations for other tab components
const UserManagement: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    role: 'Staff',
    status: 'Active'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding user:', form);
    // Add user logic here
    setShowModal(false);
    setForm({ name: '', email: '', role: 'Staff', status: 'Active' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add User
          </button>
        </div>
        
        {/* User list table would go here */}
        <div className="text-center py-12 text-gray-500">
          User management interface - user list would appear here
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
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
        </div>
      )}
    </div>
  );
};

const PaymentMethods: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
      <div className="text-center py-12 text-gray-500">
        Payment methods configuration would appear here
      </div>
    </div>
  </div>
);

const NotificationSettings: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
      <div className="text-center py-12 text-gray-500">
        Notification settings configuration would appear here
      </div>
    </div>
  </div>
);

const SecuritySettings: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow">
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
    
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
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
              <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Manage API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
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

interface SettingsPanelProps {
  activeSettingsTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ activeSettingsTab, onTabChange }) => {
  const tabs = [
    { key: 'store', label: 'Store Settings' },
    { key: 'users', label: 'User Management' },
    { key: 'payment', label: 'Payment Methods' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 focus:outline-none ${
              activeSettingsTab === tab.key
                ? 'border-green-600 text-green-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-400 bg-gray-50'
            }`}
            onClick={() => onTabChange(tab.key)}
            type="button"
            aria-current={activeSettingsTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeSettingsTab === 'store' && <StoreSettings />}
      {activeSettingsTab === 'users' && <UserManagement />}
      {activeSettingsTab === 'payment' && <PaymentMethods />}
      {activeSettingsTab === 'notifications' && <NotificationSettings />}
      {activeSettingsTab === 'security' && <SecuritySettings />}
    </div>
  );
};

export default SettingsPanel;