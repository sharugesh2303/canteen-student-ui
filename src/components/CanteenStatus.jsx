import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LuClock } from 'react-icons/lu';
import { CartContext } from '../context/CartContext';
import MenuItemCard from './MenuItemCard';

const operatingHours = {
  Breakfast: { start: 8, end: 10.5 },
  Lunch: { start: 12, end: 14.5 },
  Snacks: { start: 16, end: 18 },
};

const CanteenStatus = () => {
  const { addToCart } = useContext(CartContext);
  const [status, setStatus] = useState('LOADING');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuAndSetStatus = async () => {
      const now = new Date();
      
      // --- THIS IS THE TEMPORARY CHANGE FOR TESTING ---
      const currentHour = 17; // We are pretending it's 9 AM (Breakfast Time)
      // const currentHour = now.getHours() + now.getMinutes() / 60; // This is the original line
      // ------------------------------------------------
      
      let currentStatus = 'CLOSED';
      if (currentHour >= operatingHours.Breakfast.start && currentHour < operatingHours.Breakfast.end) {
        currentStatus = 'Breakfast';
      } else if (currentHour >= operatingHours.Lunch.start && currentHour < operatingHours.Lunch.end) {
        currentStatus = 'Lunch';
      } else if (currentHour >= operatingHours.Snacks.start && currentHour < operatingHours.Snacks.end) {
        currentStatus = 'Snacks';
      }
      
      setStatus(currentStatus);

      if (currentStatus !== 'CLOSED') {
        try {
          const response = await axios.get('http://localhost:5000/api/menu');
          setMenuItems(response.data);
        } catch (error) {
          console.error("Failed to fetch menu:", error);
        }
      }
    };

    fetchMenuAndSetStatus();
    // The interval is disabled during testing to prevent it from overriding our temporary time
    // const interval = setInterval(fetchMenuAndSetStatus, 60000);
    // return () => clearInterval(interval);
  }, []);

  if (status === 'LOADING') {
    return <div className="text-center py-16 text-gray-500">Loading...</div>;
  }

  if (status === 'CLOSED') {
    return (
      <div className="text-center py-16">
        <LuClock className="mx-auto text-5xl text-gray-400 mb-4" />
        <h2 className="text-3xl font-bold text-gray-700">Canteen Closed</h2>
        <p className="text-gray-500 mt-2">The canteen is currently closed. Please check back during our operating hours:</p>
        <div className="mt-4 text-gray-600">
          <p><span className="font-bold">Breakfast:</span> 8:00 AM - 10:30 AM</p>
          <p><span className="font-bold">Lunch:</span> 12:00 PM - 2:30 PM</p>
          <p><span className="font-bold">Snacks:</span> 4:00 PM - 6:00 PM</p>
        </div>
      </div>
    );
  }
  
  const filteredMenu = menuItems.filter(item => item.category === status);

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Today's {status} Menu
      </h2>
      {filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map(item => (
            <MenuItemCard key={item._id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No items available for {status} right now.</p>
      )}
    </div>
  );
};

export default CanteenStatus;