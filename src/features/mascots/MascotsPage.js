import React, { useState, useEffect, useRef } from 'react';
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
  const intervalRef = useRef(null); // Reference for the points update interval

  // Load user's mascots and available mascots
  useEffect(() => {
    const loadData = async () => {
      if (isSignedIn && user) {
        setIsLoading(true);
        const userId = user.id;
        
        try {
          // Get user's mascots
          const mascots = await MascotService.getUserMascots(userId);
          setUserMascots(mascots);
          
          // Get user's active mascot
          const activeMascot = await MascotService.getUserActiveMascot(userId);
          if (activeMascot) {
            setActiveMascotId(activeMascot.id);
          }
          
          // Get user's points
          const userData = await PointsService.getUserPoints(userId);
          if (userData) {
            setUserPoints(userData.points);
          }
          
          // Get all available mascots
          setAvailableMascots(MascotService.getAllMascots());
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading mascot data:', error);
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [isSignedIn, user]);

  // Set up points polling interval and listeners
  useEffect(() => {
    if (isSignedIn && user) {
      const userId = user.id;
      
      // Function to fetch points from Supabase
      const fetchPointsFromSupabase = async () => {
        try {
          const userData = await PointsService.getUserPoints(userId);
          if (userData) {
            setUserPoints(userData.points);
          }
        } catch (error) {
          console.error('Error fetching user points:', error);
        }
      };
      
      // Set up interval to fetch points every 5 seconds
      intervalRef.current = setInterval(fetchPointsFromSupabase, 5000);
      
      // Listen for mascot updates
      const handleMascotUpdate = async (event) => {
        if (event.detail.userId === userId) {
          try {
            const mascots = await MascotService.getUserMascots(userId);
            setUserMascots(mascots);
            
            if (event.detail.activeMascotId) {
              setActiveMascotId(event.detail.activeMascotId);
            }
          } catch (error) {
            console.error('Error handling mascot update:', error);
          }
        }
      };
      
      // Listen for points updates
      const handlePointsUpdate = async (event) => {
        // Only update points when the event is for this user
        if (event.detail.pointsData && event.detail.pointsData[userId]) {
          const pointsData = event.detail.pointsData[userId];
          setUserPoints(pointsData.points);
        }
      };
      
      document.addEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
      document.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
      
      return () => {
        // Clear interval and remove event listeners on cleanup
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        document.removeEventListener(MASCOT_UPDATED_EVENT, handleMascotUpdate);
        document.removeEventListener(POINTS_UPDATED_EVENT, handlePointsUpdate);
      };
    }
  }, [isSignedIn, user]);

  // Handle mascot purchase
  const handlePurchase = async (mascotId) => {
    if (isSignedIn && user) {
      try {
        setIsLoading(true);
        const result = await MascotService.purchaseMascot(user.id, mascotId);
        
        if (result.success) {
          // Update local state
          const mascots = await MascotService.getUserMascots(user.id);
          setUserMascots(mascots);
          
          const userData = await PointsService.getUserPoints(user.id);
          setUserPoints(userData.points);
          
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
        
        setIsLoading(false);
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error purchasing mascot:', error);
        setIsLoading(false);
        
        // Show error notification
        setNotification({
          type: 'error',
          message: t('mascot.purchaseError.unknown', 'An error occurred while purchasing the mascot')
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Handle activating a mascot
  const handleActivate = async (mascotId) => {
    if (isSignedIn && user) {
      try {
        setIsLoading(true);
        await MascotService.setUserActiveMascot(user.id, mascotId);
        setActiveMascotId(mascotId);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: t('mascot.activateSuccess', 'Mascot activated!')
        });
        
        setIsLoading(false);
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error activating mascot:', error);
        setIsLoading(false);
        
        // Show error notification
        setNotification({
          type: 'error',
          message: t('mascot.activateError', 'An error occurred while activating the mascot')
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  // Handle training a mascot
  const handleTrainMascot = (mascot) => {
    setTrainingMascot(mascot);
    setIsTraining(true);
  };

  // Complete training and award experience
  const completeTraining = async () => {
    if (!trainingMascot || !isSignedIn || !user) return;
    
    try {
      setIsLoading(true);
      
      // Add experience to the mascot
      const experienceGained = Math.floor(Math.random() * 10) + 5; // 5-15 exp
      await MascotService.addMascotExperience(user.id, trainingMascot.id, experienceGained);
      
      // Award points to user for training
      await PointsService.awardMascotTrainingPoints(user.id);
      const userData = await PointsService.getUserPoints(user.id);
      setUserPoints(userData.points);
      
      // Update local state with new mascot data
      const mascots = await MascotService.getUserMascots(user.id);
      setUserMascots(mascots);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: t('mascot.trainingSuccess', 'Training complete! {{name}} gained {{exp}} experience.', {
          name: t(`mascots.names.${trainingMascot.id}`, trainingMascot.name),
          exp: experienceGained
        })
      });
      
      // Reset training state
      setIsTraining(false);
      setTrainingMascot(null);
      setIsLoading(false);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error completing training:', error);
      setIsLoading(false);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: t('mascot.trainingError', 'An error occurred during training')
      });
      
      // Reset training state
      setIsTraining(false);
      setTrainingMascot(null);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
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
            <span>{t('mascot.submenu.collection', 'Your Collection')}</span>
          </button>
        </li>
        <li className="mr-2">
          <button
            onClick={() => {
              setCurrentSection('shop');
              setActiveTab('shop');
            }}
            className={`inline-flex p-4 border-b-2 rounded-t-lg group ${
              currentSection === 'shop' 
                ? 'text-blue-400 border-blue-400' 
                : 'border-transparent hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span>{t('mascot.submenu.shop', 'Mascot Shop')}</span>
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
                            {t(`mascots.names.${activeMascotId}`, userMascots.find(m => m.id === activeMascotId).name)}
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
                    setCurrentSection('shop');
                    setActiveTab('shop');
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
                      setCurrentSection('shop');
                      setActiveTab('shop');
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
      case 'shop':
        return (
          <>
            {/* Show the existing tabs but hide the tab selector */}
            <div className="hidden">
              <button onClick={() => setActiveTab('collection')}></button>
              <button onClick={() => setActiveTab('shop')}></button>
            </div>
            
            {activeTab === 'collection' && (
              <>
                {userMascots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">{t('mascot.noMascots', 'You don\'t have any mascots yet.')}</p>
                    <button
                      onClick={() => {
                        setActiveTab('shop');
                        setCurrentSection('shop');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    >
                      {t('mascot.goToStore', 'Visit Mascot Shop')}
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
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            
            {activeTab === 'shop' && (
              <>
                <div className="mb-4">
                  <p className="text-gray-300">{t('mascot.shopDescription', 'Purchase unique robot mascots using your earned points.')}</p>
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
                    setActiveTab('shop');
                    setCurrentSection('shop');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  {t('mascot.goToStore', 'Visit Mascot Shop')}
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
                          <div className="font-medium text-gray-200">{t(`mascots.names.${mascot.id}`, mascot.name)}</div>
                          <div className="text-xs text-gray-400">{t(`mascots.descriptions.${mascot.id}`, mascot.description)}</div>
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
                    setActiveTab('shop');
                    setCurrentSection('shop');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  {t('mascot.goToStore', 'Visit Mascot Shop')}
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
                              <div className="text-sm font-medium text-gray-200">{t(`mascots.names.${mascot.id}`, mascot.name)}</div>
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
              {t('mascot.training', 'Training {{name}}', { name: t(`mascots.names.${trainingMascot.id}`, trainingMascot.name) })}
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