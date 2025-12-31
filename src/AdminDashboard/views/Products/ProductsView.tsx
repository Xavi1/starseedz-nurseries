// src/AdminDashboard/views/Products/ProductsView.tsx
import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../../firebaseHelpers';
import { Product } from '../../types';
import { SearchIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon, XIcon } from 'lucide-react';
import Pagination from '../../components/Pagination';

interface ProductsViewProps {
  selectedProduct: string | null;
  setSelectedProduct: (id: string | null) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
}

const ProductsView: React.FC<ProductsViewProps> = ({
  selectedProduct, setSelectedProduct, categoryFilter, setCategoryFilter
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  
  // Additional states from the code snippet
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const [productBulkAction, setProductBulkAction] = useState('');
  const [editProductForm, setEditProductForm] = useState<any>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  
  // Add product form state
  const [addProductForm, setAddProductForm] = useState({
    name: '',
    description: '',
    longDescription: '',
    image: '',
    price: '',
    stock: '',
    category: '',
    rating: 0,
    inStock: true,
    isBestSeller: false,
    careInstructions: {
      light: '',
      temperature: '',
      warnings: '',
      water: ''
    },
    specifications: {
      Difficulty: '',
      'Growth Rate': '',
      'Light Requirements': '',
      'Mature Height': '',
      'Pet Friendly': '',
      'Pot Size': ''
    },
    relatedProducts: ['', '', ''],
    reviews: ''
  });

useEffect(() => {
    // Fetch products and map them to the UI's Product type
    getAllProducts().then((fetchedData: any[]) => {
      const mappedProducts = fetchedData.map((item) => ({
        ...item,
        // Provide defaults for missing properties required by the UI
        sku: item.sku || 'N/A',
        image: item.image || '', // Prevents undefined image errors
        inStock: item.inStock ?? (item.stock > 0),
        lowStockThreshold: item.lowStockThreshold || 5,
      }));
      setProducts(mappedProducts);
    });
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || 
                           (Array.isArray(product.category) ? 
                            product.category.includes(productCategoryFilter) : 
                            product.category === productCategoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const pageSize = 10;
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

  // Extract unique categories
  const productCategories = ['all', ...Array.from(new Set(
    products.flatMap(p => 
      Array.isArray(p.category) ? p.category : [p.category]
    ).filter(Boolean)
  ))];

  // Handlers from the code snippet
  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id: string) => () => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleProductBulkAction = () => {
    // Implementation depends on your bulk action logic
    console.log(`Bulk action ${productBulkAction} on products:`, selectedProductIds);
  };

  const handleAddProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddProductForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith('careInstructions.')) {
      const field = name.split('.')[1];
      setAddProductForm(prev => ({
        ...prev,
        careInstructions: {
          ...prev.careInstructions,
          [field]: value
        }
      }));
    } else if (name.startsWith('specifications.')) {
      const field = name.split('.')[1];
      setAddProductForm(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: value
        }
      }));
    } else if (name.startsWith('relatedProducts.')) {
      const index = parseInt(name.split('.')[1]);
      setAddProductForm(prev => {
        const newRelated = [...prev.relatedProducts];
        newRelated[index] = value;
        return {
          ...prev,
          relatedProducts: newRelated
        };
      });
    } else {
      setAddProductForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your Firebase add product logic here
    console.log('Add product:', addProductForm);
    setShowAddProductModal(false);
    // Reset form
    setAddProductForm({
      name: '',
      description: '',
      longDescription: '',
      image: '',
      price: '',
      stock: '',
      category: '',
      rating: 0,
      inStock: true,
      isBestSeller: false,
      careInstructions: {
        light: '',
        temperature: '',
        warnings: '',
        water: ''
      },
      specifications: {
        Difficulty: '',
        'Growth Rate': '',
        'Light Requirements': '',
        'Mature Height': '',
        'Pet Friendly': '',
        'Pot Size': ''
      },
      relatedProducts: ['', '', ''],
      reviews: ''
    });
  };

  const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (!editProductForm) return;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditProductForm((prev: any) => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith('careInstructions.')) {
      const field = name.split('.')[1];
      setEditProductForm((prev: any) => ({
        ...prev,
        careInstructions: {
          ...prev.careInstructions,
          [field]: value
        }
      }));
    } else if (name.startsWith('specifications.')) {
      const field = name.split('.')[1];
      setEditProductForm((prev: any) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [field]: value
        }
      }));
    } else if (name.startsWith('relatedProducts.')) {
      const index = parseInt(name.split('.')[1]);
      setEditProductForm((prev: any) => {
        const newRelated = [...prev.relatedProducts];
        newRelated[index] = value;
        return {
          ...prev,
          relatedProducts: newRelated
        };
      });
    } else {
      setEditProductForm((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditConfirm(true);
  };

  const handleConfirmEditSave = async () => {
    // Add your Firebase update logic here
    console.log('Update product:', editProductId, editProductForm);
    setShowEditConfirm(false);
    setShowEditProductModal(false);
    setEditProductForm(null);
    setEditProductId(null);
  };

  const handleCancelEditSave = () => {
    setShowEditConfirm(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderProductDetail = () => {
    // You'll need to implement this based on your ProductDetail component
    return <div>Product Detail View</div>;
  };

  const renderProductsContent = () => (
    <>
      {selectedProduct ? renderProductDetail() : (
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
                    onChange={e => setProductSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Category:</span>
                  <select 
                    className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" 
                    value={productCategoryFilter} 
                    onChange={e => setProductCategoryFilter(e.target.value)}
                  >
                    {productCategories.map((category, i) => (
                      <option key={category + '-' + i} value={category.replace(/ \(\d+\)$/, '')}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => setShowAddProductModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </button>
                
                {/* Add Product Modal */}
                {showAddProductModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200">
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowAddProductModal(false)}
                        aria-label="Close"
                      >
                        <XIcon className="h-6 w-6" />
                      </button>
                      <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" /> Add New Product
                      </h2>
                      <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Form fields from your code snippet */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input type="text" name="name" value={addProductForm.name} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <textarea name="description" value={addProductForm.description} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                            <textarea name="longDescription" value={addProductForm.longDescription} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input type="text" name="image" value={addProductForm.image} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                              <input type="number" name="price" value={addProductForm.price} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" step="0.01" required />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                              <input type="number" name="stock" value={addProductForm.stock} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
                            <input type="text" name="category" value={addProductForm.category} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                              <input type="number" name="rating" value={addProductForm.rating} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" max="5" />
                            </div>
                            <div className="flex-1 flex items-center gap-2 mt-6">
                              <input type="checkbox" name="inStock" checked={addProductForm.inStock} onChange={handleAddProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                              <label className="text-sm text-gray-700">In Stock</label>
                            </div>
                            <div className="flex-1 flex items-center gap-2 mt-6">
                              <input type="checkbox" name="isBestSeller" checked={addProductForm.isBestSeller} onChange={handleAddProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                              <label className="text-sm text-gray-700">Best Seller</label>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Care Instructions</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" name="careInstructions.light" value={addProductForm.careInstructions.light} onChange={handleAddProductChange} placeholder="Light" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="careInstructions.temperature" value={addProductForm.careInstructions.temperature} onChange={handleAddProductChange} placeholder="Temperature" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="careInstructions.warnings" value={addProductForm.careInstructions.warnings} onChange={handleAddProductChange} placeholder="Warnings" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="careInstructions.water" value={addProductForm.careInstructions.water} onChange={handleAddProductChange} placeholder="Water" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" name="specifications.Difficulty" value={addProductForm.specifications.Difficulty} onChange={handleAddProductChange} placeholder="Difficulty" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Growth Rate" value={addProductForm.specifications['Growth Rate']} onChange={handleAddProductChange} placeholder="Growth Rate" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Light Requirements" value={addProductForm.specifications['Light Requirements']} onChange={handleAddProductChange} placeholder="Light Requirements" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Mature Height" value={addProductForm.specifications['Mature Height']} onChange={handleAddProductChange} placeholder="Mature Height" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Pet Friendly" value={addProductForm.specifications['Pet Friendly']} onChange={handleAddProductChange} placeholder="Pet Friendly" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Pot Size" value={addProductForm.specifications['Pot Size']} onChange={handleAddProductChange} placeholder="Pot Size" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Related Products (IDs or paths)</label>
                            <div className="grid grid-cols-1 gap-2">
                              {[0, 1, 2].map(i => (
                                <input key={i} type="text" name={`relatedProducts.${i}`} value={addProductForm.relatedProducts[i]} onChange={handleAddProductChange} placeholder={`Related Product ${i + 1}`} className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500 flex-1" />
                              ))}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reviews (path or ID)</label>
                            <input type="text" name="reviews" value={addProductForm.reviews} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-6">
                          <button type="submit" className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Add Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
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
                        onChange={handleSelectAllProducts}
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
                          onChange={handleSelectProduct(product.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.image || '/placeholder-image.jpg'} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description?.substring(0, 50) || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(product.category) 
                        ? product.category.join(', ') 
                        : (product.category || 'Uncategorized')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock || 0}
                        {(product.stock || 0) <= (product.lowStockThreshold || 5) && (
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
                          onClick={() => setSelectedProduct(product.id)} 
                          className="text-green-700 hover:text-green-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setEditProductId(product.id);
                            setEditProductForm({
                              ...product,
                              image: product.image || product.image || '',
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
                            setShowEditProductModal(true);
                          }}
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-700"
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteProductId(product.id);
                            setShowDeleteProductModal(true);
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
          
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <select
                  className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={productBulkAction}
                  onChange={e => setProductBulkAction(e.target.value)}
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
                  onClick={handleProductBulkAction}
                  disabled={selectedProductIds.length === 0 || !productBulkAction}
                >
                  Apply
                </button>
              </div>
              
              {/* Replaced custom pagination with Pagination component */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalProducts}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {renderProductsContent()}
      
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
                  setShowDeleteProductModal(false); 
                  setDeleteProductId(null); 
                }} 
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Use Firestore instance from firebaseHelpers.js
                    const { doc, deleteDoc } = await import('firebase/firestore');
                    const { db } = await import('../../../firebase');
                    await deleteDoc(doc(db, 'products', deleteProductId));
                    setProducts(prev => prev.filter(p => p.id !== deleteProductId));
                    setShowDeleteProductModal(false);
                    setDeleteProductId(null);
                    setDeleteFeedback('Product deleted successfully.');
                    setTimeout(() => setDeleteFeedback(null), 3000);
                  } catch (err) {
                    alert('Failed to delete product.');
                    console.error('Delete error:', err);
                  }
                }}
                className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {deleteFeedback && (
        <div className="fixed top-5 right-5 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50">
          {deleteFeedback}
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditProductModal && editProductForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Confirmation Popup */}
          {showEditConfirm && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Save Changes</h3>
                <p className="mb-6 text-gray-700">Are you sure you want to save changes to this product?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={handleCancelEditSave} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                  <button onClick={handleConfirmEditSave} className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Confirm</button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => { 
                setShowEditProductModal(false); 
                setEditProductForm(null); 
                setEditProductId(null); 
              }}
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
              <EditIcon className="h-5 w-5" /> Edit Product
            </h2>
            <form onSubmit={handleEditProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" name="name" value={editProductForm.name} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" name="sku" value={editProductForm.sku ?? ''} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea name="description" value={editProductForm.description} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea name="longDescription" value={editProductForm.longDescription} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="text" name="image" value={editProductForm.image} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" name="price" value={editProductForm.price} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" step="0.01" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" name="stock" value={editProductForm.stock} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
                  <input type="text" name="category" value={editProductForm.category} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input type="number" name="rating" value={editProductForm.rating} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" max="5" />
                  </div>
                  <div className="flex-1 flex items-center gap-2 mt-6">
                    <input type="checkbox" name="inStock" checked={editProductForm.inStock} onChange={handleEditProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                    <label className="text-sm text-gray-700">In Stock</label>
                  </div>
                  <div className="flex-1 flex items-center gap-2 mt-6">
                    <input type="checkbox" name="isBestSeller" checked={editProductForm.isBestSeller} onChange={handleEditProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                    <label className="text-sm text-gray-700">Best Seller</label>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Care Instructions</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="careInstructions.light" value={editProductForm.careInstructions.light} onChange={handleEditProductChange} placeholder="Light" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="careInstructions.temperature" value={editProductForm.careInstructions.temperature} onChange={handleEditProductChange} placeholder="Temperature" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="careInstructions.warnings" value={editProductForm.careInstructions.warnings} onChange={handleEditProductChange} placeholder="Warnings" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="careInstructions.water" value={editProductForm.careInstructions.water} onChange={handleEditProductChange} placeholder="Water" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="specifications.Difficulty" value={editProductForm.specifications?.Difficulty ?? ''} onChange={handleEditProductChange} placeholder="Difficulty" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Growth Rate" value={editProductForm.specifications?.['Growth Rate'] ?? ''} onChange={handleEditProductChange} placeholder="Growth Rate" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Light Requirements" value={editProductForm.specifications?.['Light Requirements'] ?? ''} onChange={handleEditProductChange} placeholder="Light Requirements" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Mature Height" value={editProductForm.specifications?.['Mature Height'] ?? ''} onChange={handleEditProductChange} placeholder="Mature Height" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Pet Friendly" value={editProductForm.specifications?.['Pet Friendly'] ?? ''} onChange={handleEditProductChange} placeholder="Pet Friendly" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Pot Size" value={editProductForm.specifications?.['Pot Size'] ?? ''} onChange={handleEditProductChange} placeholder="Pot Size" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Related Products (IDs or paths)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[0, 1, 2].map(i => (
                      <input key={i} type="text" name={`relatedProducts.${i}`} value={editProductForm.relatedProducts[i]} onChange={handleEditProductChange} placeholder={`Related Product ${i + 1}`} className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500 flex-1" />
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviews (path or ID)</label>
                  <input type="text" name="reviews" value={editProductForm.reviews} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end mt-6">
                <button type="submit" className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsView;