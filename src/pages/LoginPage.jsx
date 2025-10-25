import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// --- SVG Icons (for a clean, dependency-free component) ---
const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor">
        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
    </svg>
);
const LockIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="1em" height="1em" viewBox="0 0 448 512" fill="currentColor">
        <path d="M144 160c0-70.4 57.6-128 128-128s128 57.6 128 128v48H144V160zM32 224h112v48H32V224zm-16 80c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16h112v80H16zm144 0v-80h160v80H160zm176-16c0-8.8 7.2-16 16-16h112v80H352V288z"/>
    </svg>
);
const GraduationCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 1.66 4 3 10 3s10-1.34 10-3v-5"/>
    </svg>
);

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);

            localStorage.setItem('token', response.data.token);
            // Ensure data is saved under the 'student' key
            localStorage.setItem('student', JSON.stringify(response.data.student));
            
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    // This tells the browser to look for 'jjcet.jpg' in your project's `public` folder.
    const backgroundImageUrl = '/jjcet.jpg';

    return (
        <div 
            className="min-h-screen bg-cover bg-center" 
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            {/* This inner div creates the dark overlay for readability */}
            <div className="min-h-screen bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
                <div className="text-center text-white mb-8">
                    <div className="inline-block bg-white p-4 rounded-full mb-4 shadow-lg">
                        <GraduationCapIcon /> 
                    </div>
                    <h1 className="text-4xl font-bold">JJ College Canteen</h1>
                    <p className="text-lg mt-2 font-light">Order from class, collect instantly</p>
                </div>
                
                <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 text-white rounded-lg shadow-xl bg-opacity-80 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white text-center">Student Login</h2>
                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-gray-300 font-semibold mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="text-gray-400" />
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-300 font-semibold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockIcon className="text-gray-400" />
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-400 text-center text-sm font-semibold">{error}</p>}
                        <button type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="text-center mt-6 pt-4 border-t border-gray-700">
                        <p className="text-gray-300 text-sm">
                            New student?{' '}
                            <Link to="/register" className="text-blue-400 hover:underline font-semibold">
                                Create an Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;