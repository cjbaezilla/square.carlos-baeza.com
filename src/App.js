import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import './App.css';
import UserProfileCard from './components/UserProfileCard';
import MetaMaskSign from './components/MetaMaskSign';
import BlockchainGuide from './components/BlockchainGuide';
import LanguageSelector from './components/LanguageSelector';
import BadgesPage from './badges/BadgesPage';
import UserRewardsPage from './rewards/UserRewardsPage';
import PointsBadge from './rewards/PointsBadge';
import MascotsPage from './mascots/MascotsPage';
import ItemsPage from './items/ItemsPage';
import MascotService, { MASCOT_UPDATED_EVENT } from './mascots/MascotService';

function App() {
  // eslint-disable-next-line no-unused-vars
  const { user, isLoaded, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  const [userMascots, setUserMascots] = useState([]);
  const [activeMascot, setActiveMascot] = useState(null);
  
  // Simple routing based on hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Load user's mascots
  useEffect(() => {
    if (isSignedIn && user) {
      // Get user's mascots
      const mascots = MascotService.getUserMascots(user.id);
      setUserMascots(mascots);
      
      // Get user's active mascot
      const active = MascotService.getUserActiveMascot(user.id);
      setActiveMascot(active);
    }
  }, [isSignedIn, user]);

  // Listen for mascot updates
  useEffect(() => {
    const handleMascotUpdate = (event) => {
      if (isSignedIn && user && event.detail.userId === user.id) {
        const mascots = MascotService.getUserMascots(user.id);
        setUserMascots(mascots);
        
        const active = MascotService.getUserActiveMascot(user.id);
        setActiveMascot(active);
      }
    };
    
    document.addEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    
    return () => {
      document.removeEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    };
  }, [isSignedIn, user]);

  const renderContent = () => {
    switch (currentRoute) {
      case '#/badges':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.badges', 'User Badges')}</h2>
            <BadgesPage />
          </div>
        );
      case '#/rewards':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.rewards', 'Rewards & Points')}</h2>
            <UserRewardsPage />
          </div>
        );
      case '#/mascots':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.mascots', 'Robot Mascots')}</h2>
            <MascotsPage />
          </div>
        );
      case '#/items':
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.items', 'Robot Items')}</h2>
            <ItemsPage />
          </div>
        );
      default:
        return (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.overview', 'Profile Overview')}</h2>
            
            {/* Profile and Badges Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* User Profile Card */}
              <UserProfileCard />
              
              {/* Badges Quick View */}
              <div className="bg-gray-900 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-gray-200">{t('badges.recent', 'Recent Badges')}</h3>
                <p className="text-gray-400 mb-2">{t('badges.quick_view', 'Quick view of your earned badges')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-3 py-1 bg-blue-900 text-blue-100 rounded-full text-xs">Web3</span>
                  <span className="inline-block px-3 py-1 bg-purple-900 text-purple-100 rounded-full text-xs">Blockchain</span>
                  <span className="inline-block px-3 py-1 bg-green-900 text-green-100 rounded-full text-xs">Active User</span>
                </div>
                <div className="mt-3">
                  <a href="#/badges" className="text-blue-400 text-sm hover:underline">
                    {t('badges.view_all', 'View all badges')} →
                  </a>
                </div>
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
                  <a href="#/rewards" className="text-blue-400 text-sm hover:underline">
                    {t('rewards.manage', 'Manage rewards')} →
                  </a>
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
                  <div className="flex justify-center my-2">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#3498db" strokeWidth="2">
                        <rect x="18" y="14" width="28" height="22" rx="2" />
                        <circle cx="28" cy="22" r="3" />
                        <circle cx="36" cy="22" r="3" />
                        <rect x="26" y="36" width="12" height="12" rx="1" />
                        <line x1="22" y1="22" x2="14" y2="24" />
                        <line x1="42" y1="22" x2="50" y2="24" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <div className="mt-3">
                  <a href="#/mascots" className="text-blue-400 text-sm hover:underline">
                    {userMascots.length > 0 
                      ? t('mascots.manage', 'Manage mascots')
                      : t('mascots.get_mascots', 'Get mascots')} →
                  </a>
                </div>
              </div>
            </div>
            
            {/* Items Quick View */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-gray-900 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3 text-gray-200">{t('items.robot_items', 'Robot Items')}</h3>
                <p className="text-gray-400 mb-2">{t('items.description', 'Collect special items to upgrade your mascots')}</p>
                <div className="flex justify-center gap-4 my-2">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="12" cy="12" r="2" />
                      <line x1="12" y1="7" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="17" />
                      <line x1="7" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="17" y2="12" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="6" width="12" height="12" />
                      <line x1="6" y1="10" x2="18" y2="10" />
                      <line x1="6" y1="14" x2="18" y2="14" />
                      <line x1="10" y1="6" x2="10" y2="18" />
                      <line x1="14" y1="6" x2="14" y2="18" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3 L20 7 L20 13 C20 17.4183 16.4183 21 12 21 C7.58172 21 4 17.4183 4 13 L4 7 L12 3Z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3">
                  <a href="#/items" className="text-blue-400 text-sm hover:underline">
                    {t('items.manage', 'Manage items')} →
                  </a>
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
    }
  };

  const Navigation = () => (
    <nav className="mb-6">
      <div className="flex flex-wrap gap-2">
        <a 
          href="#/" 
          className={`px-3 py-2 rounded-lg transition ${currentRoute === '#/' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {t('nav.home', 'Home')}
        </a>
        <a 
          href="#/badges" 
          className={`px-3 py-2 rounded-lg transition ${currentRoute === '#/badges' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {t('nav.badges', 'Badges')}
        </a>
        <a 
          href="#/rewards" 
          className={`px-3 py-2 rounded-lg transition ${currentRoute === '#/rewards' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {t('nav.rewards', 'Rewards')}
        </a>
        <a 
          href="#/mascots" 
          className={`px-3 py-2 rounded-lg transition ${currentRoute === '#/mascots' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {t('nav.mascots', 'Mascots')}
        </a>
        <a 
          href="#/items" 
          className={`px-3 py-2 rounded-lg transition ${currentRoute === '#/items' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          {t('nav.items', 'Items')}
        </a>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 shadow-md">
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-xl text-blue-400 mr-2">Square</span>
              <span className="text-sm text-gray-400">Web3 Profile</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <SignedIn>
                <div className="px-3 py-1.5 bg-gray-800 rounded-lg flex items-center">
                  <span className="text-yellow-400 mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </span>
                  <PointsBadge compact={true} />
                </div>
              </SignedIn>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
                    {t('auth.sign_in', 'Sign In')}
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto p-4">
        <SignedIn>
          <Navigation />
          {renderContent()}
        </SignedIn>
        <SignedOut>
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">{t('auth.welcome', 'Welcome to Square')}</h2>
            <p className="text-gray-400 mb-6">{t('auth.description', 'Please sign in to access your Web3 profile')}</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                {t('auth.sign_in', 'Sign In')}
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
      
      <footer className="bg-gray-900 mt-12">
        <div className="max-w-5xl mx-auto p-4 text-center text-gray-500 text-sm">
          <p>Square Web3 Profile &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
