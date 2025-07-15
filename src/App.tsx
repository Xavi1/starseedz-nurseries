
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { Hero } from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import { ProductGrid } from './components/ProductGrid';
import { AboutSection } from './components/AboutSection';
import { Newsletter } from './components/Newsletter';
import Footer from './components/Footer';
import { Shop } from './pages/Shop';
import { About } from './pages/About';
import { ProductDetail } from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Cart } from './pages/Cart';
import ContactPage from './pages/Contact';
import WishlistPage from './pages/Wishlist';
import FAQPage from './pages/FAQ';
import PrivacyPolicyPage from './pages/PrivacyPolicy';
import TermsOfServicePage from './pages/TermsOfService';
import ShippingPolicyPage from './pages/ShippingPolicy';

export function App() {
  return (
    <div className="overflow-x-hidden">
    <WishlistProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero />
                    <FeaturedCategories />
                    <ProductGrid />
                    <AboutSection />
                    <Newsletter />
                  </>
                } />
                <Route path="/shop" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </WishlistProvider>
    </div>
  );
}

