import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';

// Import Page Components
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'; 

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <CartProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                
                {/* *** 🔑 CRITICAL FIX APPLIED HERE 🔑 ***
                The path must include the dynamic segment (:orderId) 
                to match the link path: /order-details/66c4b... 
                */}
                <Route 
                    path="/order-details/:orderId" // <-- CORRECTED
                    element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} 
                />
                
                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </CartProvider>
    );
}

export default App;