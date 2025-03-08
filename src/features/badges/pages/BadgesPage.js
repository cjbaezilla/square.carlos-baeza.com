import React from 'react';
import { useTranslation } from 'react-i18next';
import BadgesPageContent from '../BadgesPage';

const BadgesPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.badges', 'User Badges')}</h2>
      <BadgesPageContent />
    </div>
  );
};

export default BadgesPage; 