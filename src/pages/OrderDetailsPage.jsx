import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import { FaChevronLeft, FaShoppingCart, FaCheckCircle, FaHourglassHalf, FaClock, FaClipboardCheck, FaTimesCircle } from 'react-icons/fa';

// --- Status Styling Helper ---
const getStatusDisplay = (status) => {
    const statusLower = status ? status.toLowerCase() : 'unknown';
    let className = 'font-extrabold uppercase px-3 py-1 rounded-full shadow-md text-sm flex items-center gap-2';
    let Icon = FaClock;

    switch (statusLower) {
        case 'ready':
            Icon = FaClipboardCheck;
            className += ' bg-green-500 text-white';
            break;
        case 'paid':
            Icon = FaHourglassHalf;
            className += ' bg-yellow-500 text-gray-900';
            break;
        case 'pending':
            Icon = FaClock;
            className += ' bg-blue-500 text-white';
            break;
        case 'delivered':
        case 'completed':
            Icon = FaCheckCircle;
            className += ' bg-green-600 text-white';
            break;
        case 'cancelled':
            Icon = FaTimesCircle;
            className += ' bg-red-600 text-white';
            break;
        default:
            Icon = FaClock;
            className += ' bg-slate-500 text-white';
    }
    return { className, Icon, text: status || 'Unknown' };
};
// --- End Status Helper ---

const OrderDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const order = location.state?.order;

    if (!order) {
        // Redirect if no order data is found
        setTimeout(() => navigate('/my-orders', { replace: true }), 1000);
        return (
            <div className="bg-slate-900 min-h-screen text-slate-100 p-8">
                <p className="text-center text-xl">Order details not found. Redirecting...</p>
            </div>
        );
    }

    // Display for Bill Number and Payment Method
    const billDisplay = order.billNumber || order.orderId;
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
                        onClick={() => navigate('/my-orders')} // Navigate back to history
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