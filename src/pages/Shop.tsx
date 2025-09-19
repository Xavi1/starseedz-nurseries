import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopSidebar } from '../components/ShopSidebar';
import { ProductCard, Product } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import { SortDropdown } from '../components/SortDropdown';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const Shop = () => {
  const location = useLocation();
  // Get category from query string
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('category') || 'all';
  const searchQuery = params.get('search')?.toLowerCase() || '';
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activePriceRange, setActivePriceRange] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('featured');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);
        
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: Number(doc.id) || Date.now(),
            name: data.name || '',
            price: data.price || 0,
            image: data.image || '',
            category: Array.isArray(data.category) ? data.category : [],
            rating: data.rating || 0,
            description: data.description,
            stock: data.stock,
            isBestSeller: data.isBestSeller || false,
            isNew: data.isNew || false
          } as Product;
        });

        setAllProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories from products
  const shopCategories = Array.from(
  allProducts.reduce((set, product) => {
    const categories = Array.isArray(product.category) 
      ? product.category 
      : [product.category];
    categories.forEach(cat => set.add(cat));
    return set;
  }, new Set<string>())
).sort();

  // Filter by category
  const categoryFilteredProducts =
    activeCategory === 'all'
      ? allProducts
      : allProducts.filter(product => product.category.includes(activeCategory));

  // Apply search filter
  const searchFilteredProducts = searchQuery
  ? categoryFilteredProducts.filter(product => {
      const name = product.name.toLowerCase();
      const nameMatch = name.includes(searchQuery) || searchQuery.includes(name);
      
      // Ensure category is treated as array
      const categories = Array.isArray(product.category) 
        ? product.category 
        : [product.category];
      
      const categoryMatch = categories.some(cat =>
        cat.toLowerCase().includes(searchQuery) || 
        searchQuery.includes(cat.toLowerCase())
      );
      return nameMatch || categoryMatch;
    })
  : categoryFilteredProducts;

  // Filter by price
  const priceRanges = {
    all: [0, 1000],
    '20-30': [20, 29.99],
    '30-50': [30, 49.99],
    'over-50': [50, 1000],
  };

  const priceFilteredProducts =
    activePriceRange === 'all'
      ? searchFilteredProducts
      : searchFilteredProducts.filter(
          product =>
            product.price >=
              priceRanges[activePriceRange as keyof typeof priceRanges][0] &&
            product.price <=
              priceRanges[activePriceRange as keyof typeof priceRanges][1]
        );

  // Sort products
  const sortProducts = (products: Product[], option: string) => {
    switch (option) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const sortedProducts = sortProducts(priceFilteredProducts, sortOption);

  // Pagination
  const productsPerPage = 8;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setActiveCategory(params.get('category') || 'all');
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activePriceRange, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Banner */}
        <div className="hidden lg:block bg-green-700 text-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Shop For Plants
            </h1>
            <p className="mt-6 text-xl max-w-3xl">
              Discover our curated collection of beautiful plants and garden
              supplies for your indoor and outdoor spaces.
            </p>
            {/* <button
              onClick={() => {
                productGridRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-block mt-8 px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-green-100 transition"
            >
              Shop Plants
            </button> */}
          </div>
        </div>
        {/* Breadcrumbs */}
        <nav className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 flex items-center space-x-2">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <span className="text-green-700 font-medium">Shop</span>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <ShopSidebar
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                activePriceRange={activePriceRange}
                setActivePriceRange={setActivePriceRange}
                categories={shopCategories}
                priceRanges={Object.keys(priceRanges)}
                resetFilters={() => {
                  setActiveCategory('all');
                  setActivePriceRange('all');
                }}
              />
            </div>
            {/* Main content */}
            <div className="lg:col-span-9" ref={productGridRef}>
              {/* Sort and filter row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sortedProducts.length} Products
                  </h2>
                  {(activeCategory !== 'all' || activePriceRange !== 'all') && (
                    <div className="mt-1 text-sm text-gray-500">
                      Filtered by:
                      {activeCategory !== 'all' && (
                        <span className="ml-1">{activeCategory}</span>
                      )}
                      {activePriceRange !== 'all' &&
                        activeCategory !== 'all' && <span>, </span>}
                      {activePriceRange !== 'all' && (
                        <span>
                          Price:{' '}
                          {activePriceRange === 'under-10'
                            ? 'Under $10'
                            : activePriceRange === 'over-50'
                            ? 'Over $50'
                            : `$${
                                priceRanges[activePriceRange as keyof typeof priceRanges][0]
                              } - $${priceRanges[activePriceRange as keyof typeof priceRanges][1]}`}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          setActivePriceRange('all');
                        }}
                        className="ml-2 text-green-700 hover:text-green-800 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
                <SortDropdown value={sortOption} onChange={setSortOption} />
              </div>
              {/* Mobile filter button */}
              <div className="block lg:hidden mb-6">
                <ShopSidebar
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  activePriceRange={activePriceRange}
                  setActivePriceRange={setActivePriceRange}
                  categories={shopCategories}
                  priceRanges={Object.keys(priceRanges)}
                  resetFilters={() => {
                    setActiveCategory('all');
                    setActivePriceRange('all');
                  }}
                  isMobile={true}
                />
              </div>
              {/* Products grid */}
              {currentProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">
                    No products found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:mt-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentProducts.map(product => (
                    <div
                      key={product.id}
                      className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col hover:shadow-2xl transition-shadow duration-300"
                    >
                      <div className="relative w-full aspect-square rounded-t-2xl overflow-hidden bg-gray-100">
                        <Link to={`/product/${product.id}`} className="block w-full h-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-center object-cover group-hover:opacity-90 transition-opacity duration-300"
                          />
                        </Link>
                      </div>
                      <div className="flex-1 flex flex-col justify-between px-6 pb-6 pt-4 text-center gap-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <p className="mb-3 text-base text-gray-500 min-h-[48px]">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-center mt-auto">
                          <div className="text-green-700 font-bold text-lg mb-2">
                            ${product.price}
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="inline-block text-green-700 hover:text-green-800 text-base font-medium"
                          >
                            View Product →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};