import databaseService from './databaseService';

class ProductService {
    // Get all products
    async getProducts(limit = null, offset = 0) {
        try {
            return await databaseService.getProducts(limit, offset);
        } catch (error) {
            console.error('ProductService - Error getting products:', error);
            throw error;
        }
    }

    // Get product by ID
    async getProductById(id) {
        try {
            return await databaseService.getProductById(id);
        } catch (error) {
            console.error('ProductService - Error getting product by id:', error);
            throw error;
        }
    }

    // Add new product
    async addProduct(productData) {
        try {
            const product = {
                name: productData.name,
                price: productData.price,
                description: productData.description || '',
                image_url: productData.image_url || '',
                category_id: productData.category_id,
                stock_quantity: productData.stock_quantity || 0,
                is_featured: productData.is_featured || false,
                is_new: productData.is_new || false,
                rating: productData.rating || 0,
                review_count: productData.review_count || 0
            };

            return await databaseService.addProduct(product);
        } catch (error) {
            console.error('ProductService - Error adding product:', error);
            throw error;
        }
    }

    // Update product
    async updateProduct(id, productData) {
        try {
            const product = {
                name: productData.name,
                price: productData.price,
                description: productData.description || '',
                image_url: productData.image_url || '',
                category_id: productData.category_id,
                stock_quantity: productData.stock_quantity || 0,
                is_featured: productData.is_featured || false,
                is_new: productData.is_new || false
            };

            return await databaseService.updateProduct(id, product);
        } catch (error) {
            console.error('ProductService - Error updating product:', error);
            throw error;
        }
    }

    // Delete product
    async deleteProduct(id) {
        try {
            return await databaseService.deleteProduct(id);
        } catch (error) {
            console.error('ProductService - Error deleting product:', error);
            throw error;
        }
    }

    // Search products
    async searchProducts(query, limit = 20) {
        try {
            return await databaseService.searchProducts(query, limit);
        } catch (error) {
            console.error('ProductService - Error searching products:', error);
            throw error;
        }
    }

    // Get featured products
    async getFeaturedProducts(limit = 10) {
        try {
            return await databaseService.getFeaturedProducts(limit);
        } catch (error) {
            console.error('ProductService - Error getting featured products:', error);
            throw error;
        }
    }

    // Get new products
    async getNewProducts(limit = 10) {
        try {
            return await databaseService.getNewProducts(limit);
        } catch (error) {
            console.error('ProductService - Error getting new products:', error);
            throw error;
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId, limit = 20, offset = 0) {
        try {
            return await databaseService.getProductsByCategory(categoryId, limit, offset);
        } catch (error) {
            console.error('ProductService - Error getting products by category:', error);
            throw error;
        }
    }

    // Get products by price range
    async getProductsByPriceRange(minPrice, maxPrice, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT * FROM products 
        WHERE price >= ? AND price <= ? 
        ORDER BY price ASC 
        LIMIT ? OFFSET ?
      `;
            return await databaseService.db.getAllAsync(query, [minPrice, maxPrice, limit, offset]);
        } catch (error) {
            console.error('ProductService - Error getting products by price range:', error);
            throw error;
        }
    }

    // Get products by rating
    async getProductsByRating(minRating, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT * FROM products 
        WHERE rating >= ? 
        ORDER BY rating DESC 
        LIMIT ? OFFSET ?
      `;
            return await databaseService.db.getAllAsync(query, [minRating, limit, offset]);
        } catch (error) {
            console.error('ProductService - Error getting products by rating:', error);
            throw error;
        }
    }

    // Get related products
    async getRelatedProducts(productId, limit = 5) {
        try {
            // First get the product to find its category
            const product = await this.getProductById(productId);
            if (!product) return [];

            // Get products from the same category, excluding the current product
            const query = `
        SELECT * FROM products 
        WHERE category_id = ? AND id != ? 
        ORDER BY rating DESC 
        LIMIT ?
      `;
            return await databaseService.db.getAllAsync(query, [product.category_id, productId, limit]);
        } catch (error) {
            console.error('ProductService - Error getting related products:', error);
            throw error;
        }
    }

    // Update product stock
    async updateProductStock(productId, quantity) {
        try {
            const query = `
        UPDATE products 
        SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND stock_quantity >= ?
      `;
            const result = await databaseService.db.runAsync(query, [quantity, productId, quantity]);
            return result.changes > 0;
        } catch (error) {
            console.error('ProductService - Error updating product stock:', error);
            throw error;
        }
    }

    // Check product availability
    async checkProductAvailability(productId, quantity = 1) {
        try {
            const product = await this.getProductById(productId);
            if (!product) return false;

            return product.stock_quantity >= quantity;
        } catch (error) {
            console.error('ProductService - Error checking product availability:', error);
            return false;
        }
    }

    // Get product statistics
    async getProductStats() {
        try {
            const stats = {};

            // Total products
            const totalResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM products');
            stats.totalProducts = totalResult.count;

            // Featured products count
            const featuredResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM products WHERE is_featured = 1');
            stats.featuredProducts = featuredResult.count;

            // New products count
            const newResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM products WHERE is_new = 1');
            stats.newProducts = newResult.count;

            // Out of stock count
            const outOfStockResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM products WHERE stock_quantity = 0');
            stats.outOfStock = outOfStockResult.count;

            // Average price
            const avgPriceResult = await databaseService.db.getFirstAsync('SELECT AVG(price) as avg_price FROM products');
            stats.averagePrice = avgPriceResult.avg_price || 0;

            // Average rating
            const avgRatingResult = await databaseService.db.getFirstAsync('SELECT AVG(rating) as avg_rating FROM products WHERE rating > 0');
            stats.averageRating = avgRatingResult.avg_rating || 0;

            return stats;
        } catch (error) {
            console.error('ProductService - Error getting product stats:', error);
            throw error;
        }
    }

    // Bulk update products
    async bulkUpdateProducts(updates) {
        try {
            const results = [];

            for (const update of updates) {
                const result = await this.updateProduct(update.id, update.data);
                results.push({ id: update.id, success: result });
            }

            return results;
        } catch (error) {
            console.error('ProductService - Error bulk updating products:', error);
            throw error;
        }
    }

    // Export products to JSON
    async exportProducts() {
        try {
            const products = await this.getProducts();
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                products: products
            };

            return exportData;
        } catch (error) {
            console.error('ProductService - Error exporting products:', error);
            throw error;
        }
    }

    // Import products from JSON
    async importProducts(importData) {
        try {
            const results = [];

            for (const productData of importData.products) {
                try {
                    const result = await this.addProduct(productData);
                    results.push({ success: true, id: result });
                } catch (error) {
                    results.push({ success: false, error: error.message, data: productData });
                }
            }

            return results;
        } catch (error) {
            console.error('ProductService - Error importing products:', error);
            throw error;
        }
    }
}

export default new ProductService();