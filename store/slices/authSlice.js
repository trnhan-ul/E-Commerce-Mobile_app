import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            // authService.login() expects (email, password) - email is used as username parameter
            const response = await authService.login(email, password);

            // authService already saves to AsyncStorage, but we also need to save to 'user' key for compatibility
            if (response.token && response.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

// Async thunk for sending OTP (for registration)
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async ({ user_name, email, password }, { rejectWithValue }) => {
        try {
            // Use sendRegistrationOTP for registration (doesn't check if email exists)
            const response = await authService.sendRegistrationOTP(email, user_name);

            // Store registration data temporarily for after OTP verification
            await AsyncStorage.setItem('pendingRegistration', JSON.stringify({
                username: user_name, // Use 'username' key to match register method
                email,
                password
            }));

            return response.message || 'OTP sent successfully';
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for confirming OTP (for registration)
export const confirmOtp = createAsyncThunk(
    'auth/confirmOtp',
    async (otp, { rejectWithValue }) => {
        try {
            // Get pending registration data first to get email
            const pendingData = await AsyncStorage.getItem('pendingRegistration');
            if (!pendingData) {
                throw new Error('Registration data not found');
            }

            const registrationData = JSON.parse(pendingData);
            const email = registrationData.email;

            // Verify OTP first
            await authService.verifyOTP(email, otp);

            // Register the user
            const result = await authService.register(registrationData);

            // Clear pending registration data
            await AsyncStorage.removeItem('pendingRegistration');

            // Save user data for compatibility
            if (result.user && result.token) {
                await AsyncStorage.setItem('user', JSON.stringify(result.user));
            }

            return { message: 'Registration successful', ...result };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        // Also call authService.logout() to ensure clean logout
        try {
            await authService.logout();
        } catch (error) {
            console.warn('Logout error:', error);
        }
        await AsyncStorage.multiRemove(['token', 'user', 'userData']);
        return null;
    }
);

// Async thunk to check if user is already logged in
export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userData = await AsyncStorage.getItem('userData') || await AsyncStorage.getItem('user');

            if (token && userData) {
                return {
                    token,
                    user: JSON.parse(userData),
                };
            }
            return null;
        } catch (error) {
            return rejectWithValue('Failed to check auth status');
        }
    }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const response = await authService.forgotPassword(email);
            return response.message || 'OTP sent successfully';
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ old_password, new_password }, { rejectWithValue }) => {
        try {
            const result = await authService.changePassword(old_password, new_password);
            return result ? 'Password changed successfully' : 'Failed to change password';
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for resetting password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, otp, newPassword }, { rejectWithValue }) => {
        try {
            const result = await authService.resetPassword(email, newPassword, otp);
            return result.success ? 'Password reset successfully' : 'Failed to reset password';
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    otpStatus: null,
    otpMessage: null,
    confirmOtpStatus: null,
    confirmOtpMessage: null,
    forgotPasswordStatus: null,
    forgotPasswordMessage: null,
    changePasswordStatus: null,
    changePasswordMessage: null,
    resetPasswordStatus: null,
    resetPasswordMessage: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        resetForgotPasswordState: (state) => {
            state.forgotPasswordStatus = null;
            state.forgotPasswordMessage = null;
        },
        resetOtpState: (state) => {
            state.otpStatus = null;
            state.otpMessage = null;
        },
        resetConfirmOtpState: (state) => {
            state.confirmOtpStatus = null;
            state.confirmOtpMessage = null;
        },
        resetResetPasswordState: (state) => {
            state.resetPasswordStatus = null;
            state.resetPasswordMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Register OTP cases
            .addCase(sendOtp.pending, (state) => {
                state.isLoading = true;
                state.otpStatus = null;
                state.otpMessage = null;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.otpStatus = 'success';
                state.otpMessage = action.payload;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.otpStatus = 'error';
                state.otpMessage = action.payload;
            })
            // Confirm OTP cases
            .addCase(confirmOtp.pending, (state) => {
                state.isLoading = true;
                state.confirmOtpStatus = null;
                state.confirmOtpMessage = null;
            })
            .addCase(confirmOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.confirmOtpStatus = 'success';
                state.otpStatus = null;
                state.confirmOtpMessage = action.payload?.message || 'Registration successful';
                // Auto login after successful registration
                if (action.payload?.user && action.payload?.token) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                }
            })
            .addCase(confirmOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.confirmOtpStatus = 'error';
                state.confirmOtpMessage = action.payload;
            })
            // Logout cases
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // Check auth status cases
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                }
            })
            // Forgot password case
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.forgotPasswordStatus = null;
                state.forgotPasswordMessage = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.forgotPasswordStatus = 'success';
                state.forgotPasswordMessage = action.payload;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.forgotPasswordStatus = 'error';
                state.forgotPasswordMessage = action.payload;
            })
            // Change password case
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.changePasswordStatus = null;
                state.changePasswordMessage = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.changePasswordStatus = 'success';
                state.changePasswordMessage = action.payload;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.changePasswordStatus = 'error';
                state.changePasswordMessage = action.payload;
            })
            // Reset password case
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.resetPasswordStatus = null;
                state.resetPasswordMessage = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.resetPasswordStatus = 'success';
                state.resetPasswordMessage = action.payload;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.resetPasswordStatus = 'error';
                state.resetPasswordMessage = action.payload;
            });
    },
});

export const { clearError, resetAuth, resetForgotPasswordState, resetOtpState, resetConfirmOtpState, resetResetPasswordState } = authSlice.actions;
export default authSlice.reducer;
