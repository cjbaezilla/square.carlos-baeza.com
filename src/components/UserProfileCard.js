import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

const UserProfileCard = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();

  // Function to format the last sign-in time as "time since"
  const formatLastSignIn = (dateString) => {
    if (!dateString) return t('userProfile.never');
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return t('userProfile.invalidDate');
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    if (diffInSecs < 60) {
      return t('userProfile.timeAgo.seconds', { count: diffInSecs });
    } else if (diffInMins < 60) {
      return t('userProfile.timeAgo.minutes', { count: diffInMins });
    } else if (diffInHours < 24) {
      return t('userProfile.timeAgo.hours', { count: diffInHours });
    } else if (diffInDays < 30) {
      return t('userProfile.timeAgo.days', { count: diffInDays });
    } else if (diffInMonths < 12) {
      return t('userProfile.timeAgo.months', { count: diffInMonths });
    } else {
      return t('userProfile.timeAgo.years', { count: diffInYears });
    }
  };

  // Octagonal clip-path for the avatar
  const octagonalClipPath = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

  if (!isLoaded) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-gray-700 rounded-lg" style={{ clipPath: octagonalClipPath }}></div>
        </div>
        <div className="h-4 bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center text-gray-300">
        <p>{t('userProfile.userNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-gray-100">
      <div className="flex flex-col items-center mb-4">
        {user.imageUrl ? (
          <div 
            className="w-24 h-24 mb-4 overflow-hidden border-2 border-blue-500"
            style={{ clipPath: octagonalClipPath }}
          >
            <img 
              src={user.imageUrl} 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div 
            className="w-24 h-24 mb-4 bg-gray-600 flex items-center justify-center text-2xl font-bold text-gray-300"
            style={{ clipPath: octagonalClipPath }}
          >
            {user.firstName ? user.firstName.charAt(0) : '?'}
            {user.lastName ? user.lastName.charAt(0) : ''}
          </div>
        )}
        
        <h2 className="text-xl font-bold">
          {user.fullName || 'User'}
        </h2>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">{t('userProfile.email')}</span>
          <span className="font-medium">
            {user.primaryEmailAddress?.emailAddress || t('userProfile.noEmail')}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">{t('userProfile.web3Wallet')}</span>
          <span className="font-medium">
            {user.primaryWeb3Wallet?.web3Wallet || t('userProfile.noWallet')}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">{t('userProfile.lastSignIn')}</span>
          <span className="font-medium">
            {formatLastSignIn(user.lastSignInAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard; 