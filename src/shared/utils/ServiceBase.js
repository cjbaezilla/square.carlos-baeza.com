import supabase, { supabaseAdmin } from './supabaseClient';

/**
 * Base Service class with shared functionality for services
 */
class ServiceBase {
  constructor() {
    this.supabase = supabase;
    this.supabaseAdmin = supabaseAdmin;
  }

  /**
   * Dispatches a custom event
   * @param {string} eventName - The name of the event to dispatch
   * @param {object} detail - The data to include in the event
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Common error handling for database operations
   * @param {Error} error - The error object
   * @param {string} operation - The name of the operation that failed
   * @param {*} defaultReturn - The default value to return in case of error
   * @returns {*} The default return value
   */
  handleError(error, operation, defaultReturn = null) {
    console.error(`Error in ${operation}:`, error);
    return defaultReturn;
  }

  /**
   * Fetches data from a table with filters
   * @param {string} table - The table name
   * @param {object} filters - The filters to apply
   * @param {boolean} useAdminClient - Whether to use the admin client
   * @returns {Promise<Array>} The fetched data
   */
  async fetchData(table, filters = {}, useAdminClient = true) {
    try {
      const client = useAdminClient ? this.supabaseAdmin : this.supabase;
      if (!client) {
        console.error('Client not available. Check environment variables.');
        return [];
      }

      let query = client.from(table).select('*');
      
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        return this.handleError(error, `fetching data from ${table}`, []);
      }
      
      return data || [];
    } catch (err) {
      return this.handleError(err, `fetching data from ${table}`, []);
    }
  }

  /**
   * Inserts data into a table
   * @param {string} table - The table name
   * @param {object} data - The data to insert
   * @param {boolean} useAdminClient - Whether to use the admin client
   * @returns {Promise<object>} The result of the operation
   */
  async insertData(table, data, useAdminClient = true) {
    try {
      const client = useAdminClient ? this.supabaseAdmin : this.supabase;
      if (!client) {
        console.error('Client not available. Check environment variables.');
        return { success: false, message: 'Service unavailable' };
      }
      
      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select();
      
      if (error) {
        return { 
          success: false, 
          message: `Error inserting data: ${error.message}` 
        };
      }
      
      return { success: true, data: result };
    } catch (err) {
      return { 
        success: false, 
        message: `Unexpected error: ${err.message}` 
      };
    }
  }

  /**
   * Updates data in a table
   * @param {string} table - The table name
   * @param {object} filters - The filters to apply
   * @param {object} updates - The updates to apply
   * @param {boolean} useAdminClient - Whether to use the admin client
   * @returns {Promise<object>} The result of the operation
   */
  async updateData(table, filters, updates, useAdminClient = true) {
    try {
      const client = useAdminClient ? this.supabaseAdmin : this.supabase;
      if (!client) {
        console.error('Client not available. Check environment variables.');
        return { success: false, message: 'Service unavailable' };
      }
      
      let query = client.from(table).update(updates);
      
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
      
      const { data, error } = await query.select();
      
      if (error) {
        return { 
          success: false, 
          message: `Error updating data: ${error.message}` 
        };
      }
      
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        message: `Unexpected error: ${err.message}` 
      };
    }
  }

  /**
   * Deletes data from a table
   * @param {string} table - The table name
   * @param {object} filters - The filters to apply
   * @param {boolean} useAdminClient - Whether to use the admin client
   * @returns {Promise<object>} The result of the operation
   */
  async deleteData(table, filters, useAdminClient = true) {
    try {
      const client = useAdminClient ? this.supabaseAdmin : this.supabase;
      if (!client) {
        console.error('Client not available. Check environment variables.');
        return { success: false, message: 'Service unavailable' };
      }
      
      let query = client.from(table).delete();
      
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
      
      const { error } = await query;
      
      if (error) {
        return { 
          success: false, 
          message: `Error deleting data: ${error.message}` 
        };
      }
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: `Unexpected error: ${err.message}` 
      };
    }
  }
}

export default ServiceBase; 