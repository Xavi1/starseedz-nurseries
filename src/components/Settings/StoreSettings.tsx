import React from 'react';
import { EditIcon, PlusIcon } from 'lucide-react';

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
  const initialFormData = React.useRef(formData);
  const initialLogoPreview = React.useRef(logoPreview);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PNG, JPG, or GIF file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', formData);
      console.log('Logo updated:', logoPreview ? 'Yes' : 'No');
      initialFormData.current = { ...formData };
      initialLogoPreview.current = logoPreview;
      setIsDirty(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...initialFormData.current });
    setLogoPreview(initialLogoPreview.current);
    setIsDirty(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('Changes cancelled');
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Store Information</h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">Store Name</label>
            <div className="mt-1">
              <input type="text" name="store-name" id="store-name" value={formData.storeName} onChange={(e) => handleInputChange('storeName', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1">
              <input type="email" name="store-email" id="store-email" value={formData.storeEmail} onChange={(e) => handleInputChange('storeEmail', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1">
              <input type="text" name="store-phone" id="store-phone" value={formData.storePhone} onChange={(e) => handleInputChange('storePhone', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
            <div className="mt-1">
              <select id="currency" name="currency" value={formData.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500">
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
            <label htmlFor="store-address" className="block text-sm font-medium text-gray-700">Address</label>
            <div className="mt-1">
              <input type="text" name="store-address" id="store-address" value={formData.storeAddress} onChange={(e) => handleInputChange('storeAddress', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Store Logo</h4>
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
              <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept=".png,.jpg,.jpeg,.gif" className="hidden" />
              <button onClick={handleChangeClick} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Change</button>
              <button onClick={handleRemoveLogo} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Remove</button>
            </div>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, or GIF. Max size 1MB.</p>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h4>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <div className="mt-1">
              <input type="text" name="tax-rate" id="tax-rate" value={formData.taxRate} onChange={(e) => handleInputChange('taxRate', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="tax-name" className="block text-sm font-medium text-gray-700">Tax Name</label>
            <div className="mt-1">
              <input type="text" name="tax-name" id="tax-name" value={formData.taxName} onChange={(e) => handleInputChange('taxName', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Shipping Methods</h4>
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Standard Shipping</h5>
              <p className="text-sm text-gray-500">3-5 business days</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-4">$5.00</span>
              <button className="text-sm text-gray-500 hover:text-gray-700"><EditIcon className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Express Shipping</h5>
              <p className="text-sm text-gray-500">1-2 business days</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-4">$15.00</span>
              <button className="text-sm text-gray-500 hover:text-gray-700"><EditIcon className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="p-4">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"><PlusIcon className="h-4 w-4 mr-1.5" />Add Shipping Method</button>
          </div>
        </div>
      </div>
      <div className="pt-5 flex justify-end">
        <button type="button" onClick={handleCancel} disabled={isLoading} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
        <button type="button" onClick={handleSaveChanges} disabled={!isDirty || isLoading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>) : ('Save Changes')}</button>
      </div>
    </div>
  );
};

export default StoreSettings;
