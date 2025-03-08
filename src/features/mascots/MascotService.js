/**
 * MascotService.js
 * Service for managing mascot system with Supabase persistence
 */

import PointsService from '../rewards/PointsService';
import supabase from '../../shared/utils/supabaseClient';

// Custom event for mascot updates
export const MASCOT_UPDATED_EVENT = 'mascot-updated';

// Mascot data with different types, stats, and prices
export const MASCOTS = [
  {
    id: 'robo-scout',
    name: 'Robo Scout',
    description: 'A lightweight robot with high agility and scanning abilities.',
    price: 50,
    stats: { hp: 20, mp: 40, agility: 8, power: 3, defense: 2 },
    rarity: 'common',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="16" y="12" width="32" height="24" rx="2" stroke="#3498db" fill="#a4d4f9" />
          <circle cx="28" cy="20" r="4" stroke="#3498db" fill="#e1f0fa" />
          <circle cx="36" cy="20" r="4" stroke="#3498db" fill="#e1f0fa" />
          <rect x="24" y="36" width="16" height="16" rx="2" stroke="#3498db" fill="#a4d4f9" />
          <line x1="30" y1="36" x2="30" y2="52" stroke="#3498db" />
          <line x1="34" y1="36" x2="34" y2="52" stroke="#3498db" />
          <line x1="24" y1="44" x2="40" y2="44" stroke="#3498db" />
          <line x1="20" y1="20" x2="12" y2="24" stroke="#3498db" />
          <line x1="44" y1="20" x2="52" y2="24" stroke="#3498db" />
        </svg>`
  },
  {
    id: 'battle-bot',
    name: 'Battle Bot',
    description: 'A battle-hardened robot with exceptional power and defense.',
    price: 120,
    stats: { hp: 65, mp: 25, agility: 4, power: 9, defense: 7 },
    rarity: 'rare',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="14" y="10" width="36" height="28" rx="4" stroke="#e74c3c" fill="#f5b7b1" />
          <circle cx="26" cy="20" r="5" stroke="#e74c3c" fill="#f9e79f" />
          <circle cx="38" cy="20" r="5" stroke="#e74c3c" fill="#f9e79f" />
          <rect x="22" y="38" width="20" height="16" rx="2" stroke="#e74c3c" fill="#f5b7b1" />
          <path d="M14 24 L6 28 L6 40 L14 36 Z" stroke="#e74c3c" fill="#f5b7b1" />
          <path d="M50 24 L58 28 L58 40 L50 36 Z" stroke="#e74c3c" fill="#f5b7b1" />
          <line x1="24" y1="44" x2="40" y2="44" stroke="#e74c3c" />
        </svg>`
  },
  {
    id: 'tech-wizard',
    name: 'Tech Wizard',
    description: 'A specialized robot with tremendous magic power and tech abilities.',
    price: 200,
    stats: { hp: 30, mp: 90, agility: 6, power: 5, defense: 3 },
    rarity: 'rare',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <path d="M32 8 L40 16 L32 24 L24 16 Z" stroke="#9b59b6" fill="#d7bde2" />
          <rect x="18" y="24" width="28" height="20" rx="4" stroke="#9b59b6" fill="#d7bde2" />
          <circle cx="27" cy="32" r="3" stroke="#9b59b6" fill="#f4ecf7" />
          <circle cx="37" cy="32" r="3" stroke="#9b59b6" fill="#f4ecf7" />
          <path d="M25 44 L32 54 L39 44 Z" stroke="#9b59b6" fill="#d7bde2" />
          <path d="M22 44 L18 56 M42 44 L46 56" stroke="#9b59b6" />
          <circle cx="32" cy="16" r="2" stroke="#9b59b6" fill="#f4ecf7" />
        </svg>`
  },
  {
    id: 'heavy-tank',
    name: 'Heavy Tank',
    description: 'An industrial robot with unmatched HP and defense but low mobility.',
    price: 180,
    stats: { hp: 100, mp: 10, agility: 2, power: 6, defense: 10 },
    rarity: 'rare',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="12" y="14" width="40" height="24" rx="0" stroke="#34495e" fill="#85929e" />
          <circle cx="26" cy="26" r="4" stroke="#34495e" fill="#ebedef" />
          <circle cx="38" cy="26" r="4" stroke="#34495e" fill="#ebedef" />
          <rect x="18" y="38" width="28" height="12" rx="0" stroke="#34495e" fill="#85929e" />
          <rect x="10" y="42" width="8" height="4" rx="2" stroke="#34495e" fill="#85929e" />
          <rect x="46" y="42" width="8" height="4" rx="2" stroke="#34495e" fill="#85929e" />
          <line x1="18" y1="42" x2="46" y2="42" stroke="#34495e" />
          <rect x="18" y="10" width="28" height="4" rx="0" stroke="#34495e" fill="#85929e" />
        </svg>`
  },
  {
    id: 'stealth-unit',
    name: 'Stealth Unit',
    description: 'A specialized robot with high agility and invisibility capabilities.',
    price: 150,
    stats: { hp: 30, mp: 40, agility: 10, power: 6, defense: 3 },
    rarity: 'rare',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <path d="M20 12 L44 12 L42 24 L22 24 Z" stroke="#2ecc71" fill="#abebc6" />
          <rect x="24" y="24" width="16" height="20" rx="2" stroke="#2ecc71" fill="#abebc6" />
          <circle cx="30" cy="32" r="2" stroke="#2ecc71" fill="#eafaf1" />
          <circle cx="34" cy="32" r="2" stroke="#2ecc71" fill="#eafaf1" />
          <path d="M24 44 L28 52 L36 52 L40 44" stroke="#2ecc71" fill="#abebc6" />
          <line x1="24" y1="36" x2="40" y2="36" stroke="#2ecc71" />
          <path d="M14 32 L20 28 M50 32 L44 28" stroke="#2ecc71" stroke-dasharray="2 1" />
        </svg>`
  },
  {
    id: 'medic-bot',
    name: 'Medic Bot',
    description: 'A support robot that specializes in healing and rejuvenation.',
    price: 140,
    stats: { hp: 45, mp: 60, agility: 5, power: 3, defense: 4 },
    rarity: 'rare',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="16" y="12" width="32" height="24" rx="12" stroke="#e74c3c" fill="#fadbd8" />
          <circle cx="28" cy="22" r="3" stroke="#e74c3c" fill="#ffffff" />
          <circle cx="36" cy="22" r="3" stroke="#e74c3c" fill="#ffffff" />
          <rect x="24" y="36" width="16" height="16" rx="4" stroke="#e74c3c" fill="#fadbd8" />
          <line x1="32" y1="36" x2="32" y2="52" stroke="#e74c3c" />
          <line x1="24" y1="44" x2="40" y2="44" stroke="#e74c3c" />
          <path d="M28 12 L28 4 L36 4 L36 12" stroke="#e74c3c" />
          <rect x="28" y="4" width="8" height="4" rx="2" stroke="#e74c3c" fill="#fadbd8" />
        </svg>`
  },
  {
    id: 'quantum-core',
    name: 'Quantum Core',
    description: 'An advanced robot with quantum computing abilities and balanced stats.',
    price: 250,
    stats: { hp: 70, mp: 70, agility: 7, power: 7, defense: 7 },
    rarity: 'epic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <circle cx="32" cy="24" r="16" stroke="#3498db" fill="#d6eaf8" />
          <circle cx="32" cy="24" r="8" stroke="#3498db" fill="#ebf5fb" />
          <circle cx="32" cy="24" r="3" stroke="#3498db" fill="#f5b7b1" />
          <rect x="24" y="40" width="16" height="16" rx="4" stroke="#3498db" fill="#d6eaf8" />
          <line x1="28" y1="40" x2="28" y2="56" stroke="#3498db" />
          <line x1="32" y1="40" x2="32" y2="56" stroke="#3498db" />
          <line x1="36" y1="40" x2="36" y2="56" stroke="#3498db" />
          <line x1="24" y1="44" x2="40" y2="44" stroke="#3498db" />
          <line x1="24" y1="48" x2="40" y2="48" stroke="#3498db" />
          <line x1="24" y1="52" x2="40" y2="52" stroke="#3498db" />
          <path d="M16 24 C16 16 24 8 32 8 40 8 48 16 48 24" stroke="#3498db" stroke-dasharray="2 1" />
        </svg>`
  },
  {
    id: 'omega-prime',
    name: 'Omega Prime',
    description: 'The ultimate robot prototype with exceptional capabilities in all areas.',
    price: 500,
    stats: { hp: 100, mp: 100, agility: 9, power: 10, defense: 9 },
    rarity: 'legendary',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <path d="M20 8 L44 8 L40 20 L24 20 Z" stroke="#f39c12" fill="#fdebd0" />
          <rect x="16" y="20" width="32" height="24" rx="4" stroke="#f39c12" fill="#fef9e7" />
          <circle cx="28" cy="30" r="4" stroke="#f39c12" fill="#f5cba7" />
          <circle cx="36" cy="30" r="4" stroke="#f39c12" fill="#f5cba7" />
          <line x1="22" y1="38" x2="42" y2="38" stroke="#f39c12" />
          <path d="M24 44 L28 56 L36 56 L40 44" stroke="#f39c12" fill="#fdebd0" />
          <path d="M16 20 L8 30 L16 40" stroke="#f39c12" />
          <path d="M48 20 L56 30 L48 40" stroke="#f39c12" />
          <circle cx="32" cy="12" r="2" stroke="#f39c12" fill="#e74c3c" />
        </svg>`
  },
  {
    id: 'nexus-guardian',
    name: 'Nexus Guardian',
    description: 'An ancient AI defender with crystalline armor and dimensional manipulation abilities.',
    price: 550,
    stats: { hp: 90, mp: 120, agility: 7, power: 8, defense: 10 },
    rarity: 'legendary',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <polygon points="32,4 40,10 48,16 40,22 32,28 24,22 16,16 24,10" stroke="#8e44ad" fill="#d2b4de" />
          <rect x="24" y="24" width="16" height="20" rx="0" stroke="#8e44ad" fill="#d2b4de" />
          <circle cx="28" cy="30" r="3" stroke="#8e44ad" fill="#f5eef8" />
          <circle cx="36" cy="30" r="3" stroke="#8e44ad" fill="#f5eef8" />
          <path d="M20 44 L28 54 L36 54 L44 44" stroke="#8e44ad" fill="#d2b4de" />
          <path d="M12 30 L20 26 M52 30 L44 26" stroke="#8e44ad" />
          <line x1="24" y1="36" x2="40" y2="36" stroke="#8e44ad" />
          <path d="M24 16 L40 16" stroke="#8e44ad" stroke-dasharray="2 1" />
          <path d="M20 44 L12 52 M44 44 L52 52" stroke="#8e44ad" stroke-dasharray="2 1" />
          <circle cx="32" cy="16" r="4" stroke="#8e44ad" fill="#a569bd" />
        </svg>`
  }
];

// Mascot System Class
class MascotService {
  constructor() {
    this.TABLE_NAME = 'user_mascots';
  }

  // Get all available mascots (shop catalog)
  getAllMascots() {
    return MASCOTS;
  }

  // Get a specific mascot by ID
  getMascotById(mascotId) {
    return MASCOTS.find(mascot => mascot.id === mascotId);
  }

  // Get mascots owned by a user
  async getUserMascots(userId) {
    try {
      // Query Supabase for user's mascots
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user mascots:', error);
        return [];
      }
      
      // Map database records to mascot objects with full details
      return data.map(record => {
        const mascotTemplate = this.getMascotById(record.mascot_id);
        return {
          ...mascotTemplate,
          purchaseDate: record.purchase_date,
          experience: record.experience,
          level: record.level,
          isActive: record.is_active
        };
      });
    } catch (err) {
      console.error('Unexpected error in getUserMascots:', err);
      return [];
    }
  }
  
  // Helper method to dispatch mascot update event
  dispatchMascotUpdatedEvent(userId, activeMascotId = null) {
    const event = new CustomEvent(MASCOT_UPDATED_EVENT, { 
      detail: { userId, activeMascotId }
    });
    document.dispatchEvent(event);
  }

  // Get user's active mascot
  async getUserActiveMascot(userId) {
    try {
      // Query Supabase for user's active mascot
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No active mascot found
          return null;
        }
        console.error('Error fetching active mascot:', error);
        return null;
      }
      
      // Map database record to mascot object with full details
      const mascotTemplate = this.getMascotById(data.mascot_id);
      return {
        ...mascotTemplate,
        purchaseDate: data.purchase_date,
        experience: data.experience,
        level: data.level,
        isActive: data.is_active
      };
    } catch (err) {
      console.error('Unexpected error in getUserActiveMascot:', err);
      return null;
    }
  }

  // Set user's active mascot
  async setUserActiveMascot(userId, mascotId) {
    try {
      // First, set all mascots to inactive
      const { error: resetError } = await supabase
        .from(this.TABLE_NAME)
        .update({ is_active: false })
        .eq('user_id', userId);
      
      if (resetError) {
        console.error('Error resetting active mascots:', resetError);
        return null;
      }
      
      // Then set the selected mascot to active
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ is_active: true })
        .eq('user_id', userId)
        .eq('mascot_id', mascotId);
      
      if (error) {
        console.error('Error setting active mascot:', error);
        return null;
      }
      
      // Dispatch event
      this.dispatchMascotUpdatedEvent(userId, mascotId);
      
      return mascotId;
    } catch (err) {
      console.error('Unexpected error in setUserActiveMascot:', err);
      return null;
    }
  }

  // Purchase a mascot for a user
  async purchaseMascot(userId, mascotId) {
    try {
      // Get the mascot details
      const mascot = this.getMascotById(mascotId);
      if (!mascot) {
        return { success: false, message: 'Mascot not found' };
      }
      
      // Get user points
      const userData = await PointsService.getUserPoints(userId);
      
      // Check if user has enough points
      if (userData.points < mascot.price) {
        return { success: false, message: 'Not enough points' };
      }
      
      // Check if user already owns this mascot
      const { data, error: checkError } = await supabase
        .from(this.TABLE_NAME)
        .select('mascot_id')
        .eq('user_id', userId)
        .eq('mascot_id', mascotId);
      
      if (checkError) {
        console.error('Error checking mascot ownership:', checkError);
        return { success: false, message: 'Error checking mascot ownership' };
      }
      
      if (data && data.length > 0) {
        return { success: false, message: 'You already own this mascot' };
      }
      
      // Deduct points
      await PointsService.addPoints(userId, -mascot.price);
      
      // Check if this is the first mascot
      const { data: existingMascots, error: countError } = await supabase
        .from(this.TABLE_NAME)
        .select('mascot_id')
        .eq('user_id', userId);
      
      if (countError) {
        console.error('Error counting existing mascots:', countError);
      }
      
      const isFirstMascot = !existingMascots || existingMascots.length === 0;
      
      // Add mascot to user's collection
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          user_id: userId,
          mascot_id: mascotId,
          is_active: isFirstMascot, // Set as active if it's the first mascot
          purchase_date: new Date().toISOString(),
          experience: 0,
          level: 1
        });
      
      if (error) {
        console.error('Error purchasing mascot:', error);
        return { success: false, message: 'Error purchasing mascot' };
      }
      
      // Dispatch event
      this.dispatchMascotUpdatedEvent(userId, isFirstMascot ? mascotId : null);
      
      // Get the full mascot object to return
      const userMascot = {
        ...mascot,
        purchaseDate: new Date().toISOString(),
        experience: 0,
        level: 1,
        isActive: isFirstMascot
      };
      
      return { 
        success: true, 
        message: 'Mascot purchased successfully', 
        mascot: userMascot 
      };
    } catch (err) {
      console.error('Unexpected error in purchaseMascot:', err);
      return { success: false, message: 'Unexpected error occurred' };
    }
  }

  // Add experience to a mascot
  async addMascotExperience(userId, mascotId, expAmount) {
    try {
      // Get current mascot data
      const { data, error: fetchError } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .eq('mascot_id', mascotId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching mascot for experience update:', fetchError);
        return null;
      }
      
      // Update experience and level
      const newExperience = data.experience + expAmount;
      const newLevel = Math.floor(newExperience / 100) + 1;
      
      // Update in database
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          experience: newExperience,
          level: newLevel
        })
        .eq('user_id', userId)
        .eq('mascot_id', mascotId);
      
      if (error) {
        console.error('Error updating mascot experience:', error);
        return null;
      }
      
      // Dispatch event
      this.dispatchMascotUpdatedEvent(userId);
      
      // Get the full mascot object to return
      const mascotTemplate = this.getMascotById(mascotId);
      return {
        ...mascotTemplate,
        purchaseDate: data.purchase_date,
        experience: newExperience,
        level: newLevel,
        isActive: data.is_active
      };
    } catch (err) {
      console.error('Unexpected error in addMascotExperience:', err);
      return null;
    }
  }
}

// Export a singleton instance
const mascotServiceInstance = new MascotService();
export default mascotServiceInstance; 