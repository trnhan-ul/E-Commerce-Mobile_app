// Database configuration
export const databaseConfig = {
    name: 'shopapp.db',
    version: 1,

    // Table definitions
    tables: [
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
    ],

    // Indexes for performance optimization
    indexes: [
        'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
        'CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)',
        'CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new)',
        'CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)',
        'CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
        'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)'
    ],

    // Sample data for testing
    sampleData: {
        categories: [
            { name: 'Điện thoại', description: 'Điện thoại thông minh', image_url: 'https://example.com/phone.jpg' },
            { name: 'Laptop', description: 'Máy tính xách tay', image_url: 'https://example.com/laptop.jpg' },
            { name: 'Phụ kiện', description: 'Phụ kiện điện tử', image_url: 'https://example.com/accessories.jpg' },
            { name: 'Đồng hồ', description: 'Đồng hồ thông minh', image_url: 'https://example.com/watch.jpg' }
        ],

        products: [
            {
                name: 'iPhone 15 Pro',
                price: 29990000,
                description: 'iPhone 15 Pro với chip A17 Pro mạnh mẽ',
                image_url: 'https://example.com/iphone15pro.jpg',
                category_id: 1,
                stock_quantity: 50,
                is_featured: 1,
                is_new: 1,
                rating: 4.8,
                review_count: 120
            },
            {
                name: 'MacBook Pro M3',
                price: 45990000,
                description: 'MacBook Pro với chip M3 hiệu năng cao',
                image_url: 'https://example.com/macbookpro.jpg',
                category_id: 2,
                stock_quantity: 30,
                is_featured: 1,
                is_new: 0,
                rating: 4.9,
                review_count: 85
            },
            {
                name: 'AirPods Pro 2',
                price: 5990000,
                description: 'Tai nghe không dây với chống ồn chủ động',
                image_url: 'https://example.com/airpods.jpg',
                category_id: 3,
                stock_quantity: 100,
                is_featured: 0,
                is_new: 1,
                rating: 4.7,
                review_count: 200
            },
            {
                name: 'Apple Watch Series 9',
                price: 8990000,
                description: 'Đồng hồ thông minh với nhiều tính năng sức khỏe',
                image_url: 'https://example.com/applewatch.jpg',
                category_id: 4,
                stock_quantity: 75,
                is_featured: 1,
                is_new: 0,
                rating: 4.6,
                review_count: 150
            }
        ],

        users: [
            {
                email: 'admin@shopapp.com',
                password: 'admin123',
                full_name: 'Admin User',
                phone: '0123456789',
                role: 'admin'
            },
            {
                email: 'user@shopapp.com',
                password: 'user123',
                full_name: 'Test User',
                phone: '0987654321',
                role: 'user'
            }
        ]
    },

    // Database settings
    settings: {
        enableForeignKeys: true,
        enableWAL: true, // Write-Ahead Logging for better performance
        cacheSize: 2000, // SQLite cache size
        journalMode: 'WAL',
        synchronous: 'NORMAL'
    }
};
