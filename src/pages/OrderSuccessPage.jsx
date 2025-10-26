import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LuPartyPopper } from 'react-icons/lu';
// Removed: import { QRCodeSVG } from 'qrcode.react';

const OrderSuccessPage = () => {
    const location = useLocation();
    const order = location.state?.order;
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        const studentData = localStorage.getItem('student');
        if (studentData) {
            setStudentName(JSON.parse(studentData).name);
        }
    }, []);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center p-4">
                <h2 className="text-2xl font-bold text-red-400">Error: No order data found.</h2>
                <Link to="/dashboard" className="mt-4 bg-orange-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-700 transition-all active:scale-95">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // Use order.paymentMethod for display
    const paymentMethodDisplay = order.paymentMethod || (order.razorpayPaymentId ? 'UPI/Card (Paid)' : 'Cash on Delivery (Pending)');

    const formattedDate = new Date(order.orderDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="bg-slate-800 p-6 md:p-10 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2">
                        <LuPartyPopper className="w-full h-full text-orange-400 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-100">Order Placed Successfully!</h1>
                    <p className="text-slate-400 mt-1 mb-6">Your order is now being processed.</p>
                </div>
                
                {/* Receipt Container */}
                <div className="bg-slate-700/50 p-6 rounded-lg border-2 border-dashed border-orange-500/50 shadow-inner">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-extrabold text-slate-100">JJ College Smart Canteen</h2>
                    </div>
                    
                    {/* Bill Number Section (Made prominent since QR is removed) */}
                    <div className="text-center my-6 py-3 border-y border-slate-600">
                        <p className="text-sm text-slate-400 mb-1">REFERENCE BILL NUMBER</p>
                        <p className="font-extrabold text-orange-400 text-3xl mt-1 font-mono">{order.billNumber}</p>
                        <p className="text-xs text-slate-400 mt-2">Please quote this number for collection</p>
                    </div>
                    {/* End Bill Number Section */}

                    {/* Order Meta Data */}
                    <div className="space-y-3 text-base text-slate-200 mb-4 border-t border-b border-slate-600 py-3">
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-400">Student Name:</span>
                            <span className='font-medium'>{studentName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-400">Payment:</span>
                            <span className={`font-medium ${order.status === 'Paid' ? 'text-green-400' : 'text-blue-400'}`}>{paymentMethodDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-400">Date:</span>
                            <span className='font-medium'>{formattedDate}</span>
                        </div>
                    </div>
                    
                    {/* Itemized List Header */}
                    <div className="py-3 my-4">
                        <div className="flex justify-between font-extrabold text-slate-100 text-sm">
                            <span className="w-1/2">ITEM</span>
                            <span className="w-1/4 text-center">QTY</span>
                            <span className="w-1/4 text-right">PRICE</span>
                        </div>
                        {/* Itemized List Details */}
                        {order.items.map((item, index) => (
                            // 🔑 DEFENSIVE FIX: Use index as a fallback key if item._id is missing
                            <div key={item._id || index} className="flex justify-between text-slate-300 text-sm mt-2">
                                <span className="w-1/2 truncate">{item.name}</span>
                                <span className="w-1/4 text-center font-medium">{item.quantity}</span>
                                <span className="w-1/4 text-right">₹{item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total Amount */}
                    <div className="flex justify-between font-extrabold text-2xl text-slate-100 mt-6 pt-3 border-t-2 border-slate-600">
                        <span className='text-orange-400'>Total {order.status === 'Paid' ? 'Paid:' : 'Due:'}</span>
                        <span className='text-green-400'>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Back to Dashboard Button */}
                <Link to="/dashboard" className="block w-full mt-8 bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-all active:scale-95 text-center shadow-lg shadow-orange-500/30">
                    Start a New Order
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;