/**
 * PointsService.js
 * Service for managing user points system with localStorage persistence
 */

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
class PointsService {
  constructor() {
    this.pointsKey = 'user_points_data';
    this.actionsKey = 'user_completed_actions';
  }

  // Initialize user points data if not exists
  initUserData(userId) {
    const pointsData = this.getAllPointsData();
    
    if (!pointsData[userId]) {
      pointsData[userId] = {
        points: 0,
        level: 1,
        lastLogin: null,
      };
      this.savePointsData(pointsData);
    }
    
    return pointsData[userId];
  }

  // Get points data for all users
  getAllPointsData() {
    const data = localStorage.getItem(this.pointsKey);
    return data ? JSON.parse(data) : {};
  }

  // Save points data for all users
  savePointsData(data) {
    localStorage.setItem(this.pointsKey, JSON.stringify(data));
    
    // Dispatch a custom event when points are updated
    const event = new CustomEvent(POINTS_UPDATED_EVENT, { 
      detail: { pointsData: data }
    });
    document.dispatchEvent(event);
  }

  // Get user's points data
  getUserPoints(userId) {
    const pointsData = this.getAllPointsData();
    return pointsData[userId] || this.initUserData(userId);
  }

  // Get completed actions for a user
  getUserCompletedActions(userId) {
    const actionsData = localStorage.getItem(this.actionsKey);
    const allActionsData = actionsData ? JSON.parse(actionsData) : {};
    return allActionsData[userId] || {};
  }

  // Save completed actions for a user
  saveUserCompletedActions(userId, actionsData) {
    const allActionsData = localStorage.getItem(this.actionsKey);
    const parsedData = allActionsData ? JSON.parse(allActionsData) : {};
    parsedData[userId] = actionsData;
    localStorage.setItem(this.actionsKey, JSON.stringify(parsedData));
  }

  // Add points to user account
  addPoints(userId, amount, actionType) {
    const pointsData = this.getAllPointsData();
    const userData = pointsData[userId] || this.initUserData(userId);
    
    userData.points += amount;
    
    // Update level based on points
    userData.level = this.calculateLevel(userData.points);
    
    // Save updated data
    this.savePointsData(pointsData);
    
    // Record this action as completed
    if (actionType) {
      this.recordCompletedAction(userId, actionType);
    }
    
    return userData;
  }

  // Record that a user has completed an action
  recordCompletedAction(userId, actionType, onlyOnce = false) {
    const actions = this.getUserCompletedActions(userId);
    
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
    
    this.saveUserCompletedActions(userId, actions);
    return true;
  }

  // Calculate user level based on points
  calculateLevel(points) {
    // Simple level calculation: level = points / 50 + 1 (rounded down)
    // So 0-49 points = level 1, 50-99 = level 2, etc.
    return Math.floor(points / 50) + 1;
  }

  // Award points for different actions if they haven't been awarded already
  awardPointsForAction(userId, actionType, onlyOnce = false) {
    // Check if user can receive points for this action
    if (this.recordCompletedAction(userId, actionType, onlyOnce)) {
      // Award points if action is valid
      const pointsToAward = POINT_VALUES[actionType] || 0;
      if (pointsToAward > 0) {
        return this.addPoints(userId, pointsToAward);
      }
    }
    return this.getUserPoints(userId);
  }

  // Award points for daily login
  awardLoginPoints(userId) {
    return this.awardPointsForAction(userId, 'LOGIN');
  }

  // Award points for completing profile
  awardProfileCompletionPoints(userId) {
    return this.awardPointsForAction(userId, 'COMPLETE_PROFILE', true);
  }

  // Award points for viewing a guide
  awardGuideViewPoints(userId) {
    return this.awardPointsForAction(userId, 'VIEW_GUIDE');
  }

  // Award points for earning a badge
  awardBadgePoints(userId) {
    return this.awardPointsForAction(userId, 'EARN_BADGE');
  }

  // Award points for training a mascot
  awardMascotTrainingPoints(userId) {
    return this.awardPointsForAction(userId, 'TRAIN_MASCOT');
  }
}

// Export a singleton instance
const pointsServiceInstance = new PointsService();
export default pointsServiceInstance; 