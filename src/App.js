import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import './App.css';
import Navigation from './components/Navigation';
import LanguageSelector from './components/LanguageSelector';
import AppRouter from './router/AppRouter';
import MascotService, { MASCOT_UPDATED_EVENT } from './mascots/MascotService';
import ItemService, { ITEM_UPDATED_EVENT } from './items/ItemService';

// Custom CSS in JSX for ensuring SVGs are visible
const svgStyles = {
  '.item-svg-container svg': {
    width: '100%',
    height: '100%',
    stroke: 'currentColor',
    strokeWidth: '2px',
    minWidth: '24px',
    minHeight: '24px'
  },
  '.item-svg-container svg *': {
    stroke: 'currentColor',
    strokeWidth: '2px'
  }
};

// Helper function to ensure user has some sample items if empty
const ensureUserHasSampleItems = (userId) => {
  const items = ItemService.getUserItems(userId);
  console.log('Current user items before ensuring samples:', items);
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log('User has no items, adding samples...');
    // Add a few sample items if the user doesn't have any
    const sampleItems = ItemService.getSampleItems();
    console.log('Sample items generated:', sampleItems);
    
    if (sampleItems && Array.isArray(sampleItems) && sampleItems.length > 0) {
      for (let i = 0; i < Math.min(3, sampleItems.length); i++) {
        console.log('Adding sample item to inventory:', sampleItems[i]);
        ItemService.addItemToUserInventory(userId, sampleItems[i]);
      }
      
      const updatedItems = ItemService.getUserItems(userId);
      console.log('Updated items after adding samples:', updatedItems);
      return updatedItems;
    }
  }
  return items;
};

function App() {
  // eslint-disable-next-line no-unused-vars
  const { user, isLoaded, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userMascots, setUserMascots] = useState([]);
  const [activeMascot, setActiveMascot] = useState(null);
  const [userItems, setUserItems] = useState([]);
  
  // Fetch and update items - extracted as a separate function to reuse
  const fetchAndUpdateItems = useCallback(() => {
    if (isSignedIn && user) {
      try {
        // Force initialization of user items data structure if it doesn't exist
        ItemService.initUserItemsData(user.id);
        
        // Get user's items, adding samples if needed
        const items = ensureUserHasSampleItems(user.id);
        console.log('Loaded user items:', items);
        
        if (items && Array.isArray(items)) {
          setUserItems(items);
        } else {
          console.warn('Items not available or not an array:', items);
          setUserItems([]);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setUserItems([]);
      }
    }
  }, [isSignedIn, user]);

  // Load user's data on initial render
  useEffect(() => {
    if (isSignedIn && user) {
      // Get user's mascots
      const mascots = MascotService.getUserMascots(user.id);
      setUserMascots(mascots);
      
      // Get user's active mascot
      const active = MascotService.getUserActiveMascot(user.id);
      setActiveMascot(active);
      
      // Fetch items
      fetchAndUpdateItems();
    }
  }, [isSignedIn, user, fetchAndUpdateItems]);

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

  // Listen for item updates
  useEffect(() => {
    const handleItemUpdate = (event) => {
      console.log('Item update event received:', event.detail);
      if (isSignedIn && user) {
        fetchAndUpdateItems();
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
            <Navigation />
            <AppRouter
              userMascots={userMascots}
              activeMascot={activeMascot}
              userItems={userItems}
            />
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
