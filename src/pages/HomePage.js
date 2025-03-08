import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserProfileCard from '../components/UserProfileCard';
import MetaMaskSign from '../components/MetaMaskSign';
import BlockchainGuide from '../components/BlockchainGuide';
import MascotProfile from '../mascots/MascotProfile';
import PointsBadge from '../rewards/PointsBadge';

const HomePage = ({ userMascots, activeMascot, userItems }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.overview', 'Profile Overview')}</h2>
      
      {/* Profile and Badges Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* User Profile Card */}
        <UserProfileCard />
        
        {/* Active Mascot */}
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3 text-gray-200">{t('mascots.active_robot', 'Active Mascot')}</h3>
          
          <div className="mt-3 w-full">
            <MascotProfile />
          </div>

          {/* Mascot Link */}
          <Link 
            to="/mascots" 
            className="text-green-400 hover:text-green-300 text-sm mt-2 transition-colors duration-200"
          >
            {t('mascot.manage', 'Manage mascots')}
          </Link>
          
        </div>
      </div>
      
      {/* Rewards and Mascots Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Rewards Quick View */}
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3 text-gray-200">{t('rewards.points', 'Your Points')}</h3>
          <div className="mb-3">
            <PointsBadge />
          </div>
          <p className="text-gray-400 mb-2">{t('rewards.description', 'Earn points by completing actions')}</p>
          <div className="mt-3">
            <Link to="/rewards" className="text-blue-400 text-sm hover:underline">
              {t('rewards.manage', 'Manage rewards')} →
            </Link>
          </div>
        </div>
        
        {/* Mascots Quick View */}
        <div className="bg-gray-900 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3 text-gray-200">{t('mascots.your_mascots', 'Your Mascots')}</h3>
          <p className="text-gray-400 mb-2">
            {userMascots.length > 0 
              ? `${t('mascots.you_have', 'You have')} ${userMascots.length} ${userMascots.length === 1 ? t('mascots.mascot', 'mascot') : t('mascots.mascots', 'mascots')}`
              : t('mascots.description', 'Collect and train robot mascots')}
          </p>
          
          {userMascots.length > 0 ? (
            <div className="flex flex-col items-center my-2">
              {activeMascot ? (
                <>
                  <div 
                    className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center p-2 mb-2"
                    dangerouslySetInnerHTML={{ __html: activeMascot.svg }}
                  />
                  <div className="text-sm font-medium text-gray-200 mb-1">{activeMascot.name}</div>
                  <div className="text-xs text-green-400">
                    {t('mascots.active_mascot', 'Active Mascot')}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {userMascots.slice(0, 3).map(mascot => (
                    <div 
                      key={mascot.id}
                      className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center p-1"
                      dangerouslySetInnerHTML={{ __html: mascot.svg }}
                    />
                  ))}
                  {userMascots.length > 3 && (
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">+{userMascots.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-row gap-3 justify-center my-2">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-green-400 p-2 item-svg-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="12" y1="7" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="17" />
                  <line x1="7" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="17" y2="12" />
                </svg>
              </div>
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400 p-2 item-svg-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="6" width="12" height="12" />
                  <line x1="6" y1="10" x2="18" y2="10" />
                  <line x1="6" y1="14" x2="18" y2="14" />
                  <line x1="10" y1="6" x2="10" y2="18" />
                  <line x1="14" y1="6" x2="14" y2="18" />
                </svg>
              </div>
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-400 p-2 item-svg-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3 L20 7 L20 13 C20 17.4183 16.4183 21 12 21 C7.58172 21 4 17.4183 4 13 L4 7 L12 3Z" />
                </svg>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link to="/items" className="text-blue-400 text-sm hover:underline inline-flex items-center justify-center">
              {userItems && userItems.length > 0 
                ? (
                  <>
                    {t('items.manage', 'Manage all items')} 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                ) 
                : t('items.get_items', 'Get items') + ' →'}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Blockchain Tools */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-200">{t('blockchain.tools', 'Blockchain Tools')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetaMaskSign />
          <BlockchainGuide />
        </div>
      </div>
    </div>
  );
};

export default HomePage; 