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

function App() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#/');
  
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
      default:
        return (
          <>
            {/* Blockchain Guide Section - Always visible regardless of sign-in status */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.blockchainBasics')}</h2>
              <BlockchainGuide />
            </div>
            
            <SignedIn>
              {/* User Profile Card Component */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.userProfile')}</h2>
                <UserProfileCard />
              </div>
              
              {/* MetaMask Signing Component */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.web3Auth')}</h2>
                <MetaMaskSign />
              </div>
            </SignedIn>
            
            <SignedOut>
              <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('common.hello')}</h2>
                <p className="mb-6 text-gray-300">{t('common.signInMessage')}</p>
                <SignInButton mode="modal">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300">
                    {t('common.signInWithClerk')}
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </>
        );
    }
  };

  // Simple navigation menu component
  const Navigation = () => (
    <nav className="mb-8 mt-4">
      <ul className="flex space-x-4 text-gray-300">
        <li>
          <a 
            href="#/" 
            className={`hover:text-white transition-colors ${currentRoute === '#/' ? 'text-white font-medium' : ''}`}
          >
            {t('nav.home', 'Home')}
          </a>
        </li>
        <SignedIn>
          <li>
            <a 
              href="#/badges" 
              className={`hover:text-white transition-colors ${currentRoute === '#/badges' ? 'text-white font-medium' : ''}`}
            >
              {t('nav.badges', 'Badges')}
            </a>
          </li>
          <li>
            <a 
              href="#/rewards" 
              className={`hover:text-white transition-colors ${currentRoute === '#/rewards' ? 'text-white font-medium' : ''}`}
            >
              {t('nav.rewards', 'Rewards')}
            </a>
          </li>
        </SignedIn>
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center py-12 transition-colors duration-200">
      <div className="max-w-3xl w-full px-6 py-8 bg-gray-800 shadow-md rounded-lg transition-colors duration-200">
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          <SignedIn>
            <PointsBadge compact={true} />
          </SignedIn>
          <LanguageSelector />
          <SignedIn>
            {/* Mount UserButton component only if user is signed in */}
            <UserButton />
          </SignedIn>
          <SignedOut>
            {/* Mount sign in button only if user is signed out */}
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300">
                {t('common.signIn')}
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-100 mb-4 transition-colors duration-200">
          {t('common.welcome')}
        </h1>
        
        <Navigation />
        
        {renderContent()}
      </div>
      
      <footer className="mt-8 text-center text-gray-400">
        <p>{t('common.footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}

export default App;
