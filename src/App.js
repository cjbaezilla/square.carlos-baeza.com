import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import './App.css';
import { Navigation, LanguageSelector } from './shared/components';
import AppRouter from './shared/router/AppRouter';
import { MascotService } from './features/mascots';
import { MASCOT_UPDATED_EVENT } from './features/mascots/MascotService';
import { ItemService } from './features/items';
import { ITEM_UPDATED_EVENT } from './features/items/ItemService';
import svgStyles from './shared/utils/svgStyles';

function App() {
  // eslint-disable-next-line no-unused-vars
  const { user, isLoaded, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userMascots, setUserMascots] = useState([]);
  const [activeMascot, setActiveMascot] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch and update items
  const fetchAndUpdateItems = useCallback(async () => {
    if (isSignedIn && user) {
      try {
        setIsLoading(true);
        // Initialize user items data if needed
        await ItemService.initUserItemsData(user.id);
        
        // Get user's items
        const items = await ItemService.getUserItems(user.id);
        console.log('Loaded user items:', items);
        
        if (items && Array.isArray(items)) {
          setUserItems(items);
        } else {
          console.warn('Items not available or not an array:', items);
          setUserItems([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setUserItems([]);
        setIsLoading(false);
      }
    }
  }, [isSignedIn, user]);

  // Fetch and update mascots
  const fetchAndUpdateMascots = useCallback(async () => {
    if (isSignedIn && user) {
      try {
        setIsLoading(true);
        
        // Get user's mascots
        const mascots = await MascotService.getUserMascots(user.id);
        setUserMascots(mascots);
        
        // Get user's active mascot
        const active = await MascotService.getUserActiveMascot(user.id);
        
        // If there's no active mascot but the user has mascots, set the first one as active
        if (!active && mascots && mascots.length > 0) {
          await MascotService.setUserActiveMascot(user.id, mascots[0].id);
          const newActive = await MascotService.getUserActiveMascot(user.id);
          setActiveMascot(newActive);
        } else {
          setActiveMascot(active);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching mascots:', error);
        setUserMascots([]);
        setActiveMascot(null);
        setIsLoading(false);
      }
    }
  }, [isSignedIn, user]);

  // Load user's data on initial render
  useEffect(() => {
    const loadUserData = async () => {
      if (isSignedIn && user) {
        try {
          // Verify tables exist in Supabase
          await ItemService.verifyTables();
          
          // Fetch items
          await fetchAndUpdateItems();
          
          // Fetch mascots
          await fetchAndUpdateMascots();
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    
    loadUserData();
  }, [isSignedIn, user, fetchAndUpdateItems, fetchAndUpdateMascots]);

  // Add global error listener for better error tracking
  useEffect(() => {
    const handleGlobalError = (event) => {
      // eslint-disable-next-line no-console
      console.error('Global error detected:', event.error || event.message);
      // eslint-disable-next-line no-console
      console.error('Error details:', event);
    };

    // Listen for unhandled errors
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Promise Rejection:', event.reason);
    });

    // Clean up
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  // Listen for mascot updates
  useEffect(() => {
    const handleMascotUpdate = async (event) => {
      if (isSignedIn && user && event.detail.userId === user.id) {
        await fetchAndUpdateMascots();
      }
    };
    
    document.addEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    
    return () => {
      document.removeEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    };
  }, [isSignedIn, user, fetchAndUpdateMascots]);

  // Listen for item updates
  useEffect(() => {
    const handleItemUpdate = async (event) => {
      if (isSignedIn && user && event.detail.userId === user.id) {
        await fetchAndUpdateItems();
      }
    };
    
    document.addEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    
    return () => {
      document.removeEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    };
  }, [isSignedIn, user, fetchAndUpdateItems]);

  // Apply custom styles for SVG rendering
  useEffect(() => {
    // Create a style element if it doesn't exist
    let styleElement = document.getElementById('custom-svg-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-svg-styles';
      document.head.appendChild(styleElement);
    }
    
    // Add the CSS rules
    let cssRules = '';
    for (const [selector, rules] of Object.entries(svgStyles)) {
      cssRules += `${selector} { `;
      for (const [property, value] of Object.entries(rules)) {
        cssRules += `${property}: ${value}; `;
      }
      cssRules += '} ';
    }
    
    styleElement.textContent = cssRules;
    
    // Cleanup
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <header className="bg-gray-900 shadow-md">
          <div className="max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-green-400">
                  {t('app.title', 'Robot Square')}
                </h1>
                <LanguageSelector />
              </div>
              
              <div>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" />
                </SignedOut>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-5xl mx-auto p-4">
          <SignedIn>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                <Navigation />
                <AppRouter
                  userMascots={userMascots}
                  activeMascot={activeMascot}
                  userItems={userItems}
                />
              </>
            )}
          </SignedIn>
          <SignedOut>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">{t('auth.sign_in_message', 'Sign in to continue')}</h2>
              <p className="text-gray-400 mb-6">{t('auth.sign_in_description', 'Please sign in or create an account to access your robot mascots')}</p>
              <SignInButton mode="modal" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition" />
            </div>
          </SignedOut>
        </main>
        
        <footer className="bg-gray-900 text-gray-400 py-4 mt-12">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm">
            <p>© 2023 Robot Square. {t('footer.rights', 'All rights reserved.')}</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
