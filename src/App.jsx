import React from 'react';
// Make sure 'BrowserRouter' or 'Router' is NOT imported here
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';

// Import Page Components
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'; // <-- 1. IMPORT NEW PAGE

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <CartProvider>
            {/* The <Router> component is removed from here */}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                
                {/* 2. ADD NEW PROTECTED ROUTE FOR ORDER DETAILS */}
                <Route path="/order-details" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                
                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </CartProvider>
    );
}

export default App;