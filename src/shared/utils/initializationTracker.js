/**
 * initializationTracker.js
 * A utility to track and manage user data initialization to prevent duplicate initializations
 */

// Memory-based tracking for the current session
const initializedUsers = {
  items: new Set(),
  mascots: new Set(),
  points: new Set(),
  badges: new Set()
};

// Session flag to prevent multiple initializations per browser session
let appInitializedThisSession = false;

// Initialize tracking in localStorage if not present
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('initialized_users')) {
    localStorage.setItem('initialized_users', JSON.stringify({
      items: {},
      mascots: {},
      points: {},
      badges: {}
    }));
  }
  
  // Check if we've already done an initialization this session
  if (sessionStorage.getItem('app_initialized_this_session') === 'true') {
    appInitializedThisSession = true;
    console.log('App already initialized this browser session');
  }
}

/**
 * Check if app has been initialized in this browser session
 * @returns {boolean} Whether initialization happened this session
 */
export const isAppInitializedThisSession = () => {
  return appInitializedThisSession;
};

/**
 * Mark that app has been initialized in this browser session
 */
export const markAppInitializedThisSession = () => {
  appInitializedThisSession = true;
  sessionStorage.setItem('app_initialized_this_session', 'true');
  console.log('App marked as initialized for this browser session');
};

/**
 * Check if a user has been initialized for a specific feature
 * @param {string} userId - The user ID to check
 * @param {string} feature - The feature to check (items, mascots, etc.)
 * @returns {boolean} Whether the user has been initialized
 */
export const isUserInitialized = (userId, feature) => {
  if (!userId || !feature) {
    console.error('isUserInitialized called with invalid parameters:', { userId, feature });
    return false;
  }

  // Protection against multiple initializations in the same session
  if (appInitializedThisSession && feature === 'items') {
    console.log('App already initialized items this session');
    return true;
  }

  // Check memory-based tracking first (current session)
  if (initializedUsers[feature]?.has(userId)) {
    console.log(`User ${userId} ${feature} already initialized (memory check)`);
    return true;
  }

  // Check localStorage for persistence across sessions
  try {
    const storedData = JSON.parse(localStorage.getItem('initialized_users') || '{}');
    const featureData = storedData[feature] || {};
    
    if (featureData[userId] === true) {
      // Also add to memory for faster future checks
      initializedUsers[feature]?.add(userId);
      console.log(`User ${userId} ${feature} already initialized (localStorage check)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return false;
  }
};

/**
 * Mark a user as initialized for a specific feature
 * @param {string} userId - The user ID to mark
 * @param {string} feature - The feature to mark (items, mascots, etc.)
 */
export const markUserInitialized = (userId, feature) => {
  if (!userId || !feature) {
    console.error('markUserInitialized called with invalid parameters:', { userId, feature });
    return;
  }

  console.log(`Marking user ${userId} as initialized for ${feature}`);

  // Add to memory-based tracking
  initializedUsers[feature]?.add(userId);

  // Update localStorage
  try {
    const storedData = JSON.parse(localStorage.getItem('initialized_users') || '{}');
    const featureData = storedData[feature] || {};
    
    featureData[userId] = true;
    storedData[feature] = featureData;
    
    localStorage.setItem('initialized_users', JSON.stringify(storedData));
    console.log(`User ${userId} marked as initialized for ${feature} in localStorage`);
    
    // If items were initialized, mark the app as initialized for this session
    if (feature === 'items') {
      markAppInitializedThisSession();
    }
  } catch (error) {
    console.error('Error updating initialization status:', error);
  }
}; 