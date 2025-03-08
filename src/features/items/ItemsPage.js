import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import ItemService, { ITEM_UPDATED_EVENT, ITEM_RARITIES } from './ItemService';
import MascotService from '../mascots/MascotService';
import PointsService, { POINTS_UPDATED_EVENT } from '../rewards/PointsService';
import './items.css'; // Import custom animations CSS

const ItemsPage = () => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userItems, setUserItems] = useState([]);
  const [userMascots, setUserMascots] = useState([]);
  const [selectedMascot, setSelectedMascot] = useState(null);
  const [equippedItems, setEquippedItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseAnimation, setPurchaseAnimation] = useState(false);
  const [newItem, setNewItem] = useState(null);
  const [mascotStats, setMascotStats] = useState(null);
  const [mascotTotalStats, setMascotTotalStats] = useState(null);
  const pointsTimerRef = useRef(null);
  const [isItemEquippedState, setIsItemEquippedState] = useState({});

  // Load user's items and mascots
  useEffect(() => {
    const loadData = async () => {
      if (isSignedIn && user) {
        try {
          console.log('ItemsPage - loadData called for user:', user.id);
          setIsLoading(true);
          const userId = user.id;
          
          // Get user's items - now async
          console.log('ItemsPage - Fetching user items...');
          const items = await ItemService.getUserItems(userId);
          console.log(`ItemsPage - Fetched ${items.length} items for user:`, userId);
          setUserItems(items);
          
          // Get user's mascots - using await for async call
          console.log('ItemsPage - Fetching user mascots...');
          const mascots = await MascotService.getUserMascots(userId);
          console.log(`ItemsPage - Fetched ${mascots?.length || 0} mascots for user:`, userId);
          setUserMascots(mascots || []); // Ensure it's an array even if null/undefined is returned
          
          // Get user's active mascot - using await for async call
          console.log('ItemsPage - Fetching active mascot...');
          const activeMascot = await MascotService.getUserActiveMascot(userId);
          if (activeMascot) {
            console.log('ItemsPage - Active mascot found:', activeMascot.id);
            setSelectedMascot(activeMascot);
            
            // Get items equipped to the active mascot - now async
            console.log('ItemsPage - Fetching items equipped to mascot:', activeMascot.id);
            const mascotItems = await ItemService.getMascotItems(userId, activeMascot.id);
            console.log(`ItemsPage - Fetched ${mascotItems.length} equipped items for mascot:`, activeMascot.id);
            setEquippedItems(mascotItems);
            
            // Calculate base and total stats
            setMascotStats(activeMascot.stats);
            setMascotTotalStats(ItemService.calculateTotalMascotStats(activeMascot, mascotItems));
          } else {
            console.log('ItemsPage - No active mascot found for user:', userId);
          }
          
          // Get user's points
          console.log('ItemsPage - Fetching user points...');
          const userData = await PointsService.getUserPoints(userId);
          console.log('ItemsPage - User points:', userData.points);
          setUserPoints(userData.points);
          
          console.log('ItemsPage - loadData completed successfully');
          setIsLoading(false);
        } catch (error) {
          console.error('ItemsPage - Error loading data:', error);
          setUserMascots([]); // Ensure userMascots is an array in case of error
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [isSignedIn, user]);

  // Add a new useEffect for updating points every 5 seconds
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (isSignedIn && user) {
        try {
          const userData = await PointsService.getUserPoints(user.id);
          if (userData && userData.points !== undefined) {
            setUserPoints(userData.points);
          }
        } catch (error) {
          console.error('Error fetching user points:', error);
        }
      }
    };

    // Initial fetch
    fetchUserPoints();

    // Set up interval to fetch points every 5 seconds
    pointsTimerRef.current = setInterval(fetchUserPoints, 5000);

    // Clean up interval on component unmount
    return () => {
      if (pointsTimerRef.current) {
        clearInterval(pointsTimerRef.current);
      }
    };
  }, [isSignedIn, user]);

  // Listen for item updates
  useEffect(() => {
    const handleItemUpdate = async (event) => {
      if (isSignedIn && user) {
        const userId = user.id;
        
        // Update user's items - now async
        const items = await ItemService.getUserItems(userId);
        setUserItems(items);
        
        // Update equipped items if the selected mascot is affected
        if (selectedMascot && event.detail.mascotId === selectedMascot.id) {
          const mascotItems = await ItemService.getMascotItems(userId, selectedMascot.id);
          setEquippedItems(mascotItems);
          
          // Recalculate total stats
          setMascotTotalStats(ItemService.calculateTotalMascotStats(selectedMascot, mascotItems));
        }
      }
    };
    
    document.addEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    
    return () => {
      document.removeEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    };
  }, [isSignedIn, user, selectedMascot]);

  // Function to handle mascot updates - wrapped in useCallback
  const handleMascotUpdate = useCallback(async () => {
    if (isSignedIn && user) {
      try {
        // Refresh mascots list
        const mascots = await MascotService.getUserMascots(user.id);
        setUserMascots(mascots || []);
        
        // Check if the selected mascot has been updated
        if (selectedMascot) {
          const updatedMascot = await MascotService.getUserActiveMascot(user.id);
          if (updatedMascot) {
            setSelectedMascot(updatedMascot);
            
            // Refresh equipped items
            const mascotItems = await ItemService.getMascotItems(user.id, updatedMascot.id);
            setEquippedItems(mascotItems);
            
            // Update stats
            setMascotStats(updatedMascot.stats);
            setMascotTotalStats(ItemService.calculateTotalMascotStats(updatedMascot, mascotItems));
          }
        }
      } catch (error) {
        console.error('Error updating mascot data:', error);
      }
    }
  }, [isSignedIn, user, selectedMascot, setUserMascots, setSelectedMascot, setEquippedItems, setMascotStats, setMascotTotalStats]);

  // Listen for mascot and points updates
  useEffect(() => {
    // No longer needs function definition here - using the one defined above
    
    document.addEventListener('mascot-updated', handleMascotUpdate);
    
    // Also listen for points updates
    const handlePointsUpdate = (event) => {
      if (isSignedIn && user && event.detail.pointsData && event.detail.pointsData[user.id]) {
        setUserPoints(event.detail.pointsData[user.id]);
      }
    };
    
    document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    
    // Clean up
    return () => {
      document.removeEventListener('mascot-updated', handleMascotUpdate);
      document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    };
  }, [isSignedIn, user, handleMascotUpdate]); // Added handleMascotUpdate to dependencies

  // Handle mascot selection
  const handleSelectMascot = async (mascot) => {
    if (isSignedIn && user) {
      setSelectedMascot(mascot);
      
      const userId = user.id;
      // Get items equipped to this mascot - now async
      const mascotItems = await ItemService.getMascotItems(userId, mascot.id);
      setEquippedItems(mascotItems);
      
      // Update stats
      setMascotStats(mascot.stats);
      setMascotTotalStats(ItemService.calculateTotalMascotStats(mascot, mascotItems));
    }
  };

  // Handle item purchase
  const handlePurchaseItem = async () => {
    if (isSignedIn && user) {
      const userId = user.id;
      
      try {
        // Purchase random item - now async
        const result = await ItemService.purchaseRandomItem(userId);
        
        if (result.success) {
          // Show notification
          setNotification({
            type: 'success',
            message: result.message
          });
          
          // Show purchase animation and reveal the new item
          setPurchaseAnimation(true);
          setNewItem(result.item);
          
          // Update points display
          setUserPoints(result.remainingPoints);
          
          // Hide notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        } else {
          // Show error notification
          setNotification({
            type: 'error',
            message: result.message
          });
          
          // Hide notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Error purchasing item:', error);
        setNotification({
          type: 'error',
          message: 'An error occurred while purchasing the item'
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    }
  };

  // Handle closing the purchase animation/reveal
  const handleClosePurchase = async () => {
    setPurchaseAnimation(false);
    setNewItem(null);
    
    // Update items list - now async
    if (isSignedIn && user) {
      const items = await ItemService.getUserItems(user.id);
      setUserItems(items);
    }
  };

  // Handle unequipping an item from the selected mascot
  const handleUnequipItem = async (itemInstanceId) => {
    if (!isSignedIn || !user || !selectedMascot) return;
    
    setIsLoading(true);
    
    try {
      const result = await ItemService.unequipItemFromMascot(
        user.id, 
        selectedMascot.id, 
        itemInstanceId
      );
      
      if (result.success) {
        // Show success notification
        setNotification({
          type: 'success',
          message: t('items.unequip_success', 'Item unequipped successfully!')
        });
        
        // Fetch updated items
        await handleMascotUpdate();
      } else {
        setNotification({
          type: 'error',
          message: result.message || t('items.unequip_error', 'Failed to unequip item')
        });
      }
    } catch (error) {
      console.error('Error unequipping item:', error);
      setNotification({
        type: 'error',
        message: t('items.unequip_error', 'Failed to unequip item')
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };
  
  // Handle equipping an item to the selected mascot
  const handleEquipItem = async (itemInstanceId) => {
    if (!isSignedIn || !user || !selectedMascot) {
      // If no mascot is selected, show notification asking user to select a mascot
      setNotification({
        type: 'info',
        message: t('items.select_mascot_first', 'Please select a mascot first')
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    // Add debugging
    console.log('Attempting to equip item with instance ID:', itemInstanceId);
    console.log('Selected mascot:', selectedMascot.id);
    
    // Find the item in userItems to verify it exists
    const itemToEquip = userItems.find(item => item.instanceId === itemInstanceId);
    if (!itemToEquip) {
      console.error('Item not found in userItems array. Instance ID:', itemInstanceId);
      console.log('Available items:', userItems.map(item => ({ id: item.id, instanceId: item.instanceId })));
      setNotification({
        type: 'error',
        message: 'Item not found in local state. Please refresh the page.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    console.log('Found item to equip:', itemToEquip);
    setIsLoading(true);
    
    try {
      const result = await ItemService.equipItemToMascot(
        user.id, 
        selectedMascot.id, 
        itemInstanceId
      );
      
      console.log('Equip result:', result);
      
      if (result.success) {
        // Show success notification
        setNotification({
          type: 'success',
          message: t('items.equip_success', 'Item equipped successfully!')
        });
        
        // Fetch updated items
        await handleMascotUpdate();
      } else {
        setNotification({
          type: 'error',
          message: result.message || t('items.equip_error', 'Failed to equip item')
        });
      }
    } catch (error) {
      console.error('Error equipping item:', error);
      setNotification({
        type: 'error',
        message: t('items.equip_error', 'Failed to equip item')
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Render tabs for navigation
  const renderTabs = () => (
    <div className="flex mb-4 border-b border-gray-700">
      <button
        className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
        onClick={() => setActiveTab('inventory')}
      >
        {t('items.inventory', 'Inventory')}
      </button>
      <button
        className={`px-4 py-2 font-medium ${activeTab === 'shop' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
        onClick={() => setActiveTab('shop')}
      >
        {t('items.shop', 'Item Shop')}
      </button>
      <button
        className={`px-4 py-2 font-medium ${activeTab === 'equipped' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
        onClick={() => setActiveTab('equipped')}
      >
        {t('items.equipped', 'Equipped Items')}
      </button>
    </div>
  );

  // Render notification
  const renderNotification = () => {
    if (!notification) return null;
    
    return (
      <div className={`p-2 mb-4 rounded ${notification.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
        {notification.message}
      </div>
    );
  };

  // Helper function to sort mascots with active one first
  const sortMascots = (mascots) => {
    if (!Array.isArray(mascots) || !selectedMascot) return mascots;
    
    return [...mascots].sort((a, b) => {
      // Place the selected/active mascot first
      if (a.id === selectedMascot.id) return -1;
      if (b.id === selectedMascot.id) return 1;
      return 0;
    });
  };

  // Render the item shop tab
  const renderShopTab = () => (
    <div className="mb-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-blue-500/10 filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/10 filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-pattern opacity-5"></div>
        </div>
        
        {/* Featured item showcase - NEW */}
        <div className="relative z-10 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-5 mb-6 border border-indigo-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-indigo-200 bg-indigo-900/60 mb-3">
                {t('items.featured', 'FEATURED')}
              </div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-2">
                {t('items.mystery_crate', 'Mystery Tech Crate')}
              </h3>
              <p className="text-indigo-100/80 mb-4">
                {t('items.crate_description', 'Unlock advanced robot components with a chance to discover rare and legendary items that will transform your mascots!')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(ITEM_RARITIES).map(([key, rarity]) => (
                  <div 
                    key={key} 
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: `${rarity.color}30`, color: rarity.color, border: `1px solid ${rarity.color}40` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rarity.color }}></span>
                    <span>{t(`items.rarities.${rarity.name}`, rarity.name)}</span>
                    <span className="opacity-70">{rarity.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                {/* Animated crate with glow effect */}
                <div className="w-52 h-52 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-xl border-2 border-indigo-400/30 p-4 flex items-center justify-center shadow-xl relative animate-float">
                    <div className="absolute inset-0 rounded-xl bg-grid-pattern opacity-10"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10l-8-4m8 4v10m0-10l8 4m-16-4l8 4" />
                    </svg>
                    
                    {/* Animated particles around the crate */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <span className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                      <span className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-700"></span>
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-300"></span>
                    </div>
                  </div>
                  
                  {/* Glow effect under crate */}
                  <div className="absolute -bottom-5 inset-x-0 h-10 bg-indigo-500/20 filter blur-xl rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 relative z-10">
          {/* Points and purchase button - REDESIGNED */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-gray-900 shadow-lg shadow-yellow-400/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-400">{t('items.your_balance', 'YOUR BALANCE')}</div>
                  <div className="text-2xl font-bold text-yellow-400">{userPoints}</div>
                </div>
              </div>
              
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((userPoints / 50) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>50</span>
              </div>
            </div>
            
            {/* Animated purchase button */}
            <button 
              onClick={handlePurchaseItem}
              disabled={userPoints < 50}
              className={`relative overflow-hidden group w-full px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                userPoints >= 50 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/30' 
                  : 'bg-gray-700 cursor-not-allowed opacity-70'
              }`}
            >
              {/* Button background animation */}
              {userPoints >= 50 && (
                <div className="absolute inset-0 w-full h-full overflow-hidden opacity-0 group-hover:opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
                {t('items.purchase_mystery_item', 'Unlock Mystery Item')} 
                <span className="bg-indigo-800/80 px-2 py-0.5 rounded text-xs ml-1">50 {t('points', 'Points')}</span>
              </div>
            </button>
            
            {/* Countdown timer - NEW */}
            {userPoints >= 50 && (
              <div className="mt-3 text-center text-xs text-indigo-300">
                <div className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('items.limited_offer', 'Limited offer refreshes in 03:45:22')}
                </div>
              </div>
            )}
            
            {/* Need more points info - IMPROVED */}
            {userPoints < 50 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-900/30 to-yellow-700/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-400">{t('items.need_more_points', 'Need more points?')}</h4>
                    <p className="text-sm text-gray-300">{t('items.earn_points_message', 'Complete activities to earn more points!')}
                      <button onClick={() => setActiveTab('shop')} className="ml-1 text-yellow-400 hover:underline">{t('items.learn_more', 'Learn how →')}</button>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* What you'll get and benefits - REDESIGNED IN CARDS */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What you might get */}
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 flex flex-col h-full">
              <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('items.what_you_get', 'What You Might Get')}
              </h4>
              <div className="space-y-3 flex-1">
                <div className="group bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200 flex gap-3 items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30 group-hover:border-purple-500/60 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-purple-200 group-hover:text-purple-100 transition-colors">{t('items.type_power_core', 'Power Core')}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{t('items.increases_energy', 'Boosts energy and attack power')}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300">
                    +25%
                  </div>
                </div>
                
                <div className="group bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200 flex gap-3 items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500/60 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-200 group-hover:text-blue-100 transition-colors">{t('items.type_cpu', 'CPU')}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{t('items.increases_logic', 'Enhances logical capabilities')}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-blue-900/30 border border-blue-500/20 text-blue-300">
                    +20%
                  </div>
                </div>
                
                <div className="group bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200 flex gap-3 items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center border border-yellow-500/30 group-hover:border-yellow-500/60 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-yellow-200 group-hover:text-yellow-100 transition-colors">{t('items.type_head_armor', 'Head Armor')}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{t('items.increases_defense', 'Increases defense stats')}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-yellow-900/30 border border-yellow-500/20 text-yellow-300">
                    +15%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Why unlock */}
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
              <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('items.why_unlock', 'Why Unlock Items?')}
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3 bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{t('items.benefit_stronger', 'Make your mascots stronger in battles')}</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{t('items.benefit_rare', 'Collect rare and legendary pieces for your collection')}</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{t('items.benefit_customize', 'Customize and build unique mascot loadouts')}</span>
                </li>
                <li className="flex items-start gap-3 bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{t('items.benefit_achieve', 'Complete achievements and collections')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* NEW: Recent Lucky Drops - add social proof */}
        <div className="relative z-10 bg-gray-900/70 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 mt-4">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('items.recent_drops', 'Recent Lucky Drops')}
          </h4>
          
          <div className="overflow-x-auto">
            <div className="inline-flex gap-4 pb-2 min-w-full">
              {/* These would typically be generated from real data */}
              <div className="relative flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 group hover:border-indigo-500/50 transition-colors duration-200">
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {t(`items.rarities.epic`, 'Epic')}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 mb-2 rounded-lg bg-purple-900/20 border border-purple-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="font-medium text-purple-200 text-center">Quantum Core</div>
                  <div className="text-xs text-gray-400 mt-1">John S. • 3m ago</div>
                </div>
              </div>
              
              <div className="relative flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 group hover:border-indigo-500/50 transition-colors duration-200">
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {t(`items.rarities.rare`, 'Rare')}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 mb-2 rounded-lg bg-blue-900/20 border border-blue-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div className="font-medium text-blue-200 text-center">Neural Processor</div>
                  <div className="text-xs text-gray-400 mt-1">Sarah K. • 12m ago</div>
                </div>
              </div>
              
              <div className="relative flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 group hover:border-indigo-500/50 transition-colors duration-200">
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">
                  {t(`items.rarities.legendary`, 'Legendary')}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 mb-2 rounded-lg bg-orange-900/20 border border-orange-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="font-medium text-orange-200 text-center">Fusion Core</div>
                  <div className="text-xs text-gray-400 mt-1">Mike T. • 27m ago</div>
                </div>
              </div>
              
              <div className="relative flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 group hover:border-indigo-500/50 transition-colors duration-200">
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-600 text-white text-xs rounded-full">
                  {t(`items.rarities.uncommon`, 'Uncommon')}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 mb-2 rounded-lg bg-yellow-900/20 border border-yellow-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="font-medium text-yellow-200 text-center">Defense Shield</div>
                  <div className="text-xs text-gray-400 mt-1">Alex W. • 42m ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render purchase animation and item reveal
  const renderPurchaseAnimation = () => {
    if (!purchaseAnimation || !newItem) return null;
    
    // Ensure we have the rarity in the correct format (uppercase) for the ITEM_RARITIES object
    const rarityKey = newItem.rarity?.toUpperCase?.() || 'COMMON';
    const rarityInfo = ITEM_RARITIES[rarityKey] || ITEM_RARITIES.COMMON;
    
    // Add debugging to help identify issues
    console.log('Purchase animation - Item:', newItem);
    console.log('Purchase animation - Rarity Key:', rarityKey);
    console.log('Purchase animation - Rarity Info:', rarityInfo);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border-2 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
             style={{ borderColor: rarityInfo.color }}>
          {/* Enhanced animated background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-0 left-0 w-60 h-60 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-pattern opacity-10"></div>
          </div>
          
          {/* Animated light rays emanating from center */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-30 animate-spin-slow" 
                 style={{ 
                   background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, ${rarityInfo.color} 20%, transparent 40%)`,
                 }}>
            </div>
          </div>
          
          {/* Rarity beam effect above item */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-transparent"
               style={{ background: `radial-gradient(ellipse at 50% 0%, ${rarityInfo.color}50 0%, transparent 70%)` }}>
          </div>
          
          <div className="relative z-10">
            {/* Congratulations header with animation */}
            <div className="text-center mb-6 animate-fade-in">
              <div className="text-xs font-bold uppercase tracking-wider mb-1 inline-block px-3 py-1 rounded-full" 
                   style={{ backgroundColor: `${rarityInfo.color}30`, color: rarityInfo.color, border: `1px solid ${rarityInfo.color}40` }}>
                {t(`items.rarities.${rarityInfo.name}`, rarityInfo.name)}
              </div>
              
              <h3 className="text-3xl font-bold relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{t('items.you_got', 'You Got!')}</span>
              </h3>
            </div>
            
            <div className="text-center relative z-10">
              {/* Item container with enhanced glow and animation effects */}
              <div className="relative mb-6 animate-float">
                {/* Glowing orbs circling the item */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="absolute w-4 h-4 rounded-full animate-orbit" style={{ backgroundColor: rarityInfo.color, opacity: 0.7, filter: 'blur(2px)' }}></div>
                  <div className="absolute w-3 h-3 rounded-full animate-orbit animation-delay-500" style={{ backgroundColor: rarityInfo.color, opacity: 0.5, filter: 'blur(2px)' }}></div>
                  <div className="absolute w-2 h-2 rounded-full animate-orbit animation-delay-1000" style={{ backgroundColor: rarityInfo.color, opacity: 0.3, filter: 'blur(1px)' }}></div>
                </div>
                
                <div 
                  className="mx-auto w-40 h-40 mb-2 p-4 rounded-full bg-gray-800 flex items-center justify-center relative transform transition-transform hover:scale-105 animate-reveal" 
                  style={{ 
                    boxShadow: `0 0 60px ${rarityInfo.color}50`,
                    border: `3px solid ${rarityInfo.color}` 
                  }}
                >
                  {/* Pulsing border effect */}
                  <div className="absolute inset-0 rounded-full pulse-border" style={{ 
                    border: `2px solid ${rarityInfo.color}`,
                    opacity: 0.5
                  }}></div>
                  
                  <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: newItem.svg }} />
                </div>
                
                {/* Particles around item - NEW */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: rarityInfo.color, opacity: 0.8 }}></div>
                  <div className="absolute top-2/3 right-1/4 w-1 h-1 rounded-full animate-ping animation-delay-500" style={{ backgroundColor: rarityInfo.color, opacity: 0.6 }}></div>
                  <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full animate-ping animation-delay-1000" style={{ backgroundColor: rarityInfo.color, opacity: 0.7 }}></div>
                </div>
              </div>
              
              <div className="mb-6 animate-fade-in animation-delay-300">
                <div className="text-2xl font-bold mb-1" style={{ color: rarityInfo.color }}>
                  {t(`items.names.${newItem.id}`, newItem.name)}
                </div>
                
                <div className="inline-block px-3 py-1 rounded-lg text-sm mb-2 bg-gray-800 text-gray-300">
                  {t(`items.types.${newItem.type}`, newItem.type)}
                </div>
                
                <div className="text-gray-400 mb-5 text-sm max-w-xs mx-auto">
                  {t(`items.descriptions.${newItem.id}`, newItem.description)}
                </div>
              </div>
              
              {/* Stats with enhanced visuals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-6 animate-fade-in animation-delay-600">
                {Object.entries(newItem.stats || {}).map(([stat, value], index) => (
                  value !== 0 ? (
                    <div 
                      key={stat} 
                      className={`py-3 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 animate-reveal`}
                      style={{ 
                        animationDelay: `${600 + (index * 150)}ms`,
                        backgroundColor: value > 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                        border: `1px solid ${value > 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                        color: value > 0 ? 'rgb(167, 243, 208)' : 'rgb(254, 202, 202)'
                      }}
                    >
                      <span className="text-xs uppercase opacity-70">{stat}</span>
                      <span className="text-xl font-bold">{value > 0 ? `+${value}` : value}</span>
                    </div>
                  ) : null
                ))}
              </div>
              
              <div className="flex flex-col items-center animate-fade-in animation-delay-900">
                {/* Confetti burst effect on button hover */}
                <button 
                  className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30 font-medium"
                  onClick={handleClosePurchase}
                >
                  <span className="relative z-10">{t('items.awesome', 'Awesome!')}</span>
                  
                  {/* Burst effect on hover */}
                  <span className="absolute inset-0 w-full h-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 scale-0 group-hover:scale-100 transition-transform duration-500 transform-origin-center">
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white opacity-20 rounded-full"></span>
                    </span>
                  </span>
                </button>
                
                <div className="mt-4 text-xs text-gray-500">
                  {t('items.auto_inventory', 'Item automatically added to your inventory')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-16 h-16" 
                 style={{ background: `linear-gradient(to bottom right, ${rarityInfo.color}50, ${rarityInfo.color}20)` }}>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the inventory tab
  const renderInventoryTab = () => {
    // No longer filter out equipped items
    const filteredItems = userItems;

    // Sort items by creation date, newest first
    const sortedItems = [...filteredItems].sort((a, b) => {
      // If createdAt dates are available, use them
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Fallback to instance ID if dates are not available
      return a.instanceId.localeCompare(b.instanceId);
    });

    if (sortedItems.length === 0) {
      return (
        <div className="bg-gray-800 text-gray-300 rounded-xl p-8 flex flex-col items-center text-center">
          <div className="mb-4 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {t('items.no_items_title', 'Your Inventory is Empty')}
          </h3>
          <p className="mb-6 max-w-md">
            {t('items.no_items', 'You don\'t have any items yet. Visit the shop to purchase some!')}
          </p>
          <button 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
            onClick={() => setActiveTab('shop')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            {t('items.go_to_shop', 'Go to Shop')}
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-gray-100 flex-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
            </svg>
            {t('items.your_items', 'Your Items')} 
            <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {sortedItems.length}
            </span>
            {userItems.some(item => isItemEquippedState[item.instanceId]) && (
              <span className="ml-2 text-xs text-gray-400">
                ({Object.values(isItemEquippedState).filter(Boolean).length} {t('items.equipped', 'equipped')})
              </span>
            )}
          </h3>
          
          <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 p-2">
            <span className="mr-2 text-gray-300 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {t('items.select_mascot', 'Select mascot:')}
            </span>
            <select 
              className="bg-gray-800 text-white rounded border border-gray-600 p-1.5 flex-grow transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedMascot ? selectedMascot.id : ''}
              onChange={(e) => {
                const mascot = userMascots.find(m => m.id === e.target.value);
                handleSelectMascot(mascot);
              }}
            >
              <option value="">{t('items.select_mascot_prompt', '-- Select a mascot --')}</option>
              {Array.isArray(userMascots) && sortMascots(userMascots).map(mascot => (
                <option key={mascot.id} value={mascot.id}>{mascot.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {sortedItems.map(item => {
            const rarityInfo = ITEM_RARITIES[item.rarity?.toUpperCase?.()] || ITEM_RARITIES.COMMON;
            
            return (
              <div 
                key={item.instanceId} 
                className="bg-gray-800 backdrop-blur-sm bg-opacity-70 border-2 rounded-xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{ 
                  borderColor: `${rarityInfo.color}50`
                }}
              >
                {/* Rarity indicator */}
                <div 
                  className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rotate-45 opacity-10"
                  style={{ backgroundColor: rarityInfo.color }}
                />
                
                <div 
                  className="w-full h-24 mb-3 flex items-center justify-center item-svg-container p-2 rounded-lg"
                  style={{ 
                    backgroundColor: `${rarityInfo.color}20`,
                    color: rarityInfo.color
                  }}
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />
                
                <div className="text-lg font-bold mb-1 truncate" style={{ color: rarityInfo.color }}>
                  {t(`items.names.${item.id}`, item.name)}
                </div>
                
                <div className="flex items-center mb-2">
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${rarityInfo.color}30`,
                      color: rarityInfo.color
                    }}
                  >
                    {t(`items.rarities.${rarityInfo.name}`, rarityInfo.name)}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {t(`items.types.${item.type}`, item.type)}
                  </span>
                </div>
                
                {/* Add created date display */}
                {item.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {t('items.acquired', 'Acquired')}: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2 mb-3 flex-grow">
                  {t(`items.descriptions.${item.id}`, item.description)}
                </p>
                
                <div className="flex flex-wrap gap-1.5 text-xs mb-3">
                  {Object.entries(item.stats || {}).map(([stat, value]) => (
                    value !== 0 ? (
                      <div 
                        key={stat} 
                        className={`px-2 py-1 rounded-lg flex items-center ${value > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                        title={`${stat.toUpperCase()}: ${value}`}
                      >
                        <span className="font-bold mr-1">{stat.substring(0, 2).toUpperCase()}</span>
                        <span>{value > 0 ? `+${value}` : value}</span>
                      </div>
                    ) : null
                  ))}
                </div>
                
                {/* Equipped status indicator */}
                {isItemEquippedState[item.instanceId] && (
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg px-3 py-1.5 mb-3 text-xs text-blue-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('items.currently_equipped', 'Currently Equipped')}
                  </div>
                )}
                
                {/* Conditional button: Equip or Unequip */}
                {isItemEquippedState[item.instanceId] ? (
                  <button
                    onClick={() => handleUnequipItem(item.instanceId)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm rounded transition-colors bg-red-700 hover:bg-red-800 text-white"
                  >
                    {t('items.unequip', 'Unequip')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquipItem(item.instanceId)}
                    disabled={isLoading || !selectedMascot}
                    className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                      selectedMascot 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedMascot
                      ? t('items.equip_to_mascot', 'Equip to {{name}}', { name: selectedMascot.name })
                      : t('items.select_mascot_to_equip', 'Select a mascot to equip')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render the equipped items tab
  const renderEquippedTab = () => {
    if (!selectedMascot) {
      return (
        <div className="p-4 bg-gray-800 text-gray-300 rounded">
          {t('items.select_mascot_first', 'Please select a mascot to view equipped items.')}
        </div>
      );
    }
    
    if (equippedItems.length === 0) {
      return (
        <div className="p-4 bg-gray-800 text-gray-300 rounded">
          {t('items.no_equipped_items', 'This mascot doesn\'t have any items equipped. Go to your inventory to equip some!')}
        </div>
      );
    }
    
    const statDifferences = {};
    
    // Calculate stat differences between base and total stats
    if (mascotStats && mascotTotalStats) {
      Object.keys(mascotStats).forEach(stat => {
        statDifferences[stat] = mascotTotalStats[stat] - mascotStats[stat];
      });
    }
    
    return (
      <div>
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold text-gray-100 flex-1">
            {selectedMascot.name}'s {t('items.equipped_items', 'Equipped Items')} ({equippedItems.length}/3)
          </h3>
          
          <div className="flex items-center">
            <span className="mr-2 text-gray-300">
              {t('items.select_mascot', 'Select mascot:')}
            </span>
            <select 
              className="bg-gray-800 text-white rounded border border-gray-700 p-1"
              value={selectedMascot ? selectedMascot.id : ''}
              onChange={(e) => {
                const mascot = userMascots.find(m => m.id === e.target.value);
                handleSelectMascot(mascot);
              }}
            >
              <option value="">{t('items.select_mascot_prompt', '-- Select a mascot --')}</option>
              {Array.isArray(userMascots) && sortMascots(userMascots).map(mascot => (
                <option key={mascot.id} value={mascot.id}>{mascot.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Mascot stats display */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-lg font-bold mb-2 text-gray-100">
            {t('items.mascot_stats', 'Mascot Stats')}
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {mascotStats && mascotTotalStats && (
              <>
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">{t('items.stats.hp', 'HP')}</div>
                  <div className="text-lg font-bold text-gray-100">
                    {mascotTotalStats.hp}
                    {statDifferences.hp > 0 && (
                      <span className="text-green-400 text-xs ml-1">(+{statDifferences.hp})</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">{t('items.stats.mp', 'MP')}</div>
                  <div className="text-lg font-bold text-gray-100">
                    {mascotTotalStats.mp}
                    {statDifferences.mp > 0 && (
                      <span className="text-green-400 text-xs ml-1">(+{statDifferences.mp})</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">{t('items.stats.power', 'Power')}</div>
                  <div className="text-lg font-bold text-gray-100">
                    {mascotTotalStats.power}
                    {statDifferences.power > 0 && (
                      <span className="text-green-400 text-xs ml-1">(+{statDifferences.power})</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">{t('items.stats.defense', 'Defense')}</div>
                  <div className="text-lg font-bold text-gray-100">
                    {mascotTotalStats.defense}
                    {statDifferences.defense > 0 && (
                      <span className="text-green-400 text-xs ml-1">(+{statDifferences.defense})</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">{t('items.stats.agility', 'Agility')}</div>
                  <div className="text-lg font-bold text-gray-100">
                    {mascotTotalStats.agility}
                    {statDifferences.agility > 0 && (
                      <span className="text-green-400 text-xs ml-1">(+{statDifferences.agility})</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Equipped items list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Sort equipped items by creation date, newest first */}
          {[...equippedItems]
            .sort((a, b) => {
              // If createdAt dates are available, use them
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              // Fallback to instance ID if dates are not available
              return a.instanceId.localeCompare(b.instanceId);
            })
            .map(item => {
              const rarityInfo = ITEM_RARITIES[item.rarity?.toUpperCase?.()] || ITEM_RARITIES.COMMON;
              
              return (
                <div 
                  key={item.instanceId} 
                  className="bg-gray-800 backdrop-blur-sm bg-opacity-70 border-2 rounded-xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{ 
                    borderColor: `${rarityInfo.color}50`
                  }}
                >
                  {/* Rarity indicator */}
                  <div 
                    className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rotate-45 opacity-10"
                    style={{ backgroundColor: rarityInfo.color }}
                  />
                  
                  <div 
                    className="w-full h-24 mb-3 flex items-center justify-center item-svg-container p-2 rounded-lg"
                    style={{ 
                      backgroundColor: `${rarityInfo.color}20`,
                      color: rarityInfo.color
                    }}
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                  
                  <div className="text-lg font-bold mb-1 truncate" style={{ color: rarityInfo.color }}>
                    {t(`items.names.${item.id}`, item.name)}
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${rarityInfo.color}30`,
                        color: rarityInfo.color
                      }}
                    >
                      {t(`items.rarities.${rarityInfo.name}`, rarityInfo.name)}
                    </span>
                  </div>
                  
                  {/* Add created date display */}
                  {item.createdAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      {t('items.acquired', 'Acquired')}: {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mb-3 flex-grow">
                    {t(`items.descriptions.${item.id}`, item.description)}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 text-xs mb-3">
                    {Object.entries(item.stats || {}).map(([stat, value]) => (
                      value !== 0 ? (
                        <div 
                          key={stat} 
                          className={`px-2 py-1 rounded-lg flex items-center ${value > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                          title={`${stat.toUpperCase()}: ${value}`}
                        >
                          <span className="font-bold mr-1">{stat.substring(0, 2).toUpperCase()}</span>
                          <span>{value > 0 ? `+${value}` : value}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                  
                  <button 
                    className="w-full px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={() => handleUnequipItem(item.instanceId)}
                    disabled={isLoading}
                  >
                    {t('items.unequip', 'Unequip')}
                  </button>
                </div>
              );
            })}
          
          {/* Add placeholders for remaining item slots */}
          {Array.from({ length: 3 - equippedItems.length }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-3 flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-gray-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-gray-500 text-center">
                {t('items.empty_slot', 'Empty slot')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return renderInventoryTab();
      case 'shop':
        return renderShopTab();
      case 'equipped':
        return renderEquippedTab();
      default:
        return renderInventoryTab();
    }
  };

  // Check which items are equipped
  useEffect(() => {
    const checkEquippedItems = async () => {
      if (isSignedIn && user && userItems.length > 0) {
        const userId = user.id;
        const equippedState = {};
        
        // Check each item
        for (const item of userItems) {
          equippedState[item.instanceId] = await ItemService.isItemEquipped(userId, item.instanceId);
        }
        
        setIsItemEquippedState(equippedState);
      }
    };
    
    checkEquippedItems();
  }, [isSignedIn, user, userItems]);

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-6 w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg h-40"></div>
          ))}
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      {renderTabs()}
      {renderNotification()}
      {renderTabContent()}
      {renderPurchaseAnimation()}
    </div>
  );
};

export default ItemsPage; 