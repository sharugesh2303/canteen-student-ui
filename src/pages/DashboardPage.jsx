/* ==================================
 * FILE: src/pages/DashboardPage.jsx
 * ================================== */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';
import AdvertisementModal from '../components/AdvertisementModal.jsx';
import { FaCommentDots, FaCartPlus, FaHeart, FaRegHeart, FaArrowLeft } from 'react-icons/fa';
import { GiFastNoodles, GiNotebook, GiIceCreamCone, GiHotMeal } from 'react-icons/gi';
import axios from 'axios';

const POLLING_INTERVAL = 15000;
const VIEWER_ROTATION_INTERVAL = 5000;

const DEFAULT_SERVICE_HOURS = {
    breakfastStart: '08:00',
    breakfastEnd: '11:00',
    lunchStart: '12:00',
    lunchEnd: '15:00',
};

// --- SparkleOverlay Component ---
const SparkleOverlay = () => {
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const sparks = Array.from({ length: 40 }).map((_, i) => {
        const style = {
            '--x': `${random(-150, 150)}vw`,
            '--y': `${random(-150, 150)}vh`,
            '--duration': `${random(8, 20)}s`,
            '--delay': `${random(1, 10)}s`,
            '--size': `${random(1, 3)}px`,
        };
        return <div key={i} className="spark" style={style}></div>;
    });
    return (
        <>
            <style>{`
                @keyframes sparkle-animation { 0% { transform: scale(0) translate(0, 0); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1) translate(var(--x), var(--y)); opacity: 0; } }
                @keyframes background-pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.05); } }
                .sparkle-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; animation: background-pulse 30s infinite ease-in-out; }
                .spark { position: absolute; top: 50%; left: 50%; width: var(--size); height: var(--size); background-color: #fbbF24; border-radius: 50%; animation: sparkle-animation var(--duration) var(--delay) infinite linear; box-shadow: 0 0 4px #fbbF24, 0 0 8px #fbbF24; }
            `}</style>
            <div className="sparkle-container">{sparks}</div>
        </>
    );
};

// --- Ad Rotator Component ---
const AdRotatorComponent = ({ activeAds, showAdModal, setShowAdModal }) => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    useEffect(() => {
        if (activeAds && activeAds.length > 0 && !sessionStorage.getItem('adShown')) {
            setShowAdModal(true);
            sessionStorage.setItem('adShown', 'true');
        }
    }, [activeAds, setShowAdModal]);
    useEffect(() => {
        if (!activeAds || activeAds.length < 2) return;
        const timer = setInterval(() => setCurrentAdIndex(p => (p + 1) % activeAds.length), VIEWER_ROTATION_INTERVAL);
        return () => clearInterval(timer);
    }, [activeAds]);
    if (!activeAds || activeAds.length === 0) return <div className="w-full max-w-lg mx-auto min-h-[400px] max-h-[600px] overflow-hidden relative mb-8 rounded-lg shadow-xl bg-slate-800/50 flex items-center justify-center border border-slate-700"><p className="text-2xl font-bold text-slate-400">No Advertisements Active</p></div>;
    const currentAd = activeAds[currentAdIndex];
    return (
        <>
            {showAdModal && currentAd && <AdvertisementModal imageUrl={currentAd.imageUrl} onClose={() => setShowAdModal(false)} />}
            <div className="w-full max-w-lg mx-auto min-h-[400px] max-h-[600px] overflow-hidden relative mb-8 rounded-lg shadow-xl bg-slate-800/50 flex items-center justify-center border border-slate-700">
                {activeAds.map((ad, i) => <img key={ad._id || i} src={ad.imageUrl} alt={`Ad ${i + 1}`} className="absolute w-full h-full object-cover transition-opacity duration-500 ease-in-out" style={{ opacity: i === currentAdIndex ? 1 : 0 }} />)}
            </div>
        </>
    );
};

// --- FeedbackButton Component ---
const FeedbackButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ feedbackText: feedback }),
            });
            if (!response.ok) throw new Error('Failed to submit feedback');
            alert("Thank you for your feedback!");
            setIsOpen(false);
            setFeedback('');
        } catch (error) {
            alert("Sorry, we couldn't submit your feedback.");
        } finally {
            setIsSubmitting(false);
        }
     };
    return (
        <>
            <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-400/50 transition-all transform hover:scale-125 active:scale-95 z-40" title="Leave Feedback">
                <FaCommentDots size={28} />
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 scale-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Share Your Feedback</h2>
                        <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl font-bold transition-transform hover:scale-110">&times;</button>
                        <form onSubmit={handleSubmit}>
                            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-800" placeholder="Tell us what you think..." required />
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
     );
};

// --- MenuItemCard Component ---
const MenuItemCard = ({ item, onAddToCart, isFavorite, onToggleFavorite }) => {
    const isOutOfStock = item.stock <= 0;
    let stockBadgeColor = isOutOfStock ? 'bg-red-600' : item.stock <= 10 ? 'bg-red-600' : item.stock <= 25 ? 'bg-yellow-600' : 'bg-green-600';
    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-orange-500/50 hover:shadow-xl hover:-translate-y-2 border border-slate-700 hover:ring-2 hover:ring-orange-400/50 active:scale-[0.98] cursor-pointer">
            <div className="relative">
                <img src={item.image || 'https://placehold.co/400x300/1e293b/475569?text=Image'} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <button
                    onClick={() => onToggleFavorite(item._id)}
                    className="absolute top-3 right-3 bg-slate-700/50 backdrop-blur-sm p-2 rounded-full z-10 transition-colors hover:bg-slate-700 hover:scale-110 active:scale-95"
                    title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                    {isFavorite ? <FaHeart className="text-red-500 transition-colors" size={20} /> : <FaRegHeart className="text-slate-300 transition-colors hover:text-red-400" size={20} />}
                </button>
                {!isOutOfStock && (
                    <div className={`absolute top-3 left-3 ${stockBadgeColor} text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md transform group-hover:scale-105 transition-transform`}>
                        Stock: {item.stock}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-slate-100 capitalize truncate">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xl font-bold text-white transition-colors group-hover:text-orange-300">₹{item.price.toFixed(2)}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full transition-all ${isOutOfStock ? 'bg-red-200 text-red-900' : 'bg-green-200 text-green-900'}`}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>
                </div>
                <button onClick={() => onAddToCart(item)} disabled={isOutOfStock} className="w-full mt-4 flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all active:scale-[0.98] disabled:bg-slate-600 disabled:cursor-not-allowed">
                    <FaCartPlus className="group-hover:rotate-6 transition-transform" /> Add to Cart
                </button>
            </div>
        </div>
    );
};

// --- CategoryFilter Component ---
// *** FIX: Added default value [] for categories prop ***
const CategoryFilter = ({ categories = [], activeCategory, setActiveCategory }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-300 mb-4">What's on your mind?</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2 scroll-smooth">
            {categories.map(cat => (
                <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex flex-col items-center justify-center space-y-2 w-20 flex-shrink-0 transition-all active:scale-95 ${activeCategory === cat.name ? 'text-orange-400' : 'text-slate-400 hover:text-orange-400 hover:scale-105'}`}
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${activeCategory === cat.name ? 'bg-slate-700 ring-2 ring-orange-500 scale-105 shadow-lg shadow-orange-500/30' : 'bg-slate-800 hover:ring-1 hover:ring-slate-600'}`}>
                        <cat.icon size={32} />
                    </div>
                    <span className="text-sm font-semibold">{cat.name}</span>
                </button>
            ))}
        </div>
    </div>
);

// --- SubCategory Card Component ---
const SubCategoryCard = ({ subCategory, onClick }) => (
    <button onClick={onClick} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col items-center group transition-all duration-300 hover:shadow-orange-500/50 hover:shadow-xl hover:-translate-y-2 border border-slate-700 hover:ring-2 hover:ring-orange-400/50 active:scale-[0.98] cursor-pointer p-4">
        <img src={subCategory.imageUrl || 'https://placehold.co/200x200/1e293b/475569?text=Image'} alt={subCategory.name} className="w-32 h-32 object-cover rounded-full mb-3 group-hover:scale-105 transition-transform duration-300" />
        <h4 className="text-md font-semibold text-slate-100 capitalize truncate group-hover:text-orange-300">{subCategory.name}</h4>
    </button>
);

// --- Main Dashboard Page Component ---
const DashboardPage = () => {
    const { handleAddToCart } = useCart();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAds, setActiveAds] = useState([]);
    const [showAdModal, setShowAdModal] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isCanteenOpen, setIsCanteenOpen] = useState(true);
    const [serviceHours, setServiceHours] = useState(DEFAULT_SERVICE_HOURS);
    const [activeCategory, setActiveCategory] = useState('Snacks');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);

    // --- Utility functions ---
    const timeToMinutes = (time) => {
        if (!time) return -1;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const isTimeSlotActive = useMemo(() => (startKey, endKey) => {
        const hours = serviceHours || DEFAULT_SERVICE_HOURS;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = timeToMinutes(hours[startKey]);
        const endMinutes = timeToMinutes(hours[endKey]);
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }, [serviceHours]);

    const visibleCategories = useMemo(() => {
        let categories = [
            { name: 'Snacks', icon: GiIceCreamCone },
            { name: 'Stationery', icon: GiNotebook },
            { name: 'Favorites', icon: FaHeart }
        ];
        if (isTimeSlotActive('lunchStart', 'lunchEnd')) categories.unshift({ name: 'Lunch', icon: GiFastNoodles });
        if (isTimeSlotActive('breakfastStart', 'breakfastEnd')) categories.unshift({ name: 'Breakfast', icon: GiHotMeal });
        return Array.from(new Map(categories.map(cat => [cat.name, cat])).values());
    }, [isTimeSlotActive]);

    // Sync activeCategory effect
    useEffect(() => {
        const newActiveCategory = (() => {
            if (isTimeSlotActive('breakfastStart', 'breakfastEnd')) return 'Breakfast';
            if (isTimeSlotActive('lunchStart', 'lunchEnd')) return 'Lunch';
            return 'Snacks';
        })();
        if (activeCategory !== newActiveCategory || (activeCategory !== 'Snacks' && newActiveCategory === 'Snacks')) {
             setActiveCategory(newActiveCategory);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTimeSlotActive]);

    // --- Data Fetching ---
    const fetchCanteenStatusAndHours = async () => {
        // console.log("FETCHING STATUS & HOURS..."); // Keep if needed
        try {
            const [statusRes, hoursRes] = await Promise.all([
                axios.get('http://localhost:5000/api/canteen-status/public'),
                axios.get('http://localhost:5000/api/service-hours/public')
            ]);
            const isOpen = statusRes.data.isOpen;
            setIsCanteenOpen(isOpen);
            if (hoursRes.data) setServiceHours(hoursRes.data);
            // console.log("Status isOpen:", isOpen, "Hours:", hoursRes.data); // Keep if needed
            return isOpen;
        } catch (err) {
            console.error("Could not fetch canteen status or hours.", err);
            setIsCanteenOpen(false);
            setError("Could not get canteen status. Assuming closed.");
            return false;
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            // console.log("1. Starting fetchDashboardData..."); // Keep if needed
            setLoading(true);
            setError(null);

            // console.log("2. Calling fetchCanteenStatusAndHours..."); // Keep if needed
            const isOpen = await fetchCanteenStatusAndHours();
            // console.log("3. Canteen status isOpen:", isOpen); // Keep if needed

            if (!isOpen) {
                // console.log("4. Canteen is closed, stopping data fetch."); // Keep if needed
                setLoading(false);
                return;
            }

            try {
                // console.log("5. Canteen is open, fetching student data..."); // Keep if needed
                const studentDataString = localStorage.getItem('student');
                if (studentDataString) {
                    const studentData = JSON.parse(studentDataString);
                    if (studentData && studentData.favorites) setFavorites(studentData.favorites);
                }
                // console.log("6. Fetching menu and ads..."); // Keep if needed

                const [menuRes, adRes] = await Promise.all([
                    fetch('http://localhost:5000/api/menu'),
                    fetch('http://localhost:5000/api/advertisements/active')
                ]);

                // console.log("7. Menu response status:", menuRes.status); // Keep if needed
                // console.log("8. Ads response status:", adRes.status); // Keep if needed

                if (!menuRes.ok) {
                    const errorText = await menuRes.text();
                    throw new Error(`Failed to fetch menu. Status: ${menuRes.status}. Response: ${errorText}`);
                }
                const menuData = await menuRes.json();
                if (!Array.isArray(menuData)) {
                    console.error("Received non-array menu data:", menuData);
                    throw new Error("Invalid menu data received from server.");
                }
                setMenuItems(menuData.map(item => ({ ...item, image: item.imageUrl })));
                // console.log("9. Menu items set."); // Keep if needed

                if (adRes.ok) {
                    const adData = await adRes.json();
                     if (!Array.isArray(adData)) {
                         console.error("Received non-array ad data:", adData);
                         throw new Error("Invalid ad data received from server.");
                     }
                    setActiveAds(adData);
                    // console.log("10. Active ads set."); // Keep if needed
                } else {
                     console.warn("Failed to fetch ads, status:", adRes.status);
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError(`Could not fetch data: ${err.message}`);
            } finally {
                // console.log("11. Setting loading to false."); // Keep if needed
                setLoading(false);
            }
        };

        fetchDashboardData();

        const interval = setInterval(fetchCanteenStatusAndHours, POLLING_INTERVAL);
        return () => clearInterval(interval);

    }, [navigate]); // Using navigate here is fine, ensures fetch on initial load/redirect

    // --- toggleFavorite function ---
    const toggleFavorite = async (itemId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to manage your favorites.');
            return navigate('/login');
        }
        const originalFavorites = [...favorites];
        const isCurrentlyFavorite = originalFavorites.includes(itemId);
        const newFavorites = isCurrentlyFavorite ? originalFavorites.filter(id => id !== itemId) : [...originalFavorites, itemId];
        setFavorites(newFavorites);
        const studentDataString = localStorage.getItem('student');
        if (studentDataString) {
            const studentData = JSON.parse(studentDataString);
            studentData.favorites = newFavorites;
            localStorage.setItem('student', JSON.stringify(studentData));
        }
        try {
            const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
            const endpoint = `http://localhost:5000/api/student/favorites/${itemId}`;
            const response = await fetch(endpoint, { method, headers: { 'x-auth-token': token } });
            if (response.status === 401) {
                alert('Session expired. Please log in again.');
                localStorage.clear();
                return navigate('/login');
            }
            if (!response.ok) throw new Error('Server update failed.');
        } catch (err) {
            setFavorites(originalFavorites);
            if (studentDataString) { /* revert local storage */ }
            alert('Failed to update favorites. Please try again.');
        }
     };

    // --- Filtering Logic ---
    let filteredItems;
    let pageTitle;
    let availableSubCategories = [];

    const availableItems = useMemo(() => {
        return menuItems.filter(item => {
            if (item.stock <= 0) return false;
            if (item.category === 'Snacks' || item.category === 'Stationery') return true;
            if (item.category === 'Breakfast' && isTimeSlotActive('breakfastStart', 'breakfastEnd')) return true;
            if (item.category === 'Lunch' && isTimeSlotActive('lunchStart', 'lunchEnd')) return true;
            return false;
        });
    }, [menuItems, isTimeSlotActive]);

    if (searchTerm.trim()) {
        pageTitle = `Searching for "${searchTerm}"`;
        filteredItems = availableItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (selectedSubCategoryId) setSelectedSubCategoryId(null);
    } else {
        pageTitle = activeCategory;
        if (activeCategory === 'Favorites') {
            const favIds = new Set(favorites);
            filteredItems = availableItems.filter(item => favIds.has(item._id));
            if (selectedSubCategoryId) setSelectedSubCategoryId(null);
        } else if (activeCategory === 'Snacks') {
            const snackItems = availableItems.filter(item => item.category === 'Snacks');
            const subMap = new Map();
            snackItems.forEach(item => {
                // Ensure subCategory exists and has an _id before adding
                if (item.subCategory && item.subCategory._id && !subMap.has(item.subCategory._id)) {
                    subMap.set(item.subCategory._id, item.subCategory);
                }
            });
            availableSubCategories = Array.from(subMap.values()).sort((a, b) => a.name.localeCompare(b.name));

            if (selectedSubCategoryId) {
                const selectedSub = availableSubCategories.find(sub => sub._id === selectedSubCategoryId);
                pageTitle = selectedSub ? selectedSub.name : 'Snacks';
                filteredItems = snackItems.filter(item => item.subCategory && item.subCategory._id === selectedSubCategoryId);
            } else {
                filteredItems = [];
                pageTitle = 'Snacks - Choose a type';
            }
        } else {
            filteredItems = availableItems.filter(item => item.category === activeCategory);
            if (selectedSubCategoryId) setSelectedSubCategoryId(null);
            // Time slot inactive title logic...
            if (activeCategory === 'Breakfast' && !isTimeSlotActive('breakfastStart', 'breakfastEnd')) {
                pageTitle = `Breakfast (Available ${serviceHours.breakfastStart} - ${serviceHours.breakfastEnd})`;
            } else if (activeCategory === 'Lunch' && !isTimeSlotActive('lunchStart', 'lunchEnd')) {
                pageTitle = `Lunch (Available ${serviceHours.lunchStart} - ${serviceHours.lunchEnd})`;
            }
        }
    }

    const handleSubCategoryClick = (subId) => setSelectedSubCategoryId(subId);
    const handleBackToSubCategories = () => setSelectedSubCategoryId(null);
    useEffect(() => { setSelectedSubCategoryId(null); }, [activeCategory]);


    // --- Render ---
    return (
        <div className="bg-slate-900 min-h-screen font-sans relative">
            <SparkleOverlay />
            <div className="relative z-10">
                <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} isCanteenOpen={isCanteenOpen} />
                <main className="container mx-auto p-4 md:p-6">
                    {!isCanteenOpen ? (
                        <div className="text-center py-40">
                            <h2 className="text-4xl font-extrabold text-red-500 mb-4">Canteen is Currently CLOSED ⛔</h2>
                            <p className="text-xl text-slate-400">Please check back later!</p>
                        </div>
                    ) : loading ? (
                         <div className="text-center p-10 font-semibold text-slate-400 flex justify-center items-center space-x-2">
                             <svg className="animate-spin h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                            <span>Loading Menu... 😋</span>
                        </div>
                    ) : error ? (
                        <div className="text-center bg-slate-800 p-10 rounded-lg shadow-md border-l-4 border-red-500">
                            <h2 className="text-2xl font-bold text-red-400">Error 😟</h2>
                            <p className="text-slate-300 mt-2">{error}</p>
                        </div>
                    ) : (
                        <>
                            <AdRotatorComponent activeAds={activeAds} showAdModal={showAdModal} setShowAdModal={setShowAdModal} />
                            <div className="mt-8">
                                <CategoryFilter categories={visibleCategories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-extrabold text-slate-100">{pageTitle}</h2>
                                    {activeCategory === 'Snacks' && selectedSubCategoryId && (
                                        <button onClick={handleBackToSubCategories} className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors bg-slate-700/50 px-3 py-1 rounded-md">
                                            <FaArrowLeft /> Back
                                        </button>
                                    )}
                                </div>

                                {/* Conditional Rendering: Subcategories or Items */}
                                {activeCategory === 'Snacks' && !selectedSubCategoryId && !searchTerm.trim() ? (
                                    availableSubCategories.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                            {availableSubCategories.map(sub => <SubCategoryCard key={sub._id} subCategory={sub} onClick={() => handleSubCategoryClick(sub._id)} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-slate-800 rounded-lg shadow-sm"><p className="text-slate-400">No Snack subcategories available.</p></div>
                                    )
                                ) : ( // Show Items
                                    filteredItems.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {filteredItems.map(item => <MenuItemCard key={item._id} item={item} onAddToCart={handleAddToCart} isFavorite={favorites.includes(item._id)} onToggleFavorite={toggleFavorite} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-slate-800 rounded-lg shadow-sm">
                                            <p className="text-slate-400">
                                                {searchTerm.trim() ? "No available items match your search." :
                                                    activeCategory === 'Favorites' ? "You haven't added any favorites yet." :
                                                    activeCategory === 'Snacks' && selectedSubCategoryId ? `No items available in this subcategory right now.` :
                                                    `No ${activeCategory} items available right now.`
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </main>
                {isCanteenOpen && <FeedbackButton />}
            </div>
        </div>
    );
};

export default DashboardPage;