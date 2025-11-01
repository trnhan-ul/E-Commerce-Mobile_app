// Export tất cả services từ một file index để dễ import
import databaseService from './databaseService';
import authService from './authService';
import cartService from './cartService';
import categoryService from './categoryService';
import chatbotService from './chatbotService';
import orderService from './orderService';
import productService from './productService';
import reviewService from './reviewService';
import userService from './userService';
import guestService from './guestService';
import syncService from './syncService';
import { migrations } from './databaseMigrations';

// Re-export as named exports
export {
    databaseService,
    authService,
    cartService,
    categoryService,
    chatbotService,
    orderService,
    productService,
    reviewService,
    userService,
    guestService,
    syncService,
    migrations,
};
