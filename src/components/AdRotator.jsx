import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Set the rotation interval to 30 minutes (30 * 60 * 1000 milliseconds)
const ROTATION_INTERVAL = 30 * 60 * 1000; 

const AdRotator = () => {
    const [ads, setAds] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Function to fetch active ads from the backend
    const fetchActiveAds = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/advertisements/active');
            
            // Only update ads if the list has changed (optimization)
            if (JSON.stringify(response.data) !== JSON.stringify(ads)) {
                setAds(response.data);
                // Reset index if the list of ads changes
                setCurrentAdIndex(0); 
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch advertisements:', error);
            setLoading(false);
        }
    }, [ads]);

    // 1. Initial Fetch and Periodic Fetch (e.g., every 5 mins)
    useEffect(() => {
        fetchActiveAds();

        // Optional: Refetch the list of active ads every 5 minutes in case admin changes them
        const fetchInterval = setInterval(fetchActiveAds, 5 * 60 * 1000); 
        return () => clearInterval(fetchInterval);
    }, [fetchActiveAds]);

    // 2. Ad Rotation Logic (every 30 minutes)
    useEffect(() => {
        if (ads.length === 0) return;

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