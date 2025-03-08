import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation();

  return (
    <nav className="mb-6">
      <div className="flex flex-wrap gap-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`
          }
        >
          {t('nav.home', 'Home')}
        </NavLink>
        <NavLink 
          to="/badges" 
          className={({ isActive }) => 
            `px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`
          }
        >
          {t('nav.badges', 'Badges')}
        </NavLink>
        <NavLink 
          to="/rewards" 
          className={({ isActive }) => 
            `px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`
          }
        >
          {t('nav.rewards', 'Rewards')}
        </NavLink>
        <NavLink 
          to="/mascots" 
          className={({ isActive }) => 
            `px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`
          }
        >
          {t('nav.mascots', 'Mascots')}
        </NavLink>
        <NavLink 
          to="/items" 
          className={({ isActive }) => 
            `px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`
          }
        >
          {t('nav.items', 'Items')}
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation; 