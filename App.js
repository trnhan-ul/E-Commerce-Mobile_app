import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { View } from 'react-native';
import ChatBotModal from './components/ChatBotModal';
import { initializeDatabase } from './store/slices/databaseSlice';
import { useDispatch } from 'react-redux';

// App content component with database initialization
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize database when app starts
    console.log('🚀 Initializing database...');
    dispatch(initializeDatabase());
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