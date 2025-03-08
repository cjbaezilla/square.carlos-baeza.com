import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import PointsService, { POINTS_UPDATED_EVENT } from './PointsService';

const PointsBadge = ({ compact = false }) => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user points data
  const fetchUserPoints = useCallback(async () => {
    if (isSignedIn && user) {
      try {
        const points = await PointsService.getUserPoints(user.id);
        if (points) {
          setUserData(points);
        }
      } catch (error) {
        console.error('Error fetching user points:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    // Load user points data when component mounts or user changes
    fetchUserPoints();
    
    // Set up custom event listener for points updates
    const handlePointsUpdate = (e) => {
      const allPoints = e.detail.pointsData;
      if (user && allPoints[user.id]) {
        setUserData(allPoints[user.id]);
      }
    };
    
    // Listen for the custom points updated event
    document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    
    // Set up polling every 5 seconds to update points
    const intervalId = setInterval(() => {
      fetchUserPoints();
    }, 5000);
    
    return () => {
      document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
      clearInterval(intervalId);
    };
  }, [user, fetchUserPoints, isSignedIn]);

  if (!isSignedIn || (!userData && !isLoading)) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    if (compact) {
      return (
        <div className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm animate-pulse">
          <span className="text-gray-400 font-bold mr-1">...</span>
          <span className="text-gray-300 text-xs">pts</span>
        </div>
      );
    }
    return (
      <div className="flex items-center bg-gray-700 rounded-lg px-4 py-2 animate-pulse">
        <div className="mr-3">
          <div className="text-gray-500 font-bold text-xl">...</div>
          <div className="text-gray-300 text-xs">{t('rewards.points', 'Points')}</div>
        </div>
        <div>
          <div className="text-gray-400 font-medium">
            {t('rewards.level', 'Level')} ...
          </div>
          <div className="w-24 bg-gray-600 rounded-full h-1.5 mt-1">
            <div className="bg-gray-500 h-1.5 rounded-full w-1/3"></div>
          </div>
        </div>
      </div>
    );
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