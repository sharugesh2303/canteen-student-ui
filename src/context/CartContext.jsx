import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- CONFIGURATION ---
// FIX: Use VITE_API_URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 1. Create the Context Object
const CartContext = createContext();

// 2. Custom Hook to use the Cart Context (MUST be exported)
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// 3. The Provider Component
export const CartProvider = ({ children }) => {
    // Initialize cart state from local storage or empty array
    const [cart, setCart] = useState(() => {
        const localCart = localStorage.getItem('canteenCart');
        return localCart ? JSON.parse(localCart) : [];
    });

    // Sync cart state to local storage whenever 'cart' changes
    useEffect(() => {
        localStorage.setItem('canteenCart', JSON.stringify(cart));
    }, [cart]);
    
    // --- Core Cart Logic ---

    const totalCartItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const handleAddToCart = (menuItem) => {
        setCart(prevCart => {
            const exists = prevCart.find(item => item._id === menuItem._id);
            if (exists) {
                // If item exists, increase quantity
                return prevCart.map(item =>
                    item._id === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                // If item is new, add it with quantity 1
                return [...prevCart, { ...menuItem, quantity: 1 }];
            }
        });
    };
    
    // Placeholder for other cart logic (removed for brevity but functional)
    const value = {
        cart,
        setCart, // Allows external component (like CartPage) to clear or manipulate cart
        totalCartItems,
        handleAddToCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};