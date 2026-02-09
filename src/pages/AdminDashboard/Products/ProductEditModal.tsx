import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { Product } from '../../../AdminDashboard/types';

interface ProductEditModalProps {
  show: boolean;
  form: Partial<Product> | null;
  showEditConfirm: boolean;
  onCancelEditSave: () => void;
  onConfirmEditSave: () => void;
  onClose: () => void;
  onSave: (updatedProduct: Partial<Product>) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  show,
  form,
  showEditConfirm,
  onCancelEditSave,
  onConfirmEditSave,
  onClose,
  onSave,
}) => {
  const [localForm, setLocalForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    longDescription: '',
    sku: '',
    price: 0,
    stock: 0,
    image: '',
    category: [],
    inStock: true,
    isBestSeller: false,
    featured: false,
    rating: 0,
    lowStockThreshold: 5,
    careInstructions: {
      light: '',
      temperature: '',
      water: '',
      warnings: '',
    },
    specifications: {
      Difficulty: '',
      'Growth Rate': '',
      'Light Requirements': '',
      'Mature Height': '',
      'Pet Friendly': '',
      'Pot Size': '',
    },
    relatedProducts: ['', '', ''],
    reviews: '',
  });

  const [categoryInput, setCategoryInput] = useState('');
  const [specifications, setSpecifications] = useState({
    Difficulty: '',
    'Growth Rate': '',
    'Light Requirements': '',
    'Mature Height: ': '',
    'Pet Friendly: ': '',
    'Pot Size': '',
  });

  useEffect(() => {
    if (form) {
      setLocalForm(form);
      setSpecifications(form.specifications || {
        Difficulty: '',
        'Growth Rate': '',
        'Light Requirements': '',
        'Mature Height': '',
        'Pet Friendly': '',
        'Pot Size': '',
      });
    }
  }, [form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setLocalForm(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      const numValue = parseFloat(value);
      setLocalForm(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setLocalForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCareInstructionsChange = (field: keyof typeof localForm.careInstructions, value: string) => {
    setLocalForm(prev => ({
      ...prev,
      careInstructions: {
        ...prev.careInstructions,
        [field]: value,
      },
    }));
  };

  const handleSpecificationChange = (field: keyof typeof specifications, value: string) => {
    setSpecifications(prev => ({
      ...prev,
      [field]: value,
    }));
    setLocalForm(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value,
      },
    }));
  };

  const handleRelatedProductChange = (index: number, value: string) => {
    const newRelatedProducts = [...(localForm.relatedProducts || ['', '', ''])];
    newRelatedProducts[index] = value;
    setLocalForm(prev => ({
      ...prev,
      relatedProducts: newRelatedProducts,
    }));
  };

  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      const currentCategories = Array.isArray(localForm.category) ? localForm.category : [];
      if (!currentCategories.includes(categoryInput.trim())) {
        setLocalForm(prev => ({
          ...prev,
          category: [...currentCategories, categoryInput.trim()],
        }));
        setCategoryInput('');
      }
    }
  };

  const handleRemoveCategory = (index: number) => {
    const currentCategories = Array.isArray(localForm.category) ? localForm.category : [];
    setLocalForm(prev => ({
      ...prev,
      category: currentCategories.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSaveClick = () => {
    // Prepare the updated form data
    const updatedForm = {
      ...localForm,
      specifications,
    };
    
    // Show confirmation dialog
    onConfirmEditSave();
  };

  const handleConfirmSave = () => {
    // Prepare the updated form data
    const updatedForm = {
      ...localForm,
      specifications,
    };
    
    // Call the parent's save function
    onSave(updatedForm);
  };

  if (!show || !form) return null;

  // Ensure category is always an array for rendering
  const categories = Array.isArray(localForm.category) ? localForm.category : [];

  return (
    <>
      {/* Confirmation Popup - Only shows when showEditConfirm is true */}
      {showEditConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center w-full">Confirm Save Changes</h3>
            <p className="mb-6 text-gray-700 text-center">Are you sure you want to save changes to this product?</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={onCancelEditSave} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSave} 
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Edit Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8 relative border border-gray-200 max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={localForm.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={localForm.sku || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={localForm.price || 0}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={localForm.stock || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={localForm.lowStockThreshold || 5}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input
                    type="number"
                    name="rating"
                    value={localForm.rating || 0}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={localForm.image || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Categories</h3>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="Add a category"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Descriptions */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Descriptions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    name="description"
                    value={localForm.description || ''}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea
                    name="longDescription"
                    value={localForm.longDescription || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Care Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Light</label>
                  <textarea
                    value={localForm.careInstructions?.light || ''}
                    onChange={(e) => handleCareInstructionsChange('light', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <textarea
                    value={localForm.careInstructions?.temperature || ''}
                    onChange={(e) => handleCareInstructionsChange('temperature', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water</label>
                  <textarea
                    value={localForm.careInstructions?.water || ''}
                    onChange={(e) => handleCareInstructionsChange('water', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warnings</label>
                  <textarea
                    value={localForm.careInstructions?.warnings || ''}
                    onChange={(e) => handleCareInstructionsChange('warnings', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <input
                    type="text"
                    value={specifications.Difficulty || ''}
                    onChange={(e) => handleSpecificationChange('Difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Growth Rate</label>
                  <input
                    type="text"
                    value={specifications['Growth Rate'] || ''}
                    onChange={(e) => handleSpecificationChange('Growth Rate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Light Requirements</label>
                  <input
                    type="text"
                    value={specifications['Light Requirements'] || ''}
                    onChange={(e) => handleSpecificationChange('Light Requirements', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mature Height</label>
                  <input
                    type="text"
                    value={specifications['Mature Height: '] || ''}
                    onChange={(e) => handleSpecificationChange('Mature Height: ', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Friendly</label>
                  <input
                    type="text"
                    value={specifications['Pet Friendly: '] || ''}
                    onChange={(e) => handleSpecificationChange('Pet Friendly: ', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pot Size</label>
                  <input
                    type="text"
                    value={specifications['Pot Size'] || ''}
                    onChange={(e) => handleSpecificationChange('Pot Size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Related Products */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Related Products (Paths)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product {index + 1}</label>
                    <input
                      type="text"
                      value={localForm.relatedProducts?.[index] || ''}
                      onChange={(e) => handleRelatedProductChange(index, e.target.value)}
                      placeholder="/products/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Status Flags */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Status</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={localForm.inStock || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded accent-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={localForm.isBestSeller || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded accent-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Best Seller</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={localForm.featured || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded accent-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>

            {/* Reviews */}
            <div className="pb-6">
              <label className="block text-lg font-semibold mb-4 text-gray-700">Reviews</label>
              <textarea
                name="reviews"
                value={localForm.reviews || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductEditModal;