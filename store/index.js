import { configureStore } from '@reduxjs/toolkit';
import databaseReducer from './slices/databaseSlice';
import chatbotReducer from './slices/chatbotSlice';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import reviewReducer from './slices/reviewSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
    reducer: {
        database: databaseReducer,
        chatBot: chatbotReducer,
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
        categories: categoryReducer,
        reviews: reviewReducer,
        orders: orderReducer,
        user: userReducer,
    },
});

// Type definitions for TypeScript support (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;