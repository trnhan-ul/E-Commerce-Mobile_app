import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  FAVORITES: 'favorites',
  SEARCH_HISTORY: 'search_history',
  SETTINGS: 'settings',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Generic storage functions
export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error setting item:', error);
    return false;
  }
};

export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing item:', error);
    return false;
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// User data functions
export const saveUserData = async (userData) => {
  return await setItem(STORAGE_KEYS.USER_DATA, userData);
};

export const getUserData = async () => {
  return await getItem(STORAGE_KEYS.USER_DATA);
};

export const removeUserData = async () => {
  return await removeItem(STORAGE_KEYS.USER_DATA);
};

// Token functions
export const saveToken = async (token) => {
  return await setItem(STORAGE_KEYS.USER_TOKEN, token);
};

export const getToken = async () => {
  return await getItem(STORAGE_KEYS.USER_TOKEN);
};

export const removeToken = async () => {
  return await removeItem(STORAGE_KEYS.USER_TOKEN);
};

// Cart functions
export const saveCartData = async (cartData) => {
  return await setItem(STORAGE_KEYS.CART_DATA, cartData);
};

export const getCartData = async () => {
  return await getItem(STORAGE_KEYS.CART_DATA);
};

export const removeCartData = async () => {
  return await removeItem(STORAGE_KEYS.CART_DATA);
};

// Favorites functions
export const saveFavorites = async (favorites) => {
  return await setItem(STORAGE_KEYS.FAVORITES, favorites);
};

export const getFavorites = async () => {
  const favorites = await getItem(STORAGE_KEYS.FAVORITES);
  return favorites || [];
};

export const addToFavorites = async (productId) => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      await saveFavorites(favorites);
    }
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async (productId) => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(id => id !== productId);
    await saveFavorites(updatedFavorites);
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isFavorite = async (productId) => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(productId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Search history functions
export const saveSearchHistory = async (searchHistory) => {
  return await setItem(STORAGE_KEYS.SEARCH_HISTORY, searchHistory);
};

export const getSearchHistory = async () => {
  const history = await getItem(STORAGE_KEYS.SEARCH_HISTORY);
  return history || [];
};

export const addToSearchHistory = async (query) => {
  try {
    if (!query || query.trim() === '') return false;
    
    const history = await getSearchHistory();
    const trimmedQuery = query.trim();
    
    // Remove if already exists
    const filteredHistory = history.filter(item => item !== trimmedQuery);
    
    // Add to beginning
    filteredHistory.unshift(trimmedQuery);
    
    // Keep only last 20 items
    const limitedHistory = filteredHistory.slice(0, 20);
    
    await saveSearchHistory(limitedHistory);
    return true;
  } catch (error) {
    console.error('Error adding to search history:', error);
    return false;
  }
};

export const clearSearchHistory = async () => {
  return await removeItem(STORAGE_KEYS.SEARCH_HISTORY);
};

// Settings functions
export const saveSettings = async (settings) => {
  return await setItem(STORAGE_KEYS.SETTINGS, settings);
};

export const getSettings = async () => {
  const settings = await getItem(STORAGE_KEYS.SETTINGS);
  return settings || {
    notifications: true,
    darkMode: false,
    language: 'vi',
  };
};

export default {
  setItem,
  getItem,
  removeItem,
  clearAll,
  saveUserData,
  getUserData,
  removeUserData,
  saveToken,
  getToken,
  removeToken,
  saveCartData,
  getCartData,
  removeCartData,
  saveFavorites,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  saveSearchHistory,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  saveSettings,
  getSettings,
};
