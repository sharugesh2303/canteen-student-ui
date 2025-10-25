import React, { createContext, useContext, useState } from 'react';

// 1. Create the context
const CartContext = createContext();

// 2. Create a custom hook for easy access to the context
export const useCart = () => {
  return useContext(CartContext);
};

// 3. Create the Provider component that will wrap your app
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (itemToAdd) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === itemToAdd._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === itemToAdd._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...itemToAdd, quantity: 1 }];
      }
    });
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // The values that will be available to any component wrapped by this provider
  const value = {
    cart,
    setCart,
    handleAddToCart,
    totalCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};