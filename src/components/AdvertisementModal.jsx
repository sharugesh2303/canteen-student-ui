import React, { useState, useEffect } from 'react';

const AdvertisementModal = ({ imageUrl, onClose }) => {
    const [isSkipVisible, setIsSkipVisible] = useState(false);

    useEffect(() => {
        // Timer to show the "SKIP" button after 5 seconds (5000ms)
        const showSkipTimer = setTimeout(() => {
            setIsSkipVisible(true);
        }, 5000);

        // 🟢 UPDATED TIMER: Timer to automatically close the modal after 10 seconds total (10000ms)
        const autoCloseTimer = setTimeout(() => {
            onClose();
        }, 10000);

        // Clean up both timers if the user skips or the component unmounts
        return () => {
            clearTimeout(showSkipTimer);
            clearTimeout(autoCloseTimer);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg"> 
                {isSkipVisible && (
                    <button
                        onClick={onClose}
                        // 🟢 FIX: Ensures button is clearly visible inside the modal on mobile
                        className="absolute top-3 right-3 text-white font-bold bg-gray-700/80 px-3 py-1 rounded-full hover:bg-gray-700 transition z-10 text-lg"
                    >
                        SKIP
                    </button>
                )}
                <img 
                    src={imageUrl} 
                    alt="Advertisement" 
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg" 
                />
            </div>
        </div>
    );
};

export default AdvertisementModal;
