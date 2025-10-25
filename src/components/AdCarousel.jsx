import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // 1. Import icons for arrows

const AdCarousel = ({ ads }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // This effect handles the automatic sliding
    useEffect(() => {
        // Don't start the timer if there's only one ad or no ads
        if (!ads || ads.length <= 1) return;

        // Change slide every 5 seconds
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % ads.length);
        }, 5000);

        // Clear the interval when the component unmounts or the index changes
        return () => clearInterval(interval);
    }, [ads, currentIndex]); // 2. Reset timer whenever the user manually changes the slide

    if (!ads || ads.length === 0) {
        return null;
    }

    // --- 3. Add handler functions for manual navigation ---
    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? ads.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === ads.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="w-full max-w-5xl mx-auto h-64 md:h-80 overflow-hidden relative mb-8 rounded-lg shadow-md bg-gray-200 group">
            {/* Slides */}
            {ads.map((ad, index) => (
                <div
                    key={ad._id}
                    className="absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: index === currentIndex ? 1 : 0 }}
                >
                    <img
                        src={ad.imageUrl}
                        alt="Advertisement"
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
            
            {/* --- 4. Add Left and Right Arrow Buttons --- */}
            {ads.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute top-1/2 -translate-y-1/2 left-4 text-white bg-black bg-opacity-30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaChevronLeft size={24} />
                    </button>
                    <button onClick={goToNext} className="absolute top-1/2 -translate-y-1/2 right-4 text-white bg-black bg-opacity-30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaChevronRight size={24} />
                    </button>
                </>
            )}

            {/* --- 5. Add Navigation Dots --- */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {ads.map((slide, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`w-3 h-3 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default AdCarousel;