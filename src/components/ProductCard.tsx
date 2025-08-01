import React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string | string[];
  rating: number;
  isNew?: boolean;
  isBestSeller?: boolean;
};

type ProductCardProps = {
  product: Product;
  disableLink?: boolean; // New prop to disable internal Link
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  disableLink = false
}) => {
  const categoryDisplay = Array.isArray(product.category)
    ? product.category.join(', ')
    : product.category;

  const cardContent = (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-full h-64 bg-gray-200 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {product.isNew && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            New Arrival
          </div>
        )}

        {product.isBestSeller && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Best Seller
          </div>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="bg-white p-2 rounded-full shadow hover:bg-green-50"
            onClick={(e) => e.preventDefault()}
          >
            <ShoppingCartIcon className="h-5 w-5 text-green-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm text-gray-500">{categoryDisplay}</h3>
        <h2 className="mt-1 text-base font-medium text-gray-900">{product.name}</h2>
        <div className="mt-1 flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="mt-2 text-lg font-medium text-gray-900">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return disableLink ? cardContent : <Link to={`/product/${product.id}`}>{cardContent}</Link>;
};
