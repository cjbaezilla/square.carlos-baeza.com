import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import BadgeService, { BADGES, BADGE_UPDATED_EVENT } from './BadgeService';
import { Badge } from './BadgeDisplay';
import TestBadges from './TestBadges';

const BadgesPage = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('earned');
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [userBadgeData, setUserBadgeData] = useState([]);
  const [userBadgeIds, setUserBadgeIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState(null);
  
  // Function to fetch user badges
  const fetchUserBadges = async (userId) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const badges = await BadgeService.getUserBadges(userId);
      setUserBadgeData(badges);
      setUserBadgeIds(badges.map(badge => badge.id));
    } catch (error) {
      console.error('Error fetching user badges:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle migration of badges from localStorage to Supabase
  const handleMigrateBadges = async () => {
    if (!user) return;
    
    setMigrationStatus({ status: 'pending', message: 'Migrating badges...' });
    try {
      const result = await BadgeService.migrateBadgesToSupabase(user.id);
      setMigrationStatus({ 
        status: result.success ? 'success' : 'error', 
        message: result.message 
      });
      
      // Refresh the badge list
      await fetchUserBadges(user.id);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setMigrationStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error migrating badges:', error);
      setMigrationStatus({ 
        status: 'error', 
        message: 'An unexpected error occurred during migration'
      });
    }
  };
  
  // Clean all badges from localStorage
  const handleCleanLocalStorage = () => {
    const count = BadgeService.clearLocalStorageBadges();
    setMigrationStatus({ 
      status: 'success', 
      message: `Cleared ${count} badge entries from localStorage` 
    });
    
    // Clear status after 5 seconds
    setTimeout(() => {
      setMigrationStatus(null);
    }, 5000);
  };
  
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
  
  if (!isLoaded || (isLoaded && user && isLoading)) {
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
          
          <div className="flex gap-2">
            <button
              onClick={handleMigrateBadges}
              className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Migrate from localStorage
            </button>
            
            <button
              onClick={handleCleanLocalStorage}
              className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Clean localStorage
            </button>
            
            <button
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {showTestPanel ? t('badges.hideTestPanel', 'Hide Test Panel') : t('badges.showTestPanel', 'Show Test Panel')}
            </button>
          </div>
        </div>
        
        {/* Migration Status */}
        {migrationStatus && (
          <div className={`mb-4 p-3 rounded ${
            migrationStatus.status === 'success' ? 'bg-green-800 text-green-100' : 
            migrationStatus.status === 'error' ? 'bg-red-800 text-red-100' : 
            'bg-blue-800 text-blue-100'
          }`}>
            {migrationStatus.message}
          </div>
        )}
        
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