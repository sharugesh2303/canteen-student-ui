import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar'; 
import { FaChevronLeft, FaShoppingCart, FaCheckCircle, FaHourglassHalf, FaClock, FaClipboardCheck, FaTimesCircle, FaReceipt } from 'react-icons/fa';

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
    const { orderId } = useParams(); 
    
    const [order, setOrder] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [studentName, setStudentName] = useState('Customer');


    useEffect(() => {
        // Load student name for display
        const studentData = localStorage.getItem('student');
        if (studentData) {
            setStudentName(JSON.parse(studentData).name);
        }

        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            navigate('/login', { replace: true });
            return;
        }

        if (!orderId) {
            setError('No order ID provided.');
            setLoading(false);
            return;
        }

        const fetchOrder = async (tkn) => {
            setLoading(true); 
            try {
                const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
                    headers: getAuthHeaders(tkn),
                });
                setOrder(response.data);
            } catch (err) {
                console.error("Order Fetch Failed:", err.response?.status, err.message); 
                if (err.response?.status === 401) {
                    navigate('/login', { replace: true });
                } else {
                    setError('Failed to fetch order details. It may be expired or access is denied.'); 
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder(storedToken);

    }, [navigate, orderId]); 

    
    // --- Rendering based on state (Loading and Error Handlers) ---

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
                <button onClick={() => navigate('/my-orders')} className="mt-6 bg-orange-500 text-white font-bold py-3 px-8 rounded-lg transition-all hover:bg-orange-600 active:scale-95">Back to History</button>
            </div>
        );
    }

    // --- Data Processing for Display ---
    const billDisplay = order.billNumber || order._id;
    const paymentMethodDisplay = order.paymentMethod || (order.razorpayPaymentId ? 'UPI/Card (Paid)' : 'Cash on Delivery (Pending)');
    const formattedDate = new Date(order.orderDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    const statusDisplay = getStatusDisplay(order.status);
    
    return (
        <div className="bg-slate-900 min-h-screen font-sans">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                
                <div className="bg-slate-800 p-6 md:p-10 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-slate-700">
                    
                    <button 
                        onClick={() => navigate('/my-orders')} 
                        className="text-slate-400 hover:text-orange-400 transition-colors flex items-center mb-6 active:scale-95"
                    >
                        <FaChevronLeft size={20} className="mr-2" /> Back to History
                    </button>
                    
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2">
                            <FaReceipt className="w-full h-full text-orange-400" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-100 mb-1">Order Details</h1>
                        <p className="text-slate-400">Your Official Transaction Receipt</p>
                    </div>

                    
                    {/* Receipt Container */}
                    <div className="bg-slate-700/50 p-6 rounded-lg border-2 border-dashed border-orange-500/50 shadow-inner mt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-extrabold text-slate-100">JJ College Smart Canteen</h2>
                            <span className={statusDisplay.className + " mt-2 mx-auto"}>
                                <statusDisplay.Icon size={16} /> {statusDisplay.text}
                            </span>
                        </div>
                        
                        {/* Bill Number Section */}
                        <div className="text-center my-6 py-3 border-y border-slate-600">
                            <p className="text-sm text-slate-400 mb-1">REFERENCE BILL NUMBER</p>
                            <p className="font-extrabold text-orange-400 text-3xl mt-1 font-mono">{billDisplay}</p>
                        </div>
                        
                        {/* Order Meta Data */}
                        <div className="space-y-3 text-base text-slate-200 mb-4 border-t border-b border-slate-600 py-3">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-400">Student Name:</span>
                                <span className='font-medium'>{studentName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-400">Payment:</span>
                                <span className={`font-medium ${order.status !== 'Pending' ? 'text-green-400' : 'text-blue-400'}`}>{paymentMethodDisplay}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-400">Date:</span>
                                <span className='font-medium'>{formattedDate}</span>
                            </div>
                        </div>
                        
                        {/* Itemized List Header */}
                        <div className="py-3 my-4">
                            <div className="flex justify-between font-extrabold text-slate-100 text-sm border-b border-slate-600 pb-2 mb-2">
                                <span className="w-1/2">ITEM</span>
                                <span className="w-1/4 text-center">QTY</span>
                                <span className="w-1/4 text-right">AMOUNT</span>
                            </div>
                            {/* Itemized List Details */}
                            {order.items.map((item, index) => (
                                <div key={item._id || index} className="flex justify-between text-slate-300 text-sm mt-2">
                                    <span className="w-1/2 truncate">{item.name}</span>
                                    <span className="w-1/4 text-center font-medium">{item.quantity}</span>
                                    <span className="w-1/4 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Total Amount */}
                        <div className="flex justify-between font-extrabold text-2xl text-slate-100 mt-6 pt-3 border-t-2 border-slate-600">
                            <span className='text-orange-400'>GRAND TOTAL:</span>
                            <span className='text-green-400'>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Button Links */}
                    <div className="mt-8 space-y-3">
                        <Link 
                            to="/dashboard" 
                            className="block w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-all active:scale-95 text-center shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                        >
                            <FaShoppingCart size={20} /> Start a New Order
                        </Link>
                        <Link 
                            to="/my-orders" 
                            className="block w-full bg-slate-700 text-slate-300 font-semibold py-3 rounded-lg hover:bg-slate-600 transition-all active:scale-95 text-center"
                        >
                            View All History
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetailsPage;
