import React from 'react';
import { useTranslation } from 'react-i18next';
import MascotService from './MascotService';

const StatBar = ({ label, value, maxValue = 100, color }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="mb-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-medium text-gray-300">{value}/{maxValue}</span>
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
  const { t } = useTranslation();
  
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
  
  return (
    <div className={`rounded-lg ${rarityColorClass} border-2 overflow-hidden shadow-lg transition-all duration-300 ${isActive ? 'ring-4 ring-green-500' : ''} hover:shadow-xl`}>
      <div className="p-4">
        <div className="text-center mb-4">
          <div
            className="w-24 h-24 mx-auto mb-2 p-2 bg-gray-800 rounded-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: mascot.svg }}
          />
          <h3 className="text-xl font-bold text-gray-200">{mascot.name}</h3>
          <div className="text-sm text-gray-400 mb-1 capitalize">{t(`mascot.rarity.${mascot.rarity}`, mascot.rarity)}</div>
          {isOwned && mascot.level && (
            <div className="text-sm text-green-400 mb-2">
              {t('mascot.level', 'Level')}: {mascot.level}
              {mascot.experience && (
                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${(mascot.experience % 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-300 mb-3">{mascot.description}</p>
        
        {showStats && (
          <div className="mb-4">
            <StatBar label="HP" value={mascot.stats.hp} color={statColors.hp} />
            <StatBar label="MP" value={mascot.stats.mp} color={statColors.mp} />
            <StatBar label={t('mascot.stats.agility', 'Agility')} value={mascot.stats.agility} maxValue={10} color={statColors.agility} />
            <StatBar label={t('mascot.stats.power', 'Power')} value={mascot.stats.power} maxValue={10} color={statColors.power} />
            <StatBar label={t('mascot.stats.defense', 'Defense')} value={mascot.stats.defense} maxValue={10} color={statColors.defense} />
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {!isOwned ? (
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 font-bold">{mascot.price} {t('rewards.points', 'Points')}</span>
              <button
                onClick={() => onPurchase(mascot.id)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors"
              >
                {t('mascot.purchase', 'Purchase')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {!isActive ? (
                <button
                  onClick={() => onActivate(mascot.id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                >
                  {t('mascot.activate', 'Activate')}
                </button>
              ) : (
                <span className="px-3 py-1 bg-green-700 text-white text-sm font-medium rounded">
                  {t('mascot.active', 'Active')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MascotDisplay; 