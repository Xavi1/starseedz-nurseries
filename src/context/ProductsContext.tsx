import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllProducts } from '../firebaseHelpers';
import { Product } from '../types';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedData = await getAllProducts();
      const mappedProducts = fetchedData.map((item: any) => ({
        ...item,
        sku: item.sku || 'N/A',
        image: item.image || '',
        inStock: item.inStock ?? (item.stock > 0),
        lowStockThreshold: item.lowStockThreshold || 5,
      }));
      setProducts(mappedProducts);
    } catch (err: any) {
      setError('Failed to fetch products');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refreshProducts: fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
