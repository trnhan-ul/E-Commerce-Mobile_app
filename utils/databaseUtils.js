import databaseService from '../services/databaseService';

// Utility functions for database management
export const databaseUtils = {
    // Check if database exists
    async isDatabaseExists() {
        try {
            return await databaseService.isDatabaseExists();
        } catch (error) {
            console.error('Error checking database existence:', error);
            return false;
        }
    },

    // Test database connection
    async testConnection() {
        try {
            return await databaseService.testConnection();
        } catch (error) {
            console.error('Error testing connection:', error);
            return false;
        }
    },

    // Get database size
    async getDatabaseSize() {
        try {
            // This is a simplified version - in a real app you'd need more sophisticated size calculation
            const tables = ['products', 'categories', 'users', 'cart', 'orders', 'order_items', 'reviews'];
            let totalRows = 0;

            for (const table of tables) {
                const result = await databaseService.db.getFirstAsync(`SELECT COUNT(*) as count FROM ${table}`);
                totalRows += result.count;
            }

            return {
                totalRows,
                estimatedSize: totalRows * 1024 // Rough estimate: 1KB per row
            };
        } catch (error) {
            console.error('Error getting database size:', error);
            return { totalRows: 0, estimatedSize: 0 };
        }
    },

    // Backup database
    async backupDatabase() {
        try {
            console.log('Creating database backup...');
            const backup = await databaseService.backupDatabase();

            if (backup) {
                // In a real app, you might want to save this to AsyncStorage or file system
                const backupData = {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    data: backup
                };

                console.log('Database backup created successfully');
                return backupData;
            }

            return null;
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    },

    // Restore database
    async restoreDatabase(backupData) {
        try {
            console.log('Restoring database from backup...');

            if (!backupData || !backupData.data) {
                throw new Error('Invalid backup data');
            }

            const success = await databaseService.restoreDatabase(backupData.data);

            if (success) {
                console.log('Database restored successfully');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error restoring database:', error);
            return false;
        }
    },

    // Export data to JSON
    async exportToJSON() {
        try {
            console.log('Exporting database to JSON...');

            const tables = ['products', 'categories', 'users', 'cart', 'orders', 'order_items', 'reviews'];
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                tables: {}
            };

            for (const table of tables) {
                exportData.tables[table] = await databaseService.db.getAllAsync(`SELECT * FROM ${table}`);
            }

            console.log('Database exported to JSON successfully');
            return exportData;
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            return null;
        }
    },

    // Import data from JSON
    async importFromJSON(jsonData) {
        try {
            console.log('Importing database from JSON...');

            if (!jsonData || !jsonData.tables) {
                throw new Error('Invalid JSON data');
            }

            // Clear existing data
            await databaseService.clearAllData();

            // Import data table by table
            for (const [tableName, data] of Object.entries(jsonData.tables)) {
                if (Array.isArray(data)) {
                    for (const row of data) {
                        const columns = Object.keys(row).join(', ');
                        const placeholders = Object.keys(row).map(() => '?').join(', ');
                        const values = Object.values(row);

                        await databaseService.db.runAsync(
                            `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
                            values
                        );
                    }
                }
            }

            console.log('Database imported from JSON successfully');
            return true;
        } catch (error) {
            console.error('Error importing from JSON:', error);
            return false;
        }
    },

    // Optimize database
    async optimizeDatabase() {
        try {
            console.log('Optimizing database...');

            // Run VACUUM to optimize database
            await databaseService.db.execAsync('VACUUM');

            // Analyze tables for better query performance
            await databaseService.db.execAsync('ANALYZE');

            console.log('Database optimized successfully');
            return true;
        } catch (error) {
            console.error('Error optimizing database:', error);
            return false;
        }
    },

    // Get database statistics
    async getDatabaseStats() {
        try {
            const stats = await databaseService.getAdminStats();
            const size = await this.getDatabaseSize();

            return {
                ...stats,
                ...size,
                lastOptimized: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            return null;
        }
    },

    // Validate database integrity
    async validateIntegrity() {
        try {
            console.log('Validating database integrity...');

            // Check for foreign key constraints
            const foreignKeyCheck = await databaseService.db.getFirstAsync('PRAGMA foreign_key_check');

            // Check for table integrity
            const integrityCheck = await databaseService.db.getFirstAsync('PRAGMA integrity_check');

            const isValid = !foreignKeyCheck && integrityCheck.status === 'ok';

            console.log(isValid ? 'Database integrity check passed' : 'Database integrity check failed');
            return {
                isValid,
                foreignKeyCheck,
                integrityCheck
            };
        } catch (error) {
            console.error('Error validating database integrity:', error);
            return { isValid: false, error: error.message };
        }
    },

    // Clean up old data
    async cleanupOldData(daysOld = 30) {
        try {
            console.log(`🧹 Cleaning up data older than ${daysOld} days...`);

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const cutoffISO = cutoffDate.toISOString();

            // Clean up old cart items
            await databaseService.db.execAsync(
                'DELETE FROM cart WHERE created_at < ?',
                [cutoffISO]
            );

            // Clean up old notifications (if table exists)
            try {
                await databaseService.db.execAsync(
                    'DELETE FROM notifications WHERE created_at < ?',
                    [cutoffISO]
                );
            } catch (error) {
                // Table might not exist, ignore error
            }

            console.log('Old data cleanup completed');
            return true;
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            return false;
        }
    },

    // Reset database to initial state
    async resetDatabase() {
        try {
            console.log('Resetting database to initial state...');

            // Clear all data
            await databaseService.clearAllData();

            // Recreate tables
            await databaseService.createTables();

            console.log('Database reset completed');
            return true;
        } catch (error) {
            console.error('Error resetting database:', error);
            return false;
        }
    },

    // Get table information
    async getTableInfo(tableName) {
        try {
            const columns = await databaseService.db.getAllAsync(`PRAGMA table_info(${tableName})`);
            const indexes = await databaseService.db.getAllAsync(`PRAGMA index_list(${tableName})`);
            const rowCount = await databaseService.db.getFirstAsync(`SELECT COUNT(*) as count FROM ${tableName}`);

            return {
                tableName,
                columns,
                indexes,
                rowCount: rowCount.count
            };
        } catch (error) {
            console.error(`Error getting table info for ${tableName}:`, error);
            return null;
        }
    },

    // Get all table names
    async getTableNames() {
        try {
            const result = await databaseService.db.getAllAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            );
            return result.map(row => row.name);
        } catch (error) {
            console.error('Error getting table names:', error);
            return [];
        }
    },

    // Execute custom query (use with caution)
    async executeQuery(query, params = []) {
        try {
            console.log('Executing custom query...');

            if (query.trim().toLowerCase().startsWith('select')) {
                const result = await databaseService.db.getAllAsync(query, params);
                return result;
            } else {
                const result = await databaseService.db.runAsync(query, params);
                return result;
            }
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
};
