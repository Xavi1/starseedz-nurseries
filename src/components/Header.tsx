import { ShoppingCartIcon, SearchIcon, MenuIcon, XIcon, UserIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Decide where to go when user icon clicked
  const handleUserClick = () => {
    if (isLoggedIn) {
      navigate('/account');
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

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
            <Link to="/" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">Shop</Link>
            <Link to="/about" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium">Contact</Link>
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {showSearch ? (
              <input
                ref={searchInputRef}
                type="text"
                className="w-64 px-3 py-2 border border-green-500 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                placeholder="Search..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onBlur={() => setShowSearch(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
                    setShowSearch(false);
                  }
                }}
              />
            ) : (
              <button className="p-1 rounded-full text-gray-500 hover:text-black-700" onClick={() => setShowSearch(true)}>
                <SearchIcon className="h-6 w-6" />
              </button>
            )}

            <button
              className="p-1 rounded-full text-gray-500 hover:text-green-700 relative"
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
              className="p-1 rounded-full text-gray-500 hover:text-green-700"
              onClick={handleUserClick}
              aria-label="Account"
            >
              <UserIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Icons */}
          <div className="flex md:hidden items-center space-x-2">
            <button className="p-1 rounded-full text-gray-500 hover:text-green-700" onClick={() => setShowSearch(!showSearch)}>
              <SearchIcon className="h-6 w-6" />
            </button>

            <button
              className="p-1 rounded-full text-gray-500 hover:text-green-700 relative"
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
              className="p-1 rounded-full text-gray-500 hover:text-green-700"
              onClick={handleUserClick}
              aria-label="Account"
            >
              <UserIcon className="h-6 w-6" />
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-green-700">
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
