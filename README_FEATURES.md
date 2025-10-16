# 📱 ShopApp - Phân chia chức năng cho 5 người (Theo Features)

## 🎯 **Tổng quan dự án**

**ShopApp** là một ứng dụng thương mại điện tử đơn giản được phát triển bằng React Native với Expo, phù hợp cho người mới học React Native. Dự án được chia cho 5 người phát triển theo từng chức năng chính.

## 👥 **Phân chia chức năng cho 5 người**

---

## 👤 **Person 1: Authentication & Profile Management**
**🎯 Scope:** Quản lý đăng nhập, đăng ký và hồ sơ cá nhân

### **📁 Files cần copy:**
```
screens/
├── LoginScreen.js
├── RegisterScreen.js
├── ProfileScreen.js
└── SplashScreen.js

components/
├── AuthRequiredModal.js
├── EditProfileModal.js
├── ProfileHeader.js
└── PersonalInfoSection.js

services/
├── authService.js
└── userService.js

store/slices/
├── authSlice.js
└── userSlice.js

utils/
└── authUtils.js

hooks/
└── useAuth.js (Tạo mới)
```

### **✅ Chức năng cần làm:**
- **Đăng nhập/Đăng ký** (Login/Register)
- **Quản lý hồ sơ cá nhân** (Profile Management)
- **Upload avatar** (Avatar Upload)
- **Thay đổi mật khẩu** (Change Password)
- **Phân quyền User/Admin** (Role Management)
- **Navigation setup** (AppNavigator.js)
- **Loading states** (LoadingSpinner.js)

### **🚀 Phát triển thêm:**
- **Form validation** (Kiểm tra dữ liệu đầu vào)
- **Error handling** (Xử lý lỗi)
- **User feedback** (Phản hồi người dùng)
- **Session management** (Quản lý phiên đăng nhập)

### **🎣 Custom Hooks:**
- **useAuth.js** - Quản lý authentication state và functions
  - `login()`, `logout()`, `register()`
  - `isAuthenticated`, `user`, `loading`, `error`
  - `isAdmin`, `checkAuthStatus()`

---

## 👤 **Person 2: Product Display & Search**
**🎯 Scope:** Hiển thị sản phẩm, tìm kiếm và danh mục

### **📁 Files cần copy:**
```
screens/
├── HomeScreen.js
├── ProductDetailScreen.js
└── AllProductsScreen.js

components/
├── ProductCard.js
├── CategorySection.js
├── FeaturedNewProducts.js
├── FeaturedTopProducts.js
├── SearchBar.js
└── TopNavBar.js

services/
├── productService.js
├── categoryService.js
└── reviewService.js

store/slices/
├── productSlice.js
├── categorySlice.js
└── reviewSlice.js

hooks/
├── useProducts.js (Tạo mới)
└── useCategories.js (Tạo mới)
```

### **✅ Chức năng cần làm:**
- **Hiển thị danh sách sản phẩm** (Product Listing)
- **Chi tiết sản phẩm** (Product Details)
- **Tìm kiếm sản phẩm** (Product Search)
- **Lọc theo danh mục** (Category Filtering)
- **Sản phẩm mới & bán chạy** (Featured Products)
- **Hệ thống đánh giá** (Review System)
- **Pagination** (Phân trang)

### **🚀 Phát triển thêm:**
- **Advanced search** (Tìm kiếm nâng cao)
- **Product sorting** (Sắp xếp sản phẩm)
- **Image gallery** (Thư viện hình ảnh)
- **Product comparison** (So sánh sản phẩm)

### **🎣 Custom Hooks:**
- **useProducts.js** - Quản lý products state và functions
  - `getProducts()`, `searchProducts()`, `getProductById()`
  - `products`, `loading`, `error`, `searchResults`
  - `featuredProducts`, `newProducts`
- **useCategories.js** - Quản lý categories state và functions
  - `getCategories()`, `getCategoryById()`
  - `categories`, `loading`, `error`

---

## 👤 **Person 3: Shopping Cart & Checkout**
**🎯 Scope:** Giỏ hàng, thanh toán và quản lý đơn hàng

### **📁 Files cần copy:**
```
screens/
├── CartScreen.js
├── PaymentScreen.js
├── BuyNowScreen.js
├── OrderDetailsScreen.js
└── OrderHistoryScreen.js

components/
├── OrderHistorySection.js
└── BottomNavigation.js

services/
├── cartService.js
└── orderService.js

store/slices/
├── cartSlice.js
└── orderSlice.js

utils/
└── formatCurrency.js

hooks/
├── useCart.js (Tạo mới)
└── useOrders.js (Tạo mới)
```

### **✅ Chức năng cần làm:**
- **Thêm/Xóa/Cập nhật giỏ hàng** (Cart Management)
- **Tính tổng tiền** (Price Calculation)
- **Chọn sản phẩm để thanh toán** (Checkout Selection)
- **Tạo đơn hàng** (Order Creation)
- **Mua ngay (Buy Now)** (Quick Purchase)
- **Lịch sử đơn hàng** (Order History)
- **Chi tiết đơn hàng** (Order Details)
- **Bottom Navigation** (Điều hướng dưới)

### **🚀 Phát triển thêm:**
- **Cart persistence** (Lưu giỏ hàng)
- **Quantity management** (Quản lý số lượng)
- **Order status tracking** (Theo dõi trạng thái đơn hàng)
- **Payment integration** (Tích hợp thanh toán)

### **🎣 Custom Hooks:**
- **useCart.js** - Quản lý cart state và functions
  - `addToCart()`, `removeFromCart()`, `updateQuantity()`
  - `cartItems`, `total`, `itemCount`, `loading`, `error`
  - `clearCart()`, `getCartTotal()`
- **useOrders.js** - Quản lý orders state và functions
  - `createOrder()`, `getOrders()`, `getOrderById()`
  - `orders`, `loading`, `error`
  - `updateOrderStatus()`, `cancelOrder()`

---

## 👤 **Person 4: Admin Panel & Management**
**🎯 Scope:** Quản lý admin, sản phẩm và đơn hàng

### **📁 Files cần copy:**
```
screens/
└── AdminScreen.js

components/
├── Loading/
    └── index.js
└── LoadingSpinner.js

constants/
└── colors.js

services/
├── productService.js (Admin functions)
├── orderService.js (Admin functions)
└── userService.js (Admin functions)

store/slices/
├── productSlice.js (Admin actions)
├── orderSlice.js (Admin actions)
└── userSlice.js (Admin actions)

hooks/
├── useAdmin.js (Tạo mới)
└── useUI.js (Tạo mới)
```

### **✅ Chức năng cần làm:**
- **Admin Dashboard** (Bảng điều khiển admin)
- **Quản lý sản phẩm** (Product Management)
- **Thêm/Sửa/Xóa sản phẩm** (CRUD Products)
- **Quản lý đơn hàng** (Order Management)
- **Quản lý người dùng** (User Management)
- **Thống kê và báo cáo** (Statistics & Reports)
- **UI Components** (Các component chung)

### **🚀 Phát triển thêm:**
- **Bulk operations** (Thao tác hàng loạt)
- **Data export** (Xuất dữ liệu)
- **Advanced filtering** (Lọc nâng cao)
- **Dashboard analytics** (Phân tích dashboard)

### **🎣 Custom Hooks:**
- **useAdmin.js** - Quản lý admin state và functions
  - `getAdminStats()`, `getAllUsers()`, `getAllOrders()`
  - `adminStats`, `users`, `orders`, `loading`, `error`
  - `updateUserStatus()`, `updateOrderStatus()`
- **useUI.js** - Quản lý UI state và functions
  - `showLoading()`, `hideLoading()`, `showToast()`
  - `isLoading`, `toastMessage`, `theme`
  - `toggleTheme()`, `setLanguage()`

---

## 👤 **Person 5: Database & AI Chatbot**
**🎯 Scope:** SQLite database, AI chatbot và offline features

### **📁 Files cần copy:**
```
App.js
app.json
package.json
index.js
babel.config.js
.gitignore

assets/
├── adaptive-icon.png
├── default-avatar.png
├── favicon.png
├── icon.png
└── splash-icon.png

store/
└── index.js

components/
├── ChatBotModal.js (GIỮ LẠI)
├── GuestModeModal.js (Tạo mới)
└── OfflineIndicator.js (Tạo mới)

services/
├── chatbotService.js (GIỮ LẠI)
├── databaseService.js (Tạo mới)
├── databaseConfig.js (Tạo mới)
├── databaseMigrations.js (Tạo mới)
├── offlineService.js (Tạo mới)
├── guestService.js (Tạo mới)
└── syncService.js (Tạo mới)

store/slices/
├── chatbotSlice.js (GIỮ LẠI)
├── databaseSlice.js (Tạo mới)
└── syncSlice.js (Tạo mới)

utils/
├── databaseUtils.js (Tạo mới)
├── storageUtils.js (Tạo mới)
└── networkUtils.js (Tạo mới)

screens/
├── GuestHomeScreen.js (Tạo mới)
└── OfflineScreen.js (Tạo mới)

hooks/
├── useDatabase.js (Tạo mới)
├── useNetwork.js (Tạo mới)
└── useChatbot.js (Tạo mới)
```

### **✅ Chức năng cần làm:**
- **SQLite Database Setup** (Thiết lập SQLite database)
- **Database Schema Design** (Thiết kế schema database)
- **CRUD Operations** (Thao tác Create, Read, Update, Delete)
- **Data Synchronization** (Đồng bộ dữ liệu với API)
- **AI Chatbot Integration** (Tích hợp AI chatbot)
- **Guest Mode Implementation** (Triển khai chế độ khách)
- **Offline Data Storage** (Lưu trữ dữ liệu offline)
- **Network Status Detection** (Phát hiện trạng thái mạng)
- **Project Setup & Integration** (Setup dự án và tích hợp)

### **🚀 Phát triển thêm:**
- **Database Migrations** (Migration database)
- **Data Backup & Restore** (Sao lưu và khôi phục dữ liệu)
- **Advanced Chatbot Features** (Tính năng chatbot nâng cao)
- **Real-time Sync** (Đồng bộ thời gian thực)
- **Performance Optimization** (Tối ưu hiệu suất)

### **🎣 Custom Hooks:**
- **useDatabase.js** - Quản lý database state và functions
  - `initDatabase()`, `syncData()`, `getProducts()`, `addProduct()`
  - `isInitialized`, `isSyncing`, `lastSync`, `error`
  - `backupDatabase()`, `restoreDatabase()`
- **useNetwork.js** - Quản lý network state và functions
  - `isConnected`, `connectionType`, `isOffline`
  - `checkConnection()`, `onConnectionChange()`
- **useChatbot.js** - Quản lý chatbot state và functions
  - `sendMessage()`, `clearChat()`, `getMessages()`
  - `messages`, `isLoading`, `error`
  - `isOpen`, `toggleChatbot()`

### **🗄️ SQLite Database Schema:**
```sql
-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id INTEGER,
    stock_quantity INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    is_new BOOLEAN DEFAULT 0,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Orders table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    payment_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## ✅ **Files GIỮ LẠI (AI Chatbot):**

```
✅ components/ChatBotModal.js (Person 5)
✅ services/chatbotService.js (Person 5)
✅ store/slices/chatbotSlice.js (Person 5)
✅ @google/generative-ai dependency (Person 5)
```

## 🔧 **Modifications cần thực hiện:**

### **1. App.js (GIỮ LẠI AI Chatbot):**
```javascript
// GIỮ NGUYÊN - Không sửa
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { View } from 'react-native';
import ChatBotModal from './components/ChatBotModal'; // ✅ GIỮ LẠI

export default function App() {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <View style={{ flex: 1 }}>
          <AppNavigator />
          <Toast />
          <ChatBotModal /> {/* ✅ GIỮ LẠI */}
        </View>
      </ActionSheetProvider>
    </Provider>
  );
}
```

### **2. store/index.js (GIỮ LẠI AI Chatbot):**
```javascript
// GIỮ NGUYÊN - Không sửa
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import reviewReducer from './slices/reviewSlice';
import categoryReducer from './slices/categorySlice';
import productReducer from './slices/productSlice';
import chatBotReducer from './slices/chatbotSlice'; // ✅ GIỮ LẠI

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        order: orderReducer,
        cart: cartReducer,
        review: reviewReducer,
        category: categoryReducer,
        product: productReducer,
        chatBot: chatBotReducer, // ✅ GIỮ LẠI
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: true,
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});
```

### **3. navigation/AppNavigator.js (GIỮ LẠI AI Chatbot):**
```javascript
// GIỮ NGUYÊN - Không sửa
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice';
import ChatBotModal from '../components/ChatBotModal'; // ✅ GIỮ LẠI
import { navigateAfterLogin } from '../utils/authUtils';
// ... other imports

const Stack = createStackNavigator();

export default function AppNavigator() {
  // ... state and effects

  return (
    <NavigationContainer ref={navigationRef}>
      {/* ✅ GIỮ LẠI - Hiển thị Chatbot nếu đã đăng nhập và không phải admin */}
      {isAuthenticated && user?.role_name !== 'admin' && <ChatBotModal />}
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="HomePage"
      >
        {/* ... other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### **4. package.json (GIỮ LẠI AI Chatbot):**
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1", // ✅ GIỮ LẠI
    // ... other dependencies
  }
}
```

