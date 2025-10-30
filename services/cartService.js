import databaseService from './databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class CartService {
  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Check if product exists and is available
      const product = await databaseService.getProductById(productId);
      if (!product) throw new Error('Product not found');

      if (product.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // Check if item already exists in cart
      const existingItem = await this.getCartItem(productId);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock_quantity) {
          throw new Error('Insufficient stock');
        }
        return await this.updateCartItem(productId, newQuantity);
      } else {
        // Add new item
        const cartItem = {
          user_id: userId,
          product_id: productId,
          quantity: quantity
        };
        return await databaseService.addCartItem(cartItem);
      }
    } catch (error) {
      console.error('CartService - Error adding to cart:', error);
      throw error;
    }
  }

  // Get cart items
  async getCartItems() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = `
        SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity,
               (ci.quantity * p.price) as total_price
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
      `;
      return await databaseService.db.getAllAsync(query, [userId]);
    } catch (error) {
      console.error('CartService - Error getting cart items:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(productId, quantity) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      if (quantity <= 0) {
        return await this.removeFromCart(productId);
      }

      // Check product stock
      const product = await databaseService.getProductById(productId);
      if (!product) throw new Error('Product not found');

      if (product.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      const query = `
        UPDATE cart_items 
        SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND product_id = ?
      `;
      const result = await databaseService.db.runAsync(query, [quantity, userId, productId]);
      return result.changes > 0;
    } catch (error) {
      console.error('CartService - Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = 'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?';
      const result = await databaseService.db.runAsync(query, [userId, productId]);
      return result.changes > 0;
    } catch (error) {
      console.error('CartService - Error removing from cart:', error);
      throw error;
    }
  }

  // Clear cart
  async clearCart() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = 'DELETE FROM cart_items WHERE user_id = ?';
      const result = await databaseService.db.runAsync(query, [userId]);
      return result.changes > 0;
    } catch (error) {
      console.error('CartService - Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart item by product ID
  async getCartItem(productId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const query = `
        SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ? AND ci.product_id = ?
      `;
      return await databaseService.db.getFirstAsync(query, [userId, productId]);
    } catch (error) {
      console.error('CartService - Error getting cart item:', error);
      return null;
    }
  }

  // Get cart count
  async getCartCount() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return 0;

      const query = 'SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?';
      const result = await databaseService.db.getFirstAsync(query, [userId]);
      return result.count || 0;
    } catch (error) {
      console.error('CartService - Error getting cart count:', error);
      return 0;
    }
  }

  // Get cart total
  async getCartTotal() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return { total: 0, itemCount: 0 };

      const query = `
        SELECT 
          SUM(ci.quantity * p.price) as total,
          SUM(ci.quantity) as item_count
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `;
      const result = await databaseService.db.getFirstAsync(query, [userId]);

      return {
        total: result.total || 0,
        itemCount: result.item_count || 0
      };
    } catch (error) {
      console.error('CartService - Error getting cart total:', error);
      return { total: 0, itemCount: 0 };
    }
  }

  // Check cart availability
  async checkCartAvailability() {
    try {
      const cartItems = await this.getCartItems();
      const unavailableItems = [];

      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          unavailableItems.push({
            product_id: item.product_id,
            product_name: item.name,
            requested_quantity: item.quantity,
            available_quantity: item.stock_quantity
          });
        }
      }

      return {
        isAvailable: unavailableItems.length === 0,
        unavailableItems: unavailableItems
      };
    } catch (error) {
      console.error('CartService - Error checking cart availability:', error);
      return { isAvailable: false, unavailableItems: [] };
    }
  }

  // Update cart item availability
  async updateCartItemAvailability() {
    try {
      const cartItems = await this.getCartItems();
      const updatedItems = [];

      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          // Update quantity to available stock
          await this.updateCartItem(item.product_id, item.stock_quantity);
          updatedItems.push({
            product_id: item.product_id,
            product_name: item.name,
            old_quantity: item.quantity,
            new_quantity: item.stock_quantity
          });
        }
      }

      return updatedItems;
    } catch (error) {
      console.error('CartService - Error updating cart item availability:', error);
      return [];
    }
  }

  // Move cart to wishlist
  async moveToWishlist(productId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Get cart item
      const cartItem = await this.getCartItem(productId);
      if (!cartItem) throw new Error('Item not in cart');

      // Add to wishlist (if wishlist table exists)
      // For now, just remove from cart
      await this.removeFromCart(productId);

      return true;
    } catch (error) {
      console.error('CartService - Error moving to wishlist:', error);
      throw error;
    }
  }

  // Get cart statistics
  async getCartStats() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return { itemCount: 0, totalValue: 0, uniqueProducts: 0 };

      const query = `
        SELECT 
          COUNT(DISTINCT ci.product_id) as unique_products,
          SUM(ci.quantity) as item_count,
          SUM(ci.quantity * p.price) as total_value
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `;
      const result = await databaseService.db.getFirstAsync(query, [userId]);

      return {
        itemCount: result.item_count || 0,
        totalValue: result.total_value || 0,
        uniqueProducts: result.unique_products || 0
      };
    } catch (error) {
      console.error('CartService - Error getting cart stats:', error);
      return { itemCount: 0, totalValue: 0, uniqueProducts: 0 };
    }
  }

  // Sync cart with server (if needed)
  async syncCart() {
    try {
      // In a real app, you might sync with server
      // For now, just return current cart
      return await this.getCartItems();
    } catch (error) {
      console.error('CartService - Error syncing cart:', error);
      throw error;
    }
  }

  // Get current user ID
  async getCurrentUserId() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
      return null;
    } catch (error) {
      console.error('CartService - Error getting current user ID:', error);
      return null;
    }
  }

  // Validate cart before checkout
  async validateCartForCheckout() {
    try {
      const cartItems = await this.getCartItems();

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const availability = await this.checkCartAvailability();
      if (!availability.isAvailable) {
        throw new Error('Some items are not available in the requested quantity');
      }

      return {
        isValid: true,
        cartItems: cartItems,
        total: await this.getCartTotal()
      };
    } catch (error) {
      console.error('CartService - Error validating cart for checkout:', error);
      throw error;
    }
  }
}

export default new CartService();