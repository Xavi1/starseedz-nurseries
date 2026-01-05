    import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  PlusIcon, 
  XIcon, 
  EyeIcon, 
  EditIcon, 
  TrashIcon, 
  ChevronRightIcon 
} from '@heroicons/react/outline';

interface Product {
  id: string;
  name: string;
  sku?: string;
  description: string;
  longDescription?: string;
  image: string;
  price: number;
  stock: number;
  category: string | string[];
  rating?: number;
  inStock?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
  lowStockThreshold?: number;
  careInstructions?: {
    light?: string;
    temperature?: string;
    warnings?: string;
    water?: string;
  };
  specifications?: {
    Difficulty?: string;
    'Growth Rate'?: string;
    'Light Requirements'?: string;
    'Mature Height'?: string;
    'Pet Friendly'?: string;
    'Pot Size'?: string;
    [key: string]: string | undefined;
  };
  relatedProducts?: string[];
  reviews?: string;
  imageUrl?: string;
}

interface ProductsManagerProps {
  selectedProduct?: string | null;
  products: Product[];
  filteredProducts: Product[];
  paginatedProducts: Product[];
  productSearchQuery: string;
  productCategoryFilter: string;
  productCategories: string[];
  selectedProductIds: string[];
  currentPage: number;
  productBulkAction: string;
  showAddProductModal: boolean;
  showEditProductModal: boolean;
  showDeleteProductModal: boolean;
  editProductForm: any | null;
  editProductId: string | null;
  deleteProductId: string | null;
  deleteFeedback: string | null;
  addProductForm: {
    name: string;
    description: string;
    longDescription: string;
    image: string;
    price: string;
    stock: string;
    category: string;
    rating: string;
    inStock: boolean;
    isBestSeller: boolean;
    careInstructions: {
      light: string;
      temperature: string;
      warnings: string;
      water: string;
    };
    specifications: {
      Difficulty: string;
      'Growth Rate': string;
      'Light Requirements': string;
      'Mature Height': string;
      'Pet Friendly': string;
      'Pot Size': string;
      [key: string]: string;
    };
    relatedProducts: string[];
    reviews: string;
  };
  showEditConfirm?: boolean;
  onSetProductSearchQuery: (query: string) => void;
  onSetProductCategoryFilter: (category: string) => void;
  onSetShowAddProductModal: (show: boolean) => void;
  onSetShowEditProductModal: (show: boolean) => void;
  onSetShowDeleteProductModal: (show: boolean) => void;
  onSetEditProductId: (id: string | null) => void;
  onSetDeleteProductId: (id: string | null) => void;
  onSetDeleteFeedback: (message: string | null) => void;
  onSetEditProductForm: (form: any) => void;
  onSetAddProductForm: (form: any) => void;
  onSetProductBulkAction: (action: string) => void;
  onSetCurrentPage: (page: number) => void;
  onSetSelectedProduct: (id: string | null) => void;
  onHandleAddProductChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onHandleAddProductSubmit: (e: React.FormEvent) => void;
  onHandleEditProductChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onHandleEditProductSubmit: (e: React.FormEvent) => void;
  onHandleSelectAllProducts: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHandleSelectProduct: (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHandleProductBulkAction: () => void;
  onHandleDeleteProduct: (id: string) => Promise<void>;
  onHandleCancelEditSave?: () => void;
  onHandleConfirmEditSave?: () => void;
  renderProductDetail?: () => React.ReactNode;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({
  selectedProduct,
  products,
  filteredProducts,
  paginatedProducts,
  productSearchQuery,
  productCategoryFilter,
  productCategories,
  selectedProductIds,
  currentPage,
  productBulkAction,
  showAddProductModal,
  showEditProductModal,
  showDeleteProductModal,
  editProductForm,
  editProductId,
  deleteProductId,
  deleteFeedback,
  addProductForm,
  showEditConfirm = false,
  onSetProductSearchQuery,
  onSetProductCategoryFilter,
  onSetShowAddProductModal,
  onSetShowEditProductModal,
  onSetShowDeleteProductModal,
  onSetEditProductId,
  onSetDeleteProductId,
  onSetDeleteFeedback,
  onSetEditProductForm,
  onSetAddProductForm,
  onSetProductBulkAction,
  onSetCurrentPage,
  onSetSelectedProduct,
  onHandleAddProductChange,
  onHandleAddProductSubmit,
  onHandleEditProductChange,
  onHandleEditProductSubmit,
  onHandleSelectAllProducts,
  onHandleSelectProduct,
  onHandleProductBulkAction,
  onHandleDeleteProduct,
  onHandleCancelEditSave,
  onHandleConfirmEditSave,
  renderProductDetail
}) => {
  const [localDeleteFeedback, setLocalDeleteFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (deleteFeedback) {
      setLocalDeleteFeedback(deleteFeedback);
      const timer = setTimeout(() => {
        setLocalDeleteFeedback(null);
        onSetDeleteFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteFeedback, onSetDeleteFeedback]);

  if (selectedProduct && renderProductDetail) {
    return <>{renderProductDetail()}</>;
  }

  // Pagination calculations
  const pageSize = 10;
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalProducts);

  let pageNumbers: (number | string)[] = [];
  if (totalPages <= 5) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPage <= 3) {
      pageNumbers = [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Products
            </h3>
            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
              <div className="relative rounded-md shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search products"
                  value={productSearchQuery}
                  onChange={e => onSetProductSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Category:</span>
                <select 
                  className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" 
                  value={productCategoryFilter} 
                  onChange={e => onSetProductCategoryFilter(e.target.value)}
                >
                  {productCategories.map((category, i) => (
                    <option key={`${category}-${i}`} value={category.replace(/ \(\d+\)$/, '')}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => onSetShowAddProductModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => onSetShowAddProductModal(false)}
                aria-label="Close"
              >
                <XIcon className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
                <PlusIcon className="h-5 w-5" /> Add New Product
              </h2>
              <form onSubmit={onHandleAddProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={addProductForm.name} 
                      onChange={onHandleAddProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea 
                      name="description" 
                      value={addProductForm.description} 
                      onChange={onHandleAddProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      rows={2} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                    <textarea 
                      name="longDescription" 
                      value={addProductForm.longDescription} 
                      onChange={onHandleAddProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      rows={3} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input 
                      type="text" 
                      name="image" 
                      value={addProductForm.image} 
                      onChange={onHandleAddProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={addProductForm.price} 
                        onChange={onHandleAddProductChange} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        min="0" 
                        step="0.01" 
                        required 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input 
                        type="number" 
                        name="stock" 
                        value={addProductForm.stock} 
                        onChange={onHandleAddProductChange} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        min="0" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
                    <input 
                      type="text" 
                      name="category" 
                      value={addProductForm.category} 
                      onChange={onHandleAddProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <input 
                        type="number" 
                        name="rating" 
                        value={addProductForm.rating} 
                        onChange={onHandleAddProductChange} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        min="0" 
                        max="5" 
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-2 mt-6">
                      <input 
                        type="checkbox" 
                        name="inStock" 
                        checked={addProductForm.inStock} 
                        onChange={onHandleAddProductChange} 
                        className="h-4 w-4 text-green-600 border-gray-300 rounded" 
                      />
                      <label className="text-sm text-gray-700">In Stock</label>
                    </div>
                    <div className="flex-1 flex items-center gap-2 mt-6">
                      <input 
                        type="checkbox" 
                        name="isBestSeller" 
                        checked={addProductForm.isBestSeller} 
                        onChange={onHandleAddProductChange} 
                        className="h-4 w-4 text-green-600 border-gray-300 rounded" 
                      />
                      <label className="text-sm text-gray-700">Best Seller</label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Care Instructions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        name="careInstructions.light" 
                        value={addProductForm.careInstructions.light} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Light" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="careInstructions.temperature" 
                        value={addProductForm.careInstructions.temperature} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Temperature" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="careInstructions.warnings" 
                        value={addProductForm.careInstructions.warnings} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Warnings" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="careInstructions.water" 
                        value={addProductForm.careInstructions.water} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Water" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        name="specifications.Difficulty" 
                        value={addProductForm.specifications.Difficulty} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Difficulty" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Growth Rate" 
                        value={addProductForm.specifications['Growth Rate']} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Growth Rate" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Light Requirements" 
                        value={addProductForm.specifications['Light Requirements']} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Light Requirements" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Mature Height" 
                        value={addProductForm.specifications['Mature Height']} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Mature Height" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Pet Friendly" 
                        value={addProductForm.specifications['Pet Friendly']} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Pet Friendly" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Pot Size" 
                        value={addProductForm.specifications['Pot Size']} 
                        onChange={onHandleAddProductChange} 
                        placeholder="Pot Size" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Related Products (IDs or paths)</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[0, 1, 2].map(i => (
                        <input 
                          key={i} 
                          type="text" 
                          name={`relatedProducts.${i}`} 
                          value={addProductForm.relatedProducts[i]} 
                          onChange={onHandleAddProductChange} 
                          placeholder={`Related Product ${i + 1}`} 
                          className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500 flex-1" 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviews (path or ID)</label>
                    <input 
                      type="text" 
                      name="reviews" 
                      value={addProductForm.reviews} 
                      onChange={onHandleAddProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end mt-6">
                  <button 
                    type="submit" 
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Feedback */}
        {localDeleteFeedback && (
          <div className="fixed top-5 right-5 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50">
            {localDeleteFeedback}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      id="select-all-products"
                      name="select-all-products"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={onHandleSelectAllProducts}
                      ref={el => { 
                        if (el) el.indeterminate = selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length; 
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        id={`select-product-${product.id}`}
                        name={`select-product-${product.id}`}
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={onHandleSelectProduct(product.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.stock}
                      {product.stock <= (product.lowStockThreshold || 5) && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {product.featured ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => onSetSelectedProduct(product.id)} 
                        className="text-green-700 hover:text-green-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          onSetEditProductId(product.id);
                          onSetEditProductForm({
                            ...product,
                            image: product.imageUrl || product.image || '',
                            price: product.price?.toString() || '',
                            stock: product.stock?.toString() || '',
                            inStock: product.inStock ?? true,
                            isBestSeller: product.isBestSeller ?? false,
                            rating: product.rating ?? 0,
                            careInstructions: {
                              light: product.careInstructions?.light || '',
                              temperature: product.careInstructions?.temperature || '',
                              warnings: product.careInstructions?.warnings || '',
                              water: product.careInstructions?.water || '',
                            },
                            specifications: {
                              Difficulty: typeof product.specifications?.Difficulty === 'string' ? product.specifications.Difficulty : '',
                              'Growth Rate': typeof product.specifications?.['Growth Rate'] === 'string' ? product.specifications['Growth Rate'] : '',
                              'Light Requirements': typeof product.specifications?.['Light Requirements'] === 'string' ? product.specifications['Light Requirements'] : '',
                              'Mature Height': typeof product.specifications?.['Mature Height'] === 'string' ? product.specifications['Mature Height'] : '',
                              'Pet Friendly': typeof product.specifications?.['Pet Friendly'] === 'string' ? product.specifications['Pet Friendly'] : '',
                              'Pot Size': typeof product.specifications?.['Pot Size'] === 'string' ? product.specifications['Pot Size'] : '',
                            },
                            relatedProducts: Array.isArray(product.relatedProducts)
                              ? product.relatedProducts.map((ref: any) =>
                                  typeof ref === "string"
                                    ? ref
                                    : String(ref.id || ref.path || "")
                                )
                              : ['', '', ''],
                            reviews: typeof product.reviews === 'string' ? product.reviews : '',
                          });
                          onSetShowEditProductModal(true);
                        }}
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-700"
                        onClick={e => {
                          e.stopPropagation();
                          onSetDeleteProductId(product.id);
                          onSetShowDeleteProductModal(true);
                        }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Product Modal */}
        {showDeleteProductModal && deleteProductId && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-10">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">Confirm Delete Product</h3>
              <p className="mb-6 text-gray-700 text-center break-words whitespace-pre-line">
                Are you sure you want to delete this product?
                <br />
                <span className="font-semibold text-red-700">This action cannot be undone.</span>
              </p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => { 
                    onSetShowDeleteProductModal(false); 
                    onSetDeleteProductId(null); 
                  }} 
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onHandleDeleteProduct(deleteProductId);
                    onSetShowDeleteProductModal(false);
                    onSetDeleteProductId(null);
                  }}
                  className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditProductModal && editProductForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Confirmation Popup */}
            {showEditConfirm && onHandleCancelEditSave && onHandleConfirmEditSave && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Save Changes</h3>
                  <p className="mb-6 text-gray-700">Are you sure you want to save changes to this product?</p>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={onHandleCancelEditSave} 
                      className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={onHandleConfirmEditSave} 
                      className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200 bg-opacity-40">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => { 
                  onSetShowEditProductModal(false); 
                  onSetEditProductForm(null); 
                  onSetEditProductId(null); 
                }}
                aria-label="Close"
              >
                <XIcon className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
                <EditIcon className="h-5 w-5" /> Edit Product
              </h2>
              <form onSubmit={onHandleEditProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={editProductForm.name} 
                      onChange={onHandleEditProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input 
                      type="text"
                      name="sku"
                      value={editProductForm.sku ?? ''}
                      onChange={onHandleEditProductChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea 
                      name="description" 
                      value={editProductForm.description} 
                      onChange={onHandleEditProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      rows={2} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                    <textarea 
                      name="longDescription" 
                      value={editProductForm.longDescription} 
                      onChange={onHandleEditProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      rows={3} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input 
                      type="text" 
                      name="image" 
                      value={editProductForm.image} 
                      onChange={onHandleEditProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={editProductForm.price} 
                        onChange={onHandleEditProductChange} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        min="0" 
                        step="0.01" 
                        required 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input 
                        type="number" 
                        name="stock" 
                        value={editProductForm.stock} 
                        onChange={onHandleEditProductChange} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        min="0" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
                    <input 
                      type="text" 
                      name="category" 
                      value={editProductForm.category} 
                      onChange={onHandleEditProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <input 
                        type="number" 
                        name="rating" 
                        value={editProductForm.rating} 
                        onChange={onHandleEditProductChange} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        min="0" 
                        max="5" 
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-2 mt-6">
                      <input 
                        type="checkbox" 
                        name="inStock" 
                        checked={editProductForm.inStock} 
                        onChange={onHandleEditProductChange} 
                        className="h-4 w-4 text-green-600 border-gray-300 rounded" 
                      />
                      <label className="text-sm text-gray-700">In Stock</label>
                    </div>
                    <div className="flex-1 flex items-center gap-2 mt-6">
                      <input 
                        type="checkbox" 
                        name="isBestSeller" 
                        checked={editProductForm.isBestSeller} 
                        onChange={onHandleEditProductChange} 
                        className="h-4 w-4 text-green-600 border-gray-300 rounded" 
                      />
                      <label className="text-sm text-gray-700">Best Seller</label>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Care Instructions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        name="careInstructions.light" 
                        value={editProductForm.careInstructions.light} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Light" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="careInstructions.temperature" 
                        value={editProductForm.careInstructions.temperature} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Temperature" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="careInstructions.warnings" 
                        value={editProductForm.careInstructions.warnings} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Warnings" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="careInstructions.water" 
                        value={editProductForm.careInstructions.water} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Water" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        name="specifications.Difficulty" 
                        value={editProductForm.specifications?.Difficulty ?? ''} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Difficulty" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Growth Rate" 
                        value={editProductForm.specifications?.['Growth Rate'] ?? ''} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Growth Rate" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Light Requirements" 
                        value={editProductForm.specifications?.['Light Requirements'] ?? ''} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Light Requirements" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Mature Height" 
                        value={editProductForm.specifications?.['Mature Height'] ?? ''} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Mature Height" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Pet Friendly" 
                        value={editProductForm.specifications?.['Pet Friendly'] ?? ''} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Pet Friendly" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                      <input 
                        type="text" 
                        name="specifications.Pot Size" 
                        value={editProductForm.specifications?.['Pot Size'] ?? ''} 
                        onChange={onHandleEditProductChange} 
                        placeholder="Pot Size" 
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" 
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Related Products (IDs or paths)</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[0, 1, 2].map(i => (
                        <input 
                          key={i} 
                          type="text" 
                          name={`relatedProducts.${i}`} 
                          value={editProductForm.relatedProducts[i]} 
                          onChange={onHandleEditProductChange} 
                          placeholder={`Related Product ${i + 1}`} 
                          className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500 flex-1" 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviews (path or ID)</label>
                    <input 
                      type="text" 
                      name="reviews" 
                      value={editProductForm.reviews} 
                      onChange={onHandleEditProductChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end mt-6">
                  <button 
                    type="submit" 
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <select
                className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={productBulkAction}
                onChange={e => onSetProductBulkAction(e.target.value)}
                aria-label="Bulk actions"
                disabled={selectedProductIds.length === 0}
              >
                <option value="">Bulk Actions</option>
                <option value="Mark as Featured">Mark as Featured</option>
                <option value="Update Stock">Update Stock</option>
                <option value="Delete Selected">Delete Selected</option>
              </select>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={onHandleProductBulkAction}
                disabled={selectedProductIds.length === 0 || !productBulkAction}
              >
                Apply
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                Showing <span className="font-medium">{totalProducts === 0 ? 0 : startIdx + 1}</span> to{' '}
                <span className="font-medium">{endIdx}</span> of{' '}
                <span className="font-medium">{totalProducts}</span>{' '}
                results
              </span>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  type="button"
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => onSetCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                </button>
                {pageNumbers.map((num, idx) =>
                  typeof num === 'number' ? (
                    <button
                      key={num}
                      type="button"
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === currentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                      onClick={() => onSetCurrentPage(num)}
                      aria-current={num === currentPage ? 'page' : undefined}
                    >
                      {num}
                    </button>
                  ) : (
                    <span key={idx} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
                  )
                )}
                <button
                  type="button"
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => onSetCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsManager;