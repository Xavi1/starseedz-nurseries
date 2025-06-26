import React from 'react';
export const FeaturedCategories = () => {
  const categories = [{
    id: 1,
    name: 'Indoor Plants',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Perfect for brightening up your home'
  }, {
    id: 2,
    name: 'Outdoor Plants',
    image: 'https://images.unsplash.com/photo-1599685315640-9baef9ddf4fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Transform your garden space'
  }, {
    id: 3,
    name: 'Succulents',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Low-maintenance plant friends'
  }, {
    id: 4,
    name: 'Garden Tools',
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Quality equipment for garden care'
  }];
  return <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Find the perfect plants and supplies for your space
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <a href="#" className="mt-2 inline-block text-green-700 hover:text-green-800 text-sm font-medium">
                  Shop Now →
                </a>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};