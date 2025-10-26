import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { LuClock } from 'react-icons/lu';
import { CartContext } from '../context/CartContext';
import MenuItemCard from './MenuItemCard';

// --- CONFIGURATION ---
// 🟢 FIX 1: Use VITE_API_URL from environment variables (set in Vercel)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const operatingHours = {
  Breakfast: { start: 8, end: 10.5, label: '8:00 AM - 10:30 AM' },
  Lunch: { start: 12, end: 14.5, label: '12:00 PM - 2:30 PM' },
  Snacks: { start: 16, end: 18, label: '4:00 PM - 6:00 PM' },
};

const CanteenStatus = () => {
  const { addToCart } = useContext(CartContext);
  // Use 'MENU' to fetch items for all relevant categories (Snacks, Stationery, Essentials)
  const [status, setStatus] = useState('MENU'); 
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCanteenOpen, setIsCanteenOpen] = useState(true); // Default to open for fetching

  // Helper to determine the current active meal name
  const getCurrentMealStatus = () => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    if (currentHour >= operatingHours.Breakfast.start && currentHour < operatingHours.Breakfast.end) {
      return 'Breakfast';
    } else if (currentHour >= operatingHours.Lunch.start && currentHour < operatingHours.Lunch.end) {
      return 'Lunch';
    } else if (currentHour >= operatingHours.Snacks.start && currentHour < operatingHours.Snacks.end) {
      return 'Snacks';
    }
    return 'CLOSED';
  };
    
  // 🟢 FIX 2: Fetch menu items that are in stock (backend filters by stock)
  useEffect(() => {
    const fetchMenuAndStatus = async () => {
      setLoading(true);
      const mealStatus = getCurrentMealStatus();
      setStatus(mealStatus);

      try {
        // Fetch the global canteen status
        const statusRes = await axios.get(`${API_BASE_URL}/canteen-status/public`);
        const isOpen = statusRes.data.isOpen;
        setIsCanteenOpen(isOpen);

        if (isOpen) {
          // Fetch ALL available items (stock > 0)
          const menuRes = await axios.get(`${API_BASE_URL}/menu`); 
          setMenuItems(menuRes.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsCanteenOpen(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuAndStatus();
    // Enable interval to check for status change every minute (original intent)
    const interval = setInterval(fetchMenuAndStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🟢 FIX 3: Filter logic now uses the full item list and focuses on currently available items
  const filteredMenu = useMemo(() => {
    if (!isCanteenOpen) return [];
    
    // The main meal category is based on time of day
    const currentMealCategory = status; 
    
    // Items available all the time when open (Snacks, Stationery, Essentials, Drinks, etc.)
    const alwaysAvailableCategories = ['Snacks', 'Stationery', 'Essentials', 'Drinks', 'Beverages'];

    // If it's a meal time, add meal-specific items.
    if (currentMealCategory !== 'CLOSED') {
        return menuItems.filter(item => 
            alwaysAvailableCategories.includes(item.category) || item.category === currentMealCategory
        );
    }
    
    // If canteen is open but not a meal time, only show always available categories
    return menuItems.filter(item => 
        alwaysAvailableCategories.includes(item.category)
    );
  }, [menuItems, status, isCanteenOpen]);
  
  // Check if the canteen is closed based on server status OR lack of items outside meal times
  if (!isCanteenOpen || (status === 'CLOSED' && filteredMenu.length === 0 && !loading)) {
    return (
      <div className="text-center py-16">
        <LuClock className="mx-auto text-5xl text-gray-400 mb-4" />
        <h2 className="text-3xl font-bold text-gray-700">Canteen Closed</h2>
        <p className="text-gray-500 mt-2">The canteen is currently closed. Please check back during our operating hours:</p>
        <div className="mt-4 text-gray-600">
          <p><span className="font-bold">Breakfast:</span> {operatingHours.Breakfast.label}</p>
          <p><span className="font-bold">Lunch:</span> {operatingHours.Lunch.label}</p>
          <p><span className="font-bold">Snacks/General:</span> {operatingHours.Snacks.label}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading Menu...</div>;
  }
  
  // Determine the display title
  const displayTitle = status !== 'CLOSED' ? `Today's ${status} Menu` : 'General & Snack Items';

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {displayTitle}
      </h2>
      {filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map(item => (
            <MenuItemCard key={item._id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No items available at this time.</p>
      )}
    </div>
  );
};

export default CanteenStatus;