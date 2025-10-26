import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- CONFIGURATION ---
// 🟢 FIX APPLIED: Use VITE_API_URL from environment variables (set in Vercel)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// The admin intends for a very long rotation interval (30 minutes).
const ROTATION_INTERVAL = 30 * 60 * 1000; 
const FETCH_INTERVAL = 5 * 60 * 1000; // Refetch ads every 5 minutes

// NOTE: You must define getFullImageUrl in DashboardPage.jsx 
// or pass it down if this component is used elsewhere in production.

const AdRotator = () => {
    const [ads, setAds] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Function to fetch active ads from the backend
    const fetchActiveAds = useCallback(async () => {
        try {
            // 🟢 FIX: Use dynamic API_BASE_URL
            const response = await axios.get(`${API_BASE_URL}/advertisements/active`);
            
            const newAds = response.data || [];
            
            // Check if the new list of ads is different from the old list
            if (newAds.length !== ads.length || JSON.stringify(newAds) !== JSON.stringify(ads)) {
                setAds(newAds);
                // Reset index only if the ad list changes, to ensure a fresh start
                setCurrentAdIndex(0); 
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch advertisements:', error);
            setLoading(false);
        }
    }, [ads]);

    // 1. Initial Fetch and Periodic Fetch (every 5 mins)
    useEffect(() => {
        fetchActiveAds();

        // Refetch the list of active ads every 5 minutes
        const fetchInterval = setInterval(fetchActiveAds, FETCH_INTERVAL); 
        return () => clearInterval(fetchInterval);
    }, [fetchActiveAds]);

    // 2. Ad Rotation Logic (every 30 minutes)
    useEffect(() => {
        if (ads.length === 0 || ads.length === 1) return;

        // Set up the 30-minute timer for rotation
        const rotationTimer = setInterval(() => {
            setCurrentAdIndex(prevIndex => (prevIndex + 1) % ads.length);
        }, ROTATION_INTERVAL);

        // Cleanup function
        return () => clearInterval(rotationTimer);
    }, [ads.length]); // Re-run effect only when the number of ads changes

    if (loading) {
        return <div className="text-center py-4 text-slate-400">Loading ads...</div>;
    }

    if (ads.length === 0) {
        return <div className="text-center py-4 text-slate-500">No active advertisements.</div>;
    }

    const currentAd = ads[currentAdIndex];

    return (
        <div className="w-full h-auto overflow-hidden rounded-xl shadow-lg border border-slate-700 bg-slate-800">
            <img 
                // Note: getFullImageUrl must be defined in the consuming file (DashboardPage.jsx)
                src={currentAd.imageUrl} 
                alt="Active Advertisement" 
                className="w-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{ height: '300px' }} // You can adjust the height as needed
            />
            <div className="p-3 text-center text-sm text-orange-400 font-medium">
                Advertisement ({currentAdIndex + 1} of {ads.length})
            </div>
        </div>
    );
};

export default AdRotator;