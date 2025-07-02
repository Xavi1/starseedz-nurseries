import { Link } from 'react-router-dom';

export const FeaturedCategories = () => {
  const categories = [
    {
      id: 1,
      name: 'Peppers',
      image: '/img/pimentopepper.webp',
      description: 'Spice up your garden with our pepper varieties.'
    },
    {
      id: 2,
      name: 'Leafy Crops',
      image: '/img/kale.webp',
      description: 'Nutritious greens for salads and more.'
    },
    {
      id: 3,
      name: 'Herbs',
      image: '/img/chives.webp',
      description: 'Aromatic herbs for cooking and health.'
    },
    {
      id: 4,
      name: 'Curcubits',
      image: '/img/tomato.webp',
      description: 'Vigorous growers for your summer garden.'
    },
    {
      id: 5,
      name: 'Beans',
      image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=500&q=60',
      description: 'Protein-rich and easy to grow.'
    },
    {
      id: 6,
      name: 'Fruits',
      image: '/img/basil.webp',
      description: 'Sweet and healthy additions to your diet.'
    },
  ];
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
          {categories.map(category => <div key={category.id} className="group relative">
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
                <Link to="/shop" className="mt-2 inline-block text-green-700 hover:text-green-800 text-sm font-medium">
                  Shop Now →
                </Link>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};