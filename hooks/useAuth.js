import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  logoutUser,
  checkAuthStatus,
  sendOtp,
  confirmOtp,
  forgotPassword,
  resetPassword,
  clearError as clearAuthError,
} from '../store/slices/authSlice';
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword as changeUserPassword,
  clearError as clearUserError,
  resetUpdateSuccess,
  resetChangePasswordSuccess,
} from '../store/slices/userSlice';

/**
 * useAuth hook
 * Exposes auth state and common actions for authentication & profile management
 */
export default function useAuth() {
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const userState = useSelector((state) => state.user);

  const user = auth.user;
  const token = auth.token;
  const isAuthenticated = !!auth.isAuthenticated;
  const isLoading = auth.isLoading || userState.isLoading;
  const error = auth.error || userState.error;

  const isAdmin = useMemo(() => {
    // Support both role and role_name fields
    const role = user?.role_name || user?.role;
    return String(role).toLowerCase() === 'admin';
  }, [user]);

  // Auth actions
  const login = useCallback((email, password) => {
    return dispatch(loginUser({ email, password }));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutUser());
  }, [dispatch]);

  const register = useCallback((user_name, email, password) => {
    // Registration flow uses OTP: send OTP then navigate to VerifyOtp screen
    return dispatch(sendOtp({ user_name, email, password }));
  }, [dispatch]);

  const verifyOtp = useCallback((otp) => {
    return dispatch(confirmOtp(otp));
  }, [dispatch]);

  const requestForgotPassword = useCallback((email) => {
    return dispatch(forgotPassword({ email }));
  }, [dispatch]);

  const doResetPassword = useCallback((email, otp, newPassword) => {
    return dispatch(resetPassword({ email, otp, newPassword }));
  }, [dispatch]);

  const refreshAuthFromStorage = useCallback(() => {
    return dispatch(checkAuthStatus());
  }, [dispatch]);

  // Profile actions
  const loadProfile = useCallback(() => {
    return dispatch(fetchUserProfile());
  }, [dispatch]);

  const saveProfile = useCallback(({ user_name, avatar }) => {
    return dispatch(updateUserProfile({ user_name, avatar }));
  }, [dispatch]);

  const changePassword = useCallback((old_password, new_password) => {
    return dispatch(changeUserPassword({ old_password, new_password }));
  }, [dispatch]);

  // Helpers
  const clearErrors = useCallback(() => {
    dispatch(clearAuthError());
    dispatch(clearUserError());
  }, [dispatch]);

  const resetFlags = useCallback(() => {
    dispatch(resetUpdateSuccess());
    dispatch(resetChangePasswordSuccess());
  }, [dispatch]);

  return {
    // state
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    userState,
    auth,

    // auth actions
    login,
    logout,
    register,
    verifyOtp,
    requestForgotPassword,
    doResetPassword,
    refreshAuthFromStorage,

    // profile actions
    loadProfile,
    saveProfile,
    changePassword,

    // helpers
    clearErrors,
    resetFlags,
  };
}
