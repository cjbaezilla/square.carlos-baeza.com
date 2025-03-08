import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import BadgeService, { BADGES, BADGE_UPDATED_EVENT } from './BadgeService';
import { Badge } from './BadgeDisplay';

// Component for testing badge awarding
const TestBadges = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  /* const [badgeData, setBadgeData] = useState([]); */
  const [userBadgeIds, setUserBadgeIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch user badges
  const fetchUserBadges = async (userId) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const badges = await BadgeService.getUserBadges(userId);
      setUserBadgeIds(badges.map(badge => badge.id));
    } catch (error) {
      console.error('Error fetching user badges:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load badges on component mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserBadges(user.id);
    }
  }, [isLoaded, user]);
  
  // Listen for badge updates
  useEffect(() => {
    const handleBadgeUpdate = (event) => {
      if (user && event.detail.userId === user.id) {
        fetchUserBadges(user.id);
      }
    };
    
    document.addEventListener(BADGE_UPDATED_EVENT, handleBadgeUpdate);
    
    return () => {
      document.removeEventListener(BADGE_UPDATED_EVENT, handleBadgeUpdate);
    };
  }, [user]);
  
  if (!isLoaded || !user) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
        {t('badges.signInToView', 'Please sign in to view your badges')}
      </div>
    );
  }
  
  const userId = user.id;
  
  // Handle awarding a badge
  const handleAwardBadge = async (badgeId) => {
    setIsLoading(true);
    const result = await BadgeService.awardBadge(userId, badgeId);
    setIsLoading(false);
    
    if (result) {
      setMessage(`Badge "${BADGES[badgeId.toUpperCase()]?.name}" has been awarded!`);
    } else {
      setMessage(`Badge already awarded.`);
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Handle removing a badge
  const handleRemoveBadge = async (badgeId) => {
    setIsLoading(true);
    const result = await BadgeService.removeBadge(userId, badgeId);
    setIsLoading(false);
    
    if (result) {
      setMessage(`Badge "${BADGES[badgeId.toUpperCase()]?.name}" has been removed.`);
    } else {
      setMessage(`Badge was not found on this user.`);
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };
  
  // Helper function to check if user has a badge
  const hasBadge = (badgeId) => {
    return userBadgeIds.includes(badgeId);
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-gray-100 mb-4">{t('badges.testPanel', 'Badge Test Panel')}</h2>
      
      {/* Status message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-900 text-white rounded-md">
          {message}
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-800 text-white rounded-md">
          Loading...
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('badges.availableBadges', 'Award Badges')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.values(BADGES).map(badge => (
            <div 
              key={badge.id} 
              className={`p-3 rounded-lg flex flex-col items-center ${
                hasBadge(badge.id) ? 'bg-gray-700' : 'bg-gray-750'
              }`}
            >
              <div className="w-12 h-12 mb-2">
                <Badge badge={badge} size="md" showTooltip={false} />
              </div>
              <div className="text-sm text-center text-gray-300 mb-2">{badge.name}</div>
              
              <div className="flex space-x-2 mt-auto">
                <button
                  onClick={() => handleAwardBadge(badge.id)}
                  disabled={hasBadge(badge.id) || isLoading}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    hasBadge(badge.id) || isLoading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {t('badges.award', 'Award')}
                </button>
                
                <button
                  onClick={() => handleRemoveBadge(badge.id)}
                  disabled={!hasBadge(badge.id) || isLoading}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    !hasBadge(badge.id) || isLoading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {t('badges.remove', 'Remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          {t('badges.testDescription', 'This panel allows you to test the badge system by manually awarding and removing badges.')}
        </p>
      </div>
    </div>
  );
};

export default TestBadges; 