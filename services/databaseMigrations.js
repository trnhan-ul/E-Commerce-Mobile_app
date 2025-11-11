import databaseService from './databaseService';

// Database migrations for version control
export const migrations = {
  // Migration from version 1 to 2
  async migrateToV2() {
    try {
      console.log("Running migration to version 2...");

      // Add new columns to products table
      await databaseService.db.execAsync(`
        ALTER TABLE products ADD COLUMN discount_percentage REAL DEFAULT 0;
      `);

      await databaseService.db.execAsync(`
        ALTER TABLE products ADD COLUMN is_on_sale BOOLEAN DEFAULT 0;
      `);

      // Add new table for product images
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id)
        );
      `);

      // Add indexes for new columns
      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage);
      `);

      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_products_sale ON products(is_on_sale);
      `);

      console.log("Migration to version 2 completed");
      return true;
    } catch (error) {
      console.error("Error in migration to version 2:", error);
      return false;
    }
  },

  // Migration from version 2 to 3
  async migrateToV3() {
    try {
      console.log("Running migration to version 3...");

      // Add wishlist table
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS wishlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES products(id),
          UNIQUE(user_id, product_id)
        );
      `);

      // Add notifications table
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      // Add user preferences table
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          theme TEXT DEFAULT 'light',
          language TEXT DEFAULT 'vi',
          notifications_enabled BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      // Add indexes
      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
      `);

      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      `);

      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
      `);

      console.log("Migration to version 3 completed");
      return true;
    } catch (error) {
      console.error("Error in migration to version 3:", error);
      return false;
    }
  },

  // Migration from version 3 to 4
  async migrateToV4() {
    try {
      console.log("Running migration to version 4...");

      // Add product variants table
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          variant_name TEXT NOT NULL,
          variant_value TEXT NOT NULL,
          price_adjustment REAL DEFAULT 0,
          stock_quantity INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id)
        );
      `);

      // Add coupons table
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS coupons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          description TEXT,
          discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
          discount_value REAL NOT NULL,
          min_order_amount REAL DEFAULT 0,
          max_discount_amount REAL,
          usage_limit INTEGER,
          used_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          valid_from DATETIME,
          valid_until DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add order coupons table
      await databaseService.db.execAsync(`
        CREATE TABLE IF NOT EXISTS order_coupons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          coupon_id INTEGER NOT NULL,
          discount_amount REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (coupon_id) REFERENCES coupons(id)
        );
      `);

      // Add indexes
      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
      `);

      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
      `);

      await databaseService.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
      `);

      console.log("Migration to version 4 completed");
      return true;
    } catch (error) {
      console.error("Error in migration to version 4:", error);
      return false;
    }
  },

  // Migration to V5: Business Rules for Supercar Sales
  async migrateToV5() {
    try {
      console.log("Running migration to version 5 - Business Rules...");

      // Add deposit_amount and deposit_paid to orders table
      try {
        await databaseService.db.execAsync(`
                    ALTER TABLE orders ADD COLUMN deposit_amount REAL DEFAULT 0;
                `);
        console.log("Added deposit_amount column to orders");
      } catch (error) {
        if (!error.message.includes("duplicate column")) {
          throw error;
        }
      }

      try {
        await databaseService.db.execAsync(`
                    ALTER TABLE orders ADD COLUMN deposit_paid BOOLEAN DEFAULT 0;
                `);
        console.log("Added deposit_paid column to orders");
      } catch (error) {
        if (!error.message.includes("duplicate column")) {
          throw error;
        }
      }

      // Add cancellation_fee to orders table
      try {
        await databaseService.db.execAsync(`
                    ALTER TABLE orders ADD COLUMN cancellation_fee REAL DEFAULT 0;
                `);
        console.log("Added cancellation_fee column to orders");
      } catch (error) {
        if (!error.message.includes("duplicate column")) {
          throw error;
        }
      }

      // Add date_of_birth to users table for age verification
      try {
        await databaseService.db.execAsync(`
                    ALTER TABLE users ADD COLUMN date_of_birth DATE;
                `);
        console.log("Added date_of_birth column to users");
      } catch (error) {
        if (!error.message.includes("duplicate column")) {
          throw error;
        }
      }

      // Add phone verification columns
      try {
        await databaseService.db.execAsync(`
                    ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT 0;
                `);
        console.log("Added phone_verified column to users");
      } catch (error) {
        if (!error.message.includes("duplicate column")) {
          throw error;
        }
      }

      console.log("Migration to version 5 completed");
      return true;
    } catch (error) {
      console.error("Error in migration to version 5:", error);
      return false;
    }
  },

  // Run all migrations
  async runMigrations(currentVersion = 1) {
    try {
      console.log(`Starting migrations from version ${currentVersion}...`);

      let version = currentVersion;

      // Run migrations sequentially
      if (version < 2) {
        await this.migrateToV2();
        version = 2;
      }

      if (version < 3) {
        await this.migrateToV3();
        version = 3;
      }

      if (version < 4) {
        await this.migrateToV4();
        version = 4;
      }

      if (version < 5) {
        await this.migrateToV5();
        version = 5;
      }

      console.log(`All migrations completed. Current version: ${version}`);
      return version;
    } catch (error) {
      console.error("Error running migrations:", error);
      return currentVersion;
    }
  },

  // Rollback to previous version (use with caution)
  async rollbackToVersion(targetVersion) {
    try {
      console.log(`Rolling back to version ${targetVersion}...`);

      // This is a simplified rollback - in production, you'd want more sophisticated rollback logic
      switch (targetVersion) {
        case 1:
          // Drop tables added in later versions
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS product_images"
          );
          await databaseService.db.execAsync("DROP TABLE IF EXISTS wishlist");
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS notifications"
          );
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS user_preferences"
          );
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS product_variants"
          );
          await databaseService.db.execAsync("DROP TABLE IF EXISTS coupons");
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS order_coupons"
          );
          break;
        case 2:
          // Keep product_images, drop others
          await databaseService.db.execAsync("DROP TABLE IF EXISTS wishlist");
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS notifications"
          );
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS user_preferences"
          );
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS product_variants"
          );
          await databaseService.db.execAsync("DROP TABLE IF EXISTS coupons");
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS order_coupons"
          );
          break;
        case 3:
          // Keep up to version 3 tables
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS product_variants"
          );
          await databaseService.db.execAsync("DROP TABLE IF EXISTS coupons");
          await databaseService.db.execAsync(
            "DROP TABLE IF EXISTS order_coupons"
          );
          break;
        default:
          console.log("Invalid target version for rollback");
          return false;
      }

      console.log(`Rollback to version ${targetVersion} completed`);
      return true;
    } catch (error) {
      console.error("Error during rollback:", error);
      return false;
    }
  },

  // Check current database version
  async getCurrentVersion() {
    try {
      // Check if version table exists
      const versionTable = await databaseService.db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='db_version'"
      );

      if (!versionTable) {
        // Create version table and set initial version
        await databaseService.db.execAsync(`
          CREATE TABLE IF NOT EXISTS db_version (
            version INTEGER PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await databaseService.db.execAsync(
          "INSERT INTO db_version (version) VALUES (1)"
        );
        return 1;
      }

      const result = await databaseService.db.getFirstAsync(
        "SELECT MAX(version) as version FROM db_version"
      );
      return result.version || 1;
    } catch (error) {
      console.error("Error getting current version:", error);
      return 1;
    }
  },

  // Update database version
  async updateVersion(version) {
    try {
      await databaseService.db.execAsync(
        "INSERT INTO db_version (version) VALUES (?)",
        [version]
      );
      return true;
    } catch (error) {
      console.error("Error updating version:", error);
      return false;
    }
  },
};
