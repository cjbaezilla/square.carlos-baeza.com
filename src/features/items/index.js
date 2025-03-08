import ItemService, { ITEM_RARITIES, ITEM_TYPES, ITEMS, ITEM_UPDATED_EVENT } from './ItemService';
import ItemsPage from './pages/ItemsPage';

// Ensure user has at least a few sample items for display
const ensureUserHasSampleItems = async (userId) => {
  if (!userId) return [];
  
  try {
    // Get user's current items
    const userItems = await ItemService.getUserItems(userId);
    
    // Return existing items if user already has some
    if (userItems && userItems.length > 0) {
      return userItems;
    }
    
    // If user has no items, add a few sample items
    // Get sample items (one of each rarity)
    const sampleItems = ItemService.getSampleItems();
    
    // Add samples to user's inventory
    const promises = sampleItems.map(item => ItemService.addItemToUserInventory(userId, item));
    await Promise.all(promises);
    
    // Get updated items list
    return await ItemService.getUserItems(userId);
  } catch (error) {
    console.error('Error ensuring user has sample items:', error);
    return [];
  }
};

export { 
  ItemService, 
  ItemsPage,
  ITEM_RARITIES, 
  ITEM_TYPES, 
  ITEMS, 
  ITEM_UPDATED_EVENT, 
  ensureUserHasSampleItems 
}; 