// src/AdminDashboard/views/Products/ProductsView.tsx
import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../../firebaseHelpers';
import { Product } from '../../types';
import { SearchIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon } from 'lucide-react';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ProductDetail from './ProductDetail';
import Pagination from '../../components/Pagination';

interface ProductsViewProps {
  selectedProduct: string | null;
  setSelectedProduct: (id: string | null) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
}

const ProductsView: React.FC<ProductsViewProps> = ({
  selectedProduct, setSelectedProduct, categoryFilter, setCategoryFilter
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch products
    getAllProducts().then(setProducts);
  }, []);

  // Filter Logic
  // Pagination Logic

  if (selectedProduct) {
    return <ProductDetail productId={selectedProduct} products={products} onClose={() => setSelectedProduct(null)} />;
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
         {/* Header with Search, Filter, Add Button */}
         
         <div className="overflow-x-auto">
            {/* Products Table */}
         </div>

         <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <Pagination 
               currentPage={currentPage}
               totalItems={products.length} // filtered length
               pageSize={10}
               onPageChange={setCurrentPage}
            />
         </div>
      </div>

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAdd={() => window.location.reload()} />}
      
      {showEditModal && editProductId && (
        <EditProductModal 
          productId={editProductId} 
          products={products}
          onClose={() => { setShowEditModal(false); setEditProductId(null); }} 
        />
      )}
    </>
  );
};

export default ProductsView;