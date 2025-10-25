import React from 'react';
import { LuPlus } from 'react-icons/lu';

const MenuItemCard = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800 truncate">{item.name}</h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-gray-600">{item.category}</p>
            <p className="text-xl font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
          </div>
        </div>
        <button
          onClick={() => onAddToCart(item)}
          className="mt-4 w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300 flex items-center justify-center space-x-2"
        >
          <LuPlus />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;