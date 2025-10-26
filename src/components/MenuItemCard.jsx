import React from 'react';
import { LuPlus } from 'react-icons/lu';

const MenuItemCard = ({ item, onAddToCart }) => {
    // Determine if the item is out of stock (stock property should be an integer)
    const isOutOfStock = item.stock <= 0;

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col group 
                        transition-all duration-300 hover:shadow-orange-500/50 hover:shadow-xl 
                        hover:-translate-y-0.5 border border-slate-700">
            
            {/* Image/Placeholder with Stock Overlay */}
            <div className="relative">
                {/* 🟢 Using item.image (from mapped data) as the source */}
                <img 
                    src={item.image || item.imageUrl || 'https://placehold.co/400x300/1e293b/475569?text=Image'} 
                    alt={item.name} 
                    className={`w-full h-40 object-cover transition-transform duration-300 ${isOutOfStock ? 'opacity-50' : 'group-hover:scale-105'}`} 
                />
                
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                        <span className="text-xl font-bold text-red-400 uppercase tracking-wider">Sold Out</span>
                    </div>
                )}
                
                {/* Stock Badge (for items still in stock) */}
                {!isOutOfStock && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                        Stock: {item.stock}
                    </div>
                )}
            </div>

            {/* Content and Button */}
            <div className="p-4 flex flex-col flex-grow text-white">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-100 truncate">{item.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                        {/* Ensure category is displayed, falling back to 'General' */}
                        <p className="text-slate-400 capitalize">{item.category || 'General'}</p>
                        <p className="text-2xl font-extrabold text-orange-400">₹{item.price.toFixed(2)}</p>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={() => onAddToCart(item)}
                    disabled={isOutOfStock}
                    className={`mt-4 w-full font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2 active:scale-[0.98]
                        ${isOutOfStock 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/30'
                        }`}
                >
                    <LuPlus size={20} />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
            </div>
        </div>
    );
};

export default MenuItemCard;