import React from 'react';
import { XIcon, EditIcon, RefreshCwIcon } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';

// Define proper types
interface CareInstructions {
  light: string;
  temperature: string;
  warnings: string;
  water: string;
}

interface Specifications {
  Difficulty: string;
  'Growth Rate': string;
  'Light Requirements': string;
  'Mature Height': string;
  'Pet Friendly': string;
  'Pot Size': string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | string[];
  price: number;
  stock: number;
  lowStockThreshold: number;
  featured: boolean;
  image: string;
  imageUrl?: string;
  inStock?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  careInstructions?: CareInstructions;
  specifications?: Specifications;
  relatedProducts?: Array<string | { id?: any; path?: any }>;
  reviews?: string;
}

interface EditProductFormData {
  image: string;
  price: string;
  stock: string;
  inStock: boolean;
  isBestSeller: boolean;
  rating: number;
  careInstructions: CareInstructions;
  specifications: Specifications;
  relatedProducts: string[];
  reviews: string;
  // Add other fields from Product as needed, making them optional or string versions
  [key: string]: any; // For other dynamic fields, but try to be more specific if possible
}

interface ProductDetailProps {
  selectedProduct: string | null;
  products: Product[];
  setSelectedProduct: (id: string | null) => void;
  setEditProductId: (id: string) => void;
  setEditProductForm: (form: EditProductFormData) => void;
  setShowEditProductModal: (show: boolean) => void;
  db: Firestore; // Firebase Firestore instance
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

// Sales data type
interface SalesDataPoint {
  date: string;
  sales: number;
}

const salesData: SalesDataPoint[] = [
  { date: '2023-05-15', sales: 5 },
  { date: '2023-05-22', sales: 8 },
  { date: '2023-05-29', sales: 12 },
  { date: '2023-06-05', sales: 10 },
  { date: '2023-06-12', sales: 15 },
  { date: '2023-06-19', sales: 18 },
  { date: '2023-06-26', sales: 14 },
  { date: '2023-07-03', sales: 20 },
  { date: '2023-07-10', sales: 16 },
];

const ProductDetail: React.FC<ProductDetailProps> = ({
  selectedProduct,
  products,
  setSelectedProduct,
  setEditProductId,
  setEditProductForm,
  setShowEditProductModal,
  db,
  setProducts
}) => {
  // =============================
  // Product Detail View
  // =============================
  // Renders detailed view for a selected product
  if (!selectedProduct) return null;
  
  const product = products.find(p => p.id === selectedProduct);
  if (!product) return null;
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {product.name}
        </h3>
        <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-500">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Image */}
          <div className="md:col-span-1">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-center object-cover" />
            </div>
          </div>
          {/* Product Details */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </h4>
                <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {product.stock} units
                  {product.stock <= product.lowStockThreshold && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Low Stock
                    </span>}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {product.featured ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Low Stock Threshold
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {product.lowStockThreshold} units
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                This {product.name} is a beautiful addition to any home or
                garden. Perfect for both beginners and experienced plant
                enthusiasts.
              </p>
            </div>
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales History
              </h4>
              <div className="mt-2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={false} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  setEditProductId(product.id);
                  setEditProductForm({
                    ...product,
                    image: product.imageUrl || product.image || '',
                    price: product.price?.toString() || '',
                    stock: product.stock?.toString() || '',
                    inStock: product.inStock ?? true,
                    isBestSeller: product.isBestSeller ?? false,
                    rating: product.rating ?? 0,
                    careInstructions: {
                      light: product.careInstructions?.light || '',
                      temperature: product.careInstructions?.temperature || '',
                      warnings: product.careInstructions?.warnings || '',
                      water: product.careInstructions?.water || '',
                    },
                    specifications: {
                      Difficulty: product.specifications?.Difficulty || '',
                      'Growth Rate': product.specifications?.['Growth Rate'] || '',
                      'Light Requirements': product.specifications?.['Light Requirements'] || '',
                      'Mature Height': product.specifications?.['Mature Height'] || '',
                      'Pet Friendly': product.specifications?.['Pet Friendly'] || '',
                      'Pot Size': product.specifications?.['Pot Size'] || '',
                    },
                    relatedProducts: product.relatedProducts 
                      ? product.relatedProducts.map((ref) =>
                          typeof ref === 'string'
                            ? ref
                            : ref.id?.value || ref.path?.value || String(ref.id || ref.path || '')
                        )
                      : ['', '', ''],
                    reviews: product.reviews || '',
                  });
                  setSelectedProduct(null);
                  setShowEditProductModal(true);
                }}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit Product
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={async () => {
                  const newStockStr = window.prompt('Enter new stock quantity:', product.stock?.toString() || '0');
                  if (newStockStr === null) return;
                  const newStock = parseInt(newStockStr);
                  if (isNaN(newStock) || newStock < 0) {
                    alert('Invalid stock value.');
                    return;
                  }
                  try {
                    const { doc, collection, updateDoc } = await import('firebase/firestore');
                    const productRef = doc(collection(db, 'products'), product.id);
                    await updateDoc(productRef, { stock: newStock });
                    setProducts((prev: Product[]) => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
                    alert('Stock updated successfully.');
                  } catch (err) {
                    alert('Failed to update stock.');
                    console.error('Update stock error:', err);
                  }
                }}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Update Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;