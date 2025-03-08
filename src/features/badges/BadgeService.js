import React from 'react';
import i18next from 'i18next';
import PointsService from '../rewards/PointsService';
import supabase, { supabaseAdmin } from '../../shared/utils/supabaseClient';

// Badge definitions with metadata - using translation keys
export const BADGES = {
  EARLY_ADOPTER: {
    id: 'early_adopter',
    nameKey: 'badges.badgeNames.earlyAdopter',
    descriptionKey: 'badges.badgeDescriptions.earlyAdopter',
    color: '#5E60CE',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#5E60CE" stroke="#7678ED" strokeWidth="2" />
        <path d="M50 20 L55 35 L70 35 L60 45 L65 60 L50 50 L35 60 L40 45 L30 35 L45 35 Z" fill="#FFFFFF" />
        <text x="50" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="Arial, sans-serif">Early Adopter</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Early Adopter',
    description: 'Joined during our platform launch phase',
  },
  WEB3_EXPLORER: {
    id: 'web3_explorer',
    nameKey: 'badges.badgeNames.web3Explorer',
    descriptionKey: 'badges.badgeDescriptions.web3Explorer',
    color: '#06D6A0',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#06D6A0" stroke="#079F79" strokeWidth="2" />
        <circle cx="50" cy="50" r="25" fill="#079F79" />
        <path d="M40,40 L60,40 L60,60 L40,60 Z" fill="#FFFFFF" />
        <path d="M65,35 L70,40 L65,45" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M65,55 L70,60 L65,65" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M35,35 L30,40 L35,45" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M35,55 L30,60 L35,65" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Web3 Explorer',
    description: 'Connected a Web3 wallet to their account',
  },
  BLOCKCHAIN_MASTER: {
    id: 'blockchain_master', 
    nameKey: 'badges.badgeNames.blockchainMaster',
    descriptionKey: 'badges.badgeDescriptions.blockchainMaster',
    color: '#FF9F1C',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="#FF9F1C" stroke="#F7B32B" strokeWidth="2" />
        <g transform="translate(50, 50)">
          <path d="M0,-30 L20,-20 L20,20 L0,30 L-20,20 L-20,-20 Z" fill="#F7B32B" />
          <path d="M0,-15 L10,-10 L10,10 L0,15 L-10,10 L-10,-10 Z" fill="#FFFFFF" />
        </g>
        <circle cx="50" cy="50" r="5" fill="#F7B32B" />
        <text x="50" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="Arial, sans-serif">Blockchain Master</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Blockchain Master',
    description: 'Demonstrated deep knowledge of blockchain concepts',
  },
  COMMUNITY_PILLAR: {
    id: 'community_pillar',
    nameKey: 'badges.badgeNames.communityPillar',
    descriptionKey: 'badges.badgeDescriptions.communityPillar',
    color: '#5271FF',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect x="15" y="15" width="70" height="70" rx="10" fill="#5271FF" stroke="#3A56F0" strokeWidth="2" />
        <circle cx="35" cy="40" r="8" fill="#FFFFFF" />
        <circle cx="65" cy="40" r="8" fill="#FFFFFF" />
        <circle cx="50" cy="65" r="8" fill="#FFFFFF" />
        <line x1="35" y1="40" x2="65" y2="40" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="35" y1="40" x2="50" y2="65" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="65" y1="40" x2="50" y2="65" stroke="#FFFFFF" strokeWidth="2" />
        <text x="50" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="Arial, sans-serif">Community Pillar</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Community Pillar',
    description: 'Active contributor to our growing community',
  },
  CRYPTO_WIZARD: {
    id: 'crypto_wizard',
    nameKey: 'badges.badgeNames.cryptoWizard',
    descriptionKey: 'badges.badgeDescriptions.cryptoWizard',
    color: '#9B5DE5',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M50,10 L65,40 L95,45 L70,65 L80,95 L50,80 L20,95 L30,65 L5,45 L35,40 Z" fill="#9B5DE5" stroke="#7B4FB5" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill="#7B4FB5" />
        <path d="M45,45 L55,55 M45,55 L55,45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <text x="50" y="90" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif">Crypto Wizard</text>
      </svg>
    ),
    // Keep original English values for fallback
    name: 'Crypto Wizard',
    description: 'Successfully completed advanced crypto transactions',
  },
};

// Event for badge updates
export const BADGE_UPDATED_EVENT = 'badge_updated';

// Class to manage user badges
class BadgeService {
  static TABLE_NAME = 'user_badges';

  // Get badges for a user
  static async getUserBadges(userId) {
    if (!userId) {
      console.log('getUserBadges called with no userId');
      return [];
    }
    
    console.log(`Fetching badges for user: ${userId}`);
    
    try {
      // First try with the admin client to bypass RLS (more reliable)
      let client = supabaseAdmin || supabase;
      
      // Query Supabase for user badges
      console.log(`Using ${supabaseAdmin ? 'admin' : 'regular'} client to fetch badges`);
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user badges:', error);
        return [];
      }
      
      // Log the result
      console.log(`Fetched ${data?.length || 0} badges for user ${userId}:`, data);
      
      // If no badges found, check if the table exists
      if (!data || data.length === 0) {
        console.log('No badges found, checking if table exists');
        const { data: tableData, error: tableError } = await client
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', this.TABLE_NAME);
          
        if (tableError) {
          console.error('Error checking if table exists:', tableError);
        } else {
          console.log('Table check result:', tableData);
        }
      }
      
      // Transform to the expected format
      return data ? data.map(badge => ({
        id: badge.badge_id,
        dateAwarded: badge.date_awarded
      })) : [];
    } catch (err) {
      console.error('Unexpected error in getUserBadges:', err);
      return [];
    }
  }

  // Add the isValidBadgeId method
  static isValidBadgeId(badgeId) {
    // Check if the badge exists in our BADGES object
    return Object.values(BADGES).some(badge => badge.id === badgeId);
  }

  // Award a badge to a user
  static async awardBadge(userId, badgeId) {
    if (!userId || !badgeId || !this.isValidBadgeId(badgeId)) {
      return false;
    }

    try {
      // Check if user already has this badge using direct query
      const hasExistingBadge = await this.hasBadge(userId, badgeId);
      if (hasExistingBadge) {
        console.log(`User ${userId} already has badge ${badgeId}`);
        return true; // Consider it a success since the user has the badge
      }

      // Use admin client to bypass RLS for insert operations
      if (!supabaseAdmin) {
        console.error('Admin client not available. Cannot award badge.');
        return false;
      }
      
      // Insert into Supabase
      const { error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .insert({
          user_id: userId,
          badge_id: badgeId,
          date_awarded: new Date().toISOString()
        });
      
      if (error) {
        // Handle duplicate key error specifically
        if (error.code === '23505') {
          console.log(`Badge ${badgeId} already exists for user ${userId}`);
          return true; // Consider it a success since the badge exists
        }
        
        console.error('Error awarding badge:', error);
        return false;
      }
      
      // Dispatch event for UI updates
      document.dispatchEvent(new CustomEvent(BADGE_UPDATED_EVENT, {
        detail: { userId }
      }));

      // Award points for earning a badge (async)
      await PointsService.awardBadgePoints(userId);
      
      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Check if a user has a specific badge
  static async hasBadge(userId, badgeId) {
    if (!userId || !badgeId) return false;
    
    try {
      // Use admin client for more reliable badge checking
      const client = supabaseAdmin || supabase;
      
      // Query Supabase for the specific badge
      const { data, error } = await client
        .from(this.TABLE_NAME)
        .select('badge_id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId);
      
      if (error) {
        console.error('Error checking for badge:', error);
        return false;
      }
      
      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.error('Unexpected error in hasBadge:', err);
      return false;
    }
  }

  // Remove a badge from a user
  static async removeBadge(userId, badgeId) {
    if (!userId || !badgeId) return false;
    
    try {
      // Use admin client to bypass RLS for delete operations
      if (!supabaseAdmin) {
        console.error('Admin client not available. Cannot remove badge.');
        return false;
      }
      
      // Delete from Supabase
      const { error } = await supabaseAdmin
        .from(this.TABLE_NAME)
        .delete()
        .eq('user_id', userId)
        .eq('badge_id', badgeId);
      
      if (error) {
        console.error('Error removing badge:', error);
        return false;
      }
      
      // Dispatch event for UI updates
      document.dispatchEvent(new CustomEvent(BADGE_UPDATED_EVENT, {
        detail: { userId }
      }));
      
      return true;
    } catch (err) {
      console.error('Unexpected error in removeBadge:', err);
      return false;
    }
  }

  // Clear all localStorage data for badges (transitional method)
  static clearLocalStorageBadges() {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter badge-related keys
    const badgeKeys = keys.filter(key => key.startsWith('user_badges_'));
    
    // Remove each badge key
    badgeKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    return badgeKeys.length;
  }

  // Get badge details by ID
  static getBadgeDetails(badgeId) {
    const badge = Object.values(BADGES).find(badge => badge.id === badgeId);
    
    if (badge) {
      // Create a copy of the badge with translated name and description
      return {
        ...badge,
        // Use i18next to translate the name and description, falling back to the original values
        name: i18next.t(badge.nameKey, badge.name),
        description: i18next.t(badge.descriptionKey, badge.description)
      };
    }
    
    return null;
  }

  // Method to automatically check and award badges based on user actions/state
  static async checkAndAwardBadges(user) {
    if (!user) return;
    
    const userId = user.id;
    
    // Logic for Early Adopter badge
    // This could be based on registration date or other criteria
    if (user.createdAt) {
      const registrationDate = new Date(user.createdAt);
      const launchEndDate = new Date('2025-06-01'); // Example launch phase end date
      
      // Only award if the date is valid
      if (!isNaN(registrationDate.getTime()) && registrationDate < launchEndDate) {
        await this.awardBadge(userId, 'early_adopter');
      }
    }
    
    // Logic for Web3 Explorer badge - if user has connected a wallet
    if (user.primaryWeb3Wallet?.web3Wallet) {
      await this.awardBadge(userId, 'web3_explorer');
    }
    
    // Additional logic for other badges would go here
    // For example, you could track user interactions and award badges accordingly
  }

  // Migrate user badges from localStorage to Supabase
  static async migrateBadgesToSupabase(userId) {
    if (!userId) return { success: false, message: 'No user ID provided' };
    
    try {
      // Get badges from localStorage
      const localStorageKey = `user_badges_${userId}`;
      const storedBadges = localStorage.getItem(localStorageKey);
      
      if (!storedBadges) {
        return { success: true, message: 'No badges to migrate for this user' };
      }
      
      const userBadges = JSON.parse(storedBadges);
      if (!Array.isArray(userBadges) || userBadges.length === 0) {
        return { success: true, message: 'No badges to migrate for this user' };
      }
      
      // Add badges to Supabase
      const badgesToInsert = userBadges.map(badge => ({
        user_id: userId,
        badge_id: badge.id,
        date_awarded: badge.dateAwarded || new Date().toISOString()
      }));
      
      // Use admin client to bypass RLS for migration
      if (!supabaseAdmin) {
        return { success: false, message: 'Admin client not available. Cannot migrate badges.' };
      }
      
      // Individually insert each badge to handle duplicates better
      let successCount = 0;
      let errorCount = 0;
      
      for (const badge of badgesToInsert) {
        try {
          // Check if badge already exists
          const { data, error: checkError } = await supabaseAdmin
            .from(this.TABLE_NAME)
            .select('id')
            .eq('user_id', badge.user_id)
            .eq('badge_id', badge.badge_id);
            
          if (checkError) {
            console.error('Error checking badge existence:', checkError);
            errorCount++;
            continue;
          }
          
          // Skip if badge already exists
          if (data && data.length > 0) {
            console.log(`Badge ${badge.badge_id} already exists for user ${badge.user_id}`);
            successCount++;
            continue;
          }
          
          // Insert the badge
          const { error: insertError } = await supabaseAdmin
            .from(this.TABLE_NAME)
            .insert(badge);
            
          if (insertError) {
            if (insertError.code === '23505') {
              // Duplicate key error - consider it a success since badge exists
              console.log(`Badge ${badge.badge_id} already exists for user ${badge.user_id}`);
              successCount++;
            } else {
              console.error('Error inserting badge:', insertError);
              errorCount++;
            }
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error processing badge:', err);
          errorCount++;
        }
      }
      
      // Only remove from localStorage if all badges were processed
      if (errorCount === 0) {
        localStorage.removeItem(localStorageKey);
      }
      
      return { 
        success: true, 
        message: `Successfully migrated ${successCount} badges to Supabase` +
                 (errorCount > 0 ? ` (${errorCount} errors)` : '')
      };
    } catch (err) {
      console.error('Unexpected error in migrateBadgesToSupabase:', err);
      return { success: false, message: 'Unexpected error during migration' };
    }
  }

  // Verify and initialize user_badges table if needed
  static async verifyUserBadgesTable() {
    try {
      console.log('Verifying user_badges table...');
      
      if (!supabaseAdmin) {
        console.error('Admin client not available. Cannot verify table.');
        // Try to proceed with regular client instead of failing
        console.log('Attempting to use regular client instead...');
        
        // Check if we can at least query the table
        const { data: testData, error: testError } = await supabase
          .from(this.TABLE_NAME)
          .select('*')
          .limit(1);
          
        if (testError && testError.code === '42P01') {
          // Table doesn't exist error (PostgreSQL error code)
          console.error('Table does not exist and cannot be created without admin client');
          return false;
        } else if (testError) {
          console.error('Error testing table access:', testError);
          return false;
        }
        
        // If we get here, the table exists and is accessible
        console.log('Table exists and is accessible with regular client');
        return true;
      }
      
      // Check if table exists
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', this.TABLE_NAME);
      
      if (tableError) {
        console.error('Error checking if table exists:', tableError);
        // Try a simpler approach - just query the table and see if it exists
        const { data: testData, error: testError } = await supabaseAdmin
          .from(this.TABLE_NAME)
          .select('*')
          .limit(1);
          
        if (testError && testError.code === '42P01') {
          // Table doesn't exist error
          console.log('Table confirmed not to exist via direct query');
        } else if (testError) {
          console.error('Error testing table access:', testError);
          return false;
        } else {
          // Table exists
          console.log('Table exists and is accessible via direct query');
          return true;
        }
      }
      
      // If table doesn't exist, create it
      if (!tableData || tableData.length === 0) {
        console.log('Table does not exist. Creating user_badges table...');
        
        try {
          // Try to create the table with individual commands
          // 1. Create table
          const createTableResult = await supabaseAdmin.rpc('exec_sql', { 
            sql: `CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id TEXT NOT NULL,
              badge_id TEXT NOT NULL,
              date_awarded TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
              UNIQUE(user_id, badge_id)
            );`
          });
          
          if (createTableResult.error) {
            console.error('Error creating table:', createTableResult.error);
            return false;
          }
          
          // 2. Create index
          const createIndexResult = await supabaseAdmin.rpc('exec_sql', {
            sql: `CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON ${this.TABLE_NAME}(user_id);`
          });
          
          if (createIndexResult.error) {
            console.warn('Error creating index, but continuing:', createIndexResult.error);
            // Continue anyway as this is not critical
          }
          
          // 3. Enable RLS
          const enableRlsResult = await supabaseAdmin.rpc('exec_sql', {
            sql: `ALTER TABLE ${this.TABLE_NAME} ENABLE ROW LEVEL SECURITY;`
          });
          
          if (enableRlsResult.error) {
            console.warn('Error enabling RLS, but continuing:', enableRlsResult.error);
            // Continue anyway
          }
          
          // 4. Create select policy
          const createSelectPolicyResult = await supabaseAdmin.rpc('exec_sql', {
            sql: `CREATE POLICY IF NOT EXISTS select_own_badges ON ${this.TABLE_NAME} 
              FOR SELECT USING (auth.uid()::text = user_id);`
          });
          
          if (createSelectPolicyResult.error) {
            console.warn('Error creating select policy, but continuing:', createSelectPolicyResult.error);
            // Continue anyway
          }
          
          // 5. Create service role policy
          const createServicePolicyResult = await supabaseAdmin.rpc('exec_sql', {
            sql: `CREATE POLICY IF NOT EXISTS service_role_all_access ON ${this.TABLE_NAME} 
              FOR ALL TO service_role USING (true);`
          });
          
          if (createServicePolicyResult.error) {
            console.warn('Error creating service role policy, but continuing:', createServicePolicyResult.error);
            // Continue anyway
          }
          
          console.log('Successfully created user_badges table with individual commands');
          return true;
        } catch (error) {
          console.error('Error in table creation process:', error);
          
          // Fall back to a simple query to check if the table got created anyway
          const { data: checkData, error: checkError } = await supabaseAdmin
            .from(this.TABLE_NAME)
            .select('*')
            .limit(1);
            
          if (!checkError) {
            console.log('Table exists despite errors in creation process');
            return true;
          }
          
          return false;
        }
      }
      
      console.log('User badges table exists');
      return true;
    } catch (error) {
      console.error('Error verifying user_badges table:', error);
      return false;
    }
  }

  // Utility method to allow initializing the badges system
  static async initBadgesSystem() {
    const tableVerified = await this.verifyUserBadgesTable();
    console.log(`Badges system initialization ${tableVerified ? 'successful' : 'failed'}`);
    return tableVerified;
  }
}

export default BadgeService; 