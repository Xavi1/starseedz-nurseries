import React, { useState, useEffect } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';

interface AddProductModalProps {
  show: boolean;
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ show, form, onChange, onClose, onSubmit }) => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());

  // Validate fields when they lose focus or when form changes
  const validateField = (name: string, value: any): string | null => {
    // Skip validation if field hasn't been touched
    if (!touchedFields.has(name)) return null;

    switch (name) {
      case 'name':
        if (!value || value.trim() === '') return 'Product name is required';
        if (value.length < 3) return 'Product name must be at least 3 characters';
        break;
      case 'price':
        if (value === '' || value === null) return 'Price is required';
        if (Number(value) < 0) return 'Price cannot be negative';
        if (Number(value) === 0) return 'Price should be greater than 0';
        break;
      case 'stock':
        if (value === '' || value === null) return 'Stock is required';
        if (Number(value) < 0) return 'Stock cannot be negative';
        break;
      case 'category':
        if (!value || value.length === 0) return 'At least one category is required';
        break;
      case 'rating':
        if (value !== '' && (Number(value) < 0 || Number(value) > 5)) return 'Rating must be between 0 and 5';
        break;
      case 'image':
        if (value && !value.match(/^https?:\/\/.+/)) return 'Please enter a valid URL starting with http:// or https://';
        break;
    }
    return null;
  };

  // Handle field blur to mark as touched and validate
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Add to touched fields
    setTouchedFields(prev => new Set(prev).add(name));
    
    // Validate field
    const error = validateField(name, value);
    setFieldErrors(prev => {
      const newMap = new Map(prev);
      if (error) {
        newMap.set(name, error);
      } else {
        newMap.delete(name);
      }
      return newMap;
    });
  };

  // Clear errors when form is submitted
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields before submit
    let hasErrors = false;
    const newErrors = new Map();
    const allFields = [
      'name', 'description', 'longDescription', 'image', 'category',
      'price', 'stock', 'rating', 'inStock', 'isBestSeller'
    ];
    
    allFields.forEach(field => {
      const value = form[field];
      const error = validateField(field, value);
      if (error) {
        newErrors.set(field, error);
        hasErrors = true;
      }
    });
    
    setFieldErrors(newErrors);
    
    // Mark all fields as touched
    setTouchedFields(new Set(allFields));
    
    if (!hasErrors) {
      onSubmit(e);
    }
  };

  // Wrap onChange to provide feedback
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e);
    
    // If field has been touched, validate on change
    if (touchedFields.has(e.target.name)) {
      const error = validateField(e.target.name, e.target.value);
      setFieldErrors(prev => {
        const newMap = new Map(prev);
        if (error) {
          newMap.set(e.target.name, error);
        } else {
          newMap.delete(e.target.name);
        }
        return newMap;
      });
    }
  };

  // Clear feedback when modal closes
  useEffect(() => {
    if (!show) {
      setTouchedFields(new Set());
      setFieldErrors(new Map());
    }
  }, [show]);

  // Helper to get field error
  const getFieldError = (name: string): string | undefined => {
    return fieldErrors.get(name);
  };

  // Helper to check if field is valid (no error)
  const isFieldValid = (name: string): boolean => {
    return touchedFields.has(name) && !fieldErrors.has(name);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
          <PlusIcon className="h-5 w-5" /> Add New Product
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${getFieldError('name') ? 'border-red-500' : isFieldValid('name') ? 'border-green-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`} 
                required 
              />
              {getFieldError('name') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('name')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                rows={2} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
              <textarea 
                name="longDescription" 
                value={form.longDescription} 
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                rows={2} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input 
                type="text" 
                name="image" 
                value={form.image} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${getFieldError('image') ? 'border-red-500' : isFieldValid('image') ? 'border-green-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`} 
              />
              {getFieldError('image') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('image')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
              <input 
                type="text" 
                name="category" 
                value={form.category.join(', ')} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border ${getFieldError('category') ? 'border-red-500' : isFieldValid('category') ? 'border-green-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`} 
                required 
              />
              {getFieldError('category') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('category')}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border ${getFieldError('price') ? 'border-red-500' : isFieldValid('price') ? 'border-green-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`} 
                  required 
                  min="0" 
                  step="0.01" 
                />
                {getFieldError('price') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('price')}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={form.stock} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border ${getFieldError('stock') ? 'border-red-500' : isFieldValid('stock') ? 'border-green-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`} 
                  required 
                  min="0" 
                />
                {getFieldError('stock') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('stock')}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <input 
                  type="number" 
                  name="rating" 
                  value={form.rating} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border ${getFieldError('rating') ? 'border-red-500' : isFieldValid('rating') ? 'border-green-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`} 
                  min="0" 
                  max="5" 
                  step="0.1" 
                />
                {getFieldError('rating') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('rating')}</p>
                )}
              </div>
              <div className="flex-1 flex items-center mt-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mr-4 accent-green-600">
                  <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} className="mr-2" />
                  In Stock
                </label>
                <label className="flex items-center text-sm font-medium text-gray-700 accent-green-600">
                  <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange} className="mr-2" />
                  Best Seller
                </label>
              </div>
            </div>
            {/* Care Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" name="careInstructions.light" value={form.careInstructions.light} onChange={handleChange} onBlur={handleBlur} placeholder="Light" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="careInstructions.temperature" value={form.careInstructions.temperature} onChange={handleChange} onBlur={handleBlur} placeholder="Temperature" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="careInstructions.warnings" value={form.careInstructions.warnings} onChange={handleChange} onBlur={handleBlur} placeholder="Warnings" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="careInstructions.water" value={form.careInstructions.water} onChange={handleChange} onBlur={handleBlur} placeholder="Water" className="border border-gray-300 rounded-md px-2 py-1" />
              </div>
            </div>
            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" name="specifications.Difficulty" value={form.specifications.Difficulty} onChange={handleChange} onBlur={handleBlur} placeholder="Difficulty" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Growth Rate" value={form.specifications['Growth Rate']} onChange={handleChange} onBlur={handleBlur} placeholder="Growth Rate" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Light Requirements" value={form.specifications['Light Requirements']} onChange={handleChange} onBlur={handleBlur} placeholder="Light Requirements" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Mature Height" value={form.specifications['Mature Height']} onChange={handleChange} onBlur={handleBlur} placeholder="Mature Height" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Pet Friendly" value={form.specifications['Pet Friendly']} onChange={handleChange} onBlur={handleBlur} placeholder="Pet Friendly" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Pot Size" value={form.specifications['Pot Size']} onChange={handleChange} onBlur={handleBlur} placeholder="Pot Size" className="border border-gray-300 rounded-md px-2 py-1" />
              </div>
            </div>
            {/* Related Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Products (IDs, comma separated)</label>
              <input type="text" name="relatedProducts.0" value={form.relatedProducts[0] || ''} onChange={handleChange} onBlur={handleBlur} className="border border-gray-300 rounded-md px-2 py-1 mb-1" placeholder="Related Product 1" />
              <input type="text" name="relatedProducts.1" value={form.relatedProducts[1] || ''} onChange={handleChange} onBlur={handleBlur} className="border border-gray-300 rounded-md px-2 py-1 mb-1" placeholder="Related Product 2" />
              <input type="text" name="relatedProducts.2" value={form.relatedProducts[2] || ''} onChange={handleChange} onBlur={handleBlur} className="border border-gray-300 rounded-md px-2 py-1" placeholder="Related Product 3" />
            </div>
            {/* Reviews */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviews</label>
              <textarea 
                name="reviews" 
                value={form.reviews} 
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                rows={2} 
              />
            </div>
            <div className="flex justify-end mt-6">
              <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">
                Add Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;