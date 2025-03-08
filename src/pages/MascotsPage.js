import React from 'react';
import { useTranslation } from 'react-i18next';
import MascotsPageContent from '../mascots/MascotsPage';

const MascotsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.mascots', 'Robot Mascots')}</h2>
      <MascotsPageContent />
    </div>
  );
};

export default MascotsPage; 