import React from 'react';
import { PackageIcon, EyeIcon, EditIcon, Trash2Icon } from 'lucide-react';

type ProductsListProps = {
  products: any[];
  filteredProducts: any[];
  productCategoryFilter: string;
  setProductCategoryFilter: (filter: string) => void;
  selectedProduct: number | null;
  setSelectedProduct: (id: number | null) => void;
};

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  filteredProducts,
  productCategoryFilter,
  setProductCategoryFilter,
  selectedProduct,
  setSelectedProduct
}) => {
  // Extract unique categories from products
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

  const getStockStatusClass = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <PackageIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Products Inventory</h2>
        </div>
        
        {/* Category Filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700">
            Filter by Category:
          </label>
          <select
            id="categoryFilter"
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
          {productCategoryFilter && ` (filtered by ${productCategoryFilter})`}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product.id)}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedProduct === product.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Product Image */}
            <div className="bg-gray-100 rounded-lg h-40 mb-4 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <PackageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{product.category}</span>
                <span className="text-sm font-semibold text-blue-600">
                  ${product.price?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusClass(product.stock)}`}>
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                </span>
                {product.onSale && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    On Sale
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                  <EditIcon className="h-4 w-4"/>
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {productCategoryFilter 
              ? `No products match the "${productCategoryFilter}" category.`
              : 'No products available in inventory.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsList;