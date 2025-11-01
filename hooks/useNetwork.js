import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  // Check connection
  const checkConnection = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      return state.isConnected;
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Handle connection change
  const handleConnectionChange = useCallback((state) => {
    setIsConnected(state.isConnected);
    setConnectionType(state.type);
  }, []);

  // Setup network listener
  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(handleConnectionChange);

    return () => {
      unsubscribe();
    };
  }, [checkConnection, handleConnectionChange]);

  return {
    isConnected,
    connectionType,
    checkConnection,
  };
};

export default useNetwork;
