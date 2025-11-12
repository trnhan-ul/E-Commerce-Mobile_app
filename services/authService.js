import databaseService from './databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

class AuthService {
  // Hash password using SHA-256
  async hashPassword(password) {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      return hash;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Register new user
  async register(userData) {
    try {
      console.log('📝 Register - Input userData:', JSON.stringify(userData, null, 2));

      // Hash the password before storing
      const hashedPassword = await this.hashPassword(userData.password);
      console.log('🔐 Password hashed successfully');

      const user = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword, // Store hashed password
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        role: 'user'
      };

      console.log('📝 Register - User object to create:', JSON.stringify(user, null, 2));

      // Check if username or email already exists
      const existingUser = await this.checkUserExists(userData.username, userData.email);
      if (existingUser) {
        console.error('❌ User already exists:', existingUser);
        throw new Error('Username or email already exists');
      }

      console.log('🔄 Creating user in database...');
      const userId = await databaseService.createUser(user);
      console.log('✅ User created with ID:', userId);

      if (!userId) {
        console.error('❌ Failed to create user - userId is null');
        throw new Error('Failed to create user in database');
      }

      // Auto login after registration - use email, not username
      console.log('🔐 Attempting auto-login with email:', userData.email, 'password:', userData.password);
      const loginResult = await this.login(userData.email, userData.password);
      console.log('✅ Auto-login successful');
      return loginResult;
    } catch (error) {
      console.error('❌ AuthService - Error registering user:', error);
      console.error('❌ Error details:', error.message);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      console.log('🔐 Login attempt - Email:', email, 'Password length:', password?.length);

      // Hash the password before comparing
      const hashedPassword = await this.hashPassword(password);
      console.log('🔐 Password hashed for comparison:', hashedPassword);

      // Kiểm tra database đã sẵn sàng
      const isReady = await databaseService.ensureDatabaseReady();
      if (!isReady) {
        throw new Error('Database not ready');
      }

      // Query user by email and hashed password
      const query = `
        SELECT * FROM users 
        WHERE email = ? AND password = ?
      `;
      const user = await databaseService.db.getFirstAsync(query, [email, hashedPassword]);

      console.log('🔍 Login query result:', user ? `Found user: ${user.email}` : 'No user found');

      if (!user) {
        // Debug: Check if email exists
        const emailCheck = await databaseService.db.getFirstAsync(
          'SELECT email, password FROM users WHERE email = ?',
          [email]
        );
        console.log('🔍 Email exists in DB:', emailCheck ? 'YES' : 'NO');
        if (emailCheck) {
          console.log('🔍 Password in DB (first 10 chars):', emailCheck.password?.substring(0, 10));
          console.log('🔍 Password provided (first 10 chars):', password?.substring(0, 10));
        }
        throw new Error('Invalid email or password');
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
      // Kiểm tra database đã sẵn sàng
      const isReady = await databaseService.ensureDatabaseReady();
      if (!isReady) {
        return false;
      }

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
      console.log('🔑 Forgot Password - Email:', email);

      // Kiểm tra database đã sẵn sàng
      const isReady = await databaseService.ensureDatabaseReady();
      if (!isReady) {
        throw new Error('Database not ready');
      }

      const query = 'SELECT id, username, email FROM users WHERE email = ?';
      const user = await databaseService.db.getFirstAsync(query, [email]);

      if (!user) {
        console.error('❌ Email not found in database:', email);
        throw new Error('Email not found');
      }

      console.log('✅ User found:', user.email);

      // Generate OTP (in real app, send via email/SMS)
      const otp = this.generateOTP();

      // Store OTP temporarily (in real app, store in database with expiration)
      await AsyncStorage.setItem(`otp_${email}`, otp);
      await AsyncStorage.setItem(`otp_time_${email}`, Date.now().toString());

      // Log OTP to console for development
      console.log('========================================');
      console.log('🔑 FORGOT PASSWORD OTP');
      console.log('========================================');
      console.log('📧 Email:', email);
      console.log('🔢 OTP Code:', otp);
      console.log('⏰ Valid for: 5 minutes');
      console.log('========================================');

      return {
        success: true,
        message: 'OTP sent to your email',
        otp: otp // In real app, don't return OTP
      };
    } catch (error) {
      console.error('❌ AuthService - Error in forgot password:', error);
      throw error;
    }
  }

  // Send OTP for registration (doesn't check if email exists)
  async sendRegistrationOTP(email, username) {
    try {
      // Check if email or username already exists
      const existingUser = await this.checkUserExists(username, email);
      if (existingUser) {
        // Check which one exists
        const emailExists = await databaseService.getUserByEmail(email);
        if (emailExists) {
          throw new Error('Email already exists');
        }
        throw new Error('Username already exists');
      }

      // Generate OTP (in real app, send via email/SMS)
      const otp = this.generateOTP();

      // 📧 FOR TESTING: Log OTP to console
      console.log('========================================');
      console.log('📧 OTP CODE FOR:', email);
      console.log('🔢 OTP:', otp);
      console.log('========================================');

      // Store OTP temporarily (in real app, store in database with expiration)
      await AsyncStorage.setItem(`otp_${email}`, otp);
      await AsyncStorage.setItem(`otp_time_${email}`, Date.now().toString());

      return {
        success: true,
        message: 'OTP sent to your email',
        otp: otp // In real app, don't return OTP
      };
    } catch (error) {
      console.error('AuthService - Error sending registration OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp, clearAfterVerify = true) {
    try {
      console.log('🔍 Verifying OTP - Email:', email, 'OTP:', otp, 'Clear after verify:', clearAfterVerify);

      const storedOTP = await AsyncStorage.getItem(`otp_${email}`);
      const otpTime = await AsyncStorage.getItem(`otp_time_${email}`);

      console.log('📦 Stored OTP:', storedOTP);
      console.log('⏰ OTP Time:', otpTime);

      if (!storedOTP || !otpTime) {
        console.error('❌ OTP not found in storage');
        throw new Error('OTP not found or expired');
      }

      // Check if OTP is expired (5 minutes)
      const currentTime = Date.now();
      const otpTimestamp = parseInt(otpTime);
      const timeDiff = currentTime - otpTimestamp;
      console.log('⏱️  Time difference (ms):', timeDiff);

      if (timeDiff > 5 * 60 * 1000) {
        console.error('❌ OTP expired');
        await AsyncStorage.multiRemove([`otp_${email}`, `otp_time_${email}`]);
        throw new Error('OTP expired');
      }

      if (storedOTP !== otp) {
        console.error('❌ OTP mismatch - Expected:', storedOTP, 'Received:', otp);
        throw new Error('Invalid OTP');
      }

      console.log('✅ OTP verified successfully');

      // Clear OTP after successful verification (only if specified)
      if (clearAfterVerify) {
        console.log('🗑️  Clearing OTP from storage');
        await AsyncStorage.multiRemove([`otp_${email}`, `otp_time_${email}`]);
      } else {
        console.log('💾 Keeping OTP in storage for next verification');
      }

      return { success: true };
    } catch (error) {
      console.error('❌ AuthService - Error verifying OTP:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(email, newPassword, otp) {
    try {
      console.log('🔐 Reset Password - Email:', email);

      // Verify OTP first (and clear it this time)
      await this.verifyOTP(email, otp, true);

      console.log('✅ OTP verified, hashing new password...');

      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      const query = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE email = ?
      `;
      const result = await databaseService.db.runAsync(query, [hashedPassword, email]);

      console.log('📝 Password update result - changes:', result.changes);

      if (result.changes === 0) {
        console.error('❌ No rows updated');
        throw new Error('Failed to reset password');
      }

      console.log('✅ Password reset successfully');

      return { success: true };
    } catch (error) {
      console.error('❌ AuthService - Error resetting password:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) throw new Error('User not logged in');

      const user = JSON.parse(userData);
      console.log('🔐 Change Password - User ID:', user.id);

      // Hash current password for verification
      const hashedCurrentPassword = await this.hashPassword(currentPassword);
      console.log('🔐 Current password hashed:', hashedCurrentPassword);

      // Verify current password
      const query = 'SELECT id, password FROM users WHERE id = ?';
      const dbUser = await databaseService.db.getFirstAsync(query, [user.id]);
      console.log('🔍 Password in DB:', dbUser?.password);
      console.log('🔍 Passwords match:', dbUser?.password === hashedCurrentPassword);

      if (!dbUser || dbUser.password !== hashedCurrentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);
      console.log('🔐 New password hashed:', hashedNewPassword);

      // Update password
      const updateQuery = `
        UPDATE users 
        SET password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const updateResult = await databaseService.db.runAsync(updateQuery, [hashedNewPassword, user.id]);
      console.log('✅ Password changed successfully');

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