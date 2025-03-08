import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ItemService, { ITEM_RARITIES, ITEM_UPDATED_EVENT } from '../items/ItemService';

const StatBar = ({ label, value, maxValue = 100, color, bonus = 0 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="mb-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-medium text-gray-300">
          {value}
          {bonus > 0 && <span className="text-green-400 text-xs ml-1">(+{bonus})</span>}
          <span className="text-gray-500">/{maxValue}</span>
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const MascotDisplay = ({ mascot, isOwned = false, isActive = false, onPurchase, onActivate, showStats = true }) => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [equippedItems, setEquippedItems] = useState([]);
  const [totalStats, setTotalStats] = useState(mascot ? { ...mascot.stats } : null);
  
  // Log mascot data for debugging - remove this in production
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('MascotDisplay - mascot data:', mascot);
    // eslint-disable-next-line no-console
    console.log('MascotDisplay - props:', { isOwned, isActive });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascot]); // Only depend on mascot to avoid too many rerenders
  
  // Load equipped items when component mounts
  useEffect(() => {
    const loadEquippedItems = async () => {
      if (isSignedIn && user && mascot && isOwned) {
        const userId = user.id;
        const mascotId = mascot.id;
        
        try {
          // Get items equipped to the mascot - AWAIT THE PROMISE
          const items = await ItemService.getMascotItems(userId, mascotId);
          
          // Make sure items is an array before setting state
          if (Array.isArray(items)) {
            setEquippedItems(items);
          } else {
            // eslint-disable-next-line no-console
            console.error('Expected items to be an array but got:', items);
            setEquippedItems([]);
          }
          
          // Calculate total stats with equipped items (ensuring items is an array)
          const itemsToUse = Array.isArray(items) ? items : [];
          const enhancedStats = ItemService.calculateTotalMascotStats(mascot, itemsToUse);
          setTotalStats(enhancedStats);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error loading equipped items:', error);
          setEquippedItems([]);
        }
      }
    };
    
    loadEquippedItems();
  }, [isSignedIn, user, mascot, isOwned]);
  
  // Update equipped items when items change
  useEffect(() => {
    const handleItemUpdate = (event) => {
      if (isSignedIn && user && mascot && isOwned) {
        const userId = user.id;
        const mascotId = mascot.id;
        
        // If this mascot's items were updated
        if (event.detail.mascotId === mascotId) {
          const updateEquippedItems = async () => {
            try {
              // Get updated items - AWAIT THE PROMISE
              const items = await ItemService.getMascotItems(userId, mascotId);
              
              // Make sure items is an array
              if (Array.isArray(items)) {
                setEquippedItems(items);
              } else {
                // eslint-disable-next-line no-console
                console.error('Expected updated items to be an array but got:', items);
                setEquippedItems([]);
              }
              
              // Recalculate total stats (ensuring items is an array)
              const itemsToUse = Array.isArray(items) ? items : [];
              const enhancedStats = ItemService.calculateTotalMascotStats(mascot, itemsToUse);
              setTotalStats(enhancedStats);
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error updating equipped items:', error);
              setEquippedItems([]);
            }
          };
          
          updateEquippedItems();
        }
      }
    };
    
    document.addEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    
    return () => {
      document.removeEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    };
  }, [isSignedIn, user, mascot, isOwned]);
  
  // Validation check - MOVED AFTER ALL HOOKS
  if (!mascot) {
    // eslint-disable-next-line no-console
    console.error('MascotDisplay: Mascot prop is null or undefined');
    return (
      <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
        <p className="text-red-400">Error: Invalid mascot data</p>
      </div>
    );
  }
  
  // Define colors for different stats
  const statColors = {
    hp: 'bg-red-500',
    mp: 'bg-blue-500',
    agility: 'bg-green-500',
    power: 'bg-yellow-500',
    defense: 'bg-purple-500'
  };
  
  // Define color class based on rarity
  const rarityColorClass = {
    common: 'border-blue-400 bg-blue-900/20',
    rare: 'border-purple-400 bg-purple-900/20',
    epic: 'border-yellow-400 bg-yellow-900/20',
    legendary: 'border-red-400 bg-red-900/20'
  }[mascot.rarity] || 'border-gray-400 bg-gray-900/20';
  
  // Calculate stat bonuses from equipped items
  const calculateBonuses = () => {
    if (!mascot || !totalStats) return {};
    
    const bonuses = {};
    
    // For each stat, calculate the difference between totalStats and mascot.stats
    Object.keys(mascot.stats).forEach(statKey => {
      bonuses[statKey] = totalStats[statKey] - mascot.stats[statKey];
    });
    
    return bonuses;
  };
  
  const statBonuses = calculateBonuses();
  
  return (
    <div className={`rounded-lg ${rarityColorClass} border-2 overflow-hidden shadow-lg transition-all duration-300 ${isActive ? 'ring-4 ring-green-500' : ''} hover:shadow-xl`}>
      <div className="p-4">
        <div className="text-center mb-4 relative">
          {/* Mascot image */}
          <div
            className="w-24 h-24 mx-auto mb-2 p-2 bg-gray-800 rounded-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: mascot.svg }}
          />
          
          {/* Equipped items indicators */}
          {Array.isArray(equippedItems) && equippedItems.length > 0 && (
            <div className="absolute top-0 right-0 flex space-x-1">
              {equippedItems.map((item, index) => {
                if (!item) return null; // Skip undefined/null items
                const rarityInfo = ITEM_RARITIES[item.rarity] || ITEM_RARITIES.COMMON;
                return (
                  <div 
                    key={item.instanceId || index} 
                    className="w-5 h-5 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: rarityInfo.color }}
                    title={item.name}
                  >
                    <span className="text-xs text-white font-bold">{index + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-100">{t(`mascots.names.${mascot.id}`, mascot.name)}</h3>
          <div className="text-xs text-gray-400 capitalize mb-1">{mascot.rarity} Class</div>
          <p className="text-sm text-gray-300">{t(`mascots.descriptions.${mascot.id}`, mascot.description)}</p>
        </div>
        
        {showStats && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">
              {t('mascots.stats', 'Mascot Stats')}
              {Array.isArray(equippedItems) && equippedItems.length > 0 && (
                <span className="text-xs font-normal text-gray-400 ml-2">
                  ({equippedItems.length} {t('items.equipped', 'items equipped')})
                </span>
              )}
            </h4>
            
            <StatBar 
              label="HP" 
              value={totalStats.hp} 
              maxValue={100} 
              color={statColors.hp}
              bonus={statBonuses.hp} 
            />
            <StatBar 
              label="MP" 
              value={totalStats.mp} 
              maxValue={100} 
              color={statColors.mp}
              bonus={statBonuses.mp} 
            />
            <StatBar 
              label="AGI" 
              value={totalStats.agility} 
              maxValue={10} 
              color={statColors.agility}
              bonus={statBonuses.agility} 
            />
            <StatBar 
              label="PWR" 
              value={totalStats.power} 
              maxValue={10} 
              color={statColors.power}
              bonus={statBonuses.power} 
            />
            <StatBar 
              label="DEF" 
              value={totalStats.defense} 
              maxValue={10} 
              color={statColors.defense}
              bonus={statBonuses.defense} 
            />
          </div>
        )}
        
        {equippedItems.length > 0 && isOwned && (
          <div className="mt-3 mb-2">
            <h4 className="text-xs font-medium text-gray-400 mb-1">
              {t('items.equipped_items', 'Equipped Items')}:
            </h4>
            <div className="flex flex-wrap gap-1">
              {equippedItems.map(item => {
                const rarityInfo = ITEM_RARITIES[item.rarity];
                return (
                  <div 
                    key={item.instanceId} 
                    className="text-xs px-2 py-0.5 rounded" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${rarityInfo.color}`, color: rarityInfo.color }}
                    title={`${item.name}: ${item.description}`}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {isOwned ? (
          <div className="flex justify-between items-center mt-4">
            {isActive ? (
              <span className="px-3 py-1 bg-green-900 text-green-100 text-xs rounded-full">
                {t('mascots.active', 'Active')}
              </span>
            ) : (
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                onClick={() => onActivate && onActivate(mascot.id)}
              >
                {t('mascots.activate', 'Activate')}
              </button>
            )}
            <Link 
              to="/items" 
              className="text-blue-400 text-xs hover:underline"
            >
              {t('items.manage_items', 'Manage Items')} →
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <button
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log('Purchase button clicked for mascot:', mascot.id);
                if (onPurchase) {
                  onPurchase(mascot.id);
                } else {
                  // eslint-disable-next-line no-console
                  console.error('onPurchase handler is not defined');
                }
              }}
            >
              {t('mascots.purchase', 'Purchase')} ({mascot.price} {t('points', 'Points')})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MascotDisplay; 