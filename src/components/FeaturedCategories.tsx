import { Link } from 'react-router-dom';
import { allProducts } from '../data/products';

const FeaturedCategories: React.FC = () => {
  // Dynamically generate unique categories from allProducts
  const categoryMap: Record<string, { image: string; description?: string }> = {};
  allProducts.forEach(product => {
    product.category.forEach(cat => {
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          image: product.image,
          description: undefined // Optionally, you can add a description field to products and use it here
        };
      }
    });
  });
  const categories = Object.entries(categoryMap).map(([name, { image, description }]) => ({
    name,
    image,
    description: description || `Shop our selection of ${name.toLowerCase()}.`
  }));
  return <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Find the perfect plants for your space
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map(category => (
            <div key={category.name} className="group relative">
              <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden shadow-md">
                <img src={category.image} alt={category.name} className="w-full h-full object-center object-cover group-hover:opacity-90 transition-opacity duration-300" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {category.description}
                </p>
                <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className="mt-2 inline-block text-green-700 hover:text-green-800 text-sm font-medium">
                  Shop Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>;
};

export default FeaturedCategories;