import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar'; 
import { FaChevronLeft, FaShoppingCart, FaCheckCircle, FaHourglassHalf, FaClock, FaClipboardCheck, FaTimesCircle } from 'react-icons/fa';

// --- CONFIGURATION ---
const API_BASE_URL = 'https://jj-canteen-backend-jakh.onrender.com/api'; 

const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`
});

// Helper to determine the status badge styling
const getStatusDisplay = (status) => {
    const statusLower = status ? status.toLowerCase() : 'unknown';
    let className = 'font-extrabold uppercase px-3 py-1 rounded-full shadow-md text-sm flex items-center gap-2';
    let Icon = FaClock;

    switch (statusLower) {
        case 'ready': Icon = FaClipboardCheck; className += ' bg-green-500 text-white'; break;
        case 'paid': Icon = FaHourglassHalf; className += ' bg-yellow-500 text-gray-900'; break;
        case 'pending': Icon = FaClock; className += ' bg-blue-500 text-white'; break;
        case 'delivered': case 'completed': Icon = FaCheckCircle; className += ' bg-green-600 text-white'; break;
        case 'cancelled': Icon = FaTimesCircle; className += ' bg-red-600 text-white'; break;
        default: Icon = FaClock; className += ' bg-slate-500 text-white';
    }
    return { className, Icon, text: status || 'Unknown' };
};

const OrderDetailsPage = () => {
    const navigate = useNavigate();
    const { orderId } = useParams(); // CORRECTLY extracts the ID from the URL
    
    const [order, setOrder] = useState(null); 
    const [token, setToken] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);


    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            navigate('/login', { replace: true });
            return;
        }

        setToken(storedToken);

        if (!orderId) {
            setError('No order ID provided.');
            setLoading(false);
            return;
        }

        const fetchOrder = async (tkn) => {
            setLoading(true); 
            try {
                // CORRECT API CALL: Uses the ID from useParams()
                const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
                    headers: getAuthHeaders(tkn),
                });
                setOrder(response.data);
            } catch (err) {
                console.error("Order Fetch Failed:", err.response?.status, err.message); 
                if (err.response?.status === 401) {
                    navigate('/login', { replace: true });
                } else {
                    // This error is likely what you were seeing if the ID was invalid or the order didn't belong to the user
                    setError('Failed to fetch order details. It may be expired or invalid.'); 
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder(storedToken);

    }, [navigate, orderId]); 

    
    // --- Rendering based on state (must come before final return) ---

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center">
                <svg className="animate-spin h-10 w-10 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }
    
    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
                <h2 className="text-2xl font-bold text-red-400">Order Error</h2>
                <p className="mt-2 text-lg text-slate-400">{error || 'Order details not found.'}</p>
                <button onClick={() => navigate('/my-orders')} className="mt-6 bg-orange-500 text-white font-bold py-3 px-8 rounded-lg">Back to History</button>
            </div>
        );
    }

    // --- Data Processing for Display ---
    const billDisplay = order.billNumber || order._id;
    const paymentMethodDisplay = order.paymentMethod || (order.razorpayPaymentId ? 'UPI/Card (Paid)' : 'Unknown');
    const orderDate = new Date(order.orderDate).toLocaleString('en-IN', {
        dateStyle: 'full', 
        timeStyle: 'short',
    });
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const statusDisplay = getStatusDisplay(order.status);
    
    return (
        <div className="bg-slate-900 min-h-screen font-sans">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-5xl mx-auto border border-slate-700">
                    <button 
                        onClick={() => navigate('/my-orders')} 
                        className="text-slate-400 hover:text-orange-400 transition-colors flex items-center mb-6 active:scale-95"
                    >
                        <FaChevronLeft size={20} className="mr-2" /> Back to History
                    </button>

                    
                    <div className="flex justify-between items-start border-b border-slate-700 pb-4 mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-100 mb-2">
                                Order Receipt
                            </h1>
                            <p className="text-lg text-orange-400 font-semibold">
                                Bill No: {billDisplay}
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-base font-semibold text-slate-400 mb-2">Payment Method:</span>
                            <span className="text-lg font-bold text-slate-200">{paymentMethodDisplay}</span>
                        </div>
                    </div>


                    <div className="space-y-4 text-slate-200">
                        <div className="flex justify-between border-b border-slate-700 pb-3">
                            <span className="font-semibold text-slate-400">Date & Time:</span>
                            <span className='font-medium text-base md:text-lg'>{orderDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-3">
                            <span className="font-semibold text-slate-400">Total Quantity:</span>
                            <span className='font-medium text-base md:text-lg'>{totalItems} items</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                            <span className="font-extrabold text-slate-200 text-lg">Order Status:</span>
                            <span className={statusDisplay.className}>
                                <statusDisplay.Icon size={16} /> {statusDisplay.text}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4 border-b border-slate-700 pb-2">Items Purchased</h2>
                    
                    <ul className="space-y-3">
                        {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-lg text-slate-300 bg-slate-700/50 p-4 rounded-xl">
                                <div className="font-semibold text-slate-200">
                                    {item.name} <span className="text-orange-400 font-bold text-base">(x{item.quantity})</span>
                                </div>
                                <span className="text-xl font-medium text-slate-100">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>

                    
                    <div className="mt-10 pt-6 border-t-4 border-slate-600 flex justify-between items-center">
                        <span className="text-2xl font-semibold text-slate-100">GRAND TOTAL:</span>
                        <span className="text-5xl font-extrabold text-green-400">₹{order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center mx-auto gap-2 shadow-xl shadow-orange-500/30 text-lg"
                        >
                            <FaShoppingCart size={20} /> Place a New Order
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetailsPage;