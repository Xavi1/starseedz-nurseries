import { ShoppingCartIcon, SearchIcon, MenuIcon, XIcon, HeartIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-green-700">
              <Link to="/">Starseedz Nurseries</Link>
            </h1>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:ml-6 md:flex md:space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">
              Shop
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">
              About
            </Link>
            <Link to="/Contact" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">
              Contact
            </Link>
          </nav>
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {showSearch ? (
              <input
                ref={searchInputRef}
                type="text"
                className="w-64 px-3 py-2 border border-green-500 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Search..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onBlur={() => setShowSearch(false)}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
                    setShowSearch(false);
                  }
                }}
              />
            ) : (
              <button className="p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none" onClick={() => setShowSearch(true)}>
                <SearchIcon className="h-6 w-6" />
              </button>
            )}
            <button
              className="p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none relative"
              onClick={() => navigate('/cart')}
              aria-label="View cart"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none relative"
              onClick={() => navigate('/wishlist')}
              aria-label="View wishlist"
            >
              <HeartIcon className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-green-700 focus:outline-none">
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700">
              Home
            </Link>
            <Link to="/shop" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700">
              Shop
            </Link>
            <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700">
              About
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700">
              Contact
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5 space-x-4">
              <button className="p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none">
                <SearchIcon className="h-6 w-6" />
              </button>
            <button
              className="p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none relative"
              onClick={() => { setIsMenuOpen(false); navigate('/wishlist'); }}
              aria-label="View wishlist"
            >
              <HeartIcon className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              className="p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none relative"
              onClick={() => { setIsMenuOpen(false); navigate('/cart'); }}
              aria-label="View cart"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>}
    </header>
  );
};

export default Header;

