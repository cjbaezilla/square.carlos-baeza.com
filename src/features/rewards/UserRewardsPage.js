import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import PointsService, { POINT_VALUES } from './PointsService';

const UserRewardsPage = () => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [actions, setActions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user points data when component mounts
    if (isSignedIn && user) {
      const userId = user.id;
      
      // Award points for login
      const updatedData = PointsService.awardLoginPoints(userId);
      setUserData(updatedData);
      
      // Get completed actions
      const completedActions = PointsService.getUserCompletedActions(userId);
      setActions(completedActions);
      
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  // Progress to next level
  const calculateProgress = () => {
    if (!userData) return 0;
    
    const currentLevelPoints = (userData.level - 1) * 50;
    const pointsInCurrentLevel = userData.points - currentLevelPoints;
    const progressPercent = (pointsInCurrentLevel / 50) * 100;
    
    return Math.min(progressPercent, 100);
  };

  // Award points for viewing the guide
  const handleViewGuide = () => {
    if (isSignedIn && user) {
      const updatedData = PointsService.awardGuideViewPoints(user.id);
      setUserData(updatedData);
      setActions(PointsService.getUserCompletedActions(user.id));
    }
  };

  // Award points for profile completion
  const handleCompleteProfile = () => {
    if (isSignedIn && user) {
      const updatedData = PointsService.awardProfileCompletionPoints(user.id);
      setUserData(updatedData);
      setActions(PointsService.getUserCompletedActions(user.id));
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* User Points Summary */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-purple-400 mb-2">
          {userData?.points} {t('rewards.points', 'Points')}
        </h3>
        <div className="flex items-center mb-2">
          <span className="text-gray-300 mr-2">{t('rewards.level', 'Level')} {userData?.level}</span>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-purple-600 h-2.5 rounded-full" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <span className="text-gray-300 ml-2">{t('rewards.level', 'Level')} {userData?.level + 1}</span>
        </div>
        <p className="text-sm text-gray-400">
          {50 - (userData?.points % 50)} {t('rewards.pointsToNextLevel', 'points to next level')}
        </p>
      </div>

      {/* Rewards Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div 
          className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
          onClick={handleViewGuide}
        >
          <h4 className="text-lg font-semibold text-gray-200 mb-1">{t('rewards.viewGuide', 'View Guide')}</h4>
          <p className="text-sm text-gray-400 mb-2">{t('rewards.viewGuideDesc', 'Learn about blockchain basics')}</p>
          <div className="flex justify-between items-center">
            <span className="text-purple-400 font-bold">+{POINT_VALUES.VIEW_GUIDE} {t('rewards.points', 'Points')}</span>
            <span className="text-gray-300 text-sm">
              {actions.VIEW_GUIDE ? `${actions.VIEW_GUIDE}x ${t('rewards.viewed', 'viewed')}` : t('rewards.notViewed', 'Not viewed')}
            </span>
          </div>
        </div>

        <div 
          className={`bg-gray-700 ${actions.COMPLETE_PROFILE ? 'opacity-75' : 'hover:bg-gray-600'} rounded-lg p-4 cursor-pointer transition-colors`}
          onClick={handleCompleteProfile}
        >
          <h4 className="text-lg font-semibold text-gray-200 mb-1">{t('rewards.completeProfile', 'Complete Profile')}</h4>
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