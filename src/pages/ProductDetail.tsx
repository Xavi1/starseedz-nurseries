import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard, Product } from '../components/ProductCard';
import { ChevronRightIcon, HomeIcon, StarIcon, ShoppingCartIcon, HeartIcon, LeafIcon, SunIcon, ThermometerIcon, AlertCircleIcon, TruckIcon, RefreshCwIcon, CheckCircleIcon, PlusIcon, MinusIcon } from 'lucide-react';
import { allProducts, ShopProduct } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
// Extended product type with additional details for the product page
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
    [key: string]: string;
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
}
export const ProductDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewModal, setShowReviewModal] = useState(false);
  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  // Detailed product data for extra info (could be merged into allProducts in the future)
  // Detailed product data for all products (generated for demo purposes)
  const detailedProductsData: {
    [key: number]: Omit<DetailedProduct, keyof Product> & { id: number };
  } = {
    101: {
      id: 101,
      description: 'High-yielding tomato plants ideal for home gardens.',
      longDescription: 'Super Delhi Tomato Plants produce large, flavorful tomatoes perfect for salads and cooking. These plants are disease-resistant and thrive in sunny locations. Great for both beginners and experienced gardeners.',
      careInstructions: {
        light: 'Full sun. At least 6-8 hours of direct sunlight daily.',
        water: 'Keep soil consistently moist but not soggy. Water at the base to avoid wetting leaves.',
        temperature: 'Prefers 65-85°F (18-29°C). Protect from frost.',
        warnings: 'Support with stakes or cages as plants grow. Watch for pests.'
      },
      specifications: {
        'Mature Height': '4-6 feet',
        'Growth Rate': 'Fast',
        'Pot Size': '12 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Anna G.', date: '2024-06-10', rating: 5, comment: 'Best tomatoes I have ever grown!' },
        { id: 2, user: 'Ben S.', date: '2024-05-22', rating: 4, comment: 'Vigorous plants, lots of fruit.' }
      ],
      inStock: true,
      relatedProducts: [102, 106, 1]
    },
    102: {
      id: 102,
      description: 'Mild onion-flavored herb for culinary use.',
      longDescription: 'Chives are easy to grow and add a delicate onion flavor to dishes. They are perennial and can be harvested multiple times a season. Great for borders and container gardens.',
      careInstructions: {
        light: 'Full sun to partial shade.',
        water: 'Water regularly, keep soil moist but not soggy.',
        temperature: 'Prefers 60-75°F (16-24°C).',
        warnings: 'Divide clumps every few years for best growth.'
      },
      specifications: {
        'Mature Height': '12-18 inches',
        'Growth Rate': 'Moderate',
        'Pot Size': '6 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun to partial shade',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Sam T.', date: '2024-05-01', rating: 5, comment: 'Perfect for my kitchen window.' }
      ],
      inStock: true,
      relatedProducts: [103, 15, 16]
    },
    103: {
      id: 103,
      description: 'Aromatic thyme variety for cooking and garnish.',
      longDescription: 'Fine Thyme is a compact, fragrant herb that thrives in containers and garden beds. Its leaves are perfect for seasoning meats, soups, and vegetables.',
      careInstructions: {
        light: 'Full sun.',
        water: 'Allow soil to dry between waterings. Drought tolerant once established.',
        temperature: 'Prefers 65-80°F (18-27°C).',
        warnings: 'Avoid overwatering. Prune regularly.'
      },
      specifications: {
        'Mature Height': '6-12 inches',
        'Growth Rate': 'Slow',
        'Pot Size': '6 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Lily M.', date: '2024-04-18', rating: 4, comment: 'Very fragrant and easy to grow.' }
      ],
      inStock: true,
      relatedProducts: [102, 15, 16]
    },
    104: {
      id: 104,
      description: 'Sweet, mild pepper variety for fresh eating.',
      longDescription: 'Pimento peppers are known for their sweet flavor and thick flesh. Great for stuffing, roasting, or eating raw. Plants are productive and easy to grow.',
      careInstructions: {
        light: 'Full sun.',
        water: 'Keep soil evenly moist. Do not let dry out completely.',
        temperature: 'Prefers 70-85°F (21-29°C).',
        warnings: 'Stake plants if heavy with fruit.'
      },
      specifications: {
        'Mature Height': '18-24 inches',
        'Growth Rate': 'Moderate',
        'Pot Size': '10 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Carlos R.', date: '2024-06-01', rating: 5, comment: 'Delicious and productive.' }
      ],
      inStock: true,
      relatedProducts: [105, 106, 101]
    },
    105: {
      id: 105,
      description: 'Spicy pepper for culinary heat and color.',
      longDescription: 'Chilli pepper plants produce abundant, spicy fruit. Use fresh, dried, or pickled. Great for salsas and hot sauces.',
      careInstructions: {
        light: 'Full sun.',
        water: 'Water regularly, allow top inch of soil to dry between waterings.',
        temperature: 'Prefers 70-90°F (21-32°C).',
        warnings: 'Wear gloves when handling hot peppers.'
      },
      specifications: {
        'Mature Height': '18-30 inches',
        'Growth Rate': 'Fast',
        'Pot Size': '10 inches+',
        Difficulty: 'Moderate',
        'Light Requirements': 'Full sun',
        'Pet Friendly': 'No (spicy!)'
      },
      reviews: [
        { id: 1, user: 'Derek F.', date: '2024-05-15', rating: 5, comment: 'Very spicy and productive.' }
      ],
      inStock: true,
      relatedProducts: [104, 106, 101]
    },
    106: {
      id: 106,
      description: 'Nutritious leafy green for salads and cooking.',
      longDescription: 'Kale is a hardy, cool-season crop packed with vitamins. Great for salads, smoothies, and sautés. Easy to grow in most climates.',
      careInstructions: {
        light: 'Full sun to partial shade.',
        water: 'Keep soil moist. Mulch to retain moisture.',
        temperature: 'Prefers 55-75°F (13-24°C).',
        warnings: 'Watch for cabbage worms and aphids.'
      },
      specifications: {
        'Mature Height': '12-18 inches',
        'Growth Rate': 'Fast',
        'Pot Size': '12 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun to partial shade',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Nina P.', date: '2024-04-30', rating: 5, comment: 'Grows fast and tastes great.' }
      ],
      inStock: true,
      relatedProducts: [101, 104, 105]
    },
    1: {
      id: 1,
      description: 'A popular tropical houseplant with iconic split leaves.',
      longDescription: 'The Monstera Deliciosa, also known as the Swiss Cheese Plant, is famous for its unique split leaves and is a favorite among plant enthusiasts. Native to the tropical forests of southern Mexico, this plant can grow quite large and makes a stunning statement piece in any room. Its air-purifying qualities and relatively easy care make it a popular choice for both beginners and experienced plant owners.',
      careInstructions: {
        light: 'Bright indirect light. Can tolerate medium light but may grow slower.',
        water: 'Allow soil to dry out between waterings. Water thoroughly when the top 2-3 inches of soil feel dry.',
        temperature: 'Prefers temperatures between 65-85°F (18-29°C). Keep away from cold drafts.',
        warnings: 'Toxic to pets if ingested. Keep away from children and animals.'
      },
      specifications: {
        'Mature Height': '3-8 feet indoors',
        'Growth Rate': 'Moderate to fast',
        'Pot Size': '8 inches',
        Difficulty: 'Easy to moderate',
        'Light Requirements': 'Medium to bright indirect light',
        'Pet Friendly': 'No - toxic to cats and dogs'
      },
      reviews: [
        { id: 1, user: 'Emily R.', date: '2023-08-15', rating: 5, comment: 'Beautiful, healthy plant! Arrived well-packaged with no damage. Already seeing new growth after just a few weeks.' },
        { id: 2, user: 'Michael T.', date: '2023-07-28', rating: 4, comment: 'Great plant, slightly smaller than I expected but very healthy. The care instructions were helpful.' },
        { id: 3, user: 'Sarah K.', date: '2023-06-10', rating: 5, comment: 'This Monstera is thriving in my living room! The leaves are gorgeous and it arrived in perfect condition.' }
      ],
      inStock: true,
      relatedProducts: [102, 106, 6]
    },
    6: {
      id: 6,
      description: 'Aromatic Mediterranean herb for cooking.',
      longDescription: 'Rosemary is a fragrant, evergreen herb used in a variety of dishes. It thrives in well-drained soil and full sun. Drought tolerant once established.',
      careInstructions: {
        light: 'Full sun.',
        water: 'Allow soil to dry between waterings. Do not overwater.',
        temperature: 'Prefers 60-80°F (16-27°C).',
        warnings: 'Prune regularly to encourage bushy growth.'
      },
      specifications: {
        'Mature Height': '2-3 feet',
        'Growth Rate': 'Moderate',
        'Pot Size': '8 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Olga V.', date: '2024-05-12', rating: 4, comment: 'Great for my kitchen garden.' }
      ],
      inStock: true,
      relatedProducts: [15, 16, 102]
    },
    15: {
      id: 15,
      description: 'Classic basil variety for Italian cuisine.',
      longDescription: 'Basil Herb Plant is a must-have for any kitchen garden. Its aromatic leaves are perfect for pesto, salads, and sauces. Easy to grow in pots or garden beds.',
      careInstructions: {
        light: 'Full sun.',
        water: 'Keep soil moist but not soggy. Pinch flowers to encourage leaf growth.',
        temperature: 'Prefers 70-90°F (21-32°C).',
        warnings: 'Sensitive to cold. Harvest leaves regularly.'
      },
      specifications: {
        'Mature Height': '12-24 inches',
        'Growth Rate': 'Fast',
        'Pot Size': '8 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Mario L.', date: '2024-06-02', rating: 5, comment: 'Best basil for my pasta!' }
      ],
      inStock: true,
      relatedProducts: [16, 102, 6]
    },
    16: {
      id: 16,
      description: 'Refreshing mint plant for teas and desserts.',
      longDescription: 'Mint Herb Plant is easy to grow and spreads quickly. Use fresh leaves in teas, desserts, and salads. Best grown in containers to control spreading.',
      careInstructions: {
        light: 'Full sun to partial shade.',
        water: 'Keep soil moist. Do not let dry out.',
        temperature: 'Prefers 60-80°F (16-27°C).',
        warnings: 'Can become invasive if not contained.'
      },
      specifications: {
        'Mature Height': '12-18 inches',
        'Growth Rate': 'Fast',
        'Pot Size': '8 inches+',
        Difficulty: 'Easy',
        'Light Requirements': 'Full sun to partial shade',
        'Pet Friendly': 'Yes'
      },
      reviews: [
        { id: 1, user: 'Sophie W.', date: '2024-05-20', rating: 5, comment: 'Perfect for mojitos!' }
      ],
      inStock: true,
      relatedProducts: [15, 102, 6]
    }
  };
  useEffect(() => {
    // Simulate API call to get product details
    const getProductDetails = () => {
      setLoading(true);
      setTimeout(() => {
        if (!id) {
          setLoading(false);
          return;
        }
    const productId = parseInt(id);
    // Find product from shared data (category is string[])
    const basicProduct = allProducts.find(p => p.id === productId);
    const detailedProductData = detailedProductsData[productId];
    if (basicProduct && detailedProductData) {
      // Merge category as string for legacy compatibility in UI
      const mergedProduct: DetailedProduct = {
        ...basicProduct,
        ...detailedProductData,
        category: Array.isArray(basicProduct.category) ? basicProduct.category.join(', ') : basicProduct.category,
        quantity: 1
      };
      setProduct(mergedProduct);
      // Related products (from shared data)
      if (detailedProductData.relatedProducts) {
        const related = allProducts.filter(p => detailedProductData.relatedProducts.includes(p.id));
        setRelatedProducts(related.map(rp => ({
          ...rp,
          category: Array.isArray(rp.category) ? rp.category.join(', ') : rp.category
        })));
      }
    }
    setLoading(false);
      }, 500); // Simulate network delay
    };
    getProductDetails();
  }, [id]);
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) return;
    setQuantity(newQuantity);
  };
  // Use cart context
  const { addToCart: addToCartContext } = useCart();
  // Use wishlist context
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const addToCart = () => {
    if (product) {
      addToCartContext(product, quantity);
    }
  };
  const handleWishlist = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };
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
                            <LeafIcon className="h-6 w-6 text-green-700" />
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
                            <div className="h-6 w-6 text-green-700" />
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
                    {activeTab === 'specifications' && <div className="border-t border-gray-200">
                        <dl>
                          {Object.entries(product.specifications).map(([key, value], index) => <div key={key} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                <dt className="text-sm font-medium text-gray-500">
                                  {key}
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {value}
                                </dd>
                              </div>)}
                        </dl>
                      </div>}
                    {activeTab === 'reviews' && <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Customer Reviews
                          </h3>
                          <button
                            className="text-sm font-medium text-green-700 hover:text-green-800"
                            onClick={() => setShowReviewModal(true)}
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
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};