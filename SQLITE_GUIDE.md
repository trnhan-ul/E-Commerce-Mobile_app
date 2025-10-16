# 📚 SQLite Guide cho ShopApp - Hướng dẫn sử dụng SQLite

## 🎯 **Tổng quan**

Hướng dẫn này sẽ giúp bạn tích hợp SQLite vào dự án ShopApp để lưu trữ dữ liệu local, hỗ trợ offline mode và cải thiện performance.

## 📦 **Cài đặt SQLite**

### **1. Cài đặt Expo SQLite:**
```bash
# Nếu dùng Expo
npx expo install expo-sqlite

# Nếu không dùng Expo
npm install react-native-sqlite-storage
```

### **2. Cài đặt thêm dependencies:**
```bash
# Cài thêm các package cần thiết
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
```

## 🗄️ **Thiết kế Database Schema**

### **1. Products Table:**
```sql
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
```

### **2. Categories Table:**
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Users Table:**
```sql
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
```

### **4. Cart Table:**
```sql
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
```

### **5. Orders Table:**
```sql
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
```

### **6. Order Items Table:**
```sql
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
```

### **7. Reviews Table:**
```sql
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

## 🔧 **Tạo Database Service**

### **1. Tạo file `services/databaseService.js`:**

```javascript
import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // Khởi tạo database
  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('shopapp.db');
      await this.createTables();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
    }
  }

  // Tạo các bảng
  async createTables() {
    const tables = [
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
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
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Users table
      `CREATE TABLE IF NOT EXISTS users (
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
      )`,

      // Cart table
      `CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
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
      )`,

      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,

      // Reviews table
      `CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
  }

  // ==================== PRODUCTS ====================
  
  // Lấy tất cả sản phẩm
  async getProducts() {
    try {
      const result = await this.db.getAllAsync('SELECT * FROM products ORDER BY created_at DESC');
      return result;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // Lấy sản phẩm theo ID
  async getProductById(id) {
    try {
      const result = await this.db.getFirstAsync('SELECT * FROM products WHERE id = ?', [id]);
      return result;
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }

  // Thêm sản phẩm mới
  async addProduct(product) {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO products (name, price, description, image_url, category_id, stock_quantity, is_featured, is_new)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.name, product.price, product.description, product.image_url, product.category_id, 
         product.stock_quantity || 0, product.is_featured || 0, product.is_new || 0]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(id, product) {
    try {
      await this.db.runAsync(
        `UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, 
         category_id = ?, stock_quantity = ?, is_featured = ?, is_new = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [product.name, product.price, product.description, product.image_url, product.category_id,
         product.stock_quantity, product.is_featured, product.is_new, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  // Xóa sản phẩm
  async deleteProduct(id) {
    try {
      await this.db.runAsync('DELETE FROM products WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Tìm kiếm sản phẩm
  async searchProducts(query) {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC',
        [`%${query}%`, `%${query}%`]
      );
      return result;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // ==================== CATEGORIES ====================
  
  // Lấy tất cả danh mục
  async getCategories() {
    try {
      const result = await this.db.getAllAsync('SELECT * FROM categories ORDER BY name');
      return result;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Thêm danh mục mới
  async addCategory(category) {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
        [category.name, category.description, category.image_url]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  }

  // ==================== CART ====================
  
  // Lấy giỏ hàng của user
  async getCart(userId) {
    try {
      const result = await this.db.getAllAsync(
        `SELECT c.*, p.name, p.price, p.image_url 
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.user_id = ?`,
        [userId]
      );
      return result;
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId, productId, quantity = 1) {
    try {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItem = await this.db.getFirstAsync(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existingItem) {
        // Cập nhật số lượng
        await this.db.runAsync(
          'UPDATE cart SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [quantity, existingItem.id]
        );
      } else {
        // Thêm mới
        await this.db.runAsync(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  // Cập nhật số lượng trong giỏ hàng
  async updateCartItem(cartId, quantity) {
    try {
      if (quantity <= 0) {
        await this.db.runAsync('DELETE FROM cart WHERE id = ?', [cartId]);
      } else {
        await this.db.runAsync(
          'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [quantity, cartId]
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(cartId) {
    try {
      await this.db.runAsync('DELETE FROM cart WHERE id = ?', [cartId]);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  // Xóa toàn bộ giỏ hàng
  async clearCart(userId) {
    try {
      await this.db.runAsync('DELETE FROM cart WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  // ==================== ORDERS ====================
  
  // Tạo đơn hàng mới
  async createOrder(userId, cartItems, totalAmount, shippingAddress, paymentMethod) {
    try {
      // Tạo đơn hàng
      const orderResult = await this.db.runAsync(
        'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
        [userId, totalAmount, shippingAddress, paymentMethod]
      );
      
      const orderId = orderResult.lastInsertRowId;
      
      // Thêm các sản phẩm vào order_items
      for (const item of cartItems) {
        await this.db.runAsync(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
      
      // Xóa giỏ hàng
      await this.clearCart(userId);
      
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  // Lấy lịch sử đơn hàng
  async getOrders(userId) {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetails(orderId) {
    try {
      const order = await this.db.getFirstAsync('SELECT * FROM orders WHERE id = ?', [orderId]);
      const items = await this.db.getAllAsync(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      return { order, items };
    } catch (error) {
      console.error('Error getting order details:', error);
      return null;
    }
  }

  // ==================== USERS ====================
  
  // Tạo user mới
  async createUser(user) {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO users (email, password, full_name, phone, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)',
        [user.email, user.password, user.full_name, user.phone, user.avatar_url, user.role || 'user']
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Lấy user theo email
  async getUserByEmail(email) {
    try {
      const result = await this.db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
      return result;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Cập nhật user
  async updateUser(id, user) {
    try {
      await this.db.runAsync(
        'UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [user.full_name, user.phone, user.avatar_url, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // ==================== REVIEWS ====================
  
  // Thêm đánh giá
  async addReview(userId, productId, rating, comment) {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
        [userId, productId, rating, comment]
      );
      
      // Cập nhật rating trung bình của sản phẩm
      await this.updateProductRating(productId);
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }

  // Lấy đánh giá của sản phẩm
  async getProductReviews(productId) {
    try {
      const result = await this.db.getAllAsync(
        `SELECT r.*, u.full_name, u.avatar_url 
         FROM reviews r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.product_id = ? 
         ORDER BY r.created_at DESC`,
        [productId]
      );
      return result;
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return [];
    }
  }

  // Cập nhật rating trung bình của sản phẩm
  async updateProductRating(productId) {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?',
        [productId]
      );
      
      await this.db.runAsync(
        'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [result.avg_rating || 0, result.review_count || 0, productId]
      );
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }

  // ==================== UTILITY METHODS ====================
  
  // Xóa tất cả dữ liệu (chỉ dùng cho testing)
  async clearAllData() {
    try {
      await this.db.execAsync('DELETE FROM reviews');
      await this.db.execAsync('DELETE FROM order_items');
      await this.db.execAsync('DELETE FROM orders');
      await this.db.execAsync('DELETE FROM cart');
      await this.db.execAsync('DELETE FROM products');
      await this.db.execAsync('DELETE FROM categories');
      await this.db.execAsync('DELETE FROM users');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Đóng database
  async close() {
    try {
      if (this.db) {
        await this.db.closeAsync();
        this.db = null;
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}

// Export singleton instance
export default new DatabaseService();
```

## 🔄 **Tích hợp với Redux**

### **1. Cập nhật `store/slices/productSlice.js`:**

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import databaseService from '../../services/databaseService';

// Async thunks
export const loadProductsFromDB = createAsyncThunk(
  'products/loadFromDB',
  async () => {
    const products = await databaseService.getProducts();
    return products;
  }
);

export const addProductToDB = createAsyncThunk(
  'products/addToDB',
  async (product) => {
    const id = await databaseService.addProduct(product);
    return { id, ...product };
  }
);

export const updateProductInDB = createAsyncThunk(
  'products/updateInDB',
  async ({ id, product }) => {
    await databaseService.updateProduct(id, product);
    return { id, ...product };
  }
);

export const deleteProductFromDB = createAsyncThunk(
  'products/deleteFromDB',
  async (id) => {
    await databaseService.deleteProduct(id);
    return id;
  }
);

export const searchProductsInDB = createAsyncThunk(
  'products/searchInDB',
  async (query) => {
    const products = await databaseService.searchProducts(query);
    return products;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    searchResults: []
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Load products
      .addCase(loadProductsFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProductsFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadProductsFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add product
      .addCase(addProductToDB.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      
      // Update product
      .addCase(updateProductInDB.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete product
      .addCase(deleteProductFromDB.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      
      // Search products
      .addCase(searchProductsInDB.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProductsInDB.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      });
  }
});

export const { clearSearchResults } = productSlice.actions;
export default productSlice.reducer;
```

## 🚀 **Sử dụng trong Component**

### **1. Trong `HomeScreen.js`:**

```javascript
import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loadProductsFromDB } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector(state => state.products);

  useEffect(() => {
    // Load products from SQLite database
    dispatch(loadProductsFromDB());
  }, [dispatch]);

  const renderProduct = ({ item }) => (
    <ProductCard product={item} />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
      />
    </View>
  );
};

export default HomeScreen;
```

## 📱 **Khởi tạo Database trong App.js**

```javascript
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import AppNavigator from './navigation/AppNavigator';
import databaseService from './services/databaseService';

export default function App() {
  useEffect(() => {
    // Khởi tạo database khi app start
    databaseService.init();
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
```

## 🎯 **Lợi ích của SQLite**

### **✅ Ưu điểm:**
1. **Offline Support** - Hoạt động không cần internet
2. **Performance** - Nhanh hơn API calls
3. **Data Persistence** - Dữ liệu không bị mất khi restart app
4. **Local Storage** - Tiết kiệm băng thông
5. **ACID Compliance** - Đảm bảo tính toàn vẹn dữ liệu
6. **Cross-platform** - Chạy trên mọi platform

### **📊 So sánh với AsyncStorage:**
| Feature | AsyncStorage | SQLite |
|---------|-------------|--------|
| Data Type | Key-Value | Relational |
| Query | Không | SQL |
| Performance | Chậm | Nhanh |
| Complex Data | Khó | Dễ |
| Relationships | Không | Có |
| Offline | Có | Có |

## 🚨 **Lưu ý quan trọng**

### **1. Migration từ API sang SQLite:**
- Sync data từ API về SQLite
- Update data khi có internet
- Handle conflicts khi sync

### **2. Performance:**
- Sử dụng indexes cho các query thường dùng
- Limit số lượng records khi query
- Cache data trong Redux state

### **3. Error Handling:**
- Always wrap database calls trong try-catch
- Log errors để debug
- Fallback về API nếu database lỗi

## 🎉 **Kết luận**

SQLite sẽ giúp ShopApp:
- ✅ **Hoạt động offline** hoàn toàn
- ✅ **Performance tốt hơn** rất nhiều
- ✅ **User experience** mượt mà hơn
- ✅ **Data persistence** đáng tin cậy
- ✅ **Scalable** cho tương lai

**Chúc bạn thành công với SQLite!** 🚀
