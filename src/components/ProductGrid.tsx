import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { FilterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Match the Product interface with what ProductCard expects
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string[];
  rating: number;
  description?: string;
  stock?: number;
}

export function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);
        
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            // Convert string ID to number if needed
            id: String(doc.id) || Date.now(), // Fallback to timestamp if conversion fails
            name: data.name || '',
            price: data.price || 0,
            image: data.image || '',
            category: Array.isArray(data.category) ? data.category : [],
            rating: data.rating || 0,
            description: data.description,
            stock: data.stock
          } as Product;
        });

        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

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
  ).sort();

  const categories = ['all', ...allCategories];

  if (loading) {
    return (
      <section className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 text-center">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 text-left mb-2 sm:mb-0">
              Just For You
            </h2>
            <p className="mt-2 sm:mt-4 text-gray-600 text-left text-base sm:text-lg">
              Our most popular plants
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center">
            <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500 mr-4">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-3 py-1 text-sm rounded-full ${activeFilter === category ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  {category === 'all' ? 'All Products' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 shadow-sm"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}