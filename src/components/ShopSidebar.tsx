import React, { useState } from 'react';
import { FilterIcon, XIcon } from 'lucide-react';
type ShopSidebarProps = {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activePriceRange: string;
  setActivePriceRange: (range: string) => void;
  categories: string[];
  priceRanges: string[];
  resetFilters: () => void;
  isMobile?: boolean;
};
export const ShopSidebar: React.FC<ShopSidebarProps> = ({
  activeCategory,
  setActiveCategory,
  activePriceRange,
  setActivePriceRange,
  categories,
  priceRanges,
  resetFilters,
  isMobile = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const formatPriceRange = (range: string) => {
    switch (range) {
      case 'all':
        return 'All Prices';
      case 'under-10':
        return 'Under $10';
      case '10-20':
        return '$10 - $20';
      case '20-30':
        return '$20 - $30';
      case '30-50':
        return '$30 - $50';
      case 'over-50':
        return 'Over $50';
      default:
        return range;
    }
  };
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (isMobile) setIsOpen(false);
  };
  const handlePriceRangeClick = (range: string) => {
    setActivePriceRange(range);
    if (isMobile) setIsOpen(false);
  };
  const handleResetFilters = () => {
    resetFilters();
    if (isMobile) setIsOpen(false);
  };
  if (isMobile) {
    return <>
        <button onClick={() => setIsOpen(true)} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <FilterIcon className="h-5 w-5 mr-2" />
          Filter Products
        </button>
        {/* Mobile filter sidebar */}
        {isOpen && <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)}></div>
              <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md">
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">
                        Filters
                      </h2>
                      <button type="button" className="text-gray-400 hover:text-gray-500" onClick={() => setIsOpen(false)}>
                        <XIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Categories
                        </h3>
                        <div className="space-y-2">
                          <div className={`cursor-pointer py-2 px-3 rounded-md ${activeCategory === 'all' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} onClick={() => handleCategoryClick('all')}>
                            All Categories
                          </div>
                          {categories.map(category => <div key={category} className={`cursor-pointer py-2 px-3 rounded-md ${activeCategory === category ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} onClick={() => handleCategoryClick(category)}>
                              {category}
                            </div>)}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Price Range
                        </h3>
                        <div className="space-y-2">
                          {priceRanges.map(range => <div key={range} className={`cursor-pointer py-2 px-3 rounded-md ${activePriceRange === range ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} onClick={() => handlePriceRangeClick(range)}>
                              {formatPriceRange(range)}
                            </div>)}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <button onClick={handleResetFilters} className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium">
                          Reset All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
      </>;
  }
  return <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          <div className={`cursor-pointer py-2 px-3 rounded-md ${activeCategory === 'all' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} onClick={() => setActiveCategory('all')}>
            All Categories
          </div>
          {categories.map(category => <div key={category} className={`cursor-pointer py-2 px-3 rounded-md ${activeCategory === category ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} onClick={() => setActiveCategory(category)}>
              {category}
            </div>)}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price</h3>
        <div className="space-y-2">
          {priceRanges.map(range => <div key={range} className={`cursor-pointer py-2 px-3 rounded-md ${activePriceRange === range ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} onClick={() => setActivePriceRange(range)}>
              {formatPriceRange(range)}
            </div>)}
        </div>
      </div>
      {(activeCategory !== 'all' || activePriceRange !== 'all') && <div className="pt-4">
          <button onClick={resetFilters} className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium">
            Reset All Filters
          </button>
        </div>}
    </div>;
};