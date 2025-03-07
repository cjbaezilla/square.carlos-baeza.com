import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import MascotService, { MASCOT_UPDATED_EVENT } from './MascotService';
import MascotDisplay from './MascotDisplay';
import PointsService, { POINTS_UPDATED_EVENT, POINT_VALUES } from '../rewards/PointsService';

const MascotsPage = () => {
  const { user, isSignedIn } = useUser();
  const { t } = useTranslation();
  const [userMascots, setUserMascots] = useState([]);
  const [availableMascots, setAvailableMascots] = useState([]);
  const [activeMascotId, setActiveMascotId] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('collection');
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingMascot, setTrainingMascot] = useState(null);
  const [currentSection, setCurrentSection] = useState('overview');

  // Load user's mascots and available mascots
  useEffect(() => {
    if (isSignedIn && user) {
      const userId = user.id;
      
      // Get user's mascots
      const mascots = MascotService.getUserMascots(userId);
      setUserMascots(mascots);
      
      // Get user's active mascot
      const activeMascot = MascotService.getUserActiveMascot(userId);
      if (activeMascot) {
        setActiveMascotId(activeMascot.id);
      }
      
      // Get user's points
      const userData = PointsService.getUserPoints(userId);
      setUserPoints(userData.points);
      
      // Get all available mascots
      setAvailableMascots(MascotService.getAllMascots());
      
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  // Listen for mascot updates
  useEffect(() => {
    const handleMascotUpdate = (event) => {
      if (isSignedIn && user && event.detail.userId === user.id) {
        const mascots = MascotService.getUserMascots(user.id);
        setUserMascots(mascots);
        
        if (event.detail.activeMascotId) {
          setActiveMascotId(event.detail.activeMascotId);
        }
      }
    };
    
    // Listen for points updates
    const handlePointsUpdate = (event) => {
      if (isSignedIn && user) {
        const userData = PointsService.getUserPoints(user.id);
        setUserPoints(userData.points);
      }
    };
    
    document.addEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
    document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    
    return () => {
      document.removeEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
      document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
    };
  }, [isSignedIn, user]);

  // Handle mascot purchase
  const handlePurchase = (mascotId) => {
    if (isSignedIn && user) {
      const result = MascotService.purchaseMascot(user.id, mascotId);
      
      if (result.success) {
        // Update local state
        setUserMascots(MascotService.getUserMascots(user.id));
        setUserPoints(PointsService.getUserPoints(user.id).points);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: t('mascot.purchaseSuccess', 'Mascot purchased successfully!')
        });
        
        // Switch to collection tab
        setActiveTab('collection');
      } else {
        // Show error notification
        setNotification({
          type: 'error',
          message: t(`mascot.purchaseError.${result.message}`, result.message)
        });
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle activating a mascot
  const handleActivate = (mascotId) => {
    if (isSignedIn && user) {
      MascotService.setUserActiveMascot(user.id, mascotId);
      setActiveMascotId(mascotId);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: t('mascot.activateSuccess', 'Mascot activated!')
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle training a mascot
  const handleTrainMascot = (mascot) => {
    setTrainingMascot(mascot);
    setIsTraining(true);
  };

  // Complete training and award experience
  const completeTraining = () => {
    if (!trainingMascot || !isSignedIn || !user) return;
    
    // Add experience to the mascot
    const experienceGained = Math.floor(Math.random() * 10) + 5; // 5-15 exp
    const updatedMascot = MascotService.addMascotExperience(user.id, trainingMascot.id, experienceGained);
    
    // Award points to user for training
    PointsService.awardMascotTrainingPoints(user.id);
    setUserPoints(PointsService.getUserPoints(user.id).points);
    
    // Update local state with new mascot data
    setUserMascots(MascotService.getUserMascots(user.id));
    
    // Show success notification
    setNotification({
      type: 'success',
      message: t('mascot.trainingSuccess', 'Training complete! {{name}} gained {{exp}} experience.', {
        name: trainingMascot.name,
        exp: experienceGained
      })
    });
    
    // Reset training state
    setIsTraining(false);
    setTrainingMascot(null);
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  // Cancel training
  const cancelTraining = () => {
    setIsTraining(false);
    setTrainingMascot(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl text-gray-200 mb-4">{t('mascot.signInPrompt', 'Sign in to view your mascots')}</h3>
        <p className="text-gray-400">{t('mascot.description', 'Collect unique robot mascots with different abilities!')}</p>
      </div>
    );
  }

  // Render the submenu
  const renderSubmenu = () => (
    <div className="mb-6 border-b border-gray-700">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
        <li className="mr-2">
          <button
            onClick={() => setCurrentSection('overview')}
            className={`inline-flex p-4 border-b-2 rounded-t-lg group ${
              currentSection === 'overview' 
                ? 'text-blue-400 border-blue-400' 
                : 'border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span>{t('mascot.submenu.overview', 'Overview')}</span>
          </button>
        </li>
        <li className="mr-2">
          <button
            onClick={() => {
              setCurrentSection('collection');
              setActiveTab('collection');
            }}
            className={`inline-flex p-4 border-b-2 rounded-t-lg group ${
              currentSection === 'collection' 
                ? 'text-blue-400 border-blue-400' 
                : 'border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span>{t('mascot.submenu.collection', 'My Mascots')}</span>
          </button>
        </li>
        <li className="mr-2">
          <button
            onClick={() => {
              setCurrentSection('store');
              setActiveTab('store');
            }}
            className={`inline-flex p-4 border-b-2 rounded-t-lg group ${
              currentSection === 'store' 
                ? 'text-blue-400 border-blue-400' 
                : 'border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span>{t('mascot.submenu.store', 'Mascot Store')}</span>
          </button>
        </li>
        <li className="mr-2">
          <button
            onClick={() => setCurrentSection('training')}
            className={`inline-flex p-4 border-b-2 rounded-t-lg group ${
              currentSection === 'training' 
                ? 'text-blue-400 border-blue-400' 
                : 'border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span>{t('mascot.submenu.training', 'Training Center')}</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => setCurrentSection('stats')}
            className={`inline-flex p-4 border-b-2 rounded-t-lg group ${
              currentSection === 'stats' 
                ? 'text-blue-400 border-blue-400' 
                : 'border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span>{t('mascot.submenu.stats', 'Mascot Stats')}</span>
          </button>
        </li>
      </ul>
    </div>
  );

  // Render content based on the selected section
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {t('mascot.overview.title', 'Your Robot Mascot Collection')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-2">
                  {t('mascot.overview.collection', 'Collection Progress')}
                </h4>
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">
                      {userMascots.length} / {availableMascots.length} {t('mascot.overview.mascotsCollected', 'Mascots Collected')}
                    </span>
                    <span className="text-sm text-gray-300">
                      {Math.round((userMascots.length / availableMascots.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(userMascots.length / availableMascots.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400">
                  {t('mascot.overview.collectionDescription', 'Collect all mascots to complete your robot collection!')}
                </p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-2">
                  {t('mascot.overview.activeMascot', 'Active Mascot')}
                </h4>
                {activeMascotId ? (
                  <div className="flex items-center">
                    {userMascots.find(m => m.id === activeMascotId) && (
                      <>
                        <div 
                          className="w-16 h-16 mr-4 bg-gray-800 rounded-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ 
                            __html: userMascots.find(m => m.id === activeMascotId).svg 
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-200">
                            {userMascots.find(m => m.id === activeMascotId).name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {t('mascot.level', 'Level')} {userMascots.find(m => m.id === activeMascotId).level}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {t('mascot.overview.noActiveMascot', 'You have no active mascot. Activate one from your collection!')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-2">
                  {t('mascot.overview.points', 'Your Points')}
                </h4>
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {userPoints} <span className="text-sm font-normal text-gray-300">{t('rewards.points', 'Points')}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentSection('store');
                    setActiveTab('store');
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {t('mascot.overview.shopNow', 'Shop for new mascots')} →
                </button>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-2">
                  {t('mascot.overview.quickActions', 'Quick Actions')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setCurrentSection('collection');
                      setActiveTab('collection');
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    {t('mascot.overview.viewCollection', 'View Collection')}
                  </button>
                  
                  <button
                    onClick={() => {
                      setCurrentSection('store');
                      setActiveTab('store');
                    }}
                    className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded"
                  >
                    {t('mascot.overview.visitStore', 'Visit Store')}
                  </button>
                  
                  {userMascots.length > 0 && (
                    <button
                      onClick={() => setCurrentSection('training')}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      {t('mascot.overview.trainMascots', 'Train Mascots')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'collection':
      case 'store':
        return (
          <>
            {/* Show the existing tabs but hide the tab selector */}
            <div className="hidden">
              <button onClick={() => setActiveTab('collection')}></button>
              <button onClick={() => setActiveTab('store')}></button>
            </div>
            
            {activeTab === 'collection' && (
              <>
                {userMascots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">{t('mascot.noMascots', 'You don\'t have any mascots yet.')}</p>
                    <button
                      onClick={() => {
                        setActiveTab('store');
                        setCurrentSection('store');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    >
                      {t('mascot.goToStore', 'Visit Mascot Store')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userMascots.map(mascot => (
                        <div key={mascot.id} className="relative">
                          <MascotDisplay
                            mascot={mascot}
                            isOwned={true}
                            isActive={mascot.id === activeMascotId}
                            onActivate={handleActivate}
                          />
                          <button
                            className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-full"
                            onClick={() => handleTrainMascot(mascot)}
                          >
                            {t('mascot.train', 'Train')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            
            {activeTab === 'store' && (
              <>
                <div className="mb-4">
                  <p className="text-gray-300">{t('mascot.storeDescription', 'Purchase unique robot mascots using your earned points.')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableMascots
                    .filter(mascot => !userMascots.some(m => m.id === mascot.id))
                    .map(mascot => (
                      <MascotDisplay
                        key={mascot.id}
                        mascot={mascot}
                        isOwned={false}
                        onPurchase={handlePurchase}
                      />
                    ))}

                  {availableMascots.length === userMascots.length && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-green-400 text-lg">
                        {t('mascot.collectionComplete', 'Congratulations! You have collected all available mascots.')}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        );
      
      case 'training':
        return (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {t('mascot.trainingCenter.title', 'Mascot Training Center')}
            </h3>
            
            {userMascots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">{t('mascot.noMascots', 'You don\'t have any mascots to train.')}</p>
                <button
                  onClick={() => {
                    setActiveTab('store');
                    setCurrentSection('store');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  {t('mascot.goToStore', 'Visit Mascot Store')}
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-300 mb-4">
                  {t('mascot.trainingCenter.description', 'Choose a mascot to train. Training improves their stats and earns you points!')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userMascots.map(mascot => (
                    <div key={mascot.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => handleTrainMascot(mascot)}
                    >
                      <div className="flex items-center mb-3">
                        <div 
                          className="w-16 h-16 mr-3 bg-gray-800 rounded-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: mascot.svg }}
                        />
                        <div>
                          <div className="font-medium text-gray-200">{mascot.name}</div>
                          <div className="text-sm text-green-400">
                            {t('mascot.level', 'Level')} {mascot.level}
                          </div>
                          <div className="text-xs text-gray-400">
                            {t('mascot.exp', 'EXP')}: {mascot.experience % 100}/100
                          </div>
                        </div>
                      </div>
                      
                      <button
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                      >
                        {t('mascot.trainMascot', 'Train this Mascot')}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
        
      case 'stats':
        return (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {t('mascot.stats.title', 'Mascot Stats Comparison')}
            </h3>
            
            {userMascots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">{t('mascot.noMascots', 'You don\'t have any mascots to compare.')}</p>
                <button
                  onClick={() => {
                    setActiveTab('store');
                    setCurrentSection('store');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  {t('mascot.goToStore', 'Visit Mascot Store')}
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-300 mb-4">
                  {t('mascot.stats.description', 'Compare the stats of your mascots to see their strengths and weaknesses.')}
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-700 rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.mascot', 'Mascot')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.level', 'Level')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.hp', 'HP')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.mp', 'MP')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.agility', 'Agility')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.power', 'Power')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {t('mascot.stats.defense', 'Defense')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {userMascots.map((mascot) => (
                        <tr key={mascot.id} className={mascot.id === activeMascotId ? 'bg-blue-900/20' : ''}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="h-8 w-8 flex-shrink-0 mr-3"
                                dangerouslySetInnerHTML={{ __html: mascot.svg }}
                              />
                              <div className="text-sm font-medium text-gray-200">{mascot.name}</div>
                              {mascot.id === activeMascotId && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-700 text-white">
                                  {t('mascot.active', 'Active')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {mascot.level}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {mascot.stats.hp}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {mascot.stats.mp}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {mascot.stats.agility}/10
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {mascot.stats.power}/10
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                            {mascot.stats.defense}/10
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
                
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* Points display */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-bold text-purple-400">
          {t('mascot.yourMascots', 'Your Robot Mascots')}
        </h3>
        <div className="px-4 py-2 bg-purple-900/50 rounded-lg">
          <span className="text-lg font-bold text-purple-300">{userPoints} {t('rewards.points', 'Points')}</span>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded ${notification.type === 'success' ? 'bg-green-800/50 text-green-200' : 'bg-red-800/50 text-red-200'}`}>
          {notification.message}
        </div>
      )}
      
      {/* Mascot Submenu */}
      {renderSubmenu()}
      
      {/* Section Content */}
      {renderSectionContent()}
      
      {/* Training Modal */}
      {isTraining && trainingMascot && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              {t('mascot.training', 'Training {{name}}', { name: trainingMascot.name })}
            </h3>
            
            <div className="flex justify-center my-6">
              <div
                className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center p-3"
                dangerouslySetInnerHTML={{ __html: trainingMascot.svg }}
              />
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                {t('mascot.trainingDescription', 'Training your mascot will increase its experience and level, making it stronger.')}
              </p>
              <div className="text-sm text-green-400">
                {t('mascot.trainingReward', 'You will earn {{points}} points for completing this training session.', {
                  points: POINT_VALUES.TRAIN_MASCOT
                })}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={cancelTraining}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                {t('mascot.cancel', 'Cancel')}
              </button>
              <button
                onClick={completeTraining}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                {t('mascot.completeTraining', 'Complete Training')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MascotsPage; 