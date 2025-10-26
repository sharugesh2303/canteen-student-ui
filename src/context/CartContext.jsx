import React from 'react';
// Using LuInfo as a reliable replacement for the alert icon
// 🟢 ADDED LuClipboardCheck for Essentials
import { LuClock, LuCroissant, LuUtensils, LuCupSoda, LuInfo, LuClipboardCheck } from 'react-icons/lu';

const ScheduleBanner = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-300 to-orange-200 p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center mb-4">
        <LuClock className="text-2xl text-yellow-900 mr-3" />
        <h2 className="text-xl font-bold text-yellow-900">Today's Menu Schedule</h2>
      </div>

      {/* 🟢 UPDATED: Grid layout to handle 4 items (4 columns or stacked on medium/small) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Breakfast */}
        <div className="flex items-center bg-white/50 p-3 rounded-lg">
          <LuCroissant className="text-2xl text-orange-600 mr-3" />
          <div>
            <p className="font-semibold text-gray-800">Breakfast</p>
            <p className="text-sm text-gray-600">8:00 AM - 10:30 AM</p>
          </div>
        </div>

        {/* Lunch */}
        <div className="flex items-center bg-white/50 p-3 rounded-lg">
          <LuUtensils className="text-2xl text-orange-600 mr-3" />
          <div>
            <p className="font-semibold text-gray-800">Lunch</p>
            <p className="text-sm text-gray-600">12:00 PM - 2:30 PM</p>
          </div>
        </div>

        {/* Snacks */}
        <div className="flex items-center bg-white/50 p-3 rounded-lg">
          <LuCupSoda className="text-2xl text-orange-600 mr-3" />
          <div>
            <p className="font-semibold text-gray-800">Snacks</p>
            <p className="text-sm text-gray-600">4:00 PM - 6:00 PM</p>
          </div>
        </div>

        {/* 🟢 NEW: Essentials/General */}
        <div className="flex items-center bg-white/50 p-3 rounded-lg">
          <LuClipboardCheck className="text-2xl text-cyan-600 mr-3" />
          <div>
            <p className="font-semibold text-gray-800">Essentials</p>
            <p className="text-sm text-gray-600">All Operating Hours</p>
          </div>
        </div>
      </div>

      {/* Closed Notification */}
      <div className="bg-yellow-100/80 text-yellow-800 p-3 rounded-lg flex items-center">
        {/* Using the LuInfo icon */}
        <LuInfo className="mr-2"/>
        <p className="text-sm font-medium">Canteen is currently closed. Check back during meal times!</p>
      </div>
    </div>
  );
};

export default ScheduleBanner;