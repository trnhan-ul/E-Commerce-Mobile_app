import databaseService from './databaseService';

class ReviewService {
    // Get reviews by product ID
    async getProductReviewsByProductId(productId) {
        try {
            if (!productId) {
                throw new Error('Product ID is required');
            }

            // Kiểm tra database đã sẵn sàng
            const isReady = await databaseService.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready for getProductReviewsByProductId');
                return [];
            }

            // Sử dụng method có sẵn trong databaseService
            return await databaseService.getProductReviews(productId);
        } catch (error) {
            console.error('ReviewService - Error getting product reviews:', error);
            return [];
        }
    }

    // Add new review
    async addReview(reviewData) {
        try {
            const review = {
                product_id: reviewData.product_id,
                user_id: reviewData.user_id,
                rating: reviewData.rating,
                comment: reviewData.comment || '',
                is_approved: reviewData.is_approved !== undefined ? reviewData.is_approved : true
            };

            // Validate rating
            if (review.rating < 1 || review.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Kiểm tra database đã sẵn sàng
            const isReady = await databaseService.ensureDatabaseReady();
            if (!isReady) {
                throw new Error('Database not ready');
            }

            const result = await databaseService.addReview(
                review.user_id,
                review.product_id,
                review.rating,
                review.comment
            );

            // Update product rating and review count
            await databaseService.updateProductRating(review.product_id);

            return result;
        } catch (error) {
            console.error('ReviewService - Error adding review:', error);
            throw error;
        }
    }

    // Update review
    async updateReview(reviewId, reviewData) {
        try {
            const review = {
                rating: reviewData.rating,
                comment: reviewData.comment || '',
                is_approved: reviewData.is_approved !== undefined ? reviewData.is_approved : true
            };

            // Validate rating
            if (review.rating < 1 || review.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            const query = `
        UPDATE product_reviews 
        SET rating = ?, comment = ?, is_approved = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
            const result = await databaseService.db.runAsync(query, [
                review.rating,
                review.comment,
                review.is_approved,
                reviewId
            ]);

            if (result.changes > 0) {
                // Get product_id to update product rating
                const reviewRecord = await this.getReviewById(reviewId);
                if (reviewRecord) {
                    await this.updateProductRating(reviewRecord.product_id);
                }
            }

            return result.changes > 0;
        } catch (error) {
            console.error('ReviewService - Error updating review:', error);
            throw error;
        }
    }

    // Delete review
    async deleteReview(reviewId) {
        try {
            // Get product_id before deleting
            const review = await this.getReviewById(reviewId);
            if (!review) return false;

            const query = 'DELETE FROM product_reviews WHERE id = ?';
            const result = await databaseService.db.runAsync(query, [reviewId]);

            if (result.changes > 0) {
                // Update product rating after deletion
                await this.updateProductRating(review.product_id);
            }

            return result.changes > 0;
        } catch (error) {
            console.error('ReviewService - Error deleting review:', error);
            throw error;
        }
    }

    // Get review by ID
    async getReviewById(reviewId) {
        try {
            const query = `
        SELECT r.*, u.username, u.avatar_url, p.name as product_name
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.id = ?
      `;
            return await databaseService.db.getFirstAsync(query, [reviewId]);
        } catch (error) {
            console.error('ReviewService - Error getting review by id:', error);
            throw error;
        }
    }

    // Get reviews by user ID
    async getReviewsByUserId(userId, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT r.*, p.name as product_name, p.image_url as product_image
        FROM product_reviews r
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
            return await databaseService.db.getAllAsync(query, [userId, limit, offset]);
        } catch (error) {
            console.error('ReviewService - Error getting reviews by user id:', error);
            throw error;
        }
    }

    // Get pending reviews (for admin approval)
    async getPendingReviews(limit = 20, offset = 0) {
        try {
            const query = `
        SELECT r.*, u.username, u.avatar_url, p.name as product_name
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.is_approved = 0
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
            return await databaseService.db.getAllAsync(query, [limit, offset]);
        } catch (error) {
            console.error('ReviewService - Error getting pending reviews:', error);
            throw error;
        }
    }

    // Approve review
    async approveReview(reviewId) {
        try {
            const query = `
        UPDATE product_reviews 
        SET is_approved = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
            const result = await databaseService.db.runAsync(query, [reviewId]);

            if (result.changes > 0) {
                // Get product_id to update product rating
                const review = await this.getReviewById(reviewId);
                if (review) {
                    await this.updateProductRating(review.product_id);
                }
            }

            return result.changes > 0;
        } catch (error) {
            console.error('ReviewService - Error approving review:', error);
            throw error;
        }
    }

    // Reject review
    async rejectReview(reviewId) {
        try {
            const query = `
        UPDATE product_reviews 
        SET is_approved = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
            const result = await databaseService.db.runAsync(query, [reviewId]);
            return result.changes > 0;
        } catch (error) {
            console.error('ReviewService - Error rejecting review:', error);
            throw error;
        }
    }

    // Update product rating based on reviews
    async updateProductRating(productId) {
        try {
            const query = `
        SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM product_reviews 
        WHERE product_id = ? AND is_approved = 1
      `;
            const result = await databaseService.db.getFirstAsync(query, [productId]);

            if (result) {
                const avgRating = result.avg_rating || 0;
                const reviewCount = result.review_count || 0;

                const updateQuery = `
          UPDATE products 
          SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
                await databaseService.db.runAsync(updateQuery, [avgRating, reviewCount, productId]);
            }
        } catch (error) {
            console.error('ReviewService - Error updating product rating:', error);
        }
    }

    // Get review statistics
    async getReviewStats() {
        try {
            const stats = {};

            // Total reviews
            const totalResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM product_reviews');
            stats.totalReviews = totalResult.count;

            // Approved reviews count
            const approvedResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM product_reviews WHERE is_approved = 1');
            stats.approvedReviews = approvedResult.count;

            // Pending reviews count
            const pendingResult = await databaseService.db.getFirstAsync('SELECT COUNT(*) as count FROM product_reviews WHERE is_approved = 0');
            stats.pendingReviews = pendingResult.count;

            // Average rating
            const avgRatingResult = await databaseService.db.getFirstAsync('SELECT AVG(rating) as avg_rating FROM product_reviews WHERE is_approved = 1');
            stats.averageRating = avgRatingResult.avg_rating || 0;

            // Rating distribution
            const ratingDistResult = await databaseService.db.getAllAsync(`
        SELECT rating, COUNT(*) as count 
        FROM product_reviews 
        WHERE is_approved = 1 
        GROUP BY rating 
        ORDER BY rating DESC
      `);
            stats.ratingDistribution = ratingDistResult;

            return stats;
        } catch (error) {
            console.error('ReviewService - Error getting review stats:', error);
            throw error;
        }
    }

    // Get reviews by rating
    async getReviewsByRating(rating, limit = 20, offset = 0) {
        try {
            const query = `
        SELECT r.*, u.username, u.avatar_url, p.name as product_name
        FROM product_reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.rating = ? AND r.is_approved = 1
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
            return await databaseService.db.getAllAsync(query, [rating, limit, offset]);
        } catch (error) {
            console.error('ReviewService - Error getting reviews by rating:', error);
            throw error;
        }
    }

    // Check if user can review product
    async canUserReviewProduct(userId, productId) {
        try {
            // Check if user already reviewed this product
            const existingReview = await databaseService.db.getFirstAsync(
                'SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            return !existingReview;
        } catch (error) {
            console.error('ReviewService - Error checking if user can review:', error);
            return false;
        }
    }

    // Get user's review for a product
    async getUserReviewForProduct(userId, productId) {
        try {
            const query = `
        SELECT r.*, p.name as product_name
        FROM product_reviews r
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ? AND r.product_id = ?
      `;
            return await databaseService.db.getFirstAsync(query, [userId, productId]);
        } catch (error) {
            console.error('ReviewService - Error getting user review for product:', error);
            throw error;
        }
    }
}

export default new ReviewService();