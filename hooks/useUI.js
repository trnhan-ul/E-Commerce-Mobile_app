import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';

export const useUI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  // Show loading
  const showLoading = useCallback((message = 'Đang tải...') => {
    setIsLoading(true);
  }, []);

  // Hide loading
  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Show toast
  const showToast = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);

    Toast.show({
      type: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
      text1: message,
      position: 'top',
      visibilityTime: 3000,
    });
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    setToastMessage(null);
    Toast.hide();
  }, []);

  // Show success message
  const showSuccess = useCallback((message) => {
    showToast(message, 'success');
  }, [showToast]);

  // Show error message
  const showError = useCallback((message) => {
    showToast(message, 'error');
  }, [showToast]);

  // Show info message
  const showInfo = useCallback((message) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    // State
    isLoading,
    toastMessage,
    toastType,

    // Actions
    showLoading,
    hideLoading,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
};

export default useUI;
