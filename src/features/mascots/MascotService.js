/**
 * MascotService.js
 * Service for managing mascot system with Supabase persistence
 */

import PointsService from '../rewards/PointsService';
import ServiceBase from '../../shared/utils/ServiceBase';

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
  },
  {
    id: 'cyber-sentinel',
    name: 'Cyber Sentinel',
    description: 'A highly advanced security robot with enhanced perception and tactical capabilities.',
    price: 280,
    stats: { hp: 65, mp: 75, agility: 8, power: 6, defense: 8 },
    rarity: 'epic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <path d="M20 10 L44 10 L40 24 L24 24 Z" stroke="#9b59b6" fill="#d7bde2" />
          <rect x="22" y="24" width="20" height="24" rx="2" stroke="#9b59b6" fill="#d7bde2" />
          <circle cx="29" cy="32" r="3" stroke="#9b59b6" fill="#f4ecf7" />
          <circle cx="35" cy="32" r="3" stroke="#9b59b6" fill="#f4ecf7" />
          <path d="M22 48 L26 56 L38 56 L42 48" stroke="#9b59b6" fill="#d7bde2" />
          <line x1="22" y1="40" x2="42" y2="40" stroke="#9b59b6" />
          <path d="M16 32 L22 28 M48 32 L42 28" stroke="#9b59b6" />
          <path d="M32 10 L32 4" stroke="#9b59b6" />
          <circle cx="32" cy="4" r="2" stroke="#9b59b6" fill="#f4ecf7" />
        </svg>`
  },
  {
    id: 'chrono-titan',
    name: 'Chrono Titan',
    description: 'A colossal robot that can manipulate time and space, with unparalleled power and defense.',
    price: 600,
    stats: { hp: 110, mp: 95, agility: 6, power: 12, defense: 11 },
    rarity: 'legendary',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <path d="M20 8 L44 8 L42 20 L22 20 Z" stroke="#f39c12" fill="#fef5e7" />
          <rect x="16" y="20" width="32" height="24" rx="2" stroke="#f39c12" fill="#fef5e7" />
          <circle cx="27" cy="28" r="4" stroke="#f39c12" fill="#fdebd0" />
          <circle cx="37" cy="28" r="4" stroke="#f39c12" fill="#fdebd0" />
          <path d="M20 44 L28 58 L36 58 L44 44" stroke="#f39c12" fill="#fef5e7" />
          <rect x="10" y="26" width="6" height="12" rx="1" stroke="#f39c12" fill="#fef5e7" />
          <rect x="48" y="26" width="6" height="12" rx="1" stroke="#f39c12" fill="#fef5e7" />
          <path d="M32 8 L32 2" stroke="#f39c12" />
          <circle cx="32" cy="2" r="1" stroke="#f39c12" fill="#e74c3c" />
          <path d="M20 36 L44 36" stroke="#f39c12" />
          <path d="M24 20 C24 16 32 12 32 4 32 12 40 16 40 20" stroke="#f39c12" stroke-dasharray="2 1" />
        </svg>`
  },
  {
    id: 'utility-droid',
    name: 'Utility Droid',
    description: 'A simple but reliable worker robot for everyday tasks.',
    price: 40,
    stats: { hp: 25, mp: 30, agility: 5, power: 4, defense: 3 },
    rarity: 'common',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="18" y="14" width="28" height="22" rx="2" stroke="#95a5a6" fill="#d5dbdb" />
          <circle cx="28" cy="22" r="3" stroke="#95a5a6" fill="#ecf0f1" />
          <circle cx="36" cy="22" r="3" stroke="#95a5a6" fill="#ecf0f1" />
          <rect x="26" y="36" width="12" height="14" rx="1" stroke="#95a5a6" fill="#d5dbdb" />
          <line x1="26" y1="43" x2="38" y2="43" stroke="#95a5a6" />
          <path d="M18 26 L12 30 M46 26 L52 30" stroke="#95a5a6" />
          <line x1="32" y1="14" x2="32" y2="10" stroke="#95a5a6" />
          <circle cx="32" cy="9" r="1" stroke="#95a5a6" fill="#ecf0f1" />
        </svg>`
  },
  {
    id: 'nano-assembler',
    name: 'Nano Assembler',
    description: 'A microscale robot capable of incredible precision and self-replication.',
    price: 80,
    stats: { hp: 15, mp: 50, agility: 9, power: 3, defense: 2 },
    rarity: 'common',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="22" y="16" width="20" height="18" rx="2" stroke="#95a5a6" fill="#d5dbdb" />
          <circle cx="29" cy="24" r="2" stroke="#95a5a6" fill="#ecf0f1" />
          <circle cx="35" cy="24" r="2" stroke="#95a5a6" fill="#ecf0f1" />
          <rect x="28" y="34" width="8" height="14" rx="1" stroke="#95a5a6" fill="#d5dbdb" />
          <path d="M22 20 L18 16 M42 20 L46 16" stroke="#95a5a6" />
          <circle cx="32" cy="12" r="3" stroke="#95a5a6" fill="#ecf0f1" />
          <line x1="28" y1="41" x2="36" y2="41" stroke="#95a5a6" />
          <path d="M32 48 L28 56 L36 56" stroke="#95a5a6" />
        </svg>`
  },
  {
    id: 'war-machine',
    name: 'War Machine',
    description: 'A heavily armored combat robot with integrated weapon systems and tactical analysis.',
    price: 190,
    stats: { hp: 80, mp: 30, agility: 5, power: 9, defense: 8 },
    rarity: 'rare',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <rect x="14" y="12" width="36" height="26" rx="2" stroke="#e74c3c" fill="#f5b7b1" />
          <circle cx="26" cy="24" r="4" stroke="#e74c3c" fill="#f9e79f" />
          <circle cx="38" cy="24" r="4" stroke="#e74c3c" fill="#f9e79f" />
          <rect x="20" y="38" width="24" height="14" rx="0" stroke="#e74c3c" fill="#f5b7b1" />
          <path d="M8 24 L14 20 M56 24 L50 20" stroke="#e74c3c" />
          <path d="M14 28 L6 32 L6 40 L14 37" stroke="#e74c3c" fill="#f5b7b1" />
          <path d="M50 28 L58 32 L58 40 L50 37" stroke="#e74c3c" fill="#f5b7b1" />
          <rect x="24" y="12" width="16" height="4" rx="1" stroke="#e74c3c" fill="#f5b7b1" />
          <line x1="20" y1="45" x2="44" y2="45" stroke="#e74c3c" />
        </svg>`
  },
  {
    id: 'data-nexus',
    name: 'Data Nexus',
    description: 'A sophisticated AI hub capable of processing vast amounts of information and manipulating digital realities.',
    price: 290,
    stats: { hp: 50, mp: 95, agility: 6, power: 8, defense: 7 },
    rarity: 'epic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke-width="2">
          <circle cx="32" cy="20" r="14" stroke="#9b59b6" fill="#d7bde2" />
          <circle cx="32" cy="20" r="8" stroke="#9b59b6" fill="#f4ecf7" />
          <circle cx="32" cy="20" r="3" stroke="#9b59b6" fill="#9b59b6" />
          <rect x="24" y="34" width="16" height="16" rx="2" stroke="#9b59b6" fill="#d7bde2" />
          <path d="M24 38 L16 34 M40 38 L48 34" stroke="#9b59b6" />
          <line x1="26" y1="34" x2="26" y2="50" stroke="#9b59b6" />
          <line x1="30" y1="34" x2="30" y2="50" stroke="#9b59b6" />
          <line x1="34" y1="34" x2="34" y2="50" stroke="#9b59b6" />
          <line x1="38" y1="34" x2="38" y2="50" stroke="#9b59b6" />
          <line x1="24" y1="42" x2="40" y2="42" stroke="#9b59b6" />
          <path d="M32 6 L32 2" stroke="#9b59b6" />
          <circle cx="32" cy="2" r="1" stroke="#9b59b6" fill="#9b59b6" />
        </svg>`
  }
];

class MascotService extends ServiceBase {
  constructor() {
    super();
    this.USER_MASCOTS_TABLE = 'user_mascots';
  }

  // Get all available mascots (shop catalog)
  getAllMascots() {
    return MASCOTS;
  }

  // Get a specific mascot by ID
  getMascotById(mascotId) {
    return MASCOTS.find(mascot => mascot.id === mascotId);
  }

  // Get user's mascots
  async getUserMascots(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'getUserMascots', []);
    }
    
    try {
      const mascots = await this.fetchData(this.USER_MASCOTS_TABLE, { user_id: userId });
      
      return mascots.map(mascotData => {
        const baseMascot = this.getMascotById(mascotData.mascot_id);
        if (!baseMascot) {
          console.warn(`Mascot not found for ID: ${mascotData.mascot_id}`);
          return null;
        }
        
        return {
          ...baseMascot,
          id: mascotData.mascot_id,
          level: mascotData.level || 1,
          exp: mascotData.exp || 0,
          nextLevelExp: mascotData.next_level_exp || 100,
          purchasedAt: mascotData.created_at,
          isActive: mascotData.is_active || false
        };
      }).filter(Boolean);
    } catch (err) {
      return this.handleError(err, 'getUserMascots', []);
    }
  }

  // Dispatch event when mascot data is updated
  dispatchMascotUpdatedEvent(userId, activeMascotId = null) {
    this.dispatchEvent(MASCOT_UPDATED_EVENT, { userId, activeMascotId });
  }

  // Get user's active mascot
  async getUserActiveMascot(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'getUserActiveMascot', null);
    }
    
    try {
      // Query mascots with is_active = true instead of using a separate table
      const activeMascots = await this.fetchData(this.USER_MASCOTS_TABLE, { 
        user_id: userId, 
        is_active: true 
      });
      
      if (!activeMascots || activeMascots.length === 0) {
        console.log('No active mascot found for user:', userId);
        return null;
      }
      
      // Get the active mascot data
      const mascotData = activeMascots[0];
      const baseMascot = this.getMascotById(mascotData.mascot_id);
      
      if (!baseMascot) {
        console.warn(`Active mascot with ID ${mascotData.mascot_id} not found in available mascots`);
        return null;
      }
      
      // Return complete mascot data
      return {
        ...baseMascot,
        id: mascotData.mascot_id,
        level: mascotData.level || 1,
        exp: mascotData.exp || 0,
        nextLevelExp: mascotData.next_level_exp || 100,
        purchasedAt: mascotData.created_at,
        isActive: true
      };
    } catch (err) {
      return this.handleError(err, 'getUserActiveMascot', null);
    }
  }

  // Set user's active mascot
  async setUserActiveMascot(userId, mascotId) {
    if (!userId || !mascotId) {
      return {
        success: false,
        message: 'Missing required parameters'
      };
    }
    
    try {
      // Check if the user has this mascot
      const userMascots = await this.getUserMascots(userId);
      const mascotExists = userMascots.some(mascot => mascot.id === mascotId);
      
      if (!mascotExists) {
        return {
          success: false,
          message: 'You do not own this mascot'
        };
      }
      
      // First, update all mascots to set is_active = false
      await this.updateData(
        this.USER_MASCOTS_TABLE,
        { user_id: userId },
        { is_active: false }
      );
      
      // Then set the specified mascot to active
      const result = await this.updateData(
        this.USER_MASCOTS_TABLE,
        { user_id: userId, mascot_id: mascotId },
        { is_active: true }
      );
      
      if (!result.success) {
        return result;
      }
      
      // Dispatch event
      this.dispatchMascotUpdatedEvent(userId, mascotId);
      
      return {
        success: true,
        message: 'Active mascot updated successfully'
      };
    } catch (err) {
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }

  // Purchase a mascot with points
  async purchaseMascot(userId, mascotId) {
    try {
      // Get mascot data first to make sure it's valid
      const mascot = this.getMascotById(mascotId);
      if (!mascot) {
        console.error('Invalid mascot ID:', mascotId);
        return {
          success: false,
          message: 'Invalid mascot ID'
        };
      }
      
      // Check if user already owns this mascot
      const userMascots = await this.fetchData(this.USER_MASCOTS_TABLE, { 
        user_id: userId,
        mascot_id: mascotId
      });
      
      if (userMascots && userMascots.length > 0) {
        return {
          success: false,
          message: 'You already own this mascot'
        };
      }
      
      // Check price and available points
      const points = await PointsService.getUserPoints(userId);
      if (points.points < mascot.price) {
        return {
          success: false,
          message: `Not enough points. You need ${mascot.price} points to purchase this mascot.`,
          requiredPoints: mascot.price,
          currentPoints: points.points
        };
      }
      
      // Check if this is the first mascot the user is purchasing
      const existingMascots = await this.fetchData(this.USER_MASCOTS_TABLE, { user_id: userId });
      const isFirstMascot = !existingMascots || existingMascots.length === 0;
      
      // Add mascot to user's collection
      const newMascotData = {
        user_id: userId,
        mascot_id: mascotId,
        level: 1,
        exp: 0,
        next_level_exp: 100,
        is_active: isFirstMascot, // If it's the first mascot, set it as active
        created_at: new Date().toISOString()
      };
      
      const result = await this.insertData(this.USER_MASCOTS_TABLE, newMascotData);
      
      if (!result.success) {
        return result;
      }
      
      // Deduct points for the purchase
      await PointsService.addPoints(userId, -mascot.price, 'MASCOT_PURCHASE');
      
      // If this is the user's first mascot, set it as active
      if (isFirstMascot) {
        this.dispatchMascotUpdatedEvent(userId, mascotId);
      }
      
      return {
        success: true,
        message: `${mascot.name} purchased successfully!`,
        mascot: {
          ...mascot,
          level: 1,
          exp: 0,
          isActive: isFirstMascot
        }
      };
    } catch (err) {
      console.error('Error purchasing mascot:', err);
      return {
        success: false,
        message: 'An error occurred while purchasing the mascot'
      };
    }
  }

  // Add experience to a mascot
  async addMascotExperience(userId, mascotId, expAmount) {
    if (!userId || !mascotId || !expAmount || expAmount <= 0) {
      return {
        success: false,
        message: 'Invalid parameters for adding experience'
      };
    }
    
    try {
      // Get current mascot data
      const mascots = await this.fetchData(this.USER_MASCOTS_TABLE, {
        user_id: userId,
        mascot_id: mascotId
      });
      
      if (!mascots || mascots.length === 0) {
        return {
          success: false,
          message: 'Mascot not found in your collection'
        };
      }
      
      const mascotData = mascots[0];
      
      // Calculate new experience and level
      const currentExp = mascotData.exp || 0;
      const currentLevel = mascotData.level || 1;
      const expToNextLevel = mascotData.next_level_exp || 100;
      
      let newExp = currentExp + expAmount;
      let newLevel = currentLevel;
      let newExpToNextLevel = expToNextLevel;
      
      // Check if mascot should level up
      if (newExp >= expToNextLevel) {
        newLevel = currentLevel + 1;
        newExp = newExp - expToNextLevel;
        newExpToNextLevel = Math.floor(expToNextLevel * 1.5); // Increase exp needed for next level
      }
      
      // Update mascot data
      const result = await this.updateData(
        this.USER_MASCOTS_TABLE,
        { user_id: userId, mascot_id: mascotId },
        { 
          exp: newExp,
          level: newLevel,
          next_level_exp: newExpToNextLevel
        }
      );
      
      if (!result.success) {
        return result;
      }
      
      // Award points for training mascot
      await PointsService.awardMascotTrainingPoints(userId);
      
      // Dispatch event
      this.dispatchMascotUpdatedEvent(userId, mascotId);
      
      return {
        success: true,
        message: newLevel > currentLevel ? 
          `Your mascot leveled up to level ${newLevel}!` : 
          `Your mascot gained ${expAmount} experience!`,
        mascot: {
          id: mascotId,
          exp: newExp,
          level: newLevel,
          expToNextLevel: newExpToNextLevel,
          leveledUp: newLevel > currentLevel
        }
      };
    } catch (err) {
      return {
        success: false,
        message: 'An error occurred while adding experience'
      };
    }
  }
}

// Export a singleton instance
const mascotServiceInstance = new MascotService();
export default mascotServiceInstance; 