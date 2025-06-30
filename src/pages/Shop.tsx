import React, { useState } from 'react';
import { Footer } from '../components/Footer';
import { ShopSidebar } from '../components/ShopSidebar';
import { ProductCard, Product } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import { SortDropdown } from '../components/SortDropdown';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';
export const Shop = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePriceRange, setActivePriceRange] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('featured');
  // Sample product data - expanded from the existing ProductGrid component
  // Change Product type for this file only (override or locally define)
  type ShopProduct = Omit<Product, 'category'> & {
    category: string[];
  };

  const allProducts: ShopProduct[] = [
    // Homepage featured products
    {
      id: 101,
      name: 'Super Delhi Tomato Plants',
      price: 80.0,
      image: '/img/tomato.webp',
      category: ['Vegetables', 'Leafy Crops'],
      rating: 5,
      isBestSeller: true,
    },
    {
      id: 102,
      name: 'Chive',
      price: 60.0,
      image: '/img/chives.webp',
      category: ['Herbs'],
      rating: 4,
    },
    {
      id: 103,
      name: 'Fine Thyme',
      price: 60.0,
      image: '/img/thyme.webp',
      category: ['Herbs'],
      rating: 4,
    },
    {
      id: 104,
      name: 'Pimento',
      price: 60.0,
      image: '/img/pimento.webp',
      category: ['Peppers'],
      rating: 5,
    },
    {
      id: 105,
      name: 'Chilli pepper',
      price: 60.0,
      image: '/img/chilli.webp',
      category: ['Peppers'],
      rating: 4,
    },
    {
      id: 106,
      name: 'Kale',
      price: 50.0,
      image: '/img/kale.webp',
      category: ['Vegetables', 'Leafy Crops'],
      rating: 4,
    },
    {
      id: 1,
      name: 'Monstera Deliciosa',
      price: 39.99,
      image:
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Vegetables'],
      rating: 5,
      isBestSeller: true,
    },
    {
      id: 2,
      name: 'Snake Plant',
      price: 24.99,
      image:
        'https://images.unsplash.com/photo-1593482892290-f54927ae2b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Herbs'],
      rating: 4,
    },
    {
      id: 3,
      name: 'Fiddle Leaf Fig',
      price: 49.99,
      image:
        'https://images.unsplash.com/photo-1616500163246-0ffbb872f4de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Curcubits'],
      rating: 4,
    },
    {
      id: 4,
      name: 'Peace Lily',
      price: 29.99,
      image:
        'https://images.unsplash.com/photo-1616784754051-4769c7a8cf5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Beans'],
      rating: 5,
    },
    {
      id: 5,
      name: 'Lavender Plant',
      price: 15.99,
      image:
        'https://images.unsplash.com/photo-1590585735278-6edaff1c0c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Herbs'],
      rating: 4,
    },
    {
      id: 6,
      name: 'Rosemary Herb',
      price: 12.99,
      image:
        'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Herbs'],
      rating: 3,
    },
    {
      id: 7,
      name: 'Echeveria Succulent',
      price: 9.99,
      image:
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Peppers'],
      rating: 4,
      isNew: true,
    },
    {
      id: 8,
      name: 'Gardening Tool Set',
      price: 34.99,
      image:
        'https://images.unsplash.com/photo-1585513553738-84971d9c2f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Vegetables'],
      rating: 5,
    },
    {
      id: 9,
      name: 'Boston Fern',
      price: 19.99,
      image:
        'https://images.unsplash.com/photo-1600411192008-aea8c0d982eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Beans'],
      rating: 4,
    },
    {
      id: 10,
      name: 'Aloe Vera',
      price: 14.99,
      image:
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Curcubits'],
      rating: 5,
    },
    {
      id: 11,
      name: 'Tomato Plant',
      price: 8.99,
      image:
        'https://images.unsplash.com/photo-1592818868295-05bb51211373?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Vegetables'],
      rating: 4,
      isNew: true,
    },
    {
      id: 12,
      name: 'Pruning Shears',
      price: 22.99,
      image:
        'https://images.unsplash.com/photo-1623210554954-9c8ae9a6a4e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Vegetables'],
      rating: 4,
    },
    {
      id: 13,
      name: 'Potting Soil Mix',
      price: 18.99,
      image:
        'https://images.unsplash.com/photo-1562688009-b5b4646a3b2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Beans'],
      rating: 5,
    },
    {
      id: 14,
      name: 'Decorative Plant Pot',
      price: 29.99,
      image:
        'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Curcubits'],
      rating: 4,
      isNew: true,
    },
    {
      id: 15,
      name: 'Basil Herb Plant',
      price: 7.99,
      image:
        'https://images.unsplash.com/photo-1600326145552-327f74b9c189?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Herbs'],
      rating: 4,
    },
    {
      id: 16,
      name: 'Mint Herb Plant',
      price: 7.99,
      image:
        'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: ['Herbs'],
      rating: 3,
    },
  ];
  // Filter by category
  const shopCategories = [
    'Peppers',
    'Leafy Crops',
    'Herbs',
    'Curcubits',
    'Beans',
    'Fruits',
  ];
  const categoryFilteredProducts =
    activeCategory === 'all'
      ? allProducts
      : allProducts.filter(product => product.category.includes(activeCategory));
  // Filter by price
  const priceRanges = {
    all: [0, 1000],
    'under-10': [0, 9.99],
    '10-20': [10, 19.99],
    '20-30': [20, 29.99],
    '30-50': [30, 49.99],
    'over-50': [50, 1000],
  };
  const priceFilteredProducts =
    activePriceRange === 'all'
      ? categoryFilteredProducts
      : categoryFilteredProducts.filter(
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
      // featured or default
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
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Banner */}
        <div className="bg-green-700 text-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Shop Our Plants
            </h1>
            <p className="mt-6 text-xl max-w-3xl">
              Discover our curated collection of beautiful plants and garden
              supplies for your indoor and outdoor spaces.
            </p>
          </div>
        </div>
        {/* Breadcrumbs */}
        <nav className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 flex items-center space-x-2">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </a>
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
            <div className="lg:col-span-9">
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
                            : `${
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
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
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
      <Footer />
    </div>
  );
};