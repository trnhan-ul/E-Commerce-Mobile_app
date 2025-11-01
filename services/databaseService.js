import * as SQLite from 'expo-sqlite';

class DatabaseService {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    // Khởi tạo database
    async init() {
        try {
            // Đảm bảo database được mở thành công
            if (!this.db) {
                this.db = await SQLite.openDatabaseAsync('shopapp.db');
            }

            // Kiểm tra database đã được mở chưa
            if (!this.db) {
                throw new Error('Failed to open database');
            }

            // Enable foreign keys trước khi tạo tables
            try {
                await this.db.runAsync('PRAGMA foreign_keys = ON;');
            } catch (error) {
                console.warn('Warning: Could not enable foreign keys:', error);
            }

            // Tạo tables
            await this.createTables();

            this.isInitialized = true;
            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing database:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    // Tạo các bảng
    async createTables() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        // Tạo tables theo thứ tự để tránh lỗi foreign key
        // 1. Categories trước (không có foreign key)
        // 2. Users trước (không có foreign key)
        // 3. Products (có foreign key đến categories)
        // 4. Cart, Orders, Reviews (có foreign key đến users/products)

        const tables = [
            // 1. Categories table (tạo đầu tiên - không có foreign key)
            `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

            // 2. Users table (tạo thứ 2 - không có foreign key)
            `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

            // 3. Products table (có foreign key đến categories)
            `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        category_id INTEGER,
        stock_quantity INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        is_new INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
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

        // Tạo từng table một cách tuần tự
        // Dùng runAsync cho CREATE TABLE (execAsync có thể gây NullPointerException)
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            try {
                await this.db.runAsync(table);
            } catch (error) {
                console.error(`Error creating table ${i + 1}:`, error);
                console.error('SQL:', table.substring(0, 200));
                throw error;
            }
        }

        // Tạo indexes để tối ưu performance
        await this.createIndexes();
    }

    // Tạo indexes
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
            'CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)',
            'CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new)',
            'CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)',
            'CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)',
            'CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)'
        ];

        for (const index of indexes) {
            try {
                await this.db.runAsync(index);
            } catch (error) {
                console.error('Error creating index:', index, error);
                // Index không critical, có thể skip
            }
        }
    }

    // ==================== PRODUCTS ====================

    // Helper method để đảm bảo database đã sẵn sàng
    async ensureDatabaseReady() {
        if (this.db && this.isInitialized) {
            return true;
        }

        // Đợi database khởi tạo (tối đa 5 giây)
        let attempts = 0;
        while ((!this.db || !this.isInitialized) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        return this.db && this.isInitialized;
    }

    // Lấy tất cả sản phẩm
    async getProducts(limit = null, offset = 0) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready, returning empty array');
                return [];
            }

            let query = 'SELECT * FROM products ORDER BY created_at DESC';
            let params = [];

            if (limit) {
                query += ' LIMIT ? OFFSET ?';
                params = [limit, offset];
            }

            const result = await this.db.getAllAsync(query, params);
            return result || [];
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    }

    // Lấy sản phẩm theo ID
    async getProductById(id) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready for getProductById');
                return null;
            }

            const result = await this.db.getFirstAsync('SELECT * FROM products WHERE id = ?', [id]);
            return result || null;
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
    async searchProducts(query, limit = 20) {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?',
                [`%${query}%`, `%${query}%`, limit]
            );
            return result;
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    // Lấy sản phẩm nổi bật
    async getFeaturedProducts(limit = 10) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready for getFeaturedProducts');
                return [];
            }

            const result = await this.db.getAllAsync(
                'SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return result || [];
        } catch (error) {
            console.error('Error getting featured products:', error);
            return [];
        }
    }

    // Lấy sản phẩm mới
    async getNewProducts(limit = 10) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready for getNewProducts');
                return [];
            }

            const result = await this.db.getAllAsync(
                'SELECT * FROM products WHERE is_new = 1 ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return result || [];
        } catch (error) {
            console.error('Error getting new products:', error);
            return [];
        }
    }

    // Lấy sản phẩm theo danh mục
    async getProductsByCategory(categoryId, limit = 20, offset = 0) {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM products WHERE category_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [categoryId, limit, offset]
            );
            return result;
        } catch (error) {
            console.error('Error getting products by category:', error);
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

    // Lấy danh mục theo ID
    async getCategoryById(id) {
        try {
            const result = await this.db.getFirstAsync('SELECT * FROM categories WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error getting category by id:', error);
            return null;
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

    // Cập nhật danh mục
    async updateCategory(id, category) {
        try {
            await this.db.runAsync(
                'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
                [category.name, category.description, category.image_url, id]
            );
            return true;
        } catch (error) {
            console.error('Error updating category:', error);
            return false;
        }
    }

    // Xóa danh mục
    async deleteCategory(id) {
        try {
            await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            return false;
        }
    }

    // Tìm kiếm categories
    async searchCategories(query, limit = 20) {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM categories WHERE name LIKE ? OR description LIKE ? ORDER BY name LIMIT ?',
                [`%${query}%`, `%${query}%`, limit]
            );
            return result;
        } catch (error) {
            console.error('Error searching categories:', error);
            return [];
        }
    }

    // ==================== USERS ====================

    // Tạo user mới
    async createUser(user) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                throw new Error('Database not ready');
            }

            const result = await this.db.runAsync(
                'INSERT INTO users (email, password, full_name, phone, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)',
                [user.email, user.password, user.full_name || '', user.phone || '', user.avatar_url || '', user.role || 'user']
            );

            const userId = result.lastInsertRowId;
            console.log(`✅ Created user: ${user.email} with ID: ${userId}`);
            return userId;
        } catch (error) {
            console.error('❌ Error creating user:', error);
            console.error('User data:', { email: user.email, role: user.role });
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

    // Lấy user theo ID
    async getUserById(id) {
        try {
            const result = await this.db.getFirstAsync('SELECT * FROM users WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error getting user by id:', error);
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

    // Lấy tất cả users (Admin)
    async getAllUsers(limit = 50, offset = 0) {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );
            return result;
        } catch (error) {
            console.error('Error getting all users:', error);
            return [];
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
    async createOrder(userId, cartItems, totalAmount, shippingAddress, paymentMethod, notes = '') {
        try {
            // Tạo đơn hàng
            const orderResult = await this.db.runAsync(
                'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
                [userId, totalAmount, shippingAddress, paymentMethod, notes]
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
    async getOrders(userId, limit = 20, offset = 0) {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [userId, limit, offset]
            );
            return result;
        } catch (error) {
            console.error('Error getting orders:', error);
            return [];
        }
    }

    // Lấy tất cả đơn hàng (Admin)
    async getAllOrders(limit = 50, offset = 0) {
        try {
            const result = await this.db.getAllAsync(
                `SELECT o.*, u.full_name, u.email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC 
         LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return result;
        } catch (error) {
            console.error('Error getting all orders:', error);
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

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        try {
            await this.db.runAsync(
                'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, orderId]
            );
            return true;
        } catch (error) {
            console.error('Error updating order status:', error);
            return false;
        }
    }

    // ==================== REVIEWS ====================

    // Thêm đánh giá
    async addReview(userId, productId, rating, comment = '') {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                throw new Error('Database not ready');
            }

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
    async getProductReviews(productId, limit = 20, offset = 0) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready for getProductReviews');
                return [];
            }

            const result = await this.db.getAllAsync(
                `SELECT r.*, u.full_name, u.avatar_url 
         FROM reviews r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.product_id = ? 
         ORDER BY r.created_at DESC 
         LIMIT ? OFFSET ?`,
                [productId, limit, offset]
            );
            return result || [];
        } catch (error) {
            console.error('Error getting product reviews:', error);
            return [];
        }
    }

    // Cập nhật rating trung bình của sản phẩm
    async updateProductRating(productId) {
        try {
            const isReady = await this.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready for updateProductRating');
                return false;
            }

            const result = await this.db.getFirstAsync(
                'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?',
                [productId]
            );

            await this.db.runAsync(
                'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
                [result?.avg_rating || 0, result?.review_count || 0, productId]
            );

            return true;
        } catch (error) {
            console.error('Error updating product rating:', error);
            return false;
        }
    }

    // ==================== STATISTICS ====================

    // Lấy thống kê admin
    async getAdminStats() {
        try {
            const stats = {};

            // Tổng số sản phẩm
            const productCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM products');
            stats.totalProducts = productCount.count;

            // Tổng số người dùng
            const userCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM users');
            stats.totalUsers = userCount.count;

            // Tổng số đơn hàng
            const orderCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM orders');
            stats.totalOrders = orderCount.count;

            // Tổng doanh thu
            const revenue = await this.db.getFirstAsync('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
            stats.totalRevenue = revenue.total || 0;

            // Đơn hàng theo trạng thái
            const orderStatus = await this.db.getAllAsync(
                'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
            );
            stats.orderStatus = orderStatus;

            return stats;
        } catch (error) {
            console.error('Error getting admin stats:', error);
            return null;
        }
    }

    // ==================== UTILITY METHODS ====================

    // Kiểm tra database có tồn tại không
    async isDatabaseExists() {
        try {
            const result = await this.db.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
            );
            return result !== null;
        } catch (error) {
            return false;
        }
    }

    // Backup database
    async backupDatabase() {
        try {
            const tables = ['products', 'categories', 'users', 'cart', 'orders', 'order_items', 'reviews'];
            const backup = {};

            for (const table of tables) {
                backup[table] = await this.db.getAllAsync(`SELECT * FROM ${table}`);
            }

            return backup;
        } catch (error) {
            console.error('Error backing up database:', error);
            return null;
        }
    }

    // Restore database
    async restoreDatabase(backup) {
        try {
            for (const [tableName, data] of Object.entries(backup)) {
                // Xóa dữ liệu cũ
                await this.db.execAsync(`DELETE FROM ${tableName}`);

                // Insert dữ liệu mới
                for (const row of data) {
                    const columns = Object.keys(row).join(', ');
                    const placeholders = Object.keys(row).map(() => '?').join(', ');
                    const values = Object.values(row);

                    await this.db.runAsync(
                        `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
                        values
                    );
                }
            }

            return true;
        } catch (error) {
            console.error('Error restoring database:', error);
            return false;
        }
    }

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

    // Kiểm tra kết nối database
    async testConnection() {
        try {
            await this.db.getFirstAsync('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Kiểm tra xem đã có dữ liệu sample chưa
    async hasSampleData() {
        try {
            const categoriesCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM categories');
            const productsCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM products');
            const usersCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM users');

            // Check cả 3 loại data: categories, products, và users
            const hasCategories = (categoriesCount?.count || 0) > 0;
            const hasProducts = (productsCount?.count || 0) > 0;
            const hasUsers = (usersCount?.count || 0) > 0;

            console.log('Data check:', { categories: hasCategories, products: hasProducts, users: hasUsers });

            return hasCategories || hasProducts || hasUsers;
        } catch (error) {
            console.error('Error checking sample data:', error);
            return false;
        }
    }

    // Import sample data từ file
    async importSampleData(sampleData) {
        try {
            if (!this.isInitialized) {
                throw new Error('Database not initialized');
            }

            console.log('📦 Importing sample data...');

            // Import categories
            if (sampleData.categories && sampleData.categories.length > 0) {
                for (const category of sampleData.categories) {
                    // Kiểm tra category đã tồn tại chưa
                    const exists = await this.db.getFirstAsync(
                        'SELECT id FROM categories WHERE name = ?',
                        [category.name]
                    );

                    if (!exists) {
                        await this.addCategory(category);
                        console.log(`✅ Imported category: ${category.name}`);
                    }
                }
            }

            // Import products
            if (sampleData.products && sampleData.products.length > 0) {
                for (const product of sampleData.products) {
                    // Kiểm tra product đã tồn tại chưa
                    const exists = await this.db.getFirstAsync(
                        'SELECT id FROM products WHERE name = ?',
                        [product.name]
                    );

                    if (!exists) {
                        await this.addProduct(product);
                        console.log(`✅ Imported product: ${product.name}`);
                    }
                }
            }

            // Import users (luôn import, chỉ skip nếu đã tồn tại email)
            if (sampleData.users && sampleData.users.length > 0) {
                console.log(`📝 Checking users... Found ${sampleData.users.length} users in sample data`);
                for (const user of sampleData.users) {
                    try {
                        const exists = await this.getUserByEmail(user.email);
                        if (!exists) {
                            const userId = await this.createUser(user);
                            if (userId) {
                                console.log(`✅ Imported user: ${user.email} (ID: ${userId})`);
                            } else {
                                console.error(`❌ Failed to import user: ${user.email}`);
                            }
                        } else {
                            console.log(`⏭️  User already exists: ${user.email}`);
                        }
                    } catch (error) {
                        console.error(`❌ Error importing user ${user.email}:`, error);
                    }
                }
            } else {
                console.log('⚠️  No users in sample data');
            }

            console.log('✅ Sample data imported successfully!');
            return true;
        } catch (error) {
            console.error('❌ Error importing sample data:', error);
            return false;
        }
    }

    // Đóng database
    async close() {
        try {
            if (this.db) {
                await this.db.closeAsync();
                this.db = null;
                this.isInitialized = false;
            }
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}

// Export singleton instance
export default new DatabaseService();
