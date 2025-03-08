import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import MascotService, { MASCOT_UPDATED_EVENT } from './MascotService';
import ItemService, { ITEM_UPDATED_EVENT, ITEM_RARITIES } from '../items/ItemService';

const MascotProfile = ({ mascot: propMascot = null, small = false }) => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [activeMascot, setActiveMascot] = useState(propMascot);
  const [equippedItems, setEquippedItems] = useState([]);
  const [totalStats, setTotalStats] = useState(null);

  // Load active mascot if not provided via props
  useEffect(() => {
    if (isSignedIn && user && !propMascot) {
      const mascot = MascotService.getUserActiveMascot(user.id);
      setActiveMascot(mascot);
      
      if (mascot) {
        // Initialize total stats with mascot's base stats
        setTotalStats({ ...mascot.stats });
      }
    } else if (propMascot) {
      // If mascot is provided via props, use it
      setActiveMascot(propMascot);
      setTotalStats({ ...propMascot.stats });
    }
  }, [isSignedIn, user, propMascot]);

  // Listen for mascot updates
  useEffect(() => {
    const handleMascotUpdate = (event) => {
      if (isSignedIn && user && event.detail.userId === user.id && !propMascot) {
        const updatedMascot = MascotService.getUserActiveMascot(user.id);
        setActiveMascot(updatedMascot);
        
        if (updatedMascot) {
          setTotalStats({ ...updatedMascot.stats });
        }
      }
    };
    
    document.addEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    
    return () => {
      document.removeEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    };
  }, [isSignedIn, user, propMascot]);

  // Load equipped items when component mounts or mascot changes
  useEffect(() => {
    if (isSignedIn && user && activeMascot) {
      const userId = user.id;
      const mascotId = activeMascot.id;
      
      // Get items equipped to the mascot
      const items = ItemService.getMascotItems(userId, mascotId);
      setEquippedItems(items);
      
      // Calculate total stats with equipped items
      const enhancedStats = ItemService.calculateTotalMascotStats(activeMascot, items);
      setTotalStats(enhancedStats);
    }
  }, [isSignedIn, user, activeMascot]);
  
  // Update equipped items when items change
  useEffect(() => {
    const handleItemUpdate = (event) => {
      if (isSignedIn && user && activeMascot) {
        const userId = user.id;
        const mascotId = activeMascot.id;
        
        // If this mascot's items were updated
        if (event.detail.mascotId === mascotId) {
          // Get updated items
          const items = ItemService.getMascotItems(userId, mascotId);
          setEquippedItems(items);
          
          // Recalculate total stats
          const enhancedStats = ItemService.calculateTotalMascotStats(activeMascot, items);
          setTotalStats(enhancedStats);
        }
      }
    };
    
    document.addEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    
    return () => {
      document.removeEventListener(ITEM_UPDATED_EVENT, handleItemUpdate);
    };
  }, [isSignedIn, user, activeMascot]);

  if (!isSignedIn || !activeMascot || !totalStats) {
    return null;
  }

  // Calculate stat differences (bonuses from items)
  const calculateStatDifferences = () => {
    if (!activeMascot || !totalStats) return {};
    
    const differences = {};
    
    Object.keys(activeMascot.stats).forEach(stat => {
      differences[stat] = totalStats[stat] - activeMascot.stats[stat];
    });
    
    return differences;
  };
  
  const statDifferences = calculateStatDifferences();
  
  // Define stat icons
  const statIcons = {
    hp: '❤️',
    mp: '🔷',
    agility: '⚡',
    power: '💪',
    defense: '🛡️'
  };
  
  // Render small version for compact display
  if (small) {
    return (
      <div className="mb-2 rounded-lg bg-opacity-20 bg-gray-700 flex items-center">
        <div 
          className="w-8 h-8 flex-shrink-0 bg-gray-800 rounded-full flex items-center justify-center p-1 mr-2"
          dangerouslySetInnerHTML={{ __html: activeMascot.svg }}
        />
        <div>
          <div className="font-medium text-sm text-gray-300">
            {t(`mascots.names.${activeMascot.id}`, activeMascot.name)}
          </div>
          <div className="text-xs text-gray-400">
            {t('mascot.level', 'Level')} {activeMascot.level} 
            <span className="ml-1 text-purple-400">
              ({t('mascot.stats.hp', 'HP')}: {totalStats.hp} / {t('mascot.stats.mp', 'MP')}: {totalStats.mp})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render full profile
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center mb-4">
        <div 
          className="w-20 h-20 mr-4 p-2 bg-gray-900 rounded-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: activeMascot.svg }}
        />
        <div>
          <h2 className="text-xl font-bold text-gray-100">{t(`mascots.names.${activeMascot.id}`, activeMascot.name)}</h2>
          <div className="text-sm text-gray-400 capitalize">{activeMascot.rarity} Class</div>
          {activeMascot.level && (
            <div className="text-sm text-green-400 mt-1">
              Level {activeMascot.level} • {activeMascot.experience % 100}% XP
            </div>
          )}
          {equippedItems.length > 0 && (
            <div className="text-sm text-blue-400 mt-1">
              {equippedItems.length} {equippedItems.length === 1 ? 'item' : 'items'} equipped
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{activeMascot.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900 rounded p-3">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Base Stats</h3>
          {Object.entries(activeMascot.stats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm capitalize">
                {statIcons[stat]} {stat}
              </span>
              <span className="text-gray-200 text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-900 rounded p-3">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Total Stats</h3>
          {Object.entries(totalStats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm capitalize">
                {statIcons[stat]} {stat}
              </span>
              <span className="text-gray-200 text-sm font-medium">
                {value}
                {statDifferences[stat] > 0 && (
                  <span className="text-green-400 text-xs ml-1">(+{statDifferences[stat]})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {equippedItems.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Equipped Items</h3>
          <div className="grid grid-cols-1 gap-2">
            {equippedItems.map(item => {
              const rarityInfo = ITEM_RARITIES[item.rarity];
              return (
                <div 
                  key={item.instanceId} 
                  className="bg-gray-900 p-2 rounded flex items-center"
                  style={{ borderLeft: `4px solid ${rarityInfo.color}` }}
                >
                  <div 
                    className="w-10 h-10 mr-3 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: rarityInfo.color }}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {rarityInfo.name} {item.type}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(item.stats).map(([stat, value]) => (
                      value !== 0 ? (
                        <div 
                          key={stat} 
                          className={`text-xs px-1.5 py-0.5 rounded-sm ${value > 0 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                        >
                          {stat.substring(0, 2).toUpperCase()} {value > 0 ? `+${value}` : value}
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded p-3 mb-4 text-center">
          <p className="text-gray-400 text-sm">
            This mascot doesn't have any items equipped.
          </p>
          <Link to="/items" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
            {t('items.equip_items', 'Equip Items')} →
          </Link>
        </div>
      )}
      
      <div className="flex justify-end">
        <Link to="/items" className="text-blue-400 hover:underline text-sm">
          {t('items.manage_items', 'Manage Items')} →
        </Link>
      </div>
    </div>
  );
};

export default MascotProfile; 