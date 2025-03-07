import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import MascotService, { MASCOT_UPDATED_EVENT } from './MascotService';

const MascotProfile = ({ small = false }) => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [activeMascot, setActiveMascot] = useState(null);

  // Load active mascot
  useEffect(() => {
    if (isSignedIn && user) {
      const mascot = MascotService.getUserActiveMascot(user.id);
      setActiveMascot(mascot);
    }
  }, [isSignedIn, user]);

  // Listen for mascot updates
  useEffect(() => {
    const handleMascotUpdate = (event) => {
      if (isSignedIn && user && event.detail.userId === user.id) {
        const mascot = MascotService.getUserActiveMascot(user.id);
        setActiveMascot(mascot);
      }
    };
    
    document.addEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    
    return () => {
      document.removeEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    };
  }, [isSignedIn, user]);

  if (!isSignedIn || !activeMascot) {
    return null;
  }

  return (
    <div className={`${small ? 'mb-2' : 'mb-4'} ${small ? '' : 'p-3'} rounded-lg bg-opacity-20 bg-gray-700 flex items-center`}>
      <div 
        className={`${small ? 'w-8 h-8' : 'w-12 h-12'} flex-shrink-0 bg-gray-800 rounded-full flex items-center justify-center p-1 mr-2`}
        dangerouslySetInnerHTML={{ __html: activeMascot.svg }}
      />
      <div>
        <div className={`font-medium ${small ? 'text-sm' : 'text-md'} text-gray-300`}>
          {activeMascot.name}
        </div>
        {!small && (
          <div className="text-xs text-gray-400">
            {t('mascot.level', 'Level')} {activeMascot.level} 
            <span className="ml-1 text-purple-400">
              ({t('mascot.stats.hp', 'HP')}: {activeMascot.stats.hp} / {t('mascot.stats.mp', 'MP')}: {activeMascot.stats.mp})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MascotProfile; 