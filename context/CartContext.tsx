import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('cart_items').then((saved) => {
      if (saved) setItems(JSON.parse(saved));
    });
  }, []);

  const persist = async (next: any[]) => {
    setItems(next);
    await AsyncStorage.setItem('cart_items', JSON.stringify(next));
  };

  const addItem = (product: any) => {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      persist(
        items.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      persist([...items, { product, quantity: 1 }]);
    }
  };

  const removeItem = (productId: string) => {
    persist(items.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    persist(
      items.map((i) => {
        if (i.product.id === productId) {
          const nextQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: nextQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => persist([]);

  const totalItems = items.length;
  const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);