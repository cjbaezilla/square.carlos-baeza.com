import React from 'react';
import { useTranslation } from 'react-i18next';
import UserRewardsPageContent from '../rewards/UserRewardsPage';

const RewardsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{t('sections.rewards', 'Rewards & Points')}</h2>
      <UserRewardsPageContent />
    </div>
  );
};

export default RewardsPage; 