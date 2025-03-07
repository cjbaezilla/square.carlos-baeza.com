import React from 'react';
import { useUser } from '@clerk/clerk-react';

const UserProfileCard = () => {
  const { user, isLoaded } = useUser();

  // Function to format the last sign-in time in a human-readable format
  const formatLastSignIn = (dateString) => {
    if (!dateString) return 'Never signed in';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Options for formatting
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
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
        <p>User not found</p>
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
          <span className="text-gray-400 text-sm">Email</span>
          <span className="font-medium">
            {user.primaryEmailAddress?.emailAddress || 'No email provided'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">Web3 Wallet</span>
          <span className="font-medium">
            {user.primaryWeb3Wallet?.web3Wallet || 'No Web3 wallet connected'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">Last Sign In</span>
          <span className="font-medium">
            {formatLastSignIn(user.lastSignInAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard; 