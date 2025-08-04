import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading, error } = useWishlist();
  const [user, authLoading] = useAuthState(auth);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-500">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">Please sign in to view your wishlist.</p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">Your wishlist is empty.</p>
          <Link 
            to="/shop" 
            className="inline-block px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-red-100"
                title="Remove from Wishlist"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                    {/* Loading spinner */}
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}