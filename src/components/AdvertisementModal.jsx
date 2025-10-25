import React, { useState, useEffect } from 'react';

const AdvertisementModal = ({ imageUrl, onClose }) => {
    const [isSkipVisible, setIsSkipVisible] = useState(false);

    useEffect(() => {
        // Timer to show the "Skip" button after 5 seconds
        const showSkipTimer = setTimeout(() => {
            setIsSkipVisible(true);
        }, 5000);

        // Timer to automatically close the modal after 8 seconds total
        const autoCloseTimer = setTimeout(() => {
            onClose();
        }, 8000);

        // Clean up both timers if the user skips or the component unmounts
        return () => {
            clearTimeout(showSkipTimer);
            clearTimeout(autoCloseTimer);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl">
                {isSkipVisible && (
                    <button
                        onClick={onClose}
                        className="absolute -top-10 right-0 text-white font-bold bg-gray-700 bg-opacity-50 px-3 py-1 rounded-full hover:bg-opacity-100 transition animate-fade-in"
                    >
                        X
                    </button>
                )}
                <img src={imageUrl} alt="Advertisement" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            </div>
        </div>
    );
};

export default AdvertisementModal;