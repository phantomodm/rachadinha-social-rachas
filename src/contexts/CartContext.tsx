
import React, { createContext, ReactNode, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Product, CartItem } from '@/types/product';
import { products as allProducts } from '@/data/products';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface StoredCartItem {
  id: string;
  quantity: number;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [storedItems, setStoredItems] = useLocalStorage<StoredCartItem[]>('cart', []);

  const cartItems = useMemo(() => {
    return storedItems.map(item => {
      const product = allProducts.find(p => p.id === item.id);
      return { ...product!, quantity: item.quantity };
    }).filter(item => item.name); // Filter out items where product wasn't found
  }, [storedItems]);

  const addToCart = (productId: string, quantity: number) => {
    setStoredItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { id: productId, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setStoredItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setStoredItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setStoredItems([]);
  };

  const cartCount = useMemo(() => {
    return storedItems.reduce((count, item) => count + item.quantity, 0);
  }, [storedItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
