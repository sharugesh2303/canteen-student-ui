import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { FaHistory, FaSearch } from 'react-icons/fa';

// --- Big Header Clock Component ---
const BigHeaderClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        // STYLING: Prominent, high-contrast clock design
        <div className="bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-700 hidden sm:block">
            <p className="text-sm font-medium text-slate-400 leading-none text-center">Current Time</p>
            <p className="text-xl md:text-2xl font-extrabold text-orange-400 leading-tight tracking-wider font-mono">
                {formattedTime}
            </p>
        </div>
    );
};
// --- End Big Header Clock Component ---


// --- Main Navbar Component ---
const Navbar = ({ searchTerm, setSearchTerm, isCanteenOpen }) => {
    // 🟢 FIX VERIFIED: Using the named import { useCart } from the context file
    const { totalCartItems, setCart } = useCart(); 
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Student');

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('student'));
            if (userData && userData.name) {
                setUserName(userData.name);
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            setUserName('Guest');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('student'); 
        localStorage.removeItem('canteenCart'); 
        setCart([]); 
        navigate('/login');
    };

    return (
        // UI/UX CHANGE: Dark theme header
        <header className="bg-gray-900 shadow-lg sticky top-0 z-20">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-xl md:text-2xl font-bold text-orange-400">JJ College Smart Canteen</h1>
                    <p className="text-xs md:text-sm text-slate-400">Welcome, {userName}</p>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    
                    {/* Integrated Big Clock */}
                    <BigHeaderClock />

                    {/* Search bar is shown only if canteen is open */}
                    {isCanteenOpen && setSearchTerm && (
                        <div className="relative hidden md:block"> {/* Show only on large screens */}
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaSearch className="w-4 h-4 text-slate-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search items..."
                                // Styled for dark theme
                                className="w-40 pl-10 pr-4 py-2 text-sm text-white bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    
                    <Link to="/my-orders" title="Order History" className="text-white hover:text-orange-400">
                        <FaHistory size={24} />
                    </Link>

                    <Link to="/cart" title="Cart" className="text-white hover:text-orange-400 relative transition-transform hover:scale-110 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {totalCartItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                {totalCartItems}
                            </span>
                        )}
                    </Link>

                    <button onClick={handleLogout} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition active:scale-95">
                        Log Out
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;