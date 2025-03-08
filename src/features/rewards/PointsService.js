/**
 * PointsService.js
 * Service for managing user points system with Supabase persistence
 */

import ServiceBase from '../../shared/utils/ServiceBase';

// Points awarded for different actions
export const POINT_VALUES = {
  LOGIN: 5,           // Points for daily login
  COMPLETE_PROFILE: 10, // Points for completing profile
  VIEW_GUIDE: 3,      // Points for viewing guides
  EARN_BADGE: 15,     // Points for earning a badge
  TRAIN_MASCOT: 2,     // Points for training mascots
};

// Create a custom event for points updates
export const POINTS_UPDATED_EVENT = 'points-updated';

// Points System Class
class PointsService extends ServiceBase {
  constructor() {
    super();
    this.USER_POINTS_TABLE = 'user_points';
    // Remove the separate actions table since it doesn't exist
    
    // Clean up localStorage on initialization - reference removed
    this.clearLocalStorageData();
  }

  // Clean all localStorage data for points
  clearLocalStorageData() {
    // localStorage references removed
    console.log('localStorage references have been removed');
  }

  // Initialize user points data if not exists
  async initUserData(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'initUserData', null);
    }
    
    try {
      // Check if user already exists in the database
      const userData = await this.fetchData(this.USER_POINTS_TABLE, { user_id: userId });
      
      // If user doesn't exist, create entry
      if (!userData || userData.length === 0) {
        // Insert new user data
        const newUserData = {
          user_id: userId,
          points: 0,
          level: 1,
          completed_actions: {} // Store completed actions in the same table
        };
        
        const result = await this.insertData(this.USER_POINTS_TABLE, newUserData);
        if (!result.success) {
          return this.handleError(new Error(result.message), 'initUserData', null);
        }
        
        return this.formatUserData(newUserData);
      }
      
      return this.formatUserData(userData[0]);
    } catch (err) {
      return this.handleError(err, 'initUserData', null);
    }
  }

  // Format user data from DB to application format
  formatUserData(dbData) {
    if (!dbData) return null;
    
    return {
      userId: dbData.user_id,
      points: dbData.points || 0,
      level: dbData.level || 1
    };
  }

  // Get all points data (admin only)
  async getAllPointsData() {
    try {
      const data = await this.fetchData(this.USER_POINTS_TABLE);
      
      return data.map(this.formatUserData).filter(Boolean);
    } catch (err) {
      return this.handleError(err, 'getAllPointsData', []);
    }
  }

  // Dispatch points updated event
  dispatchPointsUpdatedEvent(userData, userId) {
    this.dispatchEvent(POINTS_UPDATED_EVENT, {
      userId, 
      userData,
      timestamp: Date.now()
    });
  }

  // Get user's points
  async getUserPoints(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'getUserPoints', null);
    }
    
    try {
      // Initialize data if it doesn't exist
      await this.initUserData(userId);
      
      // Get user's points
      const userData = await this.fetchData(this.USER_POINTS_TABLE, { user_id: userId });
      
      if (!userData || userData.length === 0) {
        return { points: 0, level: 1 };
      }
      
      return { 
        points: userData[0].points || 0, 
        level: userData[0].level || 1 
      };
    } catch (err) {
      return this.handleError(err, 'getUserPoints', { points: 0, level: 1 });
    }
  }

  // Get completed actions for a user
  async getUserCompletedActions(userId) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'getUserCompletedActions', {});
    }
    
    try {
      // Get actions from the user_points table
      const userData = await this.fetchData(this.USER_POINTS_TABLE, { user_id: userId });
      
      if (!userData || userData.length === 0) {
        return {};
      }
      
      return userData[0].completed_actions || {};
    } catch (err) {
      return this.handleError(err, 'getUserCompletedActions', {});
    }
  }

  // Save user's completed actions
  async saveUserCompletedActions(userId, actionsData) {
    if (!userId) {
      return this.handleError(new Error('Invalid userId'), 'saveUserCompletedActions', false);
    }
    
    try {
      // Update completed_actions in the user_points table
      const result = await this.updateData(
        this.USER_POINTS_TABLE,
        { user_id: userId },
        { completed_actions: actionsData }
      );
      
      return result.success;
    } catch (err) {
      return this.handleError(err, 'saveUserCompletedActions', false);
    }
  }

  // Add points to user
  async addPoints(userId, amount, actionType = 'OTHER') {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return this.handleError(
        new Error(`Invalid parameters: userId=${userId}, amount=${amount}`), 
        'addPoints', 
        { points: 0, level: 1 }
      );
    }
    
    try {
      // Initialize data if it doesn't exist
      await this.initUserData(userId);
      
      // Get current points
      const { points: currentPoints, level: currentLevel } = await this.getUserPoints(userId);
      
      // Calculate new points and level
      const newPoints = currentPoints + amount;
      const newLevel = this.calculateLevel(newPoints);
      
      // Update in database
      const result = await this.updateData(
        this.USER_POINTS_TABLE,
        { user_id: userId },
        { 
          points: newPoints, 
          level: newLevel 
        }
      );
      
      if (!result.success) {
        return this.handleError(new Error(result.message), 'addPoints', { points: currentPoints, level: currentLevel });
      }
      
      // Create result object
      const userData = {
        points: newPoints,
        level: newLevel,
        pointsAdded: amount,
        levelUp: newLevel > currentLevel,
        actionType
      };
      
      // Dispatch event
      this.dispatchPointsUpdatedEvent(userData, userId);
      
      return userData;
    } catch (err) {
      return this.handleError(err, 'addPoints', { points: 0, level: 1 });
    }
  }

  // Record that a user has completed an action
  async recordCompletedAction(userId, actionType, onlyOnce = false) {
    try {
      // Get current actions
      const actions = await this.getUserCompletedActions(userId);
      
      // If action should only be rewarded once and it's already been done
      if (onlyOnce && actions[actionType]) {
        return false;
      }
      
      // For actions that can be done once per day (like login)
      if (actionType === 'LOGIN') {
        const today = new Date().toDateString();
        if (actions[actionType] === today) {
          return false; // Already logged in today
        }
        actions[actionType] = today;
      } else {
        // For counting actions (like viewing guides)
        actions[actionType] = (actions[actionType] || 0) + 1;
      }
      
      await this.saveUserCompletedActions(userId, actions);
      return true;
    } catch (err) {
      return this.handleError(err, 'recordCompletedAction', false);
    }
  }

  // Calculate user level based on points
  calculateLevel(points) {
    // Simple formula: level = 1 + Math.floor(points / 100)
    return 1 + Math.floor(points / 100);
  }

  // Award points for different actions if they haven't been awarded already
  async awardPointsForAction(userId, actionType, onlyOnce = false) {
    // Check if user can receive points for this action
    const canReceivePoints = await this.recordCompletedAction(userId, actionType, onlyOnce);
    
    if (canReceivePoints) {
      // Award points if action is valid
      const pointsToAward = POINT_VALUES[actionType] || 0;
      if (pointsToAward > 0) {
        return await this.addPoints(userId, pointsToAward);
      }
    }
    
    return await this.getUserPoints(userId);
  }

  // Award points for daily login
  async awardLoginPoints(userId) {
    return await this.awardPointsForAction(userId, 'LOGIN');
  }

  // Award points for completing profile
  async awardProfileCompletionPoints(userId) {
    return await this.awardPointsForAction(userId, 'COMPLETE_PROFILE', true);
  }

  // Award points for viewing guides
  async awardGuideViewPoints(userId) {
    return await this.awardPointsForAction(userId, 'VIEW_GUIDE');
  }

  // Award points for earning a badge
  async awardBadgePoints(userId) {
    return await this.awardPointsForAction(userId, 'EARN_BADGE');
  }

  // Award points for training mascots
  async awardMascotTrainingPoints(userId) {
    return await this.awardPointsForAction(userId, 'TRAIN_MASCOT');
  }
}

// Export a singleton instance
const pointsServiceInstance = new PointsService();
export default pointsServiceInstance; 