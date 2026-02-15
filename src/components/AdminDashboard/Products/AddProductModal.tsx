import React from 'react';
import { XIcon, PlusIcon } from 'lucide-react';

interface AddProductModalProps {
  show: boolean;
  form: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ show, form, onChange, onClose, onSubmit }) => {
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
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" name="name" value={form.name} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
              <textarea name="longDescription" value={form.longDescription} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="text" name="image" value={form.image} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
              <input type="text" name="category" value={form.category.join(', ')} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input type="number" name="price" value={form.price} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required min="0" step="0.01" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required min="0" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <input type="number" name="rating" value={form.rating} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" max="5" step="0.1" />
              </div>
              <div className="flex-1 flex items-center mt-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mr-4 accent-green-600">
                  <input type="checkbox" name="inStock" checked={form.inStock} onChange={onChange} className="mr-2" />
                  In Stock
                </label>
                <label className="flex items-center text-sm font-medium text-gray-700 accent-green-600">
                  <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={onChange} className="mr-2" />
                  Best Seller
                </label>
              </div>
            </div>
            {/* Care Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" name="careInstructions.light" value={form.careInstructions.light} onChange={onChange} placeholder="Light" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="careInstructions.temperature" value={form.careInstructions.temperature} onChange={onChange} placeholder="Temperature" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="careInstructions.warnings" value={form.careInstructions.warnings} onChange={onChange} placeholder="Warnings" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="careInstructions.water" value={form.careInstructions.water} onChange={onChange} placeholder="Water" className="border border-gray-300 rounded-md px-2 py-1" />
              </div>
            </div>
            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" name="specifications.Difficulty" value={form.specifications.Difficulty} onChange={onChange} placeholder="Difficulty" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Growth Rate" value={form.specifications['Growth Rate']} onChange={onChange} placeholder="Growth Rate" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Light Requirements" value={form.specifications['Light Requirements']} onChange={onChange} placeholder="Light Requirements" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Mature Height" value={form.specifications['Mature Height']} onChange={onChange} placeholder="Mature Height" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Pet Friendly" value={form.specifications['Pet Friendly']} onChange={onChange} placeholder="Pet Friendly" className="border border-gray-300 rounded-md px-2 py-1" />
                <input type="text" name="specifications.Pot Size" value={form.specifications['Pot Size']} onChange={onChange} placeholder="Pot Size" className="border border-gray-300 rounded-md px-2 py-1" />
              </div>
            </div>
            {/* Related Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Products (IDs, comma separated)</label>
              <input type="text" name="relatedProducts.0" value={form.relatedProducts[0] || ''} onChange={onChange} className="border border-gray-300 rounded-md px-2 py-1 mb-1" placeholder="Related Product 1" />
              <input type="text" name="relatedProducts.1" value={form.relatedProducts[1] || ''} onChange={onChange} className="border border-gray-300 rounded-md px-2 py-1 mb-1" placeholder="Related Product 2" />
              <input type="text" name="relatedProducts.2" value={form.relatedProducts[2] || ''} onChange={onChange} className="border border-gray-300 rounded-md px-2 py-1" placeholder="Related Product 3" />
            </div>
            {/* Reviews */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviews</label>
              <textarea name="reviews" value={form.reviews} onChange={onChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} />
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