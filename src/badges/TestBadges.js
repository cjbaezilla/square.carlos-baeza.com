import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import BadgeService, { BADGES } from './BadgeService';
import { Badge } from './BadgeDisplay';

// Component for testing badge awarding
const TestBadges = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  
  if (!isLoaded || !user) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
        {t('badges.signInToView', 'Please sign in to view your badges')}
      </div>
    );
  }
  
  const userId = user.id;
  
  // Handle awarding a badge
  const handleAwardBadge = (badgeId) => {
    const result = BadgeService.awardBadge(userId, badgeId);
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
  const handleRemoveBadge = (badgeId) => {
    const result = BadgeService.removeBadge(userId, badgeId);
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
  
  // Get list of badges this user has
  const userBadgeIds = BadgeService.getUserBadges(userId);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-gray-100 mb-4">{t('badges.testPanel', 'Badge Test Panel')}</h2>
      
      {/* Status message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-900 text-white rounded-md">
          {message}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('badges.availableBadges', 'Award Badges')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.values(BADGES).map(badge => (
            <div 
              key={badge.id} 
              className={`p-3 rounded-lg flex flex-col items-center ${
                userBadgeIds.includes(badge.id) ? 'bg-gray-700' : 'bg-gray-750'
              }`}
            >
              <div className="w-12 h-12 mb-2">
                <Badge badge={badge} size="md" showTooltip={false} />
              </div>
              <div className="text-sm text-center text-gray-300 mb-2">{badge.name}</div>
              
              <div className="flex space-x-2 mt-auto">
                <button
                  onClick={() => handleAwardBadge(badge.id)}
                  disabled={userBadgeIds.includes(badge.id)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    userBadgeIds.includes(badge.id)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {t('badges.award', 'Award')}
                </button>
                
                <button
                  onClick={() => handleRemoveBadge(badge.id)}
                  disabled={!userBadgeIds.includes(badge.id)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    !userBadgeIds.includes(badge.id)
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