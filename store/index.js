import { configureStore } from '@reduxjs/toolkit';
import databaseReducer from './slices/databaseSlice';
import chatbotReducer from './slices/chatbotSlice';

export const store = configureStore({
    reducer: {
        database: databaseReducer,
        chatBot: chatbotReducer,
    },
});

// Type definitions for TypeScript support (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;