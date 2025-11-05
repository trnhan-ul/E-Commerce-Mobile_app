import databaseService from './databaseService';

class CategoryService {
    // Get all categories
    async getCategories(limit = null, offset = 0) {
        try {
            return await databaseService.getCategories(limit, offset);
        } catch (error) {
            console.error('CategoryService - Error getting categories:', error);
            throw error;
        }
    }

    // Get category by ID
    async getCategoryById(id) {
        try {
            return await databaseService.getCategoryById(id);
        } catch (error) {
            console.error('CategoryService - Error getting category by id:', error);
            throw error;
        }
    }

    // Add new category
    async addCategory(categoryData) {
        try {
            const category = {
                name: categoryData.name,
                description: categoryData.description || '',
                image_url: categoryData.image_url || '',
                is_active: categoryData.is_active !== undefined ? categoryData.is_active : true
            };

            return await databaseService.addCategory(category);
        } catch (error) {
            console.error('CategoryService - Error adding category:', error);
            throw error;
        }
    }

    // Update category
    async updateCategory(id, categoryData) {
        try {
            const category = {
                name: categoryData.name,
                description: categoryData.description || '',
                image_url: categoryData.image_url || '',
                is_active: categoryData.is_active !== undefined ? categoryData.is_active : true
            };

            return await databaseService.updateCategory(id, category);
        } catch (error) {
            console.error('CategoryService - Error updating category:', error);
            throw error;
        }
    }

    // Delete category
    async deleteCategory(id) {
        try {
            return await databaseService.deleteCategory(id);
        } catch (error) {
            console.error('CategoryService - Error deleting category:', error);
            throw error;
        }
    }

    // Search categories
    async searchCategories(query, limit = 20) {
        try {
            return await databaseService.searchCategories(query, limit);
        } catch (error) {
            console.error('CategoryService - Error searching categories:', error);
            throw error;
        }
    }

    // Get active categories
    async getActiveCategories(limit = 20) {
        try {
            const query = `
        SELECT * FROM categories 
        WHERE is_active = 1 
        ORDER BY name ASC 
        LIMIT ?
      `;
            return await databaseService.db.getAllAsync(query, [limit]);
        } catch (error) {
            console.error('CategoryService - Error getting active categories:', error);
            throw error;
        }
    }

    // Get category with product count
    async getCategoryWithProductCount(categoryId) {
        try {
            const query = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE c.id = ?
        GROUP BY c.id
      `;
            return await databaseService.db.getFirstAsync(query, [categoryId]);
        } catch (error) {
            console.error('CategoryService - Error getting category with product count:', error);
            throw error;
        }
    }

    // Get all categories with product count
    async getCategoriesWithProductCount(limit = 20, offset = 0) {
        try {
            const query = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
        LIMIT ? OFFSET ?
      `;
            return await databaseService.db.getAllAsync(query, [limit, offset]);
        } catch (error) {
            console.error('CategoryService - Error getting categories with product count:', error);
            throw error;
        }
    }

    // Toggle category active status
    async toggleCategoryStatus(id) {
        try {
            const category = await this.getCategoryById(id);
            if (!category) throw new Error('Category not found');

            const newStatus = !category.is_active;
            const newStatusInt = newStatus ? 1 : 0;
            const query = `
        UPDATE categories 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
            try {
                const result = await databaseService.db.runAsync(query, [newStatusInt, id]);
                return result.changes > 0;
            } catch (err) {
                const msg = String(err?.message || '');
                if (msg.includes('no such column: updated_at')) {
                    // Thêm cột và thử lại
                    await databaseService.db.runAsync('ALTER TABLE categories ADD COLUMN updated_at DATETIME');
                    await databaseService.db.runAsync("UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL");
                    const result = await databaseService.db.runAsync(query, [newStatusInt, id]);
                    return result.changes > 0;
                }
                if (msg.includes('no such column: is_active')) {
                    await databaseService.db.runAsync('ALTER TABLE categories ADD COLUMN is_active INTEGER DEFAULT 1');
                    const result = await databaseService.db.runAsync(query, [newStatusInt, id]);
                    return result.changes > 0;
                }
                throw err;
            }
        } catch (error) {
            console.error('CategoryService - Error toggling category status:', error);
            throw error;
        }
    }

    // Get category statistics
    async getCategoryStats() {
        try {
            const stats = {};

            // Total categories
            const totalResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM categories');
            stats.totalCategories = totalResult.count;

            // Active categories count
            const activeResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM categories WHERE is_active = 1');
            stats.activeCategories = activeResult.count;

            // Inactive categories count
            const inactiveResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM categories WHERE is_active = 0');
            stats.inactiveCategories = inactiveResult.count;

            // Categories with products count
            const withProductsResult = await databaseService.db.getFirstAsync(`
        SELECT COUNT(DISTINCT c.id) as count 
        FROM categories c 
        INNER JOIN products p ON c.id = p.category_id
      `);
            stats.categoriesWithProducts = withProductsResult.count;

            return stats;
        } catch (error) {
            console.error('CategoryService - Error getting category stats:', error);
            throw error;
        }
    }

    // Bulk update categories
    async bulkUpdateCategories(updates) {
        try {
            const results = [];

            for (const update of updates) {
                const result = await this.updateCategory(update.id, update.data);
                results.push({ id: update.id, success: result });
            }

            return results;
        } catch (error) {
            console.error('CategoryService - Error bulk updating categories:', error);
            throw error;
        }
    }

    // Export categories to JSON
    async exportCategories() {
        try {
            const categories = await this.getCategories();
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                categories: categories
            };

            return exportData;
        } catch (error) {
            console.error('CategoryService - Error exporting categories:', error);
            throw error;
        }
    }

    // Import categories from JSON
    async importCategories(importData) {
        try {
            const results = [];

            for (const categoryData of importData.categories) {
                try {
                    const result = await this.addCategory(categoryData);
                    results.push({ success: true, id: result });
                } catch (error) {
                    results.push({ success: false, error: error.message, data: categoryData });
                }
            }

            return results;
        } catch (error) {
            console.error('CategoryService - Error importing categories:', error);
            throw error;
        }
    }
}

export default new CategoryService();