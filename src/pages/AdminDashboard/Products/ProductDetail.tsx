import { Product } from "../../../AdminDashboard/types";
import { XIcon, EditIcon, RefreshCwIcon } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { Firestore, DocumentData, UpdateData, DocumentReference, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

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

interface SalesData {
  date: string;
  sales: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  setSelectedProduct, 
  setEditProductId, 
  setEditProductForm, 
  setShowEditProductModal, 
  setProducts, 
  db, 
  updateDoc 
}) => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!product?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Query orders collection for orders containing this product
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('items', 'array-contains', product.id)
        );

        const querySnapshot = await getDocs(q);
        
        // Process orders to get sales by date
        const salesByDate: Record<string, number> = {};
        
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          const orderDate = orderData.createdAt 
            ? (orderData.createdAt instanceof Timestamp 
                ? orderData.createdAt.toDate().toISOString().split('T')[0]
                : new Date(orderData.createdAt).toISOString().split('T')[0])
            : new Date().toISOString().split('T')[0];
          
          // Count quantity of this product in the order
          let productQuantity = 0;
          if (orderData.items && Array.isArray(orderData.items)) {
            // If items is an array of product IDs, we need to check quantities
            if (orderData.quantities && orderData.quantities[product.id]) {
              productQuantity = orderData.quantities[product.id];
            } else {
              // Simple count if quantities not available
              productQuantity = orderData.items.filter((itemId: string) => itemId === product.id).length;
            }
          }
          
          if (salesByDate[orderDate]) {
            salesByDate[orderDate] += productQuantity;
          } else {
            salesByDate[orderDate] = productQuantity;
          }
        });

        // Convert to array and sort by date
        const processedData = Object.entries(salesByDate)
          .map(([date, sales]) => ({ date, sales }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setSalesData(processedData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [product?.id, db]);

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
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading sales data...</p>
                  </div>
                ) : salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => `Date: ${date}`}
                        formatter={(value) => [`${value} units`, 'Sales']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#16a34a" 
                        strokeWidth={2} 
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No sales data available for this product</p>
                  </div>
                )}
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