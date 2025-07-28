import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Product } from '../components/ProductCard';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
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
  const [hasTransferred, setHasTransferred] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !hasTransferred) {
        // User logged in - transfer anonymous cart to user cart
        transferAnonymousCartToUser(user.uid);
        setCurrentUserId(user.uid);
        setHasTransferred(true);
      } else if (user) {
        // User already logged in, just load their cart
        setCurrentUserId(user.uid);
        loadUserCart(user.uid);
      } else {
        // User logged out
        setCurrentUserId(null);
        setHasTransferred(false);
        loadUserCart('anonymous');
      }
    });

    return () => unsubscribe();
  }, [hasTransferred]);

  const loadUserCart = (userId: string) => {
    try {
      const stored = localStorage.getItem(`cart_${userId}`);
      if (stored) {
        setCart(JSON.parse(stored));
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }
  };

  const transferAnonymousCartToUser = (userId: string) => {
    try {
      // Get anonymous cart
      const anonymousCart = localStorage.getItem('cart_anonymous');
      const userCart = localStorage.getItem(`cart_${userId}`);
      
      let finalCart: CartItem[] = [];
      
      if (anonymousCart) {
        const anonymousItems: CartItem[] = JSON.parse(anonymousCart);
        
        if (userCart) {
          // Merge with existing user cart
          const userItems: CartItem[] = JSON.parse(userCart);
          const mergedCart = [...userItems];
          
          // Add anonymous items, combining quantities if product already exists
          anonymousItems.forEach(anonymousItem => {
            const existingIndex = mergedCart.findIndex(
              item => item.product.id === anonymousItem.product.id
            );
            
            if (existingIndex >= 0) {
              mergedCart[existingIndex].quantity += anonymousItem.quantity;
            } else {
              mergedCart.push(anonymousItem);
            }
          });
          
          finalCart = mergedCart;
        } else {
          // No existing user cart, use anonymous cart
          finalCart = anonymousItems;
        }
        
        // Clear anonymous cart
        localStorage.removeItem('cart_anonymous');
      } else if (userCart) {
        // No anonymous cart, use existing user cart
        finalCart = JSON.parse(userCart);
      }
      
      // Save and set the final cart
      localStorage.setItem(`cart_${userId}`, JSON.stringify(finalCart));
      setCart(finalCart);
    } catch {
      // If anything fails, just load the user's existing cart
      loadUserCart(userId);
    }
  };

  const saveCart = (cartData: CartItem[]) => {
    try {
      const key = currentUserId ? `cart_${currentUserId}` : 'cart_anonymous';
      localStorage.setItem(key, JSON.stringify(cartData));
    } catch {}
  };

  // Save cart whenever it changes
  useEffect(() => {
    saveCart(cart);
  }, [cart, currentUserId]);

  // Initial load for anonymous users
  useEffect(() => {
    if (currentUserId === null) {
      loadUserCart('anonymous');
    }
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};