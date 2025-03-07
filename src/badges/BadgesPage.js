import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import BadgeService, { BADGES } from './BadgeService';
import { Badge } from './BadgeDisplay';
import TestBadges from './TestBadges';

const BadgesPage = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('earned');
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  if (!isLoaded) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-6 w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg h-40"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-center text-gray-300">
        <p>{t('badges.signInToView', 'Please sign in to view your badges')}</p>
      </div>
    );
  }
  
  const userBadges = BadgeService.getUserBadges(user.id);
  const userBadgeIds = userBadges.map(badge => badge.id);
  
  const earnedBadges = Object.values(BADGES).filter(badge => 
    userBadgeIds.includes(badge.id)
  );
  const availableBadges = Object.values(BADGES).filter(badge => 
    !userBadgeIds.includes(badge.id)
  );
  
  const displayBadges = activeTab === 'earned' ? earnedBadges : 
                       activeTab === 'available' ? availableBadges : 
                       Object.values(BADGES);
  
  // Helper function to check if user has earned a badge
  const hasEarnedBadge = (badgeId) => {
    return userBadgeIds.includes(badgeId);
  };
  
  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">{t('badges.title', 'User Badges')}</h1>
          
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            {showTestPanel ? t('badges.hideTestPanel', 'Hide Test Panel') : t('badges.showTestPanel', 'Show Test Panel')}
          </button>
        </div>
        
        {/* Test Panel */}
        {showTestPanel && (
          <div className="mb-6">
            <TestBadges />
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('earned')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'earned' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            {t('badges.earned', 'Earned')} ({earnedBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'available' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            {t('badges.available', 'Available')} ({availableBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          >
            {t('badges.all', 'All Badges')}
          </button>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 mb-6">
          {activeTab === 'earned' ? t('badges.earnedDescription', 'These badges highlight your achievements and participation.') :
          activeTab === 'available' ? t('badges.availableDescription', 'Continue participating to earn these badges.') : 
          t('badges.allDescription', 'Overview of all badges available on our platform.')}
        </p>
        
        {/* Badges Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayBadges.map(badge => (
            <div 
              key={badge.id} 
              className={`p-4 rounded-lg ${
                activeTab === 'earned' || (activeTab === 'all' && hasEarnedBadge(badge.id)) 
                  ? 'bg-gray-700' 
                  : 'bg-gray-750 opacity-80'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 mr-4">
                  <Badge badge={badge} size="lg" showTooltip={false} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
                  {hasEarnedBadge(badge.id) && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      {t('badges.earned', 'Earned')}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">{badge.description}</p>
              {!hasEarnedBadge(badge.id) && (
                <div className="text-xs text-gray-400">
                  {t('badges.keepParticipating', 'Keep participating to earn this badge!')}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {displayBadges.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {activeTab === 'earned' 
              ? t('badges.noEarnedBadges', 'You haven\'t earned any badges yet. Keep participating!')
              : t('badges.noBadgesInCategory', 'No badges in this category.')}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPage; 