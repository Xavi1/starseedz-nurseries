import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../components/ProductCard';
import { auth, db } from '../firebase';
import { 
  collection, addDoc, query, where,
  getDocs, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlistLocal: () => void;           // ✅ local only
  clearWishlistRemote: () => Promise<void>; // ✅ remote deletion
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
  const [error, setError] = useState<Error | null>(null);
  const guestKey = 'wishlist_anonymous';

  const getWishlistRef = () => {
    if (!user) throw new Error('User not authenticated');
    return collection(db, 'users', user.uid, 'wishlists');
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        const guestWishlistStr = localStorage.getItem(guestKey);
        setWishlist(guestWishlistStr ? JSON.parse(guestWishlistStr) : []);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const wishlistRef = getWishlistRef();
        const querySnapshot = await getDocs(wishlistRef);
        
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          products.push({
            id: data.productId,
            ...data.productSnapshot
          });
        });

        // Merge guest wishlist if present
        const guestWishlistStr = localStorage.getItem(guestKey);
        if (guestWishlistStr) {
          const guestWishlist: Product[] = JSON.parse(guestWishlistStr);
          for (const item of guestWishlist) {
            if (!products.some(p => p.id === item.id)) {
              products.push(item);
              await addDoc(getWishlistRef(), {
                productId: item.id,
                productSnapshot: {
                  name: item.name,
                  price: item.price,
                  image: item.image,
                },
                addedAt: serverTimestamp()
              });
            }
          }
          localStorage.removeItem(guestKey);
        }

        setWishlist(products);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) return;
    
    if (!user) {
      const updatedWishlist = [...wishlist, product];
      setWishlist(updatedWishlist);
      localStorage.setItem(guestKey, JSON.stringify(updatedWishlist));
      return;
    }
    
    try {
      await addDoc(getWishlistRef(), {
        productId: product.id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          image: product.image,
        },
        addedAt: serverTimestamp()
      });
      setWishlist(prev => [...prev, product]);
    } catch (err) {
      setError(err as Error);
      console.error('Error adding to wishlist:', err);
      throw err;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) {
      const updatedWishlist = wishlist.filter(item => item.id !== productId);
      setWishlist(updatedWishlist);
      localStorage.setItem(guestKey, JSON.stringify(updatedWishlist));
      return;
    }
    
    try {
      const wishlistRef = getWishlistRef();
      const q = query(wishlistRef, where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      
      const deletions = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      
      setWishlist(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      setError(err as Error);
      console.error('Error removing from wishlist:', err);
      throw err;
    }
  };

  const clearWishlistLocal = () => {
    setWishlist([]);
    localStorage.setItem(guestKey, JSON.stringify([]));
  };

  const clearWishlistRemote = async () => {
    if (!user) {
      clearWishlistLocal();
      return;
    }

    try {
      setError(null);
      const wishlistRef = getWishlistRef();
      const querySnapshot = await getDocs(wishlistRef);
      const deletions = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
      clearWishlistLocal();
    } catch (err) {
      setError(err as Error);
      console.error('Error clearing wishlist remotely:', err);
      throw err;
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
        clearWishlistLocal, 
        clearWishlistRemote,
        loading,
        error 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
