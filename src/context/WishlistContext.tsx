import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../components/ProductCard';
import { auth, db } from '../firebase';
import { 
  collection, addDoc, query, where, 
  getDocs, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useAuthState(auth);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, 'wishlists'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          products.push({
            id: data.productId,
            ...data.productSnapshot
          });
        });

        setWishlist(products);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product: Product) => {
    if (!user) throw new Error('User not authenticated');
    
    if (isInWishlist(product.id)) return;

    try {
      // Add to Firebase
      await addDoc(collection(db, 'wishlists'), {
        userId: user.uid,
        productId: product.id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          image: product.image,
          // Add other product fields you need
        },
        addedAt: serverTimestamp()
      });

      // Update local state
      setWishlist(prev => [...prev, product]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Find the wishlist document to delete
      const q = query(
        collection(db, 'wishlists'),
        where('userId', '==', user.uid),
        where('productId', '==', productId)
      );
      const querySnapshot = await getDocs(q);
      
      // Delete all matching documents (should typically be just one)
      const deletions = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);

      // Update local state
      setWishlist(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get all wishlist items for the user
      const q = query(
        collection(db, 'wishlists'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      // Delete all documents
      const deletions = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);

      // Update local state
      setWishlist([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        addToWishlist, 
        removeFromWishlist, 
        isInWishlist, 
        clearWishlist,
        loading 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};