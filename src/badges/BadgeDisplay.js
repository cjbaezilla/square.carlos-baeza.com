import React, { useState, useEffect } from 'react';
import BadgeService from './BadgeService';
import { useTranslation } from 'react-i18next';

// Size classes object moved outside to be accessible by both components
const sizeClasses = {
  'sm': 'w-8 h-8',
  'md': 'w-12 h-12',
  'lg': 'w-16 h-16',
  'xl': 'w-20 h-20'
};

// Component to display a single badge
const Badge = ({ badge, size = 'md', showTooltip = true }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const badgeSize = sizeClasses[size] || sizeClasses.md;
  
  if (!badge) return null;
  
  return (
    <div className="relative">
      <div 
        className={`${badgeSize} cursor-pointer transition-transform duration-300 hover:scale-110`}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => showTooltip && setShowDetails(false)}
        onClick={() => showTooltip && setShowDetails(!showDetails)}
      >
        {badge.svg}
      </div>
      
      {showDetails && showTooltip && (
        <div className="absolute z-10 w-48 bg-gray-800 p-2 rounded-md shadow-lg text-white text-sm -top-2 left-full ml-2">
          <h3 className="font-bold">{badge.name}</h3>
          <p className="text-gray-300 text-xs">{badge.description}</p>
        </div>
      )}
    </div>
  );
};

// Component to display all badges for a user
const BadgeDisplay = ({ userId, size = 'md', showEmpty = true, limit = null, className = '' }) => {
  const [badges, setBadges] = useState([]);
  const { t } = useTranslation();
  
  useEffect(() => {
    if (userId) {
      const userBadges = BadgeService.getUserBadges(userId);
      // Map badge objects to their details
      const badgeDetails = userBadges.map(badge => ({
        ...BadgeService.getBadgeDetails(badge.id),
        dateAwarded: badge.dateAwarded
      })).filter(Boolean);
      setBadges(badgeDetails);
    }
  }, [userId]);
  
  // If no badges and not showing empty state
  if (badges.length === 0 && !showEmpty) {
    return null;
  }

  // If limit is provided, only show that many badges
  const displayBadges = limit ? badges.slice(0, limit) : badges;
  
  return (
    <div className={`${className}`}>
      {badges.length === 0 ? (
        <div className="text-gray-400 text-sm italic">{t('badges.noBadges', 'No badges earned yet')}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayBadges.map(badge => (
            <Badge 
              key={badge.id} 
              badge={badge} 
              size={size}
            />
          ))}
          
          {limit && badges.length > limit && (
            <div className={`${sizeClasses[size] || sizeClasses.md} bg-gray-700 rounded-full flex items-center justify-center text-white font-bold`}>
              +{badges.length - limit}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { BadgeDisplay, Badge };
export default BadgeDisplay; 