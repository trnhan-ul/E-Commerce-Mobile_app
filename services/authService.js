import databaseService from './databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const user = {
        username: userData.username,
        email: userData.email,
        password: userData.password, // In real app, hash this password
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        role: 'user'
      };

      // Check if username or email already exists
      const existingUser = await this.checkUserExists(userData.username, userData.email);
      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      const userId = await databaseService.addUser(user);
      
      // Auto login after registration
      const loginResult = await this.login(userData.username, userData.password);
      return loginResult;
    } catch (error) {
      console.error('AuthService - Error registering user:', error);
      throw error;
    }
  }

  // Login user
  async login(username, password) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE (username = ? OR email = ?) AND password = ?
      `;
      const user = await databaseService.db.getFirstAsync(query, [username, username, password]);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Generate token (in real app, use JWT)
      const token = this.generateToken(user.id);
      
      // Store user data and token
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      return {
        success: true,
        user: user,
        token: token
      };
    } catch (error) {
      console.error('AuthService - Error logging in:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await AsyncStorage.multiRemove(['token', 'userData']);
      return { success: true };
    } catch (error) {
      console.error('AuthService - Error logging out:', error);
      throw error;
    }
  }

  // Check if user exists
  async checkUserExists(username, email) {
    try {
      const query = `
        SELECT id FROM users 
        WHERE username = ? OR email = ?
      `;
      const result = await databaseService.db.getFirstAsync(query, [username, email]);
      return !!result;
    } catch (error) {
      console.error('AuthService - Error checking user exists:', error);
      return false;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const query = 'SELECT id, username FROM users WHERE email = ?';
      const user = await databaseService.db.getFirstAsync(query, [email]);

      if (!user) {
        throw new Error('Email not found');
      }

      // Generate OTP (in real app, send via email/SMS)
      const otp = this.generateOTP();
      
      // Store OTP temporarily (in real app, store in database with expiration)
      await AsyncStorage.setItem(`otp_${email}`, otp);
      await AsyncStorage.setItem(`otp_time_${email}`, Date.now().toString());

      return {
        success: true,
        message: 'OTP sent to your email',
        otp: otp // In real app, don't return OTP
      };
    } catch (error) {
      console.error('AuthService - Error in forgot password:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const storedOTP = await AsyncStorage.getItem(`otp_${email}`);
      const otpTime = await AsyncStorage.getItem(`otp_time_${email}`);

      if (!storedOTP || !otpTime) {
        throw new Error('OTP not found or expired');
      }

      // Check if OTP is expired (5 minutes)
      const currentTime = Date.now();
      const otpTimestamp = parseInt(otpTime);
      if (currentTime - otpTimestamp > 5 * 60 * 1000) {
        await AsyncStorage.multiRemove([`otp_${email}`, `otp_time_${email}`]);
        throw new Error('OTP expired');
      }

      if (storedOTP !== otp) {
        throw new Error('Invalid OTP');
      }

      // Clear OTP after successful verification
      await AsyncStorage.multiRemove([`otp_${email}`, `otp_time_${email}`]);

      return { success: true };
    } catch (error) {
      console.error('AuthService - Error verifying OTP:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(email, newPassword, otp) {
    try {
      // Verify OTP first
      await this.verifyOTP(email, otp);

      // Update password
      const query = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE email = ?
      `;
      const result = await databaseService.db.runAsync(query, [newPassword, email]);

      if (result.changes === 0) {
        throw new Error('Failed to reset password');
      }

      return { success: true };
    } catch (error) {
      console.error('AuthService - Error resetting password:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('User not logged in');

      const user = JSON.parse(userData);
      
      // Verify current password
      const query = 'SELECT id FROM users WHERE id = ? AND password = ?';
      const result = await databaseService.db.getFirstAsync(query, [user.id, currentPassword]);
      
      if (!result) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const updateQuery = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const updateResult = await databaseService.db.runAsync(updateQuery, [newPassword, user.id]);

      return updateResult.changes > 0;
    } catch (error) {
      console.error('AuthService - Error changing password:', error);
      throw error;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('userData');
      return !!(token && userData);
    } catch (error) {
      console.error('AuthService - Error checking login status:', error);
      return false;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('AuthService - Error getting current user:', error);
      return null;
    }
  }

  // Refresh token (in real app, implement JWT refresh)
  async refreshToken() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('User not logged in');

      const user = JSON.parse(userData);
      const newToken = this.generateToken(user.id);
      
      await AsyncStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('AuthService - Error refreshing token:', error);
      throw error;
    }
  }

  // Generate simple token (in real app, use JWT)
  generateToken(userId) {
    return `token_${userId}_${Date.now()}`;
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  }

  // Validate username
  validateUsername(username) {
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
  }

  // Get auth statistics
  async getAuthStats() {
    try {
      const stats = {};

      // Total users
      const totalUsersResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM users');
      stats.totalUsers = totalUsersResult.count;

      // Active users
      const activeUsersResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      stats.activeUsers = activeUsersResult.count;

      // New users this month
      const newUsersResult = await databaseService.db.getFirstAsync(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', 'start of month')
      `);
      stats.newUsersThisMonth = newUsersResult.count;

      return stats;
    } catch (error) {
      console.error('AuthService - Error getting auth stats:', error);
      throw error;
    }
  }
}

export default new AuthService();