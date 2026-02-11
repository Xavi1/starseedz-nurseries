import { SearchIcon, PlusIcon, EyeIcon, EditIcon } from 'lucide-react'; // Adjust import path as needed

export interface Product {
  id: string
  name: string
  sku?: string
  category: string | string[]
  price: number
  stock: number
  image?: string
  imageUrl?: string

  inStock?: boolean
  isBestSeller?: boolean
  rating?: number
  relatedProducts?: string[]
  specifications?: Record<string, unknown>
  careInstructions?: Record<string, unknown>
}

interface ProductsTableProps {
  selectedProduct: string | null
  renderProductDetail: () => React.ReactNode

  productSearchQuery: string
  setProductSearchQuery: React.Dispatch<React.SetStateAction<string>>

  productCategoryFilter: string
  setProductCategoryFilter: React.Dispatch<React.SetStateAction<string>>

  productCategories: string[]
  setShowAddProductModal: React.Dispatch<React.SetStateAction<boolean>>

  deleteFeedback: string | null

  selectedProductIds: string[]
  filteredProducts: Product[]
  paginatedProducts: Product[]

  handleSelectAllProducts: () => void
  handleSelectProduct: (id: string) => () => void

  setSelectedProduct: React.Dispatch<React.SetStateAction<string | null>>
  setEditProductId: React.Dispatch<React.SetStateAction<string | null>>
  setEditProductForm: React.Dispatch<React.SetStateAction<Product>>
  setShowEditProductModal: React.Dispatch<React.SetStateAction<boolean>>

  productBulkAction: string
  setProductBulkAction: React.Dispatch<React.SetStateAction<string>>
  handleProductBulkAction: () => void
}


const ProductsTable = ({
  selectedProduct,
  renderProductDetail,
  productSearchQuery,
  setProductSearchQuery,
  productCategoryFilter,
  setProductCategoryFilter,
  productCategories,
  setShowAddProductModal,
  deleteFeedback,
  selectedProductIds,
  filteredProducts,
  handleSelectAllProducts,
  paginatedProducts,
  handleSelectProduct,
  setSelectedProduct,
  setEditProductId,
  setEditProductForm,
  setShowEditProductModal,
  productBulkAction,
  setProductBulkAction,
  handleProductBulkAction,
}) => {
  if (selectedProduct !== null) {
    return renderProductDetail();
  }

  return (
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
                placeholder="Search products..."
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
                {productCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {deleteFeedback && (
        <div className="mx-4 mt-4 px-4 py-2 rounded bg-green-100 text-green-800 border border-green-300">
          {deleteFeedback}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAllProducts}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              paginatedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={handleSelectProduct(product.id)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={product.image || product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                      <span className="ml-3 text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedProduct(product.id)}
                      className="text-green-700 hover:text-green-900 mr-3"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        console.log('Edit button clicked', product);
                        setEditProductId(product.id);
                        setEditProductForm({
                          ...product,
                          sku: product.sku || product.id,
                          price: product.price || 0,
                          stock: product.stock || 0,
                          inStock: product.inStock ?? true,
                          isBestSeller: product.isBestSeller ?? false,
                          rating: product.rating || 0,
                          relatedProducts: product.relatedProducts || [],
                          specifications: product.specifications || {},
                          careInstructions: product.careInstructions || {},
                        });
                        setShowEditProductModal(true);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                      title="Edit product"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <select
              value={productBulkAction}
              onChange={e => setProductBulkAction(e.target.value)}
              className="text-sm border-gray-300 rounded-md mr-2"
              disabled={selectedProductIds.length === 0}
            >
              <option value="">Bulk Actions</option>
              <option value="Delete Selected">Delete Selected</option>
              <option value="Mark as Featured">Mark as Featured</option>
              <option value="Update Stock">Update Stock</option>
            </select>
            <button
              onClick={handleProductBulkAction}
              disabled={!productBulkAction || selectedProductIds.length === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              Apply
            </button>
          </div>
          <span className="text-sm text-gray-700">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;