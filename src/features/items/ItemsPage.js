import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import ItemService, { ITEM_UPDATED_EVENT, ITEM_RARITIES } from './ItemService';
import MascotService from '../mascots/MascotService';
import PointsService, { POINTS_UPDATED_EVENT } from '../rewards/PointsService';

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

  // Load user's items and mascots
  useEffect(() => {
    if (isSignedIn && user) {
      const userId = user.id;
      
      // Get user's items
      const items = ItemService.getUserItems(userId);
      setUserItems(items);
      
      // Get user's mascots
      const mascots = MascotService.getUserMascots(userId);
      setUserMascots(mascots);
      
      // Get user's active mascot
      const activeMascot = MascotService.getUserActiveMascot(userId);
      if (activeMascot) {
        setSelectedMascot(activeMascot);
        
        // Get items equipped to the active mascot
        const mascotItems = ItemService.getMascotItems(userId, activeMascot.id);
        setEquippedItems(mascotItems);
        
        // Calculate base and total stats
        setMascotStats(activeMascot.stats);
        setMascotTotalStats(ItemService.calculateTotalMascotStats(activeMascot, mascotItems));
      }
      
      // Get user's points
      const userData = PointsService.getUserPoints(userId);
      setUserPoints(userData.points);
      
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  // Listen for item updates
  useEffect(() => {
    const handleItemUpdate = (event) => {
      if (isSignedIn && user) {
        const userId = user.id;
        
        // Update user's items
        const items = ItemService.getUserItems(userId);
        setUserItems(items);
        
        // Update equipped items if the selected mascot is affected
        if (selectedMascot && event.detail.mascotId === selectedMascot.id) {
          const mascotItems = ItemService.getMascotItems(userId, selectedMascot.id);
          setEquippedItems(mascotItems);
          setMascotTotalStats(ItemService.calculateTotalMascotStats(selectedMascot, mascotItems));
        }
      }
    };
    
    // Listen for points updates
    const handlePointsUpdate = (event) => {
      if (isSignedIn && user) {
        const userData = PointsService.getUserPoints(user.id);
        setUserPoints(userData.points);
      }
    };
    
    document.addEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    
    return () => {
      document.removeEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
      document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    };
  }, [isSignedIn, user, selectedMascot]);

  // Handle mascot selection
  const handleSelectMascot = (mascot) => {
    setSelectedMascot(mascot);
    
    if (isSignedIn && user && mascot) {
      const mascotItems = ItemService.getMascotItems(user.id, mascot.id);
      setEquippedItems(mascotItems);
      setMascotStats(mascot.stats);
      setMascotTotalStats(ItemService.calculateTotalMascotStats(mascot, mascotItems));
    } else {
      setEquippedItems([]);
      setMascotStats(null);
      setMascotTotalStats(null);
    }
  };

  // Handle item purchase
  const handlePurchaseItem = () => {
    if (isSignedIn && user) {
      const userId = user.id;
      
      // Purchase random item
      const result = ItemService.purchaseRandomItem(userId);
      
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
    }
  };

  // Handle closing the purchase animation/reveal
  const handleClosePurchase = () => {
    setPurchaseAnimation(false);
    setNewItem(null);
    
    // Update items list
    if (isSignedIn && user) {
      const items = ItemService.getUserItems(user.id);
      setUserItems(items);
    }
  };

  // Handle equipping an item to the selected mascot
  const handleEquipItem = (itemInstanceId) => {
    if (isSignedIn && user && selectedMascot) {
      const userId = user.id;
      const mascotId = selectedMascot.id;
      
      // Equip item
      const result = ItemService.equipItemToMascot(userId, mascotId, itemInstanceId);
      
      if (result.success) {
        // Show notification
        setNotification({
          type: 'success',
          message: result.message
        });
        
        // Update equipped items
        const mascotItems = ItemService.getMascotItems(userId, mascotId);
        setEquippedItems(mascotItems);
        
        // Update total stats
        setMascotTotalStats(ItemService.calculateTotalMascotStats(selectedMascot, mascotItems));
        
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
    } else {
      // Show error notification if no mascot selected
      setNotification({
        type: 'error',
        message: 'Please select a mascot first'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Handle unequipping an item from the selected mascot
  const handleUnequipItem = (itemInstanceId) => {
    if (isSignedIn && user && selectedMascot) {
      const userId = user.id;
      const mascotId = selectedMascot.id;
      
      // Unequip item
      const result = ItemService.unequipItemFromMascot(userId, mascotId, itemInstanceId);
      
      if (result.success) {
        // Show notification
        setNotification({
          type: 'success',
          message: result.message
        });
        
        // Update equipped items
        const mascotItems = ItemService.getMascotItems(userId, mascotId);
        setEquippedItems(mascotItems);
        
        // Update total stats
        setMascotTotalStats(ItemService.calculateTotalMascotStats(selectedMascot, mascotItems));
        
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

  // Render the item shop tab
  const renderShopTab = () => (
    <div className="mb-4">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          {/* Shop header and points display */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">
              {t('items.mystery_item', 'Robot Parts Shop')}
            </h3>
            <p className="text-gray-300">
              {t('items.shop_description', 'Unlock powerful robot parts to enhance your mascots and dominate the arena!')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(ITEM_RARITIES).map(([key, rarity]) => (
                <div 
                  key={key} 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: `${rarity.color}20`, color: rarity.color, border: `1px solid ${rarity.color}40` }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rarity.color }}></span>
                  <span>{t(`items.rarities.${rarity.name}`, rarity.name)}</span>
                  <span className="opacity-70">{rarity.weight}%</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Points and purchase button */}
          <div className="w-full md:w-auto flex flex-col items-center">
            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-4 mb-4 w-full md:w-auto">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">{t('items.your_balance', 'YOUR BALANCE')}</div>
                <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {userPoints}
                </div>
              </div>
            </div>
            
            <button 
              onClick={handlePurchaseItem}
              disabled={userPoints < 50}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                userPoints >= 50 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-indigo-500/30' 
                  : 'bg-gray-700 cursor-not-allowed opacity-70'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
                {t('items.purchase_mystery_item', 'Unlock Mystery Item')} (50 {t('points', 'Points')})
              </div>
            </button>
          </div>
        </div>
        
        {/* Mystery crate section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 bg-opacity-70 rounded-xl p-5 border border-gray-700">
            <h4 className="text-lg font-semibold text-gray-100 mb-3">
              {t('items.what_you_get', 'What You Might Get')}
            </h4>
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{t('items.type_head_armor', 'Head Armor')}</div>
                  <div className="text-xs text-gray-400">{t('items.increases_defense', 'Increases defense stats')}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{t('items.type_power_core', 'Power Core')}</div>
                  <div className="text-xs text-gray-400">{t('items.increases_energy', 'Boosts energy and attack power')}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{t('items.type_cpu', 'CPU')}</div>
                  <div className="text-xs text-gray-400">{t('items.increases_logic', 'Enhances logical capabilities')}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-70 rounded-xl p-5 border border-gray-700">
            <h4 className="text-lg font-semibold text-gray-100 mb-3">
              {t('items.why_unlock', 'Why Unlock Items?')}
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('items.benefit_stronger', 'Make your mascots stronger in battles')}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('items.benefit_rare', 'Collect rare and legendary pieces for your collection')}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('items.benefit_customize', 'Customize and build unique mascot loadouts')}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{t('items.benefit_achieve', 'Complete achievements and collections')}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {userPoints < 50 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-900/30 to-yellow-700/20 border border-yellow-600/30 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-400">{t('items.need_more_points', 'Need more points?')}</h4>
              <p className="text-sm text-gray-300">{t('items.earn_points_message', 'Complete activities and tasks to earn more points and unlock exciting items for your collection!')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render purchase animation and item reveal
  const renderPurchaseAnimation = () => {
    if (!purchaseAnimation || !newItem) return null;
    
    const rarityInfo = ITEM_RARITIES[newItem.rarity];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
             style={{ borderColor: rarityInfo.color }}>
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 filter blur-xl animate-pulse"></div>
          </div>
          
          {/* Rarity beam effect above item */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-transparent"
               style={{ background: `radial-gradient(ellipse at 50% 0%, ${rarityInfo.color}30 0%, transparent 70%)` }}>
          </div>
          
          <h3 className="text-3xl font-bold text-center mb-6 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{t('items.you_got', 'You Got!')}</span>
          </h3>
          
          <div className="text-center relative z-10">
            {/* Item container with glow effect */}
            <div className="relative mb-6 transition-all duration-500 animate-float">
              <div 
                className="mx-auto w-40 h-40 mb-2 p-4 rounded-full bg-gray-800 flex items-center justify-center relative transform transition-transform hover:scale-105" 
                style={{ 
                  boxShadow: `0 0 40px ${rarityInfo.color}40`,
                  border: `2px solid ${rarityInfo.color}` 
                }}
              >
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: newItem.svg }} />
              </div>
              
              {/* Rarity indicator */}
              <div 
                className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                style={{ backgroundColor: rarityInfo.color, color: '#111' }}
              >
                {t(`items.rarities.${rarityInfo.name}`, rarityInfo.name)}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-2xl font-bold mb-1" style={{ color: rarityInfo.color }}>
                {t(`items.names.${newItem.id}`, newItem.name)}
              </div>
              
              <div className="inline-block px-3 py-1 rounded-lg text-sm mb-2 bg-gray-800 text-gray-300">
                {t(`items.types.${newItem.type}`, newItem.type)}
              </div>
              
              <div className="text-gray-400 mb-5 text-sm">
                {t(`items.descriptions.${newItem.id}`, newItem.description)}
              </div>
            </div>
            
            {/* Stats with improved visuals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-6">
              {Object.entries(newItem.stats).map(([stat, value]) => (
                value !== 0 ? (
                  <div 
                    key={stat} 
                    className={`py-2 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 ${
                      value > 0 ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
                    }`}
                  >
                    <span className="text-xs uppercase opacity-70">{stat}</span>
                    <span className="text-lg font-bold">{value > 0 ? `+${value}` : value}</span>
                  </div>
                ) : null
              ))}
            </div>
            
            <div className="flex flex-col items-center">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30 font-medium"
                onClick={handleClosePurchase}
              >
                {t('items.awesome', 'Awesome!')}
              </button>
              
              <div className="mt-4 text-xs text-gray-500">
                {t('items.auto_inventory', 'Item automatically added to your inventory')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the inventory tab
  const renderInventoryTab = () => {
    if (userItems.length === 0) {
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
              {userItems.length}
            </span>
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
              {userMascots.map(mascot => (
                <option key={mascot.id} value={mascot.id}>{mascot.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {userItems.map(item => {
            const rarityInfo = ITEM_RARITIES[item.rarity];
            const isEquipped = equippedItems.some(eqItem => eqItem.instanceId === item.instanceId);
            
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
                
                {/* Equipped badge */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('items.equipped', 'Equipped')}
                  </div>
                )}
                
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
                
                <div className="text-xs text-gray-300 mb-3 flex-grow">
                  {t(`items.descriptions.${item.id}`, item.description)}
                </div>
                
                <div className="flex flex-wrap gap-1.5 text-xs mb-3">
                  {Object.entries(item.stats).map(([stat, value]) => (
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
                
                {isEquipped ? (
                  <button 
                    className="w-full px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={() => handleUnequipItem(item.instanceId)}
                  >
                    {t('items.unequip', 'Unequip')}
                  </button>
                ) : (
                  <button 
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleEquipItem(item.instanceId)}
                    disabled={!selectedMascot}
                  >
                    {t('items.equip', 'Equip')}
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
              {userMascots.map(mascot => (
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
                  <div className="text-gray-300 text-xs mb-1">HP</div>
                  <div className="text-lg font-bold text-white">
                    {mascotTotalStats.hp}
                    {statDifferences.hp > 0 && (
                      <span className="text-xs text-green-400 ml-1">+{statDifferences.hp}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-gray-300 text-xs mb-1">MP</div>
                  <div className="text-lg font-bold text-white">
                    {mascotTotalStats.mp}
                    {statDifferences.mp > 0 && (
                      <span className="text-xs text-green-400 ml-1">+{statDifferences.mp}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-gray-300 text-xs mb-1">AGI</div>
                  <div className="text-lg font-bold text-white">
                    {mascotTotalStats.agility}
                    {statDifferences.agility > 0 && (
                      <span className="text-xs text-green-400 ml-1">+{statDifferences.agility}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-gray-300 text-xs mb-1">PWR</div>
                  <div className="text-lg font-bold text-white">
                    {mascotTotalStats.power}
                    {statDifferences.power > 0 && (
                      <span className="text-xs text-green-400 ml-1">+{statDifferences.power}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded text-center">
                  <div className="text-gray-300 text-xs mb-1">DEF</div>
                  <div className="text-lg font-bold text-white">
                    {mascotTotalStats.defense}
                    {statDifferences.defense > 0 && (
                      <span className="text-xs text-green-400 ml-1">+{statDifferences.defense}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Equipped items list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {equippedItems.map(item => {
            const rarityInfo = ITEM_RARITIES[item.rarity];
            
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
                
                <div className="text-lg font-bold mb-1" style={{ color: rarityInfo.color }}>
                  {t(`items.names.${item.id}`, item.name)}
                </div>
                
                <div className="text-xs text-gray-400 mb-1">
                  {t(`items.rarities.${rarityInfo.name}`, rarityInfo.name)} {t(`items.types.${item.type}`, item.type)}
                </div>
                
                <div className="text-xs text-gray-300 mb-2 flex-grow">
                  {t(`items.descriptions.${item.id}`, item.description)}
                </div>
                
                <div className="flex flex-wrap gap-1.5 text-xs mb-3">
                  {Object.entries(item.stats).map(([stat, value]) => (
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

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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