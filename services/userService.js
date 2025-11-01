import databaseService from './databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class UserService {
  // Get user profile
  async getUserProfile() {
    try {
      // Kiểm tra database đã sẵn sàng
      const isReady = await databaseService.ensureDatabaseReady();
      if (!isReady) {
        throw new Error('Database not ready');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      return await databaseService.getUserById(userId);
    } catch (error) {
      console.error('UserService - Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userData) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const user = {
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        avatar_url: userData.avatar_url || '',
        date_of_birth: userData.date_of_birth || null
      };

      return await databaseService.updateUser(userId, user);
    } catch (error) {
      console.error('UserService - Error updating user profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      // Kiểm tra database đã sẵn sàng
      const isReady = await databaseService.ensureDatabaseReady();
      if (!isReady) {
        throw new Error('Database not ready');
      }

      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Get current user to verify current password
      const user = await databaseService.getUserById(userId);
      if (!user) throw new Error('User not found');

      // In a real app, you would hash and compare passwords
      // For now, we'll just update the password
      const query = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const result = await databaseService.db.runAsync(query, [newPassword, userId]);
      return result.changes > 0;
    } catch (error) {
      console.error('UserService - Error changing password:', error);
      throw error;
    }
  }

  // Upload avatar
  async uploadAvatar(imageUri) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // In a real app, you would upload to a cloud service
      // For now, we'll just store the local URI
      const query = `
        UPDATE users 
        SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const result = await databaseService.db.runAsync(query, [imageUri, userId]);
      return result.changes > 0;
    } catch (error) {
      console.error('UserService - Error uploading avatar:', error);
      throw error;
    }
  }

  // Get user orders
  async getUserOrders(limit = 20, offset = 0) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as total_amount
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `;
      return await databaseService.db.getAllAsync(query, [userId, limit, offset]);
    } catch (error) {
      console.error('UserService - Error getting user orders:', error);
      throw error;
    }
  }

  // Get user addresses
  async getUserAddresses() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = `
        SELECT * FROM user_addresses 
        WHERE user_id = ? 
        ORDER BY is_default DESC, created_at DESC
      `;
      return await databaseService.db.getAllAsync(query, [userId]);
    } catch (error) {
      console.error('UserService - Error getting user addresses:', error);
      throw error;
    }
  }

  // Add user address
  async addUserAddress(addressData) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const address = {
        user_id: userId,
        name: addressData.name,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        is_default: addressData.is_default || false
      };

      // If this is set as default, unset other default addresses
      if (address.is_default) {
        await this.unsetDefaultAddresses(userId);
      }

      return await databaseService.addUserAddress(address);
    } catch (error) {
      console.error('UserService - Error adding user address:', error);
      throw error;
    }
  }

  // Update user address
  async updateUserAddress(addressId, addressData) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const address = {
        name: addressData.name,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        is_default: addressData.is_default || false
      };

      // If this is set as default, unset other default addresses
      if (address.is_default) {
        await this.unsetDefaultAddresses(userId, addressId);
      }

      return await databaseService.updateUserAddress(addressId, address);
    } catch (error) {
      console.error('UserService - Error updating user address:', error);
      throw error;
    }
  }

  // Delete user address
  async deleteUserAddress(addressId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      return await databaseService.deleteUserAddress(addressId);
    } catch (error) {
      console.error('UserService - Error deleting user address:', error);
      throw error;
    }
  }

  // Set default address
  async setDefaultAddress(addressId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Unset all default addresses first
      await this.unsetDefaultAddresses(userId);

      // Set this address as default
      const query = `
        UPDATE user_addresses 
        SET is_default = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `;
      const result = await databaseService.db.runAsync(query, [addressId, userId]);
      return result.changes > 0;
    } catch (error) {
      console.error('UserService - Error setting default address:', error);
      throw error;
    }
  }

  // Unset default addresses
  async unsetDefaultAddresses(userId, excludeId = null) {
    try {
      let query = 'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?';
      let params = [userId];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      await databaseService.db.runAsync(query, params);
    } catch (error) {
      console.error('UserService - Error unsetting default addresses:', error);
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      // Kiểm tra database đã sẵn sàng
      const isReady = await databaseService.ensureDatabaseReady();
      if (!isReady) {
        console.warn('Database not ready for getUserStats');
        return {
          totalOrders: 0,
          totalSpent: 0,
          favoriteCategory: null
        };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          totalOrders: 0,
          totalSpent: 0,
          favoriteCategory: null
        };
      }

      const stats = {};

      // Total orders
      const ordersResult = await databaseService.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [userId]
      );
      stats.totalOrders = ordersResult?.count || 0;

      // Total spent
      const spentResult = await databaseService.db.getFirstAsync(`
        SELECT SUM(total_amount) as total_spent 
        FROM orders 
        WHERE user_id = ? AND status = 'completed'
      `, [userId]);
      stats.totalSpent = spentResult?.total_spent || 0;

      // Addresses count (nếu table tồn tại)
      try {
        const addressesResult = await databaseService.db.getFirstAsync(
          'SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?',
          [userId]
        );
        stats.addressesCount = addressesResult?.count || 0;
      } catch (error) {
        // Table có thể không tồn tại
        stats.addressesCount = 0;
      }

      return stats;
    } catch (error) {
      console.error('UserService - Error getting user stats:', error);
      // Return default stats thay vì throw để tránh crash
      return {
        totalOrders: 0,
        totalSpent: 0,
        addressesCount: 0
      };
    }
  }

  // Get current user ID from AsyncStorage
  async getCurrentUserId() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
      return null;
    } catch (error) {
      console.error('UserService - Error getting current user ID:', error);
      return null;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('UserService - Error checking login status:', error);
      return false;
    }
  }

  // Logout user
  async logout() {
    try {
      await AsyncStorage.multiRemove(['token', 'userData']);
      return true;
    } catch (error) {
      console.error('UserService - Error logging out:', error);
      return false;
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Delete user and related data
      const queries = [
        'DELETE FROM product_reviews WHERE user_id = ?',
        'DELETE FROM user_addresses WHERE user_id = ?',
        'DELETE FROM cart WHERE user_id = ?',
        'DELETE FROM orders WHERE user_id = ?',
        'DELETE FROM users WHERE id = ?'
      ];

      for (const query of queries) {
        await databaseService.db.runAsync(query, [userId]);
      }

      // Logout user
      await this.logout();

      return true;
    } catch (error) {
      console.error('UserService - Error deleting account:', error);
      throw error;
    }
  }
}

export default new UserService();