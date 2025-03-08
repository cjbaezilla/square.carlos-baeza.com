/**
 * PointsService.js
 * Service for managing user points system with Supabase persistence
 */

import supabase from '../../shared/utils/supabaseClient';

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
    this.pointsKey = 'user_points_data'; // Keep this for backward compatibility
    this.actionsKey = 'user_completed_actions'; // Keep this for backward compatibility
    this.TABLE_NAME = 'user_points';
    
    // Clean up localStorage on initialization
    this.clearLocalStorageData();
  }

  // Clean all localStorage data for points
  clearLocalStorageData() {
    localStorage.removeItem(this.pointsKey);
    localStorage.removeItem(this.actionsKey);
  }

  // Initialize user points data if not exists
  async initUserData(userId) {
    // Check if user already exists in the database
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking for user in database:', error);
    }
    
    // If user doesn't exist, create entry
    if (!data) {
      const userData = {
        user_id: userId,
        points: 0,
        level: 1,
        last_login: null,
        completed_actions: {}
      };
      
      const { error: insertError } = await supabase
        .from(this.TABLE_NAME)
        .insert(userData);
        
      if (insertError) {
        console.error('Error creating user points data:', insertError);
      }
      
      return userData;
    }
    
    return this.formatUserData(data);
  }

  // Format database data to match the expected format
  formatUserData(dbData) {
    return {
      points: dbData.points,
      level: dbData.level,
      lastLogin: dbData.last_login
    };
  }

  // Get points data for all users - Only needed for compatibility with old events
  async getAllPointsData() {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*');
    
    if (error) {
      console.error('Error fetching all points data:', error);
      return {};
    }
    
    // Convert to the old format for backward compatibility
    const formattedData = {};
    data.forEach(user => {
      formattedData[user.user_id] = this.formatUserData(user);
    });
    
    return formattedData;
  }

  // Trigger a points update event
  dispatchPointsUpdatedEvent(userData, userId) {
    // Format for backward compatibility with event listeners
    const pointsData = {};
    pointsData[userId] = userData;
    
    const event = new CustomEvent(POINTS_UPDATED_EVENT, { 
      detail: { pointsData }
    });
    document.dispatchEvent(event);
  }

  // Get user's points data
  async getUserPoints(userId) {
    try {
      // Make sure we're getting fresh data from Supabase
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If no data, initialize user
        if (error.code === 'PGRST116') { // No data found
          return await this.initUserData(userId);
        }
        
        console.error('Error fetching user points:', error);
        return null;
      }
      
      return this.formatUserData(data);
    } catch (err) {
      console.error('Unexpected error in getUserPoints:', err);
      return null;
    }
  }

  // Get completed actions for a user
  async getUserCompletedActions(userId) {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('completed_actions')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user completed actions:', error);
        return {};
      }
      
      return data.completed_actions || {};
    } catch (err) {
      console.error('Unexpected error in getUserCompletedActions:', err);
      return {};
    }
  }

  // Update completed actions for a user
  async saveUserCompletedActions(userId, actionsData) {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ completed_actions: actionsData })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating user completed actions:', error);
      }
    } catch (err) {
      console.error('Unexpected error in saveUserCompletedActions:', err);
    }
  }

  // Add points to user account
  async addPoints(userId, amount, actionType) {
    try {
      // Get current points
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No data found
          await this.initUserData(userId);
          return this.addPoints(userId, amount, actionType); // Try again after init
        }
        
        console.error('Error fetching user points for update:', error);
        return null;
      }
      
      // Calculate new points and level
      const newPoints = data.points + amount;
      const newLevel = this.calculateLevel(newPoints);
      
      // Update database
      const { data: updatedData, error: updateError } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          points: newPoints, 
          level: newLevel 
        })
        .eq('user_id', userId)
        .select('*')
        .single();
        
      if (updateError) {
        console.error('Error updating user points:', updateError);
        return null;
      }
      
      const userData = this.formatUserData(updatedData);
      
      // Dispatch event for UI update
      this.dispatchPointsUpdatedEvent(userData, userId);
      
      // Record action if specified
      if (actionType) {
        await this.recordCompletedAction(userId, actionType);
      }
      
      return userData;
    } catch (err) {
      console.error('Unexpected error in addPoints:', err);
      return null;
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
      console.error('Unexpected error in recordCompletedAction:', err);
      return false;
    }
  }

  // Calculate user level based on points
  calculateLevel(points) {
    // Simple level calculation: level = points / 50 + 1 (rounded down)
    // So 0-49 points = level 1, 50-99 = level 2, etc.
    return Math.floor(points / 50) + 1;
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

  // Award points for viewing a guide
  async awardGuideViewPoints(userId) {
    return await this.awardPointsForAction(userId, 'VIEW_GUIDE');
  }

  // Award points for earning a badge
  async awardBadgePoints(userId) {
    return await this.awardPointsForAction(userId, 'EARN_BADGE');
  }

  // Award points for training a mascot
  async awardMascotTrainingPoints(userId) {
    return await this.awardPointsForAction(userId, 'TRAIN_MASCOT');
  }
}

// Export a singleton instance
const pointsServiceInstance = new PointsService();
export default pointsServiceInstance; 