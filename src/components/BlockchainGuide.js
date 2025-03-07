import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import PointsService from '../rewards/PointsService';

const BlockchainGuide = () => {
  const { t } = useTranslation();
  const [activeTopic, setActiveTopic] = useState(null);
  const { user, isSignedIn } = useUser();

  // Award points for viewing a topic
  useEffect(() => {
    if (isSignedIn && user && activeTopic) {
      // Award points for viewing the guide
      PointsService.awardGuideViewPoints(user.id);
    }
  }, [activeTopic, isSignedIn, user]);

  const topics = [
    {
      id: 'metamask',
      title: t('blockchainGuide.topics.metamask.title'),
      content: `
        <h3>${t('blockchainGuide.topics.metamask.heading')}</h3>
        <p>${t('blockchainGuide.topics.metamask.description')}</p>
        
        <p>${t('blockchainGuide.topics.metamask.whatItDoes')}</p>
        <ul>
          <li>${t('blockchainGuide.topics.metamask.items.0')}</li>
          <li>${t('blockchainGuide.topics.metamask.items.1')}</li>
          <li>${t('blockchainGuide.topics.metamask.items.2')}</li>
        </ul>
        
        <p>${t('blockchainGuide.topics.metamask.comparison')}</p>
      `
    },
    {
      id: 'web3',
      title: t('blockchainGuide.topics.web3.title'),
      content: `
        <h3>${t('blockchainGuide.topics.web3.heading')}</h3>
        <p>${t('blockchainGuide.topics.web3.description')}</p>
        
        <p>${t('blockchainGuide.topics.web3.comparison')}</p>
        <ul>
          <li>${t('blockchainGuide.topics.web3.items.0')}</li>
          <li>${t('blockchainGuide.topics.web3.items.1')}</li>
          <li>${t('blockchainGuide.topics.web3.items.2')}</li>
        </ul>
        
        <p>${t('blockchainGuide.topics.web3.dapps')}</p>
      `
    },
    {
      id: 'ethereum',
      title: t('blockchainGuide.topics.ethereum.title'),
      content: `
        <h3>${t('blockchainGuide.topics.ethereum.heading')}</h3>
        <p>${t('blockchainGuide.topics.ethereum.description')}</p>
        
        <p>${t('blockchainGuide.topics.ethereum.keyThings')}</p>
        <ul>
          <li>${t('blockchainGuide.topics.ethereum.items.0')}</li>
          <li>${t('blockchainGuide.topics.ethereum.items.1')}</li>
          <li>${t('blockchainGuide.topics.ethereum.items.2')}</li>
        </ul>
        
        <p>${t('blockchainGuide.topics.ethereum.platform')}</p>
      `
    },
    {
      id: 'evm',
      title: t('blockchainGuide.topics.evm.title'),
      content: `
        <h3>${t('blockchainGuide.topics.evm.heading')}</h3>
        <p>${t('blockchainGuide.topics.evm.description')}</p>
        
        <p>${t('blockchainGuide.topics.evm.understanding')}</p>
        <ul>
          <li>${t('blockchainGuide.topics.evm.items.0')}</li>
          <li>${t('blockchainGuide.topics.evm.items.1')}</li>
          <li>${t('blockchainGuide.topics.evm.items.2')}</li>
        </ul>
        
        <p>${t('blockchainGuide.topics.evm.importance')}</p>
      `
    },
    {
      id: 'defi',
      title: t('blockchainGuide.topics.defi.title'),
      content: `
        <h3>${t('blockchainGuide.topics.defi.heading')}</h3>
        <p>${t('blockchainGuide.topics.defi.description')}</p>
        
        <p>${t('blockchainGuide.topics.defi.allows')}</p>
        <ul>
          <li>${t('blockchainGuide.topics.defi.items.0')}</li>
          <li>${t('blockchainGuide.topics.defi.items.1')}</li>
          <li>${t('blockchainGuide.topics.defi.items.2')}</li>
          <li>${t('blockchainGuide.topics.defi.items.3')}</li>
          <li>${t('blockchainGuide.topics.defi.items.4')}</li>
        </ul>
        
        <p>${t('blockchainGuide.topics.defi.difference')}</p>
      `
    },
    {
      id: 'nfts',
      title: t('blockchainGuide.topics.nfts.title'),
      content: `
        <h3>${t('blockchainGuide.topics.nfts.heading')}</h3>
        <p>${t('blockchainGuide.topics.nfts.description')}</p>
        
        <p>${t('blockchainGuide.topics.nfts.nonFungible')}</p>
        
        <p>${t('blockchainGuide.topics.nfts.represent')}</p>
        <ul>
          <li>${t('blockchainGuide.topics.nfts.items.0')}</li>
          <li>${t('blockchainGuide.topics.nfts.items.1')}</li>
          <li>${t('blockchainGuide.topics.nfts.items.2')}</li>
          <li>${t('blockchainGuide.topics.nfts.items.3')}</li>
          <li>${t('blockchainGuide.topics.nfts.items.4')}</li>
          <li>${t('blockchainGuide.topics.nfts.items.5')}</li>
        </ul>
        
        <p>${t('blockchainGuide.topics.nfts.ownership')}</p>
      `
    }
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">{t('blockchainGuide.title')}</h2>
      <p className="text-gray-300 mb-6">
        {t('blockchainGuide.intro')}
      </p>
      
      <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
            className={`px-3 py-2 rounded text-center transition-colors duration-300 ${
              activeTopic === topic.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {topic.title}
          </button>
        ))}
      </div>
      
      {activeTopic && (
        <div className="mt-6 animate-fadeIn">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div 
              className="text-gray-200 blockchain-guide-content"
              dangerouslySetInnerHTML={{ 
                __html: topics.find(t => t.id === activeTopic).content 
              }}
            />
            
            <button
              onClick={() => setActiveTopic(null)}
              className="mt-4 text-gray-400 hover:text-gray-200 text-sm flex items-center"
            >
              <span>{t('blockchainGuide.close')}</span>
            </button>
          </div>
        </div>
      )}
      
      {!activeTopic && (
        <div className="text-gray-300 p-4 bg-gray-700 rounded-lg">
          <p className="text-center">{t('blockchainGuide.selectTopic')}</p>
        </div>
      )}
      
      <div className="mt-6 text-gray-400 text-sm">
        <p>{t('blockchainGuide.evolving')}</p>
      </div>
    </div>
  );
};

export default BlockchainGuide; 