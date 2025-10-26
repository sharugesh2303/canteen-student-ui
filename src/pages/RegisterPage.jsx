import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// --- CONFIGURATION ---
// 🟢 FIX APPLIED: Use VITE_API_URL from environment variables (set in Vercel)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// --- End API Config ---

// Placeholder Icons (to avoid external dependency issues)
const UserIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>);
const LockIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor"><path d="M144 160C144 89.6 202.7 32 272 32c70.5 0 128 57.6 128 128v48H144V160zM32 224h112v48H32V224zm-16 80c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16h112v80H16zm144 0v-80h160v80H160zm176-16c0-8.8 7.2-16 16-16h112v80H352V288z"/></svg>);
const MailIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} width="1em" height="1em" viewBox="0 0 512 512" fill="currentColor"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 369.6c29.1 22 69.8 22 98.9 0l217.6-179.2c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 160V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160L320 320c-17.7 13.3-39.6 20-64 20s-46.3-6.7-64-20L0 160z"/></svg>);
const CapIcon = ({ size, className }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512" className={className} fill="currentColor"><path d="M472 64H40c-17.67 0-32 14.33-32 32v272c0 17.67 14.33 32 32 32h16c0 53.02 42.98 96 96 96s96-42.98 96-96h64c0 53.02 42.98 96 96 96s96-42.98 96-96h16c17.67 0 32-14.33 32-32V96c0-17.67-14.33-32-32-32zM152 448c-30.88 0-56-25.12-56-56s25.12-56 56-56 56 25.12 56 56-25.12 56-56 56zm208 0c-30.88 0-56-25.12-56-56s25.12-56 56-56 56 25.12 56 56-25.12 56-56 56zM464 264H48V96h416v168z"/></svg>);


const RegisterPage = () => {
    // Removed registerNumber from state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        // Updated check to only require name, email, and password
        if (!name || !email || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            // 🟢 FIX APPLIED: Use API_BASE_URL
            const response = await axios.post(`${API_BASE_URL}/auth/register-email-otp`, { name, email });
            setSuccessMsg(response.data.message);
            setIsOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP via email. Check your email address.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            // 🟢 FIX APPLIED: Use API_BASE_URL
            const response = await axios.post(`${API_BASE_URL}/auth/verify-email-otp`, { email, otp, password });
            setSuccessMsg(response.data.message + " Redirecting to login...");
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-green-300 flex flex-col items-center justify-center p-4">
            <div className="text-center text-white mb-8">
                <div className="inline-block bg-white p-4 rounded-full mb-4 shadow-lg">
                    <CapIcon size={40} className="text-cyan-600" />
                </div>
                <h1 className="text-4xl font-bold">JJ College Canteen</h1>
                <p className="text-lg mt-2 font-light">Student Register</p>
            </div>
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create New Account</h2>
                
                <form className="space-y-4" onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                    
                    {/* --- STEP 1: Registration Details (Visible until OTP is sent) --- */}
                    {!isOtpSent && (
                        <>
                            <div className="relative">
                                <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-1">Name</label>
                                <span className="absolute inset-y-0 left-0 top-6 flex items-center pl-3">
                                    <UserIcon className="text-gray-400" />
                                </span>
                                <input type="text" id="name" placeholder="Full Name" required
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            {/* Removed the Register Number input field */}

                            <div className="relative">
                                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-1">Email Address (for OTP)</label>
                                <span className="absolute inset-y-0 left-0 top-6 flex items-center pl-3">
                                    <MailIcon className="text-gray-400" />
                                </span>
                                <input type="email" id="email" placeholder="e.g. name@college.com" required
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="relative">
                                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-1">Password</label>
                                <span className="absolute inset-y-0 left-0 top-6 flex items-center pl-3">
                                    <LockIcon className="text-gray-400" />
                                </span>
                                <input type="password" id="password" placeholder="Create Password" required
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </>
                    )}

                    {/* --- STEP 2: OTP Verification (Visible after OTP is sent) --- */}
                    {isOtpSent && (
                        <div className="relative">
                            <label htmlFor="otp" className="block text-gray-700 text-sm font-semibold mb-1">Verification Code (Check your email)</label>
                            <span className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 text-cyan-600 font-bold">#</span>
                            <input type="text" id="otp" placeholder="Enter 6-digit OTP" required
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                value={otp} onChange={(e) => setOtp(e.target.value)} />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    {successMsg && <p className="text-green-500 text-center text-sm">{successMsg}</p>}

                    <button type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition duration-300 disabled:opacity-50">
                        {loading ? (isOtpSent ? 'Verifying...' : 'Sending OTP...') : (isOtpSent ? 'Verify OTP & Finish' : 'Register & Get OTP')}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;