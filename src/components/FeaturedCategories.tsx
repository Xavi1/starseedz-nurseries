import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Category {
  name: string;
  image: string;
  description: string;
}

const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);
        
        const categoryMap: Record<string, { image: string; description?: string }> = {};
        
        snapshot.forEach(doc => {
          const product = doc.data();
          // Handle category as array of strings
          if (Array.isArray(product.category)) {
            product.category.forEach((cat: string) => {
              if (!categoryMap[cat]) {
                categoryMap[cat] = {
                  image: product.image,
                  description: product.description || undefined
                };
              }
            });
          }
        });

        const formattedCategories = Object.entries(categoryMap).map(([name, { image, description }]) => ({
          name,
          image,
          description: description || `Shop our selection of ${name.toLowerCase()}.`
        }));

        setCategories(formattedCategories);
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
        setLoading(false);
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Find the perfect plants for your space
          </p>
        </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mt-12">
          {categories.map(category => (
            <div key={category.name} className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col hover:shadow-2xl transition-shadow duration-300">
              <div className="relative w-full aspect-square rounded-t-2xl overflow-hidden bg-gray-100">
                <Link 
                  to={`/shop?category=${encodeURIComponent(category.name)}`} 
                  className="block w-full h-full"
                >
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-center object-cover group-hover:opacity-90 transition-opacity duration-300" 
                  />
                </Link>
              </div>
              <div className="flex-1 flex flex-col justify-between px-6 pb-6 pt-4 text-center gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="mb-3 text-base text-gray-500 min-h-[48px]">
                    {category.description}
                  </p>
                </div>
                <Link 
                  to={`/shop?category=${encodeURIComponent(category.name)}`} 
                  className="mt-2 inline-block text-green-700 hover:text-green-800 text-base font-medium"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;