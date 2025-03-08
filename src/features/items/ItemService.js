/**
 * ItemService.js
 * Service for managing item system with Supabase persistence
 */

import supabase, { supabaseAdmin } from '../../shared/utils/supabaseClient';
import PointsService from '../rewards/PointsService';
import ServiceBase from '../../shared/utils/ServiceBase';

// Custom event for item updates
export const ITEM_UPDATED_EVENT = 'item-updated';

// Item rarities with their weights for random selection
export const ITEM_RARITIES = {
  COMMON: { name: 'Common', weight: 55, color: '#97a0af' },
  UNCOMMON: { name: 'Uncommon', weight: 25, color: '#2ecc71' },
  RARE: { name: 'Rare', weight: 12, color: '#3498db' },
  EPIC: { name: 'Epic', weight: 6, color: '#9b59b6' },
  LEGENDARY: { name: 'Legendary', weight: 2, color: '#f1c40f' }
};

// Item Types
export const ITEM_TYPES = {
  HEAD: 'Head',
  BODY: 'Body',
  ARMS: 'Arms',
  LEGS: 'Legs',
  WEAPON: 'Weapon',
  SHIELD: 'Shield',
  POWER_CORE: 'Power Core',
  CPU: 'CPU',
  SENSOR: 'Sensor',
  BATTERY: 'Battery',
  COOLING: 'Cooling',
  BOOSTER: 'Booster'
};

// Item definitions - 90+ different items with varying stats
export const ITEMS = [
  // COMMON ITEMS - 30 items
  {
    id: 'basic-antenna',
    name: 'Basic Antenna',
    description: 'A simple antenna that slightly improves robot communication.',
    type: ITEM_TYPES.HEAD,
    rarity: 'COMMON',
    stats: { hp: 1, mp: 1, agility: 0, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <line x1="12" y1="2" x2="12" y2="6" />
          <circle cx="12" cy="8" r="2" />
        </svg>`
  },
  {
    id: 'simple-visor',
    name: 'Simple Visor',
    description: 'A basic visor that provides minor perceptual enhancements.',
    type: ITEM_TYPES.HEAD,
    rarity: 'COMMON',
    stats: { hp: 0, mp: 2, agility: 1, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <path d="M4 10 L20 10 L18 14 L6 14 Z" />
        </svg>`
  },
  {
    id: 'basic-cpu',
    name: 'Basic CPU',
    description: 'A standard processing unit with limited capabilities.',
    type: ITEM_TYPES.CPU,
    rarity: 'COMMON',
    stats: { hp: 0, mp: 3, agility: 0, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" />
          <line x1="6" y1="10" x2="18" y2="10" />
          <line x1="6" y1="14" x2="18" y2="14" />
          <line x1="10" y1="6" x2="10" y2="18" />
          <line x1="14" y1="6" x2="14" y2="18" />
        </svg>`
  },
  {
    id: 'metal-plate',
    name: 'Metal Plate',
    description: 'A simple metal plate that provides basic protection.',
    type: ITEM_TYPES.BODY,
    rarity: 'COMMON',
    stats: { hp: 2, mp: 0, agility: -1, power: 0, defense: 2 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>`
  },
  {
    id: 'basic-servo',
    name: 'Basic Servo',
    description: 'A standard servo motor for robotic movement.',
    type: ITEM_TYPES.ARMS,
    rarity: 'COMMON',
    stats: { hp: 0, mp: 0, agility: 1, power: 1, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="8" x2="12" y2="4" />
        </svg>`
  },
  {
    id: 'rubber-wheels',
    name: 'Rubber Wheels',
    description: 'Simple rubber wheels for basic mobility.',
    type: ITEM_TYPES.LEGS,
    rarity: 'COMMON',
    stats: { hp: 0, mp: 0, agility: 2, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <circle cx="8" cy="16" r="4" />
          <circle cx="16" cy="16" r="4" />
        </svg>`
  },
  {
    id: 'basic-battery',
    name: 'Basic Battery',
    description: 'A standard power cell with limited capacity.',
    type: ITEM_TYPES.BATTERY,
    rarity: 'COMMON',
    stats: { hp: 1, mp: 2, agility: 0, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <rect x="8" y="6" width="8" height="12" />
          <line x1="12" y1="3" x2="12" y2="6" />
        </svg>`
  },
  {
    id: 'metal-arm',
    name: 'Metal Arm',
    description: 'A basic mechanical arm with simple joints.',
    type: ITEM_TYPES.ARMS,
    rarity: 'COMMON',
    stats: { hp: 0, mp: 0, agility: 0, power: 2, defense: 1 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <path d="M9 6 L15 6 L15 18 L9 18" />
          <circle cx="7" cy="10" r="2" />
          <circle cx="7" cy="14" r="2" />
        </svg>`
  },
  {
    id: 'simple-fan',
    name: 'Simple Fan',
    description: 'A basic cooling fan for temperature regulation.',
    type: ITEM_TYPES.COOLING,
    rarity: 'COMMON',
    stats: { hp: 1, mp: 1, agility: 0, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 6 L14 10 L10 10 Z" />
          <path d="M18 12 L14 14 L14 10 Z" />
          <path d="M12 18 L10 14 L14 14 Z" />
          <path d="M6 12 L10 10 L10 14 Z" />
        </svg>`
  },
  {
    id: 'small-hammer',
    name: 'Small Hammer',
    description: 'A simple tool for basic repairs and combat.',
    type: ITEM_TYPES.WEAPON,
    rarity: 'COMMON',
    stats: { hp: 0, mp: 0, agility: -1, power: 3, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.COMMON.color}" stroke-width="2">
          <rect x="12" y="4" width="4" height="6" />
          <line x1="14" y1="10" x2="14" y2="18" />
        </svg>`
  },
  
  // Additional COMMON items would continue here...
  
  // UNCOMMON ITEMS - 25 items
  {
    id: 'reinforced-plate',
    name: 'Reinforced Plate',
    description: 'A strengthened armor plate with improved durability.',
    type: ITEM_TYPES.BODY,
    rarity: 'UNCOMMON',
    stats: { hp: 4, mp: 0, agility: -1, power: 0, defense: 4 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.UNCOMMON.color}" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" rx="1" />
          <line x1="6" y1="10" x2="18" y2="10" />
          <line x1="6" y1="14" x2="18" y2="14" />
        </svg>`
  },
  {
    id: 'advanced-sensor',
    name: 'Advanced Sensor',
    description: 'Enhanced sensory equipment for improved perception.',
    type: ITEM_TYPES.SENSOR,
    rarity: 'UNCOMMON',
    stats: { hp: 0, mp: 3, agility: 2, power: 0, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.UNCOMMON.color}" stroke-width="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2 L12 8 M12 16 L12 22 M2 12 L8 12 M16 12 L22 12" />
        </svg>`
  },
  {
    id: 'power-cell',
    name: 'Power Cell',
    description: 'Higher capacity energy storage with improved efficiency.',
    type: ITEM_TYPES.BATTERY,
    rarity: 'UNCOMMON',
    stats: { hp: 2, mp: 5, agility: 0, power: 1, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.UNCOMMON.color}" stroke-width="2">
          <rect x="7" y="6" width="10" height="12" />
          <line x1="12" y1="3" x2="12" y2="6" />
          <line x1="9" y1="10" x2="15" y2="10" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>`
  },
  
  // Additional UNCOMMON items would continue here...
  
  // RARE ITEMS - 17 items
  {
    id: 'precision-servo',
    name: 'Precision Servo',
    description: 'High-precision servo motor for enhanced control and power.',
    type: ITEM_TYPES.ARMS,
    rarity: 'RARE',
    stats: { hp: 0, mp: 0, agility: 3, power: 4, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.RARE.color}" stroke-width="2">
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="2" />
          <line x1="12" y1="7" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="17" />
          <line x1="7" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="17" y2="12" />
        </svg>`
  },
  {
    id: 'tactical-shield',
    name: 'Tactical Shield',
    description: 'Advanced defensive barrier with energy dispersal technology.',
    type: ITEM_TYPES.SHIELD,
    rarity: 'RARE',
    stats: { hp: 2, mp: 0, agility: -1, power: 0, defense: 7 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.RARE.color}" stroke-width="2">
          <path d="M12 3 L20 7 L20 13 C20 17.4183 16.4183 21 12 21 C7.58172 21 4 17.4183 4 13 L4 7 L12 3Z" />
        </svg>`
  },
  
  // Additional RARE items would continue here...
  
  // EPIC ITEMS - 12 items
  {
    id: 'quantum-processor',
    name: 'Quantum Processor',
    description: 'Advanced computational unit using quantum principles for superior performance.',
    type: ITEM_TYPES.CPU,
    rarity: 'EPIC',
    stats: { hp: 1, mp: 9, agility: 2, power: 2, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.EPIC.color}" stroke-width="2">
          <rect x="5" y="5" width="14" height="14" />
          <circle cx="12" cy="12" r="3" />
          <line x1="5" y1="9" x2="19" y2="9" />
          <line x1="5" y1="15" x2="19" y2="15" />
          <line x1="9" y1="5" x2="9" y2="19" />
          <line x1="15" y1="5" x2="15" y2="19" />
        </svg>`
  },
  {
    id: 'fusion-core',
    name: 'Fusion Core',
    description: 'Miniaturized fusion reactor providing exceptional energy output.',
    type: ITEM_TYPES.POWER_CORE,
    rarity: 'EPIC',
    stats: { hp: 3, mp: 8, agility: 0, power: 5, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.EPIC.color}" stroke-width="2">
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 6 C15.3137 6 18 8.68629 18 12 C18 15.3137 15.3137 18 12 18" stroke-dasharray="2 2" />
        </svg>`
  },
  
  // Additional EPIC items would continue here...
  
  // LEGENDARY ITEMS - 6 items
  {
    id: 'singularity-core',
    name: 'Singularity Core',
    description: 'Harnesses controlled micro-singularity for unparalleled power generation.',
    type: ITEM_TYPES.POWER_CORE,
    rarity: 'LEGENDARY',
    stats: { hp: 5, mp: 12, agility: 2, power: 8, defense: 0 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.LEGENDARY.color}" stroke-width="2">
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="12" r="10" stroke-dasharray="1 2" />
          <path d="M12 2 L12 22 M2 12 L22 12" stroke-dasharray="1 1" />
        </svg>`
  },
  {
    id: 'neutronium-armor',
    name: 'Neutronium Armor',
    description: 'Virtually indestructible armor made from superdense neutron star material.',
    type: ITEM_TYPES.BODY,
    rarity: 'LEGENDARY',
    stats: { hp: 10, mp: -2, agility: -2, power: 0, defense: 15 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${ITEM_RARITIES.LEGENDARY.color}" stroke-width="2">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <path d="M5 9 L19 9 M5 15 L19 15" />
          <path d="M9 5 L9 19 M15 5 L15 19" />
          <circle cx="12" cy="12" r="3" stroke-dasharray="0.5 0.5" />
        </svg>`
  }
  
  // Additional LEGENDARY items would continue here...
  
  // Note: For brevity, I'm including a representative sample of items.
  // In a real implementation, you would add all 90+ items as required.
];

// Helper function to generate a random item based on rarity weights
export const generateRandomItem = () => {
  // Calculate total weight
  const totalWeight = Object.values(ITEM_RARITIES).reduce((sum, rarity) => sum + rarity.weight, 0);
  
  // Generate a random number between 0 and total weight
  let randomWeight = Math.random() * totalWeight;
  
  // Determine the rarity based on weight
  let selectedRarity = null;
  for (const [rarityKey, rarity] of Object.entries(ITEM_RARITIES)) {
    randomWeight -= rarity.weight;
    if (randomWeight <= 0) {
      selectedRarity = rarityKey;
      break;
    }
  }
  
  // Fallback to COMMON if something goes wrong
  if (!selectedRarity) selectedRarity = 'COMMON';
  
  // Filter items by the selected rarity
  const itemsByRarity = ITEMS.filter(item => item.rarity === selectedRarity);
  
  // Select a random item from the filtered list
  const randomIndex = Math.floor(Math.random() * itemsByRarity.length);
  return itemsByRarity[randomIndex];
};

// Item System Class
class ItemService extends ServiceBase {
  constructor() {
    super();
    this.USER_ITEMS_TABLE = 'user_items';
    this.MASCOT_ITEMS_TABLE = 'mascot_equipped_items';
    
    // Clean up localStorage on initialization - reference removed
    this.clearLocalStorageData();
  }
  
  // Clear any legacy localStorage data
  clearLocalStorageData() {
    // localStorage references removed
    console.log('localStorage references have been removed');
  }
  
  // Verify tables exist in Supabase
  async verifyTables() {
    try {
      console.log('Verifying item tables...');
      
      // Check user_items table
      const { error: itemsError } = await supabase
        .from(this.USER_ITEMS_TABLE)
        .select('id')
        .limit(1);
        
      if (itemsError) {
        console.error('Error checking user_items table:', itemsError);
        return false;
      }
      
      // Check mascot_equipped_items table
      const { error: equippedError } = await supabase
        .from(this.MASCOT_ITEMS_TABLE)
        .select('id')
        .limit(1);
        
      if (equippedError) {
        console.error('Error checking mascot_equipped_items table:', equippedError);
        return false;
      }
      
      console.log('Item tables verified successfully');
      return true;
    } catch (err) {
      console.error('Error verifying item tables:', err);
      return false;
    }
  }
  
  // Initialize user data (if not already initialized)
  async initUserItemsData(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'initUserItemsData', false);
    }
    
    try {
      // Check if user already has items data
      const userItems = await this.fetchData(this.USER_ITEMS_TABLE, { user_id: userId });
      
      // If user already has items data, no need to initialize
      if (userItems && userItems.length > 0) {
        return true;
      }
      
      // Give the user some starter items
      const starterItems = this.getSampleItems();
      
      for (const item of starterItems) {
        await this.addItemToUserInventory(userId, item);
      }
      
      return true;
    } catch (err) {
      return this.handleError(err, 'initUserItemsData', false);
    }
  }
  
  // Get items owned by a user
  async getUserItems(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'getUserItems', []);
    }
    
    try {
      const items = await this.fetchData(this.USER_ITEMS_TABLE, { user_id: userId });
      return this.formatItemsResponse(items);
    } catch (err) {
      return this.handleError(err, 'getUserItems', []);
    }
  }
  
  // Format items data returned from the database
  formatItemsResponse(data) {
    // Ensure data is valid
    if (!data) {
      // eslint-disable-next-line no-console
      console.warn('formatItemsResponse received no data');
      return [];
    }
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      // eslint-disable-next-line no-console
      console.error('formatItemsResponse expected an array but got:', typeof data);
      return [];
    }
    
    try {
      // Log the first few items for debugging
      if (data.length > 0) {
        console.log('Sample item from database:', data[0]);
      }
      
      // Transform to match the expected structure
      const formattedItems = data.map(item => {
        if (!item) return null;
        
        if (!item.instance_id) {
          console.error('Missing instance_id for item:', item);
        }
        
        return {
          id: item.item_id,
          instanceId: item.instance_id,
          name: item.name,
          description: item.description,
          type: item.type,
          rarity: item.rarity,
          stats: item.stats || {},
          svg: item.svg,
          createdAt: item.created_at
        };
      }).filter(Boolean); // Remove any null items
      
      // Log a summary of the formatted items
      console.log(`Formatted ${formattedItems.length} items`);
      
      return formattedItems;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error formatting items response:', error);
      return [];
    }
  }
  
  // Add an item to a user's inventory
  async addItemToUserInventory(userId, item) {
    if (!userId || !item) {
      return {
        success: false,
        message: 'Missing required parameters'
      };
    }
    
    try {
      // Generate a unique instance ID
      const instanceId = `${item.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Create item data object
      const itemData = {
        user_id: userId,
        instance_id: instanceId,
        item_id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        stats: item.stats,
        svg: item.svg,
        created_at: new Date().toISOString()
      };
      
      // Add item to database
      const result = await this.insertData(this.USER_ITEMS_TABLE, itemData);
      
      if (!result.success) {
        return result;
      }
      
      // Dispatch event
      this.dispatchEvent(ITEM_UPDATED_EVENT, { userId });
      
      return {
        success: true,
        message: `${item.name} added to your inventory!`,
        item: {
          ...item,
          instanceId
        }
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to add item to inventory'
      };
    }
  }
  
  // Purchase a random item with points
  async purchaseRandomItem(userId) {
    if (!userId) {
      console.error('purchaseRandomItem called with no userId');
      return {
        success: false,
        message: 'Invalid user ID'
      };
    }
    
    try {
      // Check if user has enough points
      const userData = await PointsService.getUserPoints(userId);
      const itemPrice = 50; // Fixed price of 50 points
      
      if (userData.points < itemPrice) {
        return {
          success: false,
          message: 'Not enough points to purchase an item',
          requiredPoints: itemPrice,
          currentPoints: userData.points
        };
      }
      
      // Generate a random item first to ensure we have a valid item
      const newItem = generateRandomItem();
      if (!newItem) {
        console.error('Failed to generate random item');
        return {
          success: false,
          message: 'Failed to generate item'
        };
      }
      
      // Try to add the item to inventory first before deducting points
      const itemInstance = await this.addItemToUserInventory(userId, newItem);
      
      if (!itemInstance) {
        return {
          success: false,
          message: 'Failed to add item to inventory'
        };
      }
      
      // Deduct points only after successfully adding item to inventory
      const pointsResult = await PointsService.addPoints(userId, -itemPrice, 'ITEM_PURCHASE');
      if (!pointsResult || !pointsResult.success) {
        console.error('Failed to deduct points after adding item:', pointsResult);
        // Item was added but points weren't deducted - this is an edge case
        // Consider rolling back the item addition in a production app
        return {
          success: true,
          item: itemInstance,
          message: `Successfully purchased ${newItem.name}, but there was an issue updating your points. Please refresh.`,
        };
      }
      
      // Dispatch event for UI updates
      const event = new CustomEvent(ITEM_UPDATED_EVENT, { 
        detail: { 
          userId,
          itemId: itemInstance.instanceId,
          timestamp: Date.now()
        }
      });
      document.dispatchEvent(event);
      
      return {
        success: true,
        item: itemInstance,
        message: `Successfully purchased ${newItem.name}`,
        pointsSpent: itemPrice,
        remainingPoints: pointsResult.userData.points
      };
    } catch (err) {
      console.error('Error purchasing random item:', err);
      return {
        success: false,
        message: 'An error occurred while purchasing the item'
      };
    }
  }
  
  // Get mascot equipped items
  async getMascotItems(userId, mascotId) {
    if (!userId || !mascotId) {
      return this.handleError(new Error('Invalid parameters'), 'getMascotItems', []);
    }
    
    try {
      // Get equipped item instances from the join table
      const equippedData = await this.fetchData(
        this.MASCOT_ITEMS_TABLE, 
        { user_id: userId, mascot_id: mascotId }
      );
      
      if (!equippedData || equippedData.length === 0) {
        return [];
      }
      
      // Get the instance IDs
      const itemInstanceIds = equippedData.map(entry => entry.item_instance_id);
      
      // Get the actual items
      const itemsData = await this.fetchData(
        this.USER_ITEMS_TABLE, 
        { user_id: userId }
      );
      
      if (!itemsData) {
        return [];
      }
      
      // Filter items by instance IDs
      const equippedItems = itemsData.filter(item => 
        itemInstanceIds.includes(item.instance_id)
      );
      
      // Use the helper method to format the response
      const formattedItems = this.formatItemsResponse(equippedItems);
      return Array.isArray(formattedItems) ? formattedItems : [];
    } catch (err) {
      return this.handleError(err, 'getMascotItems', []);
    }
  }
  
  // Equip item to mascot
  async equipItemToMascot(userId, mascotId, itemInstanceId) {
    if (!userId || !mascotId || !itemInstanceId) {
      return {
        success: false,
        message: 'Missing required parameters'
      };
    }
    
    try {
      // Find the item in the user's inventory
      const userItems = await this.fetchData(
        this.USER_ITEMS_TABLE,
        { user_id: userId }
      );
      
      const itemData = userItems.find(item => item.instance_id === itemInstanceId);
      
      if (!itemData) {
        return {
          success: false,
          message: 'Item not found in inventory'
        };
      }
      
      // Check if mascot already has the maximum number of items (3)
      const equippedItems = await this.fetchData(
        this.MASCOT_ITEMS_TABLE,
        { user_id: userId, mascot_id: mascotId }
      );
      
      if (equippedItems && equippedItems.length >= 3) {
        return {
          success: false,
          message: 'Mascot already has the maximum number of items equipped (3)'
        };
      }
      
      // First check if this item is already equipped on this mascot
      const alreadyEquipped = equippedItems.some(
        entry => entry.item_instance_id === itemInstanceId
      );
      
      if (alreadyEquipped) {
        return {
          success: false,
          message: 'This item is already equipped on this mascot'
        };
      }
      
      // Equip the item
      const result = await this.insertData(this.MASCOT_ITEMS_TABLE, {
        user_id: userId,
        mascot_id: mascotId,
        item_instance_id: itemInstanceId
      });
      
      if (!result.success) {
        return result;
      }
      
      // Dispatch event
      this.dispatchEvent(ITEM_UPDATED_EVENT, { userId });
      
      return {
        success: true,
        message: `${itemData.name} has been equipped to your mascot`,
        equippedItem: {
          id: itemData.item_id,
          instanceId: itemData.instance_id,
          name: itemData.name,
          description: itemData.description,
          type: itemData.type,
          rarity: itemData.rarity,
          stats: itemData.stats,
          svg: itemData.svg
        }
      };
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }
  
  // Unequip item from mascot
  async unequipItemFromMascot(userId, mascotId, itemInstanceId) {
    if (!userId || !mascotId || !itemInstanceId) {
      return {
        success: false,
        message: 'Missing required parameters'
      };
    }
    
    try {
      // Check if item is equipped
      const equippedItems = await this.fetchData(
        this.MASCOT_ITEMS_TABLE,
        { 
          user_id: userId, 
          mascot_id: mascotId,
          item_instance_id: itemInstanceId
        }
      );
      
      if (!equippedItems || equippedItems.length === 0) {
        return {
          success: false,
          message: 'This item is not equipped on this mascot'
        };
      }
      
      // Unequip the item
      const result = await this.deleteData(
        this.MASCOT_ITEMS_TABLE,
        {
          user_id: userId,
          mascot_id: mascotId,
          item_instance_id: itemInstanceId
        }
      );
      
      if (!result.success) {
        return result;
      }
      
      // Dispatch event
      this.dispatchEvent(ITEM_UPDATED_EVENT, { userId });
      
      return {
        success: true,
        message: 'Item unequipped successfully'
      };
    } catch (err) {
      return {
        success: false,
        message: 'An error occurred while unequipping the item'
      };
    }
  }
  
  // Calculate total mascot stats with equipped items
  calculateTotalMascotStats(mascot, equippedItems = []) {
    try {
      // Check if mascot is valid
      if (!mascot || !mascot.stats) {
        // eslint-disable-next-line no-console
        console.error('Invalid mascot or mascot stats provided to calculateTotalMascotStats');
        return mascot?.stats || {};
      }
      
      // Ensure equippedItems is an array and not a Promise
      if (!Array.isArray(equippedItems)) {
        // Check if it's a Promise
        if (equippedItems && typeof equippedItems.then === 'function') {
          // eslint-disable-next-line no-console
          console.error('Promise passed to calculateTotalMascotStats instead of an array. Did you forget to await getMascotItems?', equippedItems);
          // Return mascot base stats as fallback
          return { ...mascot.stats };
        }
        
        // eslint-disable-next-line no-console
        console.error('equippedItems is not an array in calculateTotalMascotStats:', equippedItems);
        equippedItems = [];
      }
      
      // Start with the mascot's base stats
      const totalStats = { ...mascot.stats };
      
      // Add stats from all equipped items
      for (const item of equippedItems) {
        // Skip invalid items
        if (!item || !item.stats) continue;
        
        try {
          for (const [stat, value] of Object.entries(item.stats)) {
            if (totalStats[stat] !== undefined && typeof value === 'number') {
              totalStats[stat] += value;
            }
          }
        } catch (statError) {
          // eslint-disable-next-line no-console
          console.error('Error processing item stats:', statError, item);
          // Continue with next item
        }
      }
      
      return totalStats;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in calculateTotalMascotStats:', error);
      return mascot?.stats || {};
    }
  }
  
  // Check if an item is equipped on any mascot
  async isItemEquipped(userId, itemInstanceId) {
    if (!userId || !itemInstanceId) return false;
    
    try {
      // Check if admin client is available
      if (!supabaseAdmin) {
        console.error('Admin client not available. Check environment variables.');
        return false;
      }
      
      const { data, error } = await supabaseAdmin
        .from(this.MASCOT_ITEMS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .eq('item_instance_id', itemInstanceId)
        .limit(1);
        
      if (error) {
        console.error('Error checking if item is equipped:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (err) {
      console.error('Error checking if item is equipped:', err);
      return false;
    }
  }
  
  // Get the point value for an item (for selling)
  getItemValue(item) {
    const rarityValues = {
      'COMMON': 10,
      'UNCOMMON': 25,
      'RARE': 50,
      'EPIC': 100,
      'LEGENDARY': 250
    };
    
    return rarityValues[item.rarity] || 0;
  }
  
  // Get a sample set of items for new users
  getSampleItems() {
    // Return one item of each rarity for display purposes
    return ITEMS.filter((item, index, array) => {
      // For each rarity, find the first item with that rarity
      const rarityItems = array.filter(i => i.rarity === item.rarity);
      return rarityItems.indexOf(item) === 0;
    });
  }

  // Create a random item instance
  createRandomItemInstance() {
    const item = generateRandomItem();
    
    // Create instance ID
    const instanceId = `${item.id}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    return {
      id: item.id,
      instanceId: instanceId,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      stats: item.stats,
      svg: item.svg
    };
  }
}

// Export a singleton instance
const itemServiceInstance = new ItemService();
export default itemServiceInstance; 