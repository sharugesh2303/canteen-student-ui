import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FaHistory, FaCheckCircle, FaTruck, FaMoneyBillWave, FaChevronRight } from 'react-icons/fa';

// --- CONFIGURATION ---
// 🔑 FIX: Ensuring this page uses the definitive backend URL too.
const API_BASE_URL = 'https://jj-canteen-backend-jakh.onrender.com/api'; 

// Helper function for Authorization Header
const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`
});

// --- Order Card Component (Unchanged) ---
const OrderCard = ({ order, orderIndex }) => {
// ... (OrderCard code remains the same as previously provided)
    let statusIcon, statusColor;
    const status = order.status.toLowerCase();

    switch (status) {
        case 'delivered':
            statusIcon = <FaCheckCircle size={16} />; 
            statusColor = 'text-green-400 bg-green-900/50';
            break;
        case 'ready':
            statusIcon = <FaTruck size={16} />; 
            statusColor = 'text-orange-400 bg-orange-900/50';
            break;
        case 'pending':
            statusIcon = <FaMoneyBillWave size={16} />;
            statusColor = 'text-blue-400 bg-blue-900/50';
            break;
        case 'paid':
        default:
            statusIcon = <FaMoneyBillWave size={16} />;
            statusColor = 'text-yellow-400 bg-yellow-900/50';
            break;
    }

    const orderDate = new Date(order.orderDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <Link 
            to={`/order-details/${order._id}`} 
            state={{ order: order }} // Pass full order object for immediate display on next page
            className="block" 
        >
            <div className="bg-slate-700 p-6 rounded-xl shadow-md cursor-pointer 
                        transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 
                        hover:-translate-y-0.5 active:scale-[0.98] border border-slate-600">
                
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-lg font-semibold text-orange-400">Bill No: {order.billNumber || order.orderId}</p>
                        <p className="text-2xl font-bold text-slate-100 mt-1">
                            ₹{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">{orderDate}</p>
                    </div>
                    
                    <div className="text-right flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 text-sm font-semibold uppercase rounded-full flex items-center gap-1 ${statusColor}`}>
                            {status} {statusIcon}
                        </span>
                        <div className="text-slate-400 text-base mt-1 flex items-center">
                           View Details <FaChevronRight size={12} className='ml-1' />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-600 mt-4 pt-3">
                    <h4 className="font-semibold text-slate-300 mb-2 text-lg">Items Summary:</h4>
                    <ul className="text-slate-400 text-base flex flex-wrap gap-x-6">
                        {order.items.slice(0, 3).map((item, i) => ( 
                            <li key={i} className="truncate">
                                {item.name} (x{item.quantity})
                            </li>
                        ))}
                        {order.items.length > 3 && (
                            <li className="text-slate-500">
                                + {order.items.length - 3} more
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </Link>
    );
};


const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCanteenOpen, setIsCanteenOpen] = useState(true); 
    const navigate = useNavigate();
    
    const historyIcon = <FaHistory size={30} className="inline text-orange-400 ml-3 mb-1" />;

    const fetchCanteenStatus = async () => {
        try {
            // Using hardcoded API_BASE_URL
            const statusRes = await axios.get(`${API_BASE_URL}/canteen-status/public`); 
            setIsCanteenOpen(statusRes.data.isOpen);
            return statusRes.data.isOpen;
        } catch (err) {
            console.warn("Could not fetch canteen status for HistoryPage.");
            setIsCanteenOpen(false); 
            return false;
        }
    };

    const fetchOrderHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const isOpen = await fetchCanteenStatus();
        if (!isOpen) { 
            setLoading(false);
            return;
        }

        try {
            // Using hardcoded API_BASE_URL and Bearer token headers
            const response = await axios.get(`${API_BASE_URL}/orders/my-history`, {
                headers: getAuthHeaders(token),
            });

            // Axios automatically parses JSON and checks for 2xx status codes.
            setOrders(response.data);

        } catch (err) {
            if (err.response && err.response.status === 401) {
                 // Handle session expiration specifically
                localStorage.clear();
                alert('Your session expired. Please log in again.');
                navigate('/login');
            } else if (err.response && err.response.data && err.response.data.message) {
                 setError(err.response.data.message);
            } else {
                 setError('Failed to fetch order history. Check backend connection.');
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrderHistory();

        // Polling status and history periodically
        const interval = setInterval(fetchOrderHistory, 30000); 
        return () => clearInterval(interval);

    }, [navigate]);

    return (
        <div className="bg-slate-900 min-h-screen font-sans">
            <Navbar />
            <main className="container mx-auto p-4 md:p-8">
                
                {/* Header outside the main card */}
                <h1 className="text-4xl font-extrabold text-slate-100 mb-8 flex items-center">
                    Your Order History {historyIcon}
                </h1>
                
                {/* CONDITIONAL RENDERING BASED ON STATUS */}
                {!isCanteenOpen ? (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl max-w-5xl mx-auto border border-slate-700 text-center py-20">
                        <h2 className="text-4xl font-extrabold text-red-400 mb-4">Canteen is CLOSED ⛔</h2>
                        <p className="text-xl text-slate-400">
                            You cannot view history when the canteen is closed.
                        </p>
                        <Link to="/dashboard" className="mt-6 inline-block bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-orange-500/30">
                            View Dashboard Status
                        </Link>
                    </div>
                ) : (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl max-w-5xl mx-auto border border-slate-700">
                        {loading && (
                            <div className="text-center py-10 font-semibold text-slate-400 flex justify-center items-center space-x-2">
                                <svg className="animate-spin h-6 w-6 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading your orders...</span>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="text-center bg-slate-700/50 p-10 rounded-lg shadow border border-red-500">
                                <p className="text-xl text-red-400">Error: Failed to load order history.</p>
                                <p className="text-sm text-slate-400 mt-2">{error}</p>
                            </div>
                        )}
                        
                        {!loading && !error && orders.length === 0 ? (
                            <div className="text-center bg-slate-700/50 p-10 rounded-lg shadow border border-dashed border-slate-600">
                                <p className="text-xl text-slate-400 mb-4">You haven't placed any orders yet.</p>
                                <Link to="/dashboard" className="inline-block bg-orange-500 text-white font-bold py-3 px-8 rounded-lg transition-all hover:bg-orange-600 active:scale-95 text-lg">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order, index) => (
                                    <OrderCard 
                                        key={order._id || index} 
                                        order={order} 
                                        orderIndex={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderHistoryPage;