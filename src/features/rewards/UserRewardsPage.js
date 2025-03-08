import React, { useState, useEffect, useCallback, memo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import PointsService, { POINT_VALUES, POINTS_UPDATED_EVENT } from './PointsService';

// Memoized Points Summary component - only re-renders when points data changes
const PointsSummary = memo(({ userData, t }) => {
  // Progress to next level
  const calculateProgress = () => {
    if (!userData) return 0;
    
    const currentLevelPoints = (userData.level - 1) * 50;
    const pointsInCurrentLevel = userData.points - currentLevelPoints;
    const progressPercent = (pointsInCurrentLevel / 50) * 100;
    
    return Math.min(progressPercent, 100);
  };

  if (!userData) return null;

  return (
    <div className="mb-6 text-center">
      <h3 className="text-2xl font-bold text-purple-400 mb-2">
        {userData.points} {t('rewards.points', 'Points')}
      </h3>
      <div className="flex items-center mb-2">
        <span className="text-gray-300 mr-2">{t('rewards.level', 'Level')} {userData.level}</span>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-purple-600 h-2.5 rounded-full" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <span className="text-gray-300 ml-2">{t('rewards.level', 'Level')} {userData.level + 1}</span>
      </div>
      <p className="text-sm text-gray-400">
        {50 - (userData.points % 50)} {t('rewards.pointsToNextLevel', 'points to next level')}
      </p>
    </div>
  );
});

// Memoized Action Card component - only re-renders when its specific properties change
const ActionCard = memo(({ 
  title, 
  description, 
  pointValue, 
  actionCount, 
  countText, 
  notDoneText,
  isCompleted, 
  isLoading, 
  onAction, 
  t 
}) => {
  return (
    <div 
      className={`bg-gray-700 ${isCompleted ? 'opacity-75' : isLoading ? 'opacity-75 cursor-wait' : 'hover:bg-gray-600 cursor-pointer'} rounded-lg p-4 transition-colors`}
      onClick={!isLoading && !isCompleted ? onAction : undefined}
    >
      <h4 className="text-lg font-semibold text-gray-200 mb-1">
        {title}
        {isLoading && <span className="ml-2 inline-block animate-pulse">...</span>}
      </h4>
      <p className="text-sm text-gray-400 mb-2">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-purple-400 font-bold">+{pointValue} {t('rewards.points', 'Points')}</span>
        <span className="text-gray-300 text-sm">
          {actionCount ? `${actionCount}x ${countText}` : notDoneText}
        </span>
      </div>
    </div>
  );
});

// Memoized Activity List component
const ActivityList = memo(({ actions, pointValues, t }) => {
  return (
    <div className="border-t border-gray-700 pt-4">
      <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('rewards.recentActivity', 'Recent Activity')}</h4>
      <ul className="space-y-2">
        {actions.LOGIN && (
          <li className="text-sm text-gray-400">
            ✓ {t('rewards.dailyLogin', 'Daily Login')} (+{pointValues.LOGIN} {t('rewards.points', 'Points')})
          </li>
        )}
        {actions.VIEW_GUIDE > 0 && (
          <li className="text-sm text-gray-400">
            ✓ {t('rewards.viewedGuide', 'Viewed Guide')} {actions.VIEW_GUIDE}x (+{pointValues.VIEW_GUIDE * actions.VIEW_GUIDE} {t('rewards.points', 'Points')})
          </li>
        )}
        {actions.COMPLETE_PROFILE && (
          <li className="text-sm text-gray-400">
            ✓ {t('rewards.profileCompleted', 'Profile Completed')} (+{pointValues.COMPLETE_PROFILE} {t('rewards.points', 'Points')})
          </li>
        )}
        {Object.keys(actions).length === 0 && (
          <li className="text-sm text-gray-400">
            {t('rewards.noActivityYet', 'No activity yet. Start earning points!')}
          </li>
        )}
      </ul>
    </div>
  );
});

// Main component
const UserRewardsPage = () => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [actions, setActions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isViewGuideLoading, setIsViewGuideLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Function to fetch just the user points data for polling updates
  const fetchUserPointsOnly = useCallback(async () => {
    if (!isSignedIn || !user) return;
    
    try {
      const pointsData = await PointsService.getUserPoints(user.id);
      if (pointsData) {
        setUserData(pointsData);
      }
    } catch (error) {
      console.error('Error fetching user points for counter update:', error);
    }
  }, [isSignedIn, user]);

  // Function to fetch complete user data with actions
  const fetchUserData = useCallback(async () => {
    if (!isSignedIn || !user) return;
    
    try {
      setIsLoading(true);
      const userId = user.id;
      
      // Award points for login
      const updatedData = await PointsService.awardLoginPoints(userId);
      if (updatedData) {
        setUserData(updatedData);
      }
      
      // Get completed actions
      const completedActions = await PointsService.getUserCompletedActions(userId);
      setActions(completedActions || {});
    } catch (error) {
      console.error('Error fetching user rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    // Load full user points data when component mounts
    fetchUserData();
    
    // Set up event listener for point updates
    const handlePointsUpdate = (e) => {
      if (user && e.detail.pointsData && e.detail.pointsData[user.id]) {
        setUserData(e.detail.pointsData[user.id]);
      }
    };
    
    document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    
    // Set up polling to only update counters every 5 seconds
    const intervalId = setInterval(() => {
      if (isSignedIn && user) {
        fetchUserPointsOnly(); // Only update the points counter
      }
    }, 5000);
    
    return () => {
      document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
      clearInterval(intervalId);
    };
  }, [isSignedIn, user, fetchUserData, fetchUserPointsOnly]);

  // Award points for viewing the guide
  const handleViewGuide = useCallback(async () => {
    if (!isSignedIn || !user || isViewGuideLoading) return;
    
    try {
      setIsViewGuideLoading(true);
      // Only get the updated points data
      const updatedData = await PointsService.awardGuideViewPoints(user.id);
      if (updatedData) {
        // Only update the points counter
        setUserData(updatedData);
        
        // Update the actions locally instead of fetching again
        setActions(prevActions => {
          const newActions = { ...prevActions };
          newActions.VIEW_GUIDE = (newActions.VIEW_GUIDE || 0) + 1;
          return newActions;
        });
      }
    } catch (error) {
      console.error('Error awarding guide view points:', error);
    } finally {
      setIsViewGuideLoading(false);
    }
  }, [isSignedIn, user, isViewGuideLoading]);

  // Award points for profile completion
  const handleCompleteProfile = useCallback(async () => {
    if (!isSignedIn || !user || isProfileLoading || actions.COMPLETE_PROFILE) return;
    
    try {
      setIsProfileLoading(true);
      // Only get the updated points data
      const updatedData = await PointsService.awardProfileCompletionPoints(user.id);
      if (updatedData) {
        // Only update the points counter
        setUserData(updatedData);
        
        // Update the actions locally instead of fetching again
        setActions(prevActions => ({
          ...prevActions,
          COMPLETE_PROFILE: true
        }));
      }
    } catch (error) {
      console.error('Error awarding profile completion points:', error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [isSignedIn, user, isProfileLoading, actions.COMPLETE_PROFILE]);

  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl text-gray-200 mb-4">{t('rewards.signInPrompt', 'Sign in to track your rewards')}</h3>
        <p className="text-gray-400">{t('rewards.pointsDescription', 'Earn points by completing actions and reach new levels!')}</p>
      </div>
    );
  }

  // Add loading screen effect similar to badges page
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-6 w-1/3"></div>
        <div className="space-y-4">
          <div className="h-16 bg-gray-700 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg h-32"></div>
            <div className="bg-gray-700 p-4 rounded-lg h-32"></div>
          </div>
          <div className="h-4 w-3/4 bg-gray-700 rounded mt-6"></div>
          <div className="h-4 w-2/3 bg-gray-700 rounded mt-2"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl text-gray-200 mb-4">{t('rewards.dataNotFound', 'User points data not found')}</h3>
        <p className="text-gray-400">{t('rewards.tryRefreshing', 'Please try refreshing the page')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* User Points Summary - removed inline loading state */}
      <PointsSummary userData={userData} t={t} />

      {/* Rewards Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ActionCard
          title={t('rewards.viewGuide', 'View Guide')}
          description={t('rewards.viewGuideDesc', 'Learn about blockchain basics')}
          pointValue={POINT_VALUES.VIEW_GUIDE}
          actionCount={actions.VIEW_GUIDE}
          countText={t('rewards.viewed', 'viewed')}
          notDoneText={t('rewards.notViewed', 'Not viewed')}
          isCompleted={false}
          isLoading={isViewGuideLoading}
          onAction={handleViewGuide}
          t={t}
        />

        <ActionCard
          title={t('rewards.completeProfile', 'Complete Profile')}
          description={t('rewards.completeProfileDesc', 'Fill in your user profile')}
          pointValue={POINT_VALUES.COMPLETE_PROFILE}
          actionCount={null}
          countText=""
          notDoneText={t('rewards.incomplete', 'Incomplete')}
          isCompleted={actions.COMPLETE_PROFILE}
          isLoading={isProfileLoading}
          onAction={handleCompleteProfile}
          t={t}
        />
      </div>

      {/* Recent Activity - removed inline loading state */}
      <ActivityList 
        actions={actions} 
        pointValues={POINT_VALUES} 
        t={t} 
      />
    </div>
  );
};

export default UserRewardsPage; 