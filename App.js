import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { View } from 'react-native';
import ChatBotModal from './components/ChatBotModal';
import { initializeDatabase, importSampleData } from './store/slices/databaseSlice';
import { useDispatch } from 'react-redux';
import supercarShopSampleData from './sampleData/supercarShopData';

// App content component with database initialization
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize database when app starts
    const initApp = async () => {
      console.log('🚀 Initializing database...');

      // Khởi tạo database
      const initResult = await dispatch(initializeDatabase()).unwrap();

      if (initResult && initResult.isInitialized) {
        // Import sample data sau khi database đã khởi tạo
        console.log('📦 Importing sample data...');
        await dispatch(importSampleData(supercarShopSampleData));
      }
    };

    initApp();
  }, [dispatch]);

  return <AppNavigator />;
}

// Main App component
export default function App() {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <View style={{ flex: 1 }}>
          <AppContent />
          <Toast />
          <ChatBotModal />
        </View>
      </ActionSheetProvider>
    </Provider>
  );
}