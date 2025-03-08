import ItemService from '../ItemService';

// Helper function to ensure user has some sample items if empty
export const ensureUserHasSampleItems = (userId) => {
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