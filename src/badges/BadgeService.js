import React from 'react';
import i18next from 'i18next';
import PointsService from '../rewards/PointsService';

// Badge definitions with metadata - using translation keys
export const BADGES = {
  EARLY_ADOPTER: {
    id: 'early_adopter',
    nameKey: 'badges.badgeNames.earlyAdopter',
    descriptionKey: 'badges.badgeDescriptions.earlyAdopter',
    color: '#5E60CE',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#5E60CE" stroke="#7678ED" strokeWidth="2" />
        <path d="M50 20 L55 35 L70 35 L60 45 L65 60 L50 50 L35 60 L40 45 L30 35 L45 35 Z" fill="#FFFFFF" />
        <text x="50" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="Arial, sans-serif">Early Adopter</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Early Adopter',
    description: 'Joined during our platform launch phase',
  },
  WEB3_EXPLORER: {
    id: 'web3_explorer',
    nameKey: 'badges.badgeNames.web3Explorer',
    descriptionKey: 'badges.badgeDescriptions.web3Explorer',
    color: '#06D6A0',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#06D6A0" stroke="#079F79" strokeWidth="2" />
        <circle cx="50" cy="50" r="25" fill="#079F79" />
        <path d="M40,40 L60,40 L60,60 L40,60 Z" fill="#FFFFFF" />
        <path d="M65,35 L70,40 L65,45" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M65,55 L70,60 L65,65" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M35,35 L30,40 L35,45" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M35,55 L30,60 L35,65" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Web3 Explorer',
    description: 'Connected a Web3 wallet to their account',
  },
  BLOCKCHAIN_MASTER: {
    id: 'blockchain_master', 
    nameKey: 'badges.badgeNames.blockchainMaster',
    descriptionKey: 'badges.badgeDescriptions.blockchainMaster',
    color: '#FF9F1C',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#FF9F1C" stroke="#F7B32B" strokeWidth="2" />
        <g transform="translate(50, 50)">
          <path d="M0,-30 L20,-20 L20,20 L0,30 L-20,20 L-20,-20 Z" fill="#F7B32B" />
          <path d="M0,-15 L10,-10 L10,10 L0,15 L-10,10 L-10,-10 Z" fill="#FFFFFF" />
        </g>
        <circle cx="50" cy="50" r="5" fill="#F7B32B" />
        <text x="50" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="Arial, sans-serif">Blockchain Master</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Blockchain Master',
    description: 'Demonstrated deep knowledge of blockchain concepts',
  },
  COMMUNITY_PILLAR: {
    id: 'community_pillar',
    nameKey: 'badges.badgeNames.communityPillar',
    descriptionKey: 'badges.badgeDescriptions.communityPillar',
    color: '#5271FF',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect x="15" y="15" width="70" height="70" rx="10" fill="#5271FF" stroke="#3A56F0" strokeWidth="2" />
        <circle cx="35" cy="40" r="8" fill="#FFFFFF" />
        <circle cx="65" cy="40" r="8" fill="#FFFFFF" />
        <circle cx="50" cy="65" r="8" fill="#FFFFFF" />
        <line x1="35" y1="40" x2="65" y2="40" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="35" y1="40" x2="50" y2="65" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="65" y1="40" x2="50" y2="65" stroke="#FFFFFF" strokeWidth="2" />
        <text x="50" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="Arial, sans-serif">Community Pillar</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Community Pillar',
    description: 'Active contributor to our growing community',
  },
  CRYPTO_WIZARD: {
    id: 'crypto_wizard',
    nameKey: 'badges.badgeNames.cryptoWizard',
    descriptionKey: 'badges.badgeDescriptions.cryptoWizard',
    color: '#9B5DE5',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M50,10 L65,40 L95,45 L70,65 L80,95 L50,80 L20,95 L30,65 L5,45 L35,40 Z" fill="#9B5DE5" stroke="#7B4FB5" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill="#7B4FB5" />
        <path d="M45,45 L55,55 M45,55 L55,45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <text x="50" y="90" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif">Crypto Wizard</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Crypto Wizard',
    description: 'Successfully completed advanced crypto transactions',
  },
};

// Class to manage user badges
class BadgeService {
  // Get badges for a user
  static getUserBadges(userId) {
    if (!userId) return [];
    
    const storedBadges = localStorage.getItem(`user_badges_${userId}`);
    return storedBadges ? JSON.parse(storedBadges) : [];
  }

  // Add the isValidBadgeId method
  static isValidBadgeId(badgeId) {
    // Check if the badge exists in our BADGES object
    return Object.values(BADGES).some(badge => badge.id === badgeId);
  }

  // Award a badge to a user
  static awardBadge(userId, badgeId) {
    if (!userId || !badgeId || !this.isValidBadgeId(badgeId)) {
      return false;
    }

    // Check if user already has this badge
    if (this.hasBadge(userId, badgeId)) {
      return false; // User already has the badge
    }

    const userBadges = this.getUserBadges(userId);
    userBadges.push({
      id: badgeId,
      dateAwarded: new Date().toISOString()
    });

    // Save updated badges
    localStorage.setItem(`user_badges_${userId}`, JSON.stringify(userBadges));

    // Award points for earning a badge
    PointsService.awardBadgePoints(userId);

    return true;
  }

  // Check if a user has a specific badge
  static hasBadge(userId, badgeId) {
    if (!userId || !badgeId) return false;
    
    const userBadges = this.getUserBadges(userId);
    // Check if the user has a badge with the given ID
    return userBadges.some(badge => badge.id === badgeId);
  }

  // Remove a badge from a user
  static removeBadge(userId, badgeId) {
    if (!userId || !badgeId) return false;
    
    const userBadges = this.getUserBadges(userId);
    const updatedBadges = userBadges.filter(badge => badge.id !== badgeId);
    
    if (updatedBadges.length !== userBadges.length) {
      localStorage.setItem(`user_badges_${userId}`, JSON.stringify(updatedBadges));
      return true;
    }
    
    return false;
  }

  // Get badge details by ID
  static getBadgeDetails(badgeId) {
    const badge = Object.values(BADGES).find(badge => badge.id === badgeId);
    
    if (badge) {
      // Create a copy of the badge with translated name and description
      return {
        ...badge,
        // Use i18next to translate the name and description, falling back to the original values
        name: i18next.t(badge.nameKey, badge.name),
        description: i18next.t(badge.descriptionKey, badge.description)
      };
    }
    
    return null;
  }

  // Method to automatically check and award badges based on user actions/state
  static checkAndAwardBadges(user) {
    if (!user) return;
    
    const userId = user.id;
    
    // Logic for Early Adopter badge
    // This could be based on registration date or other criteria
    if (user.createdAt) {
      const registrationDate = new Date(user.createdAt);
      const launchEndDate = new Date('2025-06-01'); // Example launch phase end date
      
      // Only award if the date is valid
      if (!isNaN(registrationDate.getTime()) && registrationDate < launchEndDate) {
        this.awardBadge(userId, 'early_adopter');
      }
    }
    
    // Logic for Web3 Explorer badge - if user has connected a wallet
    if (user.primaryWeb3Wallet?.web3Wallet) {
      this.awardBadge(userId, 'web3_explorer');
    }
    
    // Additional logic for other badges would go here
    // For example, you could track user interactions and award badges accordingly
  }
}

export default BadgeService; 