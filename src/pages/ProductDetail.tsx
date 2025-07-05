import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard, Product } from '../components/ProductCard';
import { ChevronRightIcon, HomeIcon, StarIcon, ShoppingCartIcon, HeartIcon, LeafIcon, SunIcon, ThermometerIcon, AlertCircleIcon, TruckIcon, RefreshCwIcon, CheckCircleIcon, PlusIcon, MinusIcon } from 'lucide-react';
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  // Mock data for all products - in a real app this would come from an API or context
  const allProducts: Product[] = [{
    id: 1,
    name: 'Monstera Deliciosa',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Indoor Plants',
    rating: 5,
    isBestSeller: true
  }, {
    id: 2,
    name: 'Snake Plant',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae2b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Indoor Plants',
    rating: 4
  }, {
    id: 3,
    name: 'Fiddle Leaf Fig',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1616500163246-0ffbb872f4de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Indoor Plants',
    rating: 4
  }, {
    id: 4,
    name: 'Peace Lily',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1616784754051-4769c7a8cf5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Indoor Plants',
    rating: 5
  }, {
    id: 5,
    name: 'Lavender Plant',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1590585735278-6edaff1c0c28?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Outdoor Plants',
    rating: 4
  }, {
    id: 6,
    name: 'Rosemary Herb',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Outdoor Plants',
    rating: 3
  }, {
    id: 7,
    name: 'Echeveria Succulent',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Succulents',
    rating: 4,
    isNew: true
  }, {
    id: 8,
    name: 'Gardening Tool Set',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1585513553738-84971d9c2f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Garden Tools',
    rating: 5
  }];
  // Mock detailed product data - in a real app this would come from an API
  const detailedProductsData: {
    [key: number]: Omit<DetailedProduct, keyof Product> & {
      id: number;
    };
  } = {
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
      reviews: [{
        id: 1,
        user: 'Emily R.',
        date: '2023-08-15',
        rating: 5,
        comment: 'Beautiful, healthy plant! Arrived well-packaged with no damage. Already seeing new growth after just a few weeks.'
      }, {
        id: 2,
        user: 'Michael T.',
        date: '2023-07-28',
        rating: 4,
        comment: 'Great plant, slightly smaller than I expected but very healthy. The care instructions were helpful.'
      }, {
        id: 3,
        user: 'Sarah K.',
        date: '2023-06-10',
        rating: 5,
        comment: 'This Monstera is thriving in my living room! The leaves are gorgeous and it arrived in perfect condition.'
      }],
      inStock: true,
      relatedProducts: [2, 3, 4]
    },
    2: {
      id: 2,
      description: 'A hardy, low-maintenance plant perfect for beginners.',
      longDescription: "The Snake Plant (Sansevieria) is one of the most tolerant houseplants you can find. With its stiff, upright leaves and striking appearance, it's both decorative and nearly indestructible. NASA has even listed it as an air-purifying plant that can remove toxins from the environment. Its minimal care requirements make it perfect for busy people or those new to plant parenthood.",
      careInstructions: {
        light: 'Tolerates low light to bright indirect light. Can handle some direct sun.',
        water: 'Allow to dry completely between waterings. Water sparingly, especially in winter.',
        temperature: 'Adaptable to most indoor temperatures. Prefers 65-85°F (18-29°C).',
        warnings: 'Mildly toxic if ingested. Keep away from pets and children.'
      },
      specifications: {
        'Mature Height': '1-4 feet',
        'Growth Rate': 'Slow',
        'Pot Size': '6 inches',
        Difficulty: 'Very easy',
        'Light Requirements': 'Low to bright indirect light',
        'Pet Friendly': 'No - mildly toxic to pets'
      },
      reviews: [{
        id: 1,
        user: 'James W.',
        date: '2023-09-02',
        rating: 5,
        comment: "Perfect plant for my office. Looks great and I can't seem to kill it!"
      }, {
        id: 2,
        user: 'Olivia P.',
        date: '2023-08-17',
        rating: 4,
        comment: "Healthy plant, good size. I've had it for a month and it's doing well with minimal care."
      }],
      inStock: true,
      relatedProducts: [1, 4, 7]
    },
    3: {
      id: 3,
      description: 'An elegant indoor tree with large, violin-shaped leaves.',
      longDescription: 'The Fiddle Leaf Fig (Ficus lyrata) is known for its large, glossy violin-shaped leaves and has become an interior design staple. Native to the tropical forests of Western Africa, this statement plant can grow quite tall indoors, creating a dramatic focal point in any room. While it has a reputation for being somewhat finicky, with consistent care it can thrive and grow for many years.',
      careInstructions: {
        light: 'Bright indirect light. Some direct morning sun is beneficial.',
        water: 'Allow top inch of soil to dry between waterings. Consistent moisture without overwatering.',
        temperature: 'Prefers temperatures between 65-75°F (18-24°C). Keep away from drafts.',
        warnings: 'Can cause irritation if ingested. Keep sap away from skin and eyes.'
      },
      specifications: {
        'Mature Height': '6-10 feet indoors',
        'Growth Rate': 'Moderate',
        'Pot Size': '10 inches',
        Difficulty: 'Moderate to difficult',
        'Light Requirements': 'Bright indirect light',
        'Pet Friendly': 'No - toxic to cats and dogs'
      },
      reviews: [{
        id: 1,
        user: 'Thomas B.',
        date: '2023-07-25',
        rating: 5,
        comment: 'Gorgeous plant! Mine has adjusted well and is already putting out new leaves.'
      }, {
        id: 2,
        user: 'Ava M.',
        date: '2023-06-30',
        rating: 3,
        comment: 'Beautiful plant but requires more care than I expected. Still figuring out the right watering schedule.'
      }],
      inStock: true,
      relatedProducts: [1, 4, 2]
    },
    4: {
      id: 4,
      description: 'An elegant flowering plant known for its air-purifying qualities.',
      longDescription: "The Peace Lily (Spathiphyllum) is a popular choice for homes and offices due to its beautiful white flowers and glossy green leaves. It's one of the best air-purifying plants according to NASA studies. Peace lilies are relatively easy to care for and will even let you know when they need water by drooping slightly, then perking back up after watering.",
      careInstructions: {
        light: 'Medium to low indirect light. Too much direct sun will scorch leaves.',
        water: 'Keep soil consistently moist but not soggy. Water when top of soil feels dry.',
        temperature: 'Prefers temperatures between 65-80°F (18-27°C). Keep away from cold drafts.',
        warnings: 'Toxic to pets and humans if ingested. Can cause irritation to mouth and digestive system.'
      },
      specifications: {
        'Mature Height': '1-3 feet',
        'Growth Rate': 'Moderate',
        'Pot Size': '6 inches',
        Difficulty: 'Easy',
        'Light Requirements': 'Low to medium indirect light',
        'Pet Friendly': 'No - toxic to cats and dogs'
      },
      reviews: [{
        id: 1,
        user: 'Lisa T.',
        date: '2023-08-28',
        rating: 5,
        comment: "My peace lily is flowering beautifully! It's perfect for my low-light bedroom."
      }, {
        id: 2,
        user: 'Daniel R.',
        date: '2023-08-02',
        rating: 4,
        comment: 'Healthy plant with several flower spathes. Very happy with my purchase.'
      }],
      inStock: true,
      relatedProducts: [1, 2, 3]
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
        const basicProduct = allProducts.find(p => p.id === productId);
        const detailedProductData = detailedProductsData[productId];
        if (basicProduct && detailedProductData) {
          const fullProduct: DetailedProduct = {
            ...basicProduct,
            ...detailedProductData,
            quantity: 1
          };
          setProduct(fullProduct);
          // Get related products
          if (detailedProductData.relatedProducts) {
            const related = allProducts.filter(p => detailedProductData.relatedProducts.includes(p.id));
            setRelatedProducts(related);
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
  const addToCart = () => {
    // In a real app, this would add the product to a cart state/context
    alert(`Added ${quantity} ${product?.name} to cart`);
  };
  if (loading) {
    return <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading product details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  if (!product) {
    return <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
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
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-white">
      <Header />
      <main>
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
                        <div className="h-6 w-6 text-green-700" />
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
                    <button type="button" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <HeartIcon className="h-5 w-5 mr-2" />
                      Add to Wishlist
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
                <div className="flex space-x-8">
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
              </div>
              {/* Tab Content */}
              <div className="py-6">
                {activeTab === 'description' && <div className="prose prose-green max-w-none">
                    <p>{product.longDescription}</p>
                  </div>}
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
                      <button className="text-sm font-medium text-green-700 hover:text-green-800">
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
      </main>
      <Footer />
    </div>;
};