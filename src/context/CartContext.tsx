import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Product } from '../components/ProductCard';

interface CartItem {
  product: Product;
  quantity: number;
  addedAt?: Date;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  isSyncing: boolean;
}


// Also export setCart for direct use in special cases (e.g., logout)
interface CartContextInternalType extends CartContextType {
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}
const CartContext = createContext<CartContextInternalType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get storage key based on auth state
  const getStorageKey = useCallback(() => {
    return currentUserId ? `cart_${currentUserId}` : 'cart_anonymous';
  }, [currentUserId]);

  // Save cart to both localStorage and Firestore
  const persistCart = useCallback(async (cartData: CartItem[]) => {
    const storageKey = getStorageKey();
    
    try {
      // Always save to localStorage first for instant UI updates
      localStorage.setItem(storageKey, JSON.stringify(cartData));
      
      // Sync to Firestore if authenticated and online
      if (isOnline && currentUserId) {
        setIsSyncing(true);
        const userCartRef = doc(db, 'users', currentUserId, 'cart', 'active');
        await setDoc(userCartRef, {
          items: cartData,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Failed to persist cart:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [currentUserId, isOnline, getStorageKey]);

  // Load cart with Firestore fallback
  const loadCart = useCallback(async () => {
    const storageKey = getStorageKey();
    
    try {
      let loadedCart: CartItem[] = [];
      
      // 1. Try Firestore first (if authenticated and online)
      if (isOnline && currentUserId) {
        const userCartRef = doc(db, 'users', currentUserId, 'cart', 'active');
        const docSnap = await getDoc(userCartRef);
        
        if (docSnap.exists()) {
          loadedCart = docSnap.data().items || [];
        }
      }
      
      // 2. Fall back to localStorage if Firestore empty or offline
      if (loadedCart.length === 0) {
        const stored = localStorage.getItem(storageKey);
        loadedCart = stored ? JSON.parse(stored) : [];
      }
      
      setCart(loadedCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
      const stored = localStorage.getItem(storageKey);
      setCart(stored ? JSON.parse(stored) : []);
    }
  }, [currentUserId, isOnline, getStorageKey]);

  // Real-time Firestore sync for logged-in users
  useEffect(() => {
    if (!isOnline || !currentUserId) return;
    
    const userCartRef = doc(db, 'users', currentUserId, 'cart', 'active');
    const unsubscribe = onSnapshot(userCartRef, (doc) => {
      if (doc.exists()) {
        const firestoreCart = doc.data().items || [];
        setCart(firestoreCart);
        localStorage.setItem(getStorageKey(), JSON.stringify(firestoreCart));
      }
    });
    
    return () => unsubscribe();
  }, [currentUserId, isOnline, getStorageKey]);

// Handle auth state changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const anonymousKey = 'cart_anonymous';
      let mergedCart: CartItem[] = [];

      try {
        // Get cart from Firestore first
        const userCartRef = doc(db, 'users', user.uid, 'cart', 'active');
        const docSnap = await getDoc(userCartRef);

        if (docSnap.exists()) {
          mergedCart = docSnap.data().items || [];
        }
      } catch (err) {
        console.error("Failed to load Firestore cart:", err);
      }

      // Merge in guest cart only if it exists
      const anonymousCart = localStorage.getItem(anonymousKey);
      if (anonymousCart) {
        mergedCart = mergeCarts(mergedCart, JSON.parse(anonymousCart));
        localStorage.removeItem(anonymousKey);
      }

      // Save merged cart locally (for offline use)
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(mergedCart));

      setCurrentUserId(user.uid);
      setCart(mergedCart); // directly update state
      await persistCart(mergedCart); // sync to Firestore if merged
    }
  });

  return () => unsubscribe();
}, [persistCart]);


  // Helper to merge carts while combining quantities
  const mergeCarts = (primary: CartItem[], secondary: CartItem[]): CartItem[] => {
    const merged = [...primary];
    
    secondary.forEach(item => {
      const existingIndex = merged.findIndex(
        i => i.product.id === item.product.id
      );
      
      if (existingIndex >= 0) {
        merged[existingIndex].quantity += item.quantity;
      } else {
        merged.push(item);
      }
    });
    
    return merged;
  };

  const addToCart = async (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      let newCart: CartItem[];
      
      if (existingIndex >= 0) {
        newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
      } else {
        newCart = [
          ...prev,
          { product, quantity, addedAt: new Date() }
        ];
      }
      
      persistCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = async (productId: number) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      persistCart(newCart);
      return newCart;
    });
  };

  const clearCart = async () => {
    setCart([]);
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    await persistCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        cartCount,
        isSyncing,
        setCart // expose setCart for direct use
      }}
    >
      {children}
    </CartContext.Provider>
  );
};