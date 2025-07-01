import React from 'react';
import { Link } from 'react-router-dom';
export const Hero = () => {
  return <section className="relative bg-green-700">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="h-[500px] bg-cover bg-center" style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
    }}></div>
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-lg">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Bring Nature Home
            </h2>
            <p className="mt-3 text-xl text-white">
              Discover our curated collection of beautiful plants and garden
              supplies for your indoor and outdoor spaces.
            </p>
            <div className="mt-8 flex space-x-4">
              <Link to="/shop" className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-100 shadow-md">
                Shop Plants
              </Link>
              <a href="#" className="px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-800 hover:bg-opacity-30">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>;
};