import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { FilterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allProducts } from '../data/products';

export function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  // Use centralized product data
  const products = allProducts;
  // Support multiple categories per product
  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(product =>
        Array.isArray(product.category)
          ? product.category.includes(activeFilter)
          : product.category === activeFilter
      );
  // Flatten all categories for filter buttons
  const allCategories = Array.from(
    products.reduce((set, product) => {
      if (Array.isArray(product.category)) {
        product.category.forEach(cat => set.add(cat));
      } else {
        set.add(product.category);
      }
      return set;
    }, new Set<string>())
  );
  const categories = ['all', ...allCategories];
  return <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Featured Products
            </h2>
            <p className="mt-4 text-gray-600">
              Our most popular plants and gardening supplies
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center">
            <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500 mr-4">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => <button key={category} onClick={() => setActiveFilter(category)} className={`px-3 py-1 text-sm rounded-full ${activeFilter === category ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  {category === 'all' ? 'All Products' : category}
                </button>)}
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="mt-8 text-center">
          <Link to="/shop" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 shadow-sm">
            View All Products
          </Link>
        </div>
      </div>
    </section>;
}