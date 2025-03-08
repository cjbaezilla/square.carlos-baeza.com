import React from 'react';
import { useTranslation } from 'react-i18next';
import ItemsPageContent from '../ItemsPage';

const ItemsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.items', 'Robot Items')}</h2>
      <ItemsPageContent />
    </div>
  );
};

export default ItemsPage; 