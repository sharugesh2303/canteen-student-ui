/* ==================================
 * FILE: src/pages/CartPage.jsx
 * ================================== */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

// --- CONFIGURATION ---
// 🟢 FIX APPLIED: Use VITE_API_URL from environment variables (set in Vercel)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to dynamically load the Razorpay script
const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Helper function for Authorization Header
const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

const CartPage = () => {
    const { cart, setCart } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [studentData, setStudentData] = useState({});
    const [isCanteenOpen, setIsCanteenOpen] = useState(true); 
    const navigate = useNavigate();

    // Fetch Canteen Status
    const fetchCanteenStatus = async () => {
        try {
            const statusRes = await axios.get(`${API_BASE_URL}/canteen-status/public`); 
            setIsCanteenOpen(statusRes.data.isOpen);
        } catch (err) {
            console.warn("Could not fetch canteen status for CartPage.");
            setIsCanteenOpen(false); 
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedStudentData = localStorage.getItem('student');

        if (!token || !storedStudentData) {
            navigate('/login');
            return;
        } else {
            setStudentData(JSON.parse(storedStudentData));
        }

        fetchCanteenStatus();
        const interval = setInterval(fetchCanteenStatus, 15000); 
        return () => clearInterval(interval);

    }, [navigate]);

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleRemoveItem = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== itemId));
    };

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item._id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleUpiPayment = async () => {
        if (totalPrice === 0 || !isCanteenOpen) return;
        
        setIsPlacingOrder(true);
        const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!scriptLoaded) {
            alert('Payment gateway failed to load. Please check your internet connection.');
            setIsPlacingOrder(false);
            return;
        }

        const token = localStorage.getItem('token');
        
        // 1. Construct the complete order payload 
        const orderPayload = {
            amount: totalPrice,
            items: cart.map(item => ({
                _id: item._id, // MenuItem ID
                name: item.name,
                quantity: item.quantity,
                price: item.price // Price per unit
            })),
        };

        try {
            // 2. Send the full order payload to the payment/orders endpoint
            const orderResponse = await axios.post(
                `${API_BASE_URL}/payment/orders`, 
                orderPayload, 
                { 
                    // 🟢 FIX: Use Bearer token for Authorization
                    headers: getAuthHeaders(token)
                }
            );
            
            const orderData = orderResponse.data;

            // 3. CRITICAL FRONTEND FIX: ACCESS VITE ENV VARIABLE
            // 🟢 NOTE: This is designed to pull from Vercel's injected variables
            const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (!RAZORPAY_KEY) {
                // If the key is missing, throw an error to catch below
                throw new Error("Razorpay Key ID (VITE_RAZORPAY_KEY_ID) is missing in frontend environment. Check your Vercel environment variables.");
            }

            const options = {
                key: RAZORPAY_KEY, // Use the safely checked variable
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'JJ College Smart Canteen',
                description: `Payment for ${cart.length} item(s)`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        // 4. Verification step
                        const verificationResponse = await axios.post(`${API_BASE_URL}/payment/verify`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            orderPayload: { items: cart, totalAmount: totalPrice }, 
                        }, { 
                            // 🟢 FIX: Use Bearer token for Authorization
                            headers: getAuthHeaders(token)
                        });

                        if (verificationResponse.data.order) {
                            setCart([]);
                            navigate('/order-success', { state: { order: verificationResponse.data.order } });
                        } else {
                            alert('Payment verification failed. Please contact support.');
                            setIsPlacingOrder(false);
                        }
                    } catch (err) {
                        alert('An error occurred while verifying your payment.');
                        setIsPlacingOrder(false);
                    }
                },
                prefill: { name: studentData.name, email: studentData.email },
                theme: { color: '#f97316' } 
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                alert('Payment failed. Please try again or contact support.');
                console.error('Razorpay Error:', response.error.description);
                setIsPlacingOrder(false);
            });
            paymentObject.open();

        } catch (error) {
            // Log the full error to the console for detailed debugging
            console.error('Payment Setup Error (FATAL):', error.response || error.message); 
            
            // Display friendly message
            const friendlyMessage = error.message.includes("VITE_RAZORPAY_KEY_ID") 
                ? "Setup Error: Razorpay Key ID is missing in your Vercel environment variables."
                : `Payment setup failed. Details: ${error.response?.data?.message || error.message}`;

            alert(friendlyMessage);
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                
                {/* CONDITIONAL RENDERING BASED ON STATUS */}
                {!isCanteenOpen ? (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl max-w-4xl mx-auto border border-slate-700 text-center py-20">
                        <h2 className="text-4xl font-extrabold text-red-400 mb-4">Canteen is CLOSED ⛔</h2>
                        <p className="text-xl text-slate-400">
                            You cannot access the cart while the canteen is closed for service.
                        </p>
                        <Link to="/dashboard" className="mt-6 inline-block bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-orange-500/30">
                            View Dashboard Status
                        </Link>
                    </div>
                ) : (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl max-w-4xl mx-auto border border-slate-700">
                        <h1 className="text-3xl font-bold text-slate-100 mb-6">Your Cart <span className='text-orange-400'>🛒</span></h1>
                        
                        {cart.length === 0 ? (
                            <div className="text-center py-12 bg-slate-700/50 rounded-lg border border-dashed border-slate-600 shadow-inner">
                                <p className="text-xl text-slate-400 mb-6">Your cart looks a little empty! Time to grab a quick bite.</p>
                                <Link to="/dashboard" className="mt-6 inline-block bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-orange-500/30">
                                    ← Back to Menu
                                </Link>
                            </div>
                        ) : (
                            <div>
                                {cart.map(item => (
                                    <div 
                                        key={item._id} 
                                        className="flex items-center justify-between border-b border-slate-700 py-4 transition-all duration-300 hover:bg-slate-700/50 rounded-lg px-2 my-2"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-slate-600" />
                                            <div>
                                                <h2 className="text-lg font-semibold capitalize text-slate-100">{item.name}</h2>
                                                <p className="text-slate-400">₹{item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 md:gap-8">
                                            <div className="flex items-center border border-slate-600 rounded-lg bg-slate-700">
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} 
                                                    className="p-2 font-bold text-xl text-slate-300 hover:text-red-400 transition-all active:scale-90"
                                                    title="Decrease Quantity"
                                                >
                                                    <FaMinus size={12} />
                                                </button>
                                                <span className="px-3 font-bold text-slate-100 text-lg border-x border-slate-600">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} 
                                                    className="p-2 font-bold text-xl text-slate-300 hover:text-green-400 transition-all active:scale-90"
                                                    title="Increase Quantity"
                                                >
                                                    <FaPlus size={12} />
                                                </button>
                                            </div>
                                            
                                            <p className="font-bold w-16 text-right text-lg text-orange-400 hidden sm:block">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            
                                            <button 
                                                onClick={() => handleRemoveItem(item._id)} 
                                                className="text-red-400 hover:text-red-500 transition-all transform hover:scale-110 active:scale-90 p-2 rounded-full hover:bg-slate-700" 
                                                title="Remove Item"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="mt-8 flex flex-col items-end pt-4 border-t border-slate-700">
                                    <h2 className="text-3xl font-extrabold text-slate-100">Total: <span className='text-orange-400'>₹{totalPrice.toFixed(2)}</span></h2>
                                    <p className="text-slate-500 text-sm mt-1">Payable amount, including all charges</p>
                                    
                                    <div className="mt-6">
                                        <button
                                            onClick={handleUpiPayment}
                                            disabled={isPlacingOrder}
                                            className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-green-700 disabled:bg-green-400/50 transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl shadow-green-600/30"
                                        >
                                            {isPlacingOrder ? 'Processing Payment...' : 'Proceed to Pay'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CartPage;