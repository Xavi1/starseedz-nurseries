
import { Product } from "../../../AdminDashboard/types";
import { XIcon, EditIcon, RefreshCwIcon } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";


import { Firestore, DocumentData, UpdateData, DocumentReference } from "firebase/firestore";

interface ProductDetailProps {
  product: Product;
  setSelectedProduct: (product: Product | null) => void;
  setEditProductId: (id: string) => void;
  setEditProductForm: (form: Partial<Product>) => void;
  setShowEditProductModal: (show: boolean) => void;
  setProducts: (updater: (prev: Product[]) => Product[]) => void;
  db: Firestore;
  updateDoc: (ref: DocumentReference<DocumentData>, data: UpdateData<DocumentData>) => Promise<void>;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, setSelectedProduct, setEditProductId, setEditProductForm, setShowEditProductModal, setProducts, db, updateDoc }) => {
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
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</h4>
                <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</h4>
                <p className="mt-1 text-sm text-gray-900">{Array.isArray(product.category) ? product.category.join(', ') : product.category}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price</h4>
                <p className="mt-1 text-sm text-gray-900">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</h4>
                <p className="mt-1 text-sm text-gray-900">{product.stock} units{product.stock <= product.lowStockThreshold && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Low Stock</span>}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</h4>
                <p className="mt-1 text-sm text-gray-900">{product.featured ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock Threshold</h4>
                <p className="mt-1 text-sm text-gray-900">{product.lowStockThreshold} units</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</h4>
              <p className="mt-1 text-sm text-gray-600">This {product.name} is a beautiful addition to any home or garden. Perfect for both beginners and experienced plant enthusiasts.</p>
            </div>
            <div className="mt-6">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sales History</h4>
              <div className="mt-2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{date: '2023-05-15',sales: 5},{date: '2023-05-22',sales: 8},{date: '2023-05-29',sales: 12},{date: '2023-06-05',sales: 10},{date: '2023-06-12',sales: 15},{date: '2023-06-19',sales: 18},{date: '2023-06-26',sales: 14},{date: '2023-07-03',sales: 20},{date: '2023-07-10',sales: 16}]}> <CartesianGrid strokeDasharray="3 3" vertical={false} /> <XAxis dataKey="date" tick={false} /> <YAxis /> <Tooltip /> <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} dot={false} /> </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onClick={() => { setEditProductId(product.id); setEditProductForm({
                ...product,
                image: product.image || '',
                price: typeof product.price === 'number' ? product.price : 0,
                stock: typeof product.stock === 'number' ? product.stock : 0,
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
                relatedProducts: Array.isArray(product.relatedProducts)
                  ? product.relatedProducts.map((ref) => typeof ref === 'string' ? ref : String((ref as { id?: string; path?: string })?.id || (ref as { id?: string; path?: string })?.path || ''))
                  : ['', '', ''],
                reviews: typeof product.reviews === 'string' ? product.reviews : '',
              }); setSelectedProduct(null); setShowEditProductModal(true); }}><EditIcon className="h-4 w-4 mr-2" />Edit Product</button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onClick={async () => { const newStockStr = window.prompt('Enter new stock quantity:', product.stock?.toString() || '0'); if (newStockStr === null) return; const newStock = parseInt(newStockStr); if (isNaN(newStock) || newStock < 0) { alert('Invalid stock value.'); return; } try { const { doc, collection } = await import('firebase/firestore'); const productRef = doc(collection(db, 'products'), product.id); await updateDoc(productRef, { stock: newStock }); setProducts((prev: Product[]) => prev.map((p: Product) => p.id === product.id ? { ...p, stock: newStock } : p)); alert('Stock updated successfully.'); } catch (err) { alert('Failed to update stock.'); console.error('Update stock error:', err); } }}><RefreshCwIcon className="h-4 w-4 mr-2" />Update Stock</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
