import React, { useState } from 'react';
import { ProductCard, Product } from './ProductCard';
import { FilterIcon } from 'lucide-react';
export const ProductGrid = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const products: Product[] = [{
    id: 1,
    name: 'Super Delhi Tomato Plants',
    price: 80.00,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Vegetables',
    rating: 5,
    isBestSeller: true
  }, {
    id: 2,
    name: 'Chive',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae2b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Herbs',
    rating: 4
  }, {
    id: 3,
    name: 'Fine Thyme',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1616500163246-0ffbb872f4de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Herbs',
    rating: 4
  }, {
    id: 4,
    name: 'Pimento',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1616784754051-4769c7a8cf5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Vegetables',
    rating: 5
  }, {
    id: 5,
    name: 'Chilli pepper',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1590585735278-6edaff1c0c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Vegetables',
    rating: 4
  }, 
  {
    id: 6,
    name: 'Kale',
    price: 50.00,
    image: 'https://images.unsplash.com/photo-1590585735278-6edaff1c0c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Vegetables',
    rating: 4
  }
];
  const filteredProducts = activeFilter === 'all' ? products : products.filter(product => product.category === activeFilter);
  const categories = ['all', ...new Set(products.map(product => product.category))];
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
          <a href="#" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 shadow-sm">
            View All Products
          </a>
        </div>
      </div>
    </section>;
};