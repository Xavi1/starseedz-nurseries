import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCartState: () => void;
  cartCount: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


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
  const lastSyncedCartRef = useRef<CartItem[]>([]);
  // Removed unused navigate

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

  const getStorageKey = useCallback(() => {
    return currentUserId ? `cart_${currentUserId}` : 'cart_anonymous';
  }, [currentUserId]);

  // Loop-safe persistCart
  const persistCart = useCallback(async (cartData: CartItem[]) => {
    const storageKey = getStorageKey();

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartData));

      if (isOnline && currentUserId) {
        const hasChanged = JSON.stringify(cartData) !== JSON.stringify(lastSyncedCartRef.current);
        if (!hasChanged) return;

        setIsSyncing(true);
        const userCartRef = doc(db, 'users', currentUserId, 'cart', 'active');
        await setDoc(userCartRef, {
          items: cartData,
          updatedAt: serverTimestamp()
        }, { merge: true });

        lastSyncedCartRef.current = cartData;
      }
    } catch (error) {
      console.error('Failed to persist cart:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [currentUserId, isOnline, getStorageKey]);

  // Load cart
  const loadCart = useCallback(() => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    setCart(stored ? JSON.parse(stored) : []);
  }, [getStorageKey]);

  // Firestore real-time sync
  useEffect(() => {
    if (!isOnline || !currentUserId) return;

    const userCartRef = doc(db, 'users', currentUserId, 'cart', 'active');
    const unsubscribe = onSnapshot(userCartRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreCart = docSnap.data().items || [];
        lastSyncedCartRef.current = firestoreCart;
        setCart(firestoreCart);
        localStorage.setItem(getStorageKey(), JSON.stringify(firestoreCart));
      }
    });

    return () => unsubscribe();
  }, [currentUserId, isOnline, getStorageKey]);

  // Merge carts (string-safe ID comparison)
    const mergeCarts = (primary: CartItem[], secondary: CartItem[]): CartItem[] => {
    const merged = [...primary];
    secondary.forEach(item => {
      const existingIndex = merged.findIndex(
        i => String(i.product.id) === String(item.product.id)
      );
      if (existingIndex >= 0) {
        merged[existingIndex].quantity += item.quantity;
      } else {
        merged.push(item);
      }
    });
    return merged;
  };

  // Auth state change handler
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const anonymousKey = 'cart_anonymous';
      let mergedCart: CartItem[] = [];

      try {
        // Load current Firestore cart
        const userCartRef = doc(db, 'users', user.uid, 'cart', 'active');
        const docSnap = await getDoc(userCartRef);
        if (docSnap.exists()) {
          mergedCart = docSnap.data().items || [];
        }
      } catch (err) {
        console.error("Failed to load Firestore cart:", err);
      }

      // Always merge guest cart if present
      const anonymousCartStr = localStorage.getItem(anonymousKey);
      if (anonymousCartStr) {
        const anonymousCart: CartItem[] = JSON.parse(anonymousCartStr);
        mergedCart = mergeCarts(mergedCart, anonymousCart);
        localStorage.removeItem(anonymousKey);

        // Persist merged cart to Firestore
        await persistCart(mergedCart);
      } else {
        // No guest cart — still update local storage for offline use
        localStorage.setItem(`cart_${user.uid}`, JSON.stringify(mergedCart));
      }

      // Update context state
      setCurrentUserId(user.uid);
      setCart(mergedCart);

    } else {
      // User logged out → clear cart for guest
      setCurrentUserId(null);
      setCart([]);
    }
  });

  return () => unsubscribe();
}, [persistCart]);



  // Initial load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Actions
  const addToCart = async (product: Product, quantity = 1) => {
    // Require login to add to cart
    if (!currentUserId) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login?message=login_required_cart';
      }
      return;
    }
    setCart(prev => {
      const existingIndex = prev.findIndex(item => String(item.product.id) === String(product.id));
      let newCart: CartItem[];

      if (existingIndex >= 0) {
        newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
      } else {
        newCart = [...prev, { product, quantity, addedAt: new Date() }];
      }

      persistCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = async (productId: number | string) => {
    setCart(prev => {
      const newCart = prev.filter(item => String(item.product.id) !== String(productId));
      persistCart(newCart);
      return newCart;
    });
  };

  const clearCart = async () => {
    setCart([]);
    await persistCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const resetCartState = () => setCart([]);

  return (
  <CartContext.Provider
    value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      resetCartState,  // 👈 new method
      cartCount,
      isSyncing
    }}
  >
      {children}
    </CartContext.Provider>
  );
};
