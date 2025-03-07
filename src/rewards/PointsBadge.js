import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import PointsService, { POINTS_UPDATED_EVENT } from './PointsService';

const PointsBadge = ({ compact = false }) => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load user points data when component mounts or user changes
    if (isSignedIn && user) {
      const userId = user.id;
      const points = PointsService.getUserPoints(userId);
      setUserData(points);
      
      // Set up custom event listener for points updates
      const handlePointsUpdate = (e) => {
        const allPoints = e.detail.pointsData;
        if (allPoints[userId]) {
          setUserData(allPoints[userId]);
        }
      };
      
      // Listen for the custom points updated event
      document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
      
      // For cross-tab synchronization (not needed for same-tab updates)
      const handleStorageChange = (e) => {
        if (e.key === PointsService.pointsKey) {
          const allPoints = JSON.parse(e.newValue || '{}');
          if (allPoints[userId]) {
            setUserData(allPoints[userId]);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isSignedIn, user]);

  if (!isSignedIn || !userData) {
    return null;
  }

  if (compact) {
    // Compact display for navbar/header
    return (
      <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm">
        <span className="text-purple-400 font-bold mr-1">{userData.points}</span>
        <span className="text-gray-300 text-xs">pts</span>
      </div>
    );
  }

  // Full display
  return (
    <div className="flex items-center bg-gray-700 rounded-lg px-4 py-2">
      <div className="mr-3">
        <div className="text-purple-400 font-bold text-xl">{userData.points}</div>
        <div className="text-gray-300 text-xs">{t('rewards.points', 'Points')}</div>
      </div>
      <div>
        <div className="text-gray-200 font-medium">
          {t('rewards.level', 'Level')} {userData.level}
        </div>
        <div className="w-24 bg-gray-600 rounded-full h-1.5 mt-1">
          <div 
            className="bg-purple-500 h-1.5 rounded-full" 
            style={{ 
              width: `${((userData.points % 50) / 50) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PointsBadge; 