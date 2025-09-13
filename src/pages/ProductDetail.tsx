// ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductCard, Product } from '../components/ProductCard';
import {
  ChevronRightIcon, HomeIcon, StarIcon, ShoppingCartIcon,
  HeartIcon, LeafIcon, SunIcon, DropletIcon, ThermometerIcon,
  AlertCircleIcon, TruckIcon, RefreshCwIcon, CheckCircleIcon,
  PlusIcon, MinusIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface DetailedProduct {
  id: string;
  name: string;
  price: number;
  category: string[];
  image: string;
  rating: number;
  description: string;
  longDescription: string;
  careInstructions: {
    light: string;
    water: string;
    temperature: string;
    warnings: string;
  };
  specifications: {
    "Difficulty": string;
    "Growth Rate": string;
    "Light Requirements": string;
    "Mature Height": string;
    "Pet Friendly": string;
    "Pot Size": string;
  };
  reviews: {
    id: string;
    user: string;
    date: string;
    rating: number;
    comment: string;
  }[];
  inStock: boolean;
  quantity?: number;
  relatedProducts: Product[]; 
  isNew?: boolean;
  isBestSeller?: boolean;
}

// Development-only error boundary component
export const DevErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductDetail rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error rendering product details
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Something went wrong while displaying this product. Our team has been notified.
                  Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [wishlistAction, setWishlistAction] = useState<'added' | 'removed'>('added');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart: addToCartContext, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Sign-In Popup
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showCartSignInPopup, setShowCartSignInPopup] = useState(false);
  

useEffect(() => {
  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      console.log("Fetching product with ID:", id);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Product found:", data);

        const category = Array.isArray(data.category) ? data.category : [data.category || "Unknown"];
        const specs = data.specifications || data.specificatons || {};

        //  Fetch related product data
        const relatedRefs = data.relatedProducts || [];
        const relatedDocs = await Promise.all(
  relatedRefs.map(async (ref: any) => {
    if (!ref?.referencePath) return null;
    try {
      const productSnap = await getDoc(doc(db, ref.referencePath));
      const pd = productSnap.data();
      return productSnap.exists()
        ? {
            id: productSnap.id,
            name: pd?.name || "",
            price: pd?.price || 0,
            category: pd?.category || [],
            image: pd?.image || "",
            rating: pd?.rating || 0,
            isNew: pd?.isNew || false,
            isBestSeller: pd?.isBestSeller || false
          }
        : null;
    } catch (err) {
      console.warn("Failed to fetch related product:", err);
      return null;
    }
  })
);

// Remove nulls just in case
setRelatedProducts(relatedDocs.filter(Boolean));


        //  Fetch reviews from global collection
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('productId', '==', docRef)
        );
        const reviewsSnap = await getDocs(reviewsQuery);
        const reviews = reviewsSnap.docs.map((reviewDoc) => {
          const r = reviewDoc.data();
          return {
            id: reviewDoc.id,
            user: r.firstname?.id || 'Anonymous',
            date: r.createdAt?.toDate?.()?.toISOString().split('T')[0] || '',
            rating: r.rating,
            comment: r.comment
          };
        });

        const detailedProduct: DetailedProduct = {
          id: docSnap.id,
          name: data.name || "Unnamed Product",
          price: data.price || 0,
          category,
          image: data.image || "",
          rating: data.rating || 0,
          description: data.description || "No description available",
          longDescription: data.longDescription || data.description || "No detailed description available",
          careInstructions: {
            light: data.careInstructions?.light || "Light requirements not specified",
            water: data.careInstructions?.water || "Watering instructions not specified",
            temperature: data.careInstructions?.temperature || "Temperature requirements not specified",
            warnings: data.careInstructions?.warnings || "No special warnings"
          },
          specifications: {
            "Difficulty": specs.Difficulty || specs.difficulty || specs["difficulty"] || "Not specified",
            "Growth Rate": specs["Growth Rate"] || specs.growthRate || specs["growthRate"] || "Not specified",
            "Light Requirements": specs["Light Requirements"] || specs.lightRequirements || specs["lightRequirements"] || "Not specified",
            "Mature Height": specs["Mature Height"] || specs.matureHeight || specs["matureHeight"] || "Not specified",
            "Pet Friendly": specs["Pet Friendly"] || specs.petFriendly || specs["petFriendly"] || "Not specified",
            "Pot Size": specs["Pot Size"] || specs.potSize || specs["potSize"] || "Not specified"
          },
          reviews,
          inStock: data.inStock !== undefined ? data.inStock : true,
          quantity: data.stock || 0,
          relatedProducts: [],
          isNew: data.isNew || false,
          isBestSeller: data.isBestSeller || false
        };

        setProduct(detailedProduct);
      } else {
        console.warn("No product found for ID:", id);
        setProduct(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);

  // Convert product.id to number for context comparisons
  const productIdNum = Number(product?.id);
  const hasPurchased = cart.some(item => item.product.id === productIdNum && item.quantity > 0);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    setQuantity(newQuantity);
  };

  // Convert DetailedProduct to Product for context
  const toProduct = (d: DetailedProduct): Product => ({
    id: Number(d.id),
    name: d.name,
    price: d.price,
    category: d.category,
    image: d.image,
    rating: d.rating,
    isNew: d.isNew,
    isBestSeller: d.isBestSeller
  });

  const addToCart = () => {
    if (!user) {
      setShowCartSignInPopup(true);
      return;
    }
    if (!product) return;
    const prod = toProduct(product);
    addToCartContext(prod, quantity);
    setPopupProduct(prod);
    setShowCartPopup(true);
  };

  const handleWishlist = () => {
     if (!user) {
    setShowSignInPopup(true);
    return;
    }

    if (!product) return;
    const prod = toProduct(product);
    if (isInWishlist(prod.id)) {
      removeFromWishlist(prod.id);
      setWishlistAction('removed');
    } else {
      addToWishlist(prod);
      setWishlistAction('added');
    }
    setPopupProduct(prod);
    setShowWishlistPopup(true);
  };

  // Main render
  if (loading) {
    return (
      <main>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            Sorry, we couldn't find the product you're looking for.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <DevErrorBoundary>
        {/* Product Detail Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
              {/* Product Image */}
              <div className="lg:max-w-lg lg:self-end">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-center object-cover" />
                </div>
                {/* Additional images would go here in a real product */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="aspect-square rounded-md overflow-hidden cursor-pointer border-2 border-green-600">
                    <img src={product.image} alt={`${product.name} - Main View`} className="w-full h-full object-center object-cover" />
                  </div>
                  <div className="aspect-square rounded-md overflow-hidden cursor-pointer">
                    <img src={`https://images.unsplash.com/photo-${productIdNum === 1 ? '1614594975525-e45190c55d0b' : productIdNum === 2 ? '1593482892290-f54927ae2b7b' : productIdNum === 3 ? '1616500163246-0ffbb872f4de' : '1616784754051-4769c7a8cf5f'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60&h=500&fit=crop`} alt={`${product.name} - Side View`} className="w-full h-full object-center object-cover" />
                  </div>
                  <div className="aspect-square rounded-md overflow-hidden cursor-pointer">
                    <img src={`https://images.unsplash.com/photo-${productIdNum === 1 ? '1611000226964-c6e96070fcc3' : productIdNum === 2 ? '1593482892290-f54927ae2b7b' : productIdNum === 3 ? '1616500163246-0ffbb872f4de' : '1616784754051-4769c7a8cf5f'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60&h=500&fit=crop`} alt={`${product.name} - Detail View`} className="w-full h-full object-center object-cover" />
                  </div>
                  <div className="aspect-square rounded-md overflow-hidden cursor-pointer">
                    <img src={`https://images.unsplash.com/photo-${productIdNum === 1 ? '1620127518526-c0712f189bf6' : productIdNum === 2 ? '1593482892290-f54927ae2b7b' : productIdNum === 3 ? '1616500163246-0ffbb872f4de' : '1616784754051-4769c7a8cf5f'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60&h=500&fit=crop`} alt={`${product.name} - Lifestyle View`} className="w-full h-full object-center object-cover" />
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
                      {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                    </span>
                    {product.inStock ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>}
                    {product.inStock && typeof product.quantity === 'number' && product.quantity <= 10 && product.quantity > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Only {product.quantity} left!
                      </span>
                    )}
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
                  <div className="mt-6">
  {product.inStock ? (
    <button 
      type="button" 
      onClick={addToCart} 
      className="w-full flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800"
    >
      <ShoppingCartIcon className="h-5 w-5 mr-2" />
      Add to Cart
    </button>
  ) : (
    <div className="space-y-3">
      <button 
        type="button" 
        disabled 
        className="w-full flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-400 cursor-not-allowed"
      >
        Out of Stock
      </button>
      <button 
        type="button" 
       onClick={() => navigate(`/contact?product=${product.id}`)}
        className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Contact Sales
      </button>
    </div>
  )}
</div>
                  {/* Wishlist */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleWishlist}
                      className={`w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium ${isInWishlist(Number(product.id)) ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                      <HeartIcon className={`h-5 w-5 mr-2 ${isInWishlist(Number(product.id)) ? 'fill-red-600 text-red-600' : ''}`} />
                      {isInWishlist(Number(product.id)) ? 'Remove from Wishlist' : 'Add to Wishlist'}
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
                  id: product.reviews.length ? String(Math.max(...product.reviews.map(r => Number(r.id))) + 1) : '1',
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
  {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
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
{/* Sign In Popup */}
{showSignInPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl overflow-hidden w-96">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Sign In Required</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>You need to be signed in to add items to your wishlist.</p>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowSignInPopup(false)}
              >
                Cancel
              </button>
              <Link
                to="/login"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-700 hover:bg-green-800"
                onClick={() => setShowSignInPopup(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{showCartSignInPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl overflow-hidden w-96">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Sign In Required</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>You need to be signed in to add items to your cart.</p>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCartSignInPopup(false)}
              >
                Cancel
              </button>
              <Link
                to="/login"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-700 hover:bg-green-800"
                onClick={() => setShowCartSignInPopup(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
          </div>
        </section>
      </DevErrorBoundary>
    </main>
  );
};