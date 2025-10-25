// src/components/CurrentTimeDisplay.jsx
import React, { useState, useEffect } from 'react';

const CurrentTimeDisplay = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div className="flex flex-col text-right text-xs mr-2">
            <p className="text-slate-400 leading-none">Local Time</p>
            <p className="text-orange-400 font-bold text-sm leading-none">{formattedTime}</p>
        </div>
    );
};

export default CurrentTimeDisplay;