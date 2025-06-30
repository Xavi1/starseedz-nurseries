import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCategories } from './components/FeaturedCategories';
import { ProductGrid } from './components/ProductGrid';
import { AboutSection } from './components/AboutSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Shop } from './pages/Shop';

export function App() {
  return (
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
            {/* Add more routes for other new components/pages as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}