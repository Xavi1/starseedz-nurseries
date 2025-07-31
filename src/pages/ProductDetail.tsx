// ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard, Product } from '../components/ProductCard';
import {
  ChevronRightIcon, HomeIcon, StarIcon, ShoppingCartIcon,
  HeartIcon, LeafIcon, SunIcon, DropletIcon, ThermometerIcon,
  AlertCircleIcon, TruckIcon, RefreshCwIcon, CheckCircleIcon,
  PlusIcon, MinusIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface DetailedProduct extends Product {
  description: string;
  longDescription: string;
  careInstructions: {
    light: string;
    water: string;
    temperature: string;
    warnings: string;
  };
 specifications: {
    "Mature Height"?: string;
    "Growth Rate"?: string;
    "Pot Size"?: string;
    Difficulty?: string;
    "Light Requirements"?: string;
    "Pet Friendly"?: string;
  };
  reviews: {
    id: number;
    user: string;
    date: string;
    rating: number;
    comment: string;
  }[];
  inStock: boolean;
  quantity?: number;
  relatedProducts: number[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);    const [wishlistAction, setWishlistAction] = useState<'added' | 'removed'>('added');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart: addToCartContext, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
   // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
  if (!id) return;
  setLoading(true);
  
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Debug: Log the raw specifications from Firestore
      console.log('Raw specifications from Firestore:', data.specifications);
      
      // Handle the Map data
      const specsFromFirestore = data.specifications || {};
      
      setProduct({
        ...(data as DetailedProduct),
        specifications: {
          "Difficulty": specsFromFirestore["Difficulty"] || "Not specified",
          "Growth Rate": specsFromFirestore["Growth Rate"] || "Not specified",
          "Light Requirements": specsFromFirestore["Light Requirements"] || "Not specified",
          "Mature Height": specsFromFirestore["Mature Height"] || "Not specified",
          "Pet Friendly": specsFromFirestore["Pet Friendly"] || "Not specified", 
          "Pot Size": specsFromFirestore["Pot Size"] || "Not specified"
        }
      });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  } finally {
    setLoading(false);
  }
};

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (product) {
      addToCartContext(product, quantity);
      setPopupProduct(product);
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 3000);
    }
  };

  const handleWishlist = () => {
    if (product) {
      isInWishlist(product.id)
        ? removeFromWishlist(product.id)
        : addToWishlist(product);
    }
  };
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) return;
    setQuantity(newQuantity);
  };

   // Only allow review if user has purchased this product (in cart with quantity > 0)
  const hasPurchased = cart.some(item => item.product.id === product?.id && item.quantity > 0);


   return (
      <div className="min-h-screen bg-white">
        <main>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading product details...</p>
              </div>
            </div>
          ) : !product ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Product Not Found
              </h2>
              <p className="mt-2 text-gray-600">
                Sorry, we couldn't find the product you're looking for.
              </p>
              <div className="mt-6">
                <Link to="/shop" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800">
                  Return to Shop
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Breadcrumbs */}
              <nav className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="py-3 flex items-center space-x-2 text-sm">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                      <HomeIcon className="h-4 w-4 mr-1" />
                      Home
                    </Link>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    <Link to="/shop" className="text-gray-500 hover:text-gray-700">
                      Shop
                    </Link>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    <Link to={`/shop?category=${product.category}`} className="text-gray-500 hover:text-gray-700">
                      {product.category}
                    </Link>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-green-700 font-medium truncate">
                      {product.name}
                    </span>
                  </div>
                </div>
              </nav>
              {/* Product Detail Section */}
              <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
                    {/* Product Image */}
                    <div className="lg:max-w-lg lg:self-end">
                      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-center object-cover" />
                      </div>
                      {/* Additional images would go here in a real product */}
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer border-2 border-green-600">
                          <img src={product.image} alt={`${product.name} - Main View`} className="w-full h-full object-center object-cover" />
                        </div>
                        <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer">
                          <img src={`https://images.unsplash.com/photo-${product.id === 1 ? '1614594975525-e45190c55d0b' : product.id === 2 ? '1593482892290-f54927ae2b7b' : product.id === 3 ? '1616500163246-0ffbb872f4de' : '1616784754051-4769c7a8cf5f'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60&h=500&fit=crop`} alt={`${product.name} - Side View`} className="w-full h-full object-center object-cover" />
                        </div>
                        <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer">
                          <img src={`https://images.unsplash.com/photo-${product.id === 1 ? '1611000226964-c6e96070fcc3' : product.id === 2 ? '1593482892290-f54927ae2b7b' : product.id === 3 ? '1616500163246-0ffbb872f4de' : '1616784754051-4769c7a8cf5f'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60&h=500&fit=crop`} alt={`${product.name} - Detail View`} className="w-full h-full object-center object-cover" />
                        </div>
                        <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer">
                          <img src={`https://images.unsplash.com/photo-${product.id === 1 ? '1620127518526-c0712f189bf6' : product.id === 2 ? '1593482892290-f54927ae2b7b' : product.id === 3 ? '1616500163246-0ffbb872f4de' : '1616784754051-4769c7a8cf5f'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60&h=500&fit=crop`} alt={`${product.name} - Lifestyle View`} className="w-full h-full object-center object-cover" />
                        </div>
                      </div>
                    </div>
                    {/* Product Info */}
                    <div className="mt-10 lg:mt-0 lg:col-start-2">
                      <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                          {product.name}
                        </h1>
                        {/* Price */}
                        <div className="mt-3">
                          <h2 className="sr-only">Product information</h2>
                          <p className="text-3xl text-gray-900">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        {/* Rating */}
                        <div className="mt-3">
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map(rating => <StarIcon key={rating} className={`${product.rating > rating ? 'text-yellow-400' : 'text-gray-300'} h-5 w-5 flex-shrink-0`} aria-hidden="true" />)}
                          </div>
                          <p className="ml-3 text-sm text-gray-500">
                            {product.reviews.length} reviews
                          </p>
                        </div>
                        {/* Badges */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {product.isNew && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              New Arrival
                            </span>}
                          {product.isBestSeller && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Best Seller
                            </span>}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                          {product.inStock ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              In Stock
                            </span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of Stock
                            </span>}
                        </div>
                        {/* Description */}
                        <div className="mt-6">
                          <h3 className="sr-only">Description</h3>
                          <p className="text-base text-gray-700">
                            {product.description}
                          </p>
                        </div>
                        {/* Quick Care */}
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-900">
                            Quick Care Guide
                          </h3>
                          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3">
                              <SunIcon className="h-6 w-6 text-green-700" />
                              <span className="mt-1 text-xs text-center">
                                {product.careInstructions.light.split('.')[0]}
                              </span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3">
                              <DropletIcon className="h-6 w-6 text-green-700" />
                              <span className="mt-1 text-xs text-center">
                                {product.careInstructions.water.split('.')[0]}
                              </span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3">
                              <ThermometerIcon className="h-6 w-6 text-green-700" />
                              <span className="mt-1 text-xs text-center">
                                {product.careInstructions.temperature.split('.')[0]}
                              </span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3">
                              <AlertCircleIcon className="h-6 w-6 text-amber-500" />
                              <span className="mt-1 text-xs text-center">
                                {product.careInstructions.warnings.split('.')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Quantity */}
                        <div className="mt-6">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900 mr-3">
                              Quantity:
                            </h3>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button type="button" onClick={() => handleQuantityChange(quantity - 1)} className="p-2 text-gray-500 hover:text-gray-600" disabled={quantity <= 1}>
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-1 text-gray-900">
                                {quantity}
                              </span>
                              <button type="button" onClick={() => handleQuantityChange(quantity + 1)} className="p-2 text-gray-500 hover:text-gray-600" disabled={quantity >= 10}>
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* Add to cart */}
                        <div className="mt-6">
                          <button type="button" onClick={addToCart} disabled={!product.inStock} className={`w-full flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${product.inStock ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'}`}>
                            <ShoppingCartIcon className="h-5 w-5 mr-2" />
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                        {/* Wishlist */}
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={handleWishlist}
                            className={`w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium ${isInWishlist(product.id) ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                          >
                            <HeartIcon className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? 'fill-red-600 text-red-600' : ''}`} />
                            {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          </button>
                        </div>
                        {/* Shipping & Returns */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                          <div className="flex items-center">
                            <TruckIcon className="h-5 w-5 text-green-700" />
                            <span className="ml-2 text-sm text-gray-500">
                              Free shipping on orders over $50
                            </span>
                          </div>
                          <div className="mt-2 flex items-center">
                            <RefreshCwIcon className="h-5 w-5 text-green-700" />
                            <span className="ml-2 text-sm text-gray-500">
                              30-day returns policy
                            </span>
                          </div>
                          <div className="mt-2 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-700" />
                            <span className="ml-2 text-sm text-gray-500">
                              Quality guarantee
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Product Details Tabs */}
                  <div className="mt-16">
                    <div className="border-b border-gray-200">
                      <div className="relative">
                        <div className="flex space-x-8 overflow-x-auto no-scrollbar sm:overflow-visible">
                          <button onClick={() => setActiveTab('description')} className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'description' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Description
                          </button>
                          <button onClick={() => setActiveTab('care')} className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'care' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Care Instructions
                          </button>
                          <button onClick={() => setActiveTab('specifications')} className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'specifications' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Specifications
                          </button>
                          <button onClick={() => setActiveTab('reviews')} className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Reviews ({product.reviews.length})
                          </button>
                        </div>
                        {/* Right edge gradient for scroll hint on mobile */}
                        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white via-white/80 to-transparent sm:hidden" />
                      </div>
                    </div>
  
                    {/* Tab Content */}
                    <div className="py-6">
                      {activeTab === 'description' && <div className="prose prose-green max-w-none">
                          <p>{product.longDescription}</p>
        </div>}
        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowReviewModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setReviewError("");
                  if (!reviewName.trim() || !reviewComment.trim()) {
                    setReviewError("Please fill in all fields.");
                    return;
                  }
                  if (!product) return;
                  setReviewSubmitting(true);
                  // Simulate API delay
                  setTimeout(() => {
                    const newReview = {
                      id: product.reviews.length ? Math.max(...product.reviews.map(r => r.id)) + 1 : 1,
                      user: reviewName,
                      date: new Date().toISOString().slice(0, 10),
                      rating: parseInt(reviewRating),
                      comment: reviewComment
                    };
                    // Add review to product state
                    setProduct({
                      ...product,
                      reviews: [newReview, ...product.reviews],
                      rating: Math.round(((product.rating * product.reviews.length + newReview.rating) / (product.reviews.length + 1)) * 10) / 10
                    });
                    setShowReviewModal(false);
                    setReviewName("");
                    setReviewRating("5");
                    setReviewComment("");
                    setReviewSubmitting(false);
                  }, 600);
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    disabled={reviewSubmitting}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={reviewRating}
                    onChange={e => setReviewRating(e.target.value)}
                    disabled={reviewSubmitting}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows={4}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    disabled={reviewSubmitting}
                  ></textarea>
                </div>
                {reviewError && <div className="mb-2 text-red-600 text-sm">{reviewError}</div>}
                <button
                  type="submit"
                  className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:opacity-60"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        )}
                      {activeTab === 'care' && <div className="space-y-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <SunIcon className="h-6 w-6 text-green-700" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-base font-medium text-gray-900">
                                Light
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {product.careInstructions.light}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <DropletIcon className="h-6 w-6 text-green-700" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-base font-medium text-gray-900">
                                Water
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {product.careInstructions.water}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <ThermometerIcon className="h-6 w-6 text-green-700" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-base font-medium text-gray-900">
                                Temperature
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {product.careInstructions.temperature}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <AlertCircleIcon className="h-6 w-6 text-amber-500" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-base font-medium text-gray-900">
                                Warnings
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {product.careInstructions.warnings}
                              </p>
                            </div>
                          </div>
                        </div>}
                      {activeTab === 'specifications' && (
  <div className="border-t border-gray-200">
    <dl>
      {product.specifications && [
        { key: "Difficulty", value: product.specifications.Difficulty },
        { key: "Growth Rate", value: product.specifications["Growth Rate"] },
        { key: "Light Requirements", value: product.specifications["Light Requirements"] },
        { key: "Mature Height", value: product.specifications["Mature Height"] },
        { key: "Pet Friendly", value: product.specifications["Pet Friendly"] },
        { key: "Pot Size", value: product.specifications["Pot Size"] }
      ].map(({key, value}, index) => (
        <div 
          key={key} 
          className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
        >
          <dt className="text-sm font-medium text-gray-500">
            {key}
          </dt>
          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {value || "Not specified"}
          </dd>
        </div>
      ))}
    </dl>
  </div>
)}
                      {activeTab === 'reviews' && <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              Customer Reviews
                            </h3>
                            <button
                              className={`text-sm font-medium ${hasPurchased ? 'text-green-700 hover:text-green-800' : 'text-gray-400 cursor-not-allowed'}`}
                              onClick={() => hasPurchased && setShowReviewModal(true)}
                              disabled={!hasPurchased}
                              title={hasPurchased ? '' : 'You can only review products you have purchased.'}
                            >
                              Write a review
                            </button>
                          </div>
                          <div className="border-t border-b border-gray-200 py-6">
                            <div className="flex items-center">
                              <div>
                                <div className="flex items-center">
                                  {[0, 1, 2, 3, 4].map(rating => <StarIcon key={rating} className={`${product.rating > rating ? 'text-yellow-400' : 'text-gray-300'} h-5 w-5 flex-shrink-0`} aria-hidden="true" />)}
                                </div>
                                <p className="sr-only">
                                  {product.rating} out of 5 stars
                                </p>
                              </div>
                              <p className="ml-3 text-sm text-gray-500">
                                Based on {product.reviews.length} reviews
                              </p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            {product.reviews.map(review => <div key={review.id} className="border-b border-gray-200 pb-6">
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center">
                                    {[0, 1, 2, 3, 4].map(rating => <StarIcon key={rating} className={`${review.rating > rating ? 'text-yellow-400' : 'text-gray-300'} h-4 w-4 flex-shrink-0`} aria-hidden="true" />)}
                                  </div>
                                  <h4 className="ml-2 text-sm font-medium text-gray-900">
                                    {review.user}
                                  </h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                  {review.date}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {review.comment}
                                </p>
                              </div>)}
                          </div>
                        </div>}
                    </div>
                  </div>
                  {/* Related Products */}
                  <div className="mt-16">
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                      Related Products
                    </h2>
                    <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                      {relatedProducts.map(relatedProduct => <Link to={`/product/${relatedProduct.id}`} key={relatedProduct.id}>
                          <ProductCard product={relatedProduct} />
                        </Link>)}
                    </div>
                  </div>
                 {/* Cart Added Popup */}
  {showCartPopup && (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-500 ease-out transform cart-popup-enter-active pointer-events-auto">
      {popupProduct && (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-green-200 w-80 pointer-events-auto">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={popupProduct.image} 
                  alt={popupProduct.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                  <h3 className="text-sm font-medium text-green-700">
                    Added to your cart
                  </h3>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {popupProduct.name}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {quantity} × ${popupProduct.price.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors duration-150"
                onClick={() => setShowCartPopup(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setShowCartPopup(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-150"
            >
              Continue shopping
            </button>
            <Link 
              to="/cart" 
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 transition-colors duration-150"
              onClick={() => setShowCartPopup(false)}
            >
              View cart
            </Link>
          </div>
        </div>
      )}
    </div>
  )}
  {/* Wishlist Popup */}
  {showWishlistPopup && (
    <div className="fixed bottom-4 right-4 z-40 transition-all duration-500 ease-out transform cart-popup-enter-active pointer-events-auto">
      {popupProduct && (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-green-200 w-80 pointer-events-auto">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={popupProduct.image} 
                  alt={popupProduct.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <CheckCircleIcon className={`h-4 w-4 ${wishlistAction === 'added' ? 'text-green-600' : 'text-red-500'} mr-1`} />
                  <h3 className={`text-sm font-medium ${wishlistAction === 'added' ? 'text-green-700' : 'text-red-600'}`}>
                    {wishlistAction === 'added' ? 'Added to wishlist' : 'Removed from wishlist'}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {popupProduct.name}
                </p>
              </div>
              <button
                type="button"
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors duration-150"
                onClick={() => setShowWishlistPopup(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex justify-end">
            <Link 
              to="/wishlist" 
              className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors duration-150"
              onClick={() => setShowWishlistPopup(false)}
            >
              View wishlist
            </Link>
          </div>
        </div>
      )}
    </div>
  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    );
};
