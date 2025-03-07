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
            <div className="flex flex-wrap">
              <div className="w-full md:w-1/2 md:pr-4">
                <SignedIn>
                  {/* User Profile Card Component - Moved to top left */}
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
              </div>
              
              <div className="w-full md:w-1/2 md:pl-4">
                {/* Blockchain Guide Section - Moved to right side */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.blockchainBasics')}</h2>
                  <BlockchainGuide />
                </div>
              </div>
            </div>
            
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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">Carlos DApp</h1>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            <SignedIn>
              <PointsBadge compact={true} />
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
          </div>
        </div>
      </header>
      
      <nav className="bg-gray-800 border-t border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <ul className="flex space-x-6">
            <li>
              <a href="#/" className={`${currentRoute === '#/' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                {t('nav.home', 'Home')}
              </a>
            </li>
            <li>
              <a href="#/badges" className={`${currentRoute === '#/badges' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                {t('nav.badges', 'Badges')}
              </a>
            </li>
            <li>
              <a href="#/rewards" className={`${currentRoute === '#/rewards' ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}>
                {t('nav.rewards', 'Rewards')}
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      
      <footer className="bg-gray-800 mt-12 py-6 border-t border-gray-700">
        <p>{t('common.footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}

export default App;
