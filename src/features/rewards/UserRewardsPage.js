import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import PointsService, { POINT_VALUES, POINTS_UPDATED_EVENT } from './PointsService';

const UserRewardsPage = () => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [actions, setActions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

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
      if (isSignedIn && user && !isActionLoading) {
        fetchUserPointsOnly(); // Only update the points counter
      }
    }, 5000);
    
    return () => {
      document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
      clearInterval(intervalId);
    };
  }, [isSignedIn, user, fetchUserData, fetchUserPointsOnly, isActionLoading]);

  // Progress to next level
  const calculateProgress = () => {
    if (!userData) return 0;
    
    const currentLevelPoints = (userData.level - 1) * 50;
    const pointsInCurrentLevel = userData.points - currentLevelPoints;
    const progressPercent = (pointsInCurrentLevel / 50) * 100;
    
    return Math.min(progressPercent, 100);
  };

  // Award points for viewing the guide
  const handleViewGuide = async () => {
    if (!isSignedIn || !user || isActionLoading) return;
    
    try {
      setIsActionLoading(true);
      const updatedData = await PointsService.awardGuideViewPoints(user.id);
      if (updatedData) {
        setUserData(updatedData);
      }
      
      const completedActions = await PointsService.getUserCompletedActions(user.id);
      setActions(completedActions || {});
    } catch (error) {
      console.error('Error awarding guide view points:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Award points for profile completion
  const handleCompleteProfile = async () => {
    if (!isSignedIn || !user || isActionLoading) return;
    
    try {
      setIsActionLoading(true);
      const updatedData = await PointsService.awardProfileCompletionPoints(user.id);
      if (updatedData) {
        setUserData(updatedData);
      }
      
      const completedActions = await PointsService.getUserCompletedActions(user.id);
      setActions(completedActions || {});
    } catch (error) {
      console.error('Error awarding profile completion points:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl text-gray-200 mb-4">{t('rewards.signInPrompt', 'Sign in to track your rewards')}</h3>
        <p className="text-gray-400">{t('rewards.pointsDescription', 'Earn points by completing actions and reach new levels!')}</p>
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
      {/* User Points Summary */}
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

      {/* Rewards Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div 
          className={`bg-gray-700 ${isActionLoading ? 'opacity-75 cursor-wait' : 'hover:bg-gray-600 cursor-pointer'} rounded-lg p-4 transition-colors`}
          onClick={!isActionLoading ? handleViewGuide : undefined}
        >
          <h4 className="text-lg font-semibold text-gray-200 mb-1">
            {t('rewards.viewGuide', 'View Guide')}
            {isActionLoading && <span className="ml-2 inline-block animate-pulse">...</span>}
          </h4>
          <p className="text-sm text-gray-400 mb-2">{t('rewards.viewGuideDesc', 'Learn about blockchain basics')}</p>
          <div className="flex justify-between items-center">
            <span className="text-purple-400 font-bold">+{POINT_VALUES.VIEW_GUIDE} {t('rewards.points', 'Points')}</span>
            <span className="text-gray-300 text-sm">
              {actions.VIEW_GUIDE ? `${actions.VIEW_GUIDE}x ${t('rewards.viewed', 'viewed')}` : t('rewards.notViewed', 'Not viewed')}
            </span>
          </div>
        </div>

        <div 
          className={`bg-gray-700 ${actions.COMPLETE_PROFILE ? 'opacity-75' : isActionLoading ? 'opacity-75 cursor-wait' : 'hover:bg-gray-600 cursor-pointer'} rounded-lg p-4 transition-colors`}
          onClick={!isActionLoading && !actions.COMPLETE_PROFILE ? handleCompleteProfile : undefined}
        >
          <h4 className="text-lg font-semibold text-gray-200 mb-1">
            {t('rewards.completeProfile', 'Complete Profile')}
            {isActionLoading && <span className="ml-2 inline-block animate-pulse">...</span>}
          </h4>
          <p className="text-sm text-gray-400 mb-2">{t('rewards.completeProfileDesc', 'Fill in your user profile')}</p>
          <div className="flex justify-between items-center">
            <span className="text-purple-400 font-bold">+{POINT_VALUES.COMPLETE_PROFILE} {t('rewards.points', 'Points')}</span>
            <span className="text-gray-300 text-sm">
              {actions.COMPLETE_PROFILE ? t('rewards.completed', 'Completed') : t('rewards.incomplete', 'Incomplete')}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-lg font-semibold text-gray-200 mb-3">{t('rewards.recentActivity', 'Recent Activity')}</h4>
        <ul className="space-y-2">
          {actions.LOGIN && (
            <li className="text-sm text-gray-400">
              ✓ {t('rewards.dailyLogin', 'Daily Login')} (+{POINT_VALUES.LOGIN} {t('rewards.points', 'Points')})
            </li>
          )}
          {actions.VIEW_GUIDE > 0 && (
            <li className="text-sm text-gray-400">
              ✓ {t('rewards.viewedGuide', 'Viewed Guide')} {actions.VIEW_GUIDE}x (+{POINT_VALUES.VIEW_GUIDE * actions.VIEW_GUIDE} {t('rewards.points', 'Points')})
            </li>
          )}
          {actions.COMPLETE_PROFILE && (
            <li className="text-sm text-gray-400">
              ✓ {t('rewards.profileCompleted', 'Profile Completed')} (+{POINT_VALUES.COMPLETE_PROFILE} {t('rewards.points', 'Points')})
            </li>
          )}
          {Object.keys(actions).length === 0 && (
            <li className="text-sm text-gray-400">
              {t('rewards.noActivityYet', 'No activity yet. Start earning points!')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserRewardsPage; 