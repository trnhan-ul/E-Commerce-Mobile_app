import databaseService from './databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      console.log('OrderService - Creating order with data:', orderData);

      // Validate required fields
      if (!orderData.total_amount || orderData.total_amount <= 0) {
        throw new Error('Invalid total amount');
      }

      if (!orderData.shipping_address) {
        throw new Error('Shipping address is required');
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order must have at least one item');
      }

      console.log('OrderService - Calling databaseService.createOrder');

      // Use databaseService.createOrder which handles everything in a transaction
      const orderId = await databaseService.createOrder(
        userId,
        orderData.items,
        parseFloat(orderData.total_amount),
        orderData.shipping_address,
        orderData.payment_method || 'cod',
        orderData.notes || ''
      );

      console.log('OrderService - Order created successfully with ID:', orderId);

      return orderId;
    } catch (error) {
      console.error('OrderService - Error creating order:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ? AND o.user_id = ?
        GROUP BY o.id
      `;
      const order = await databaseService.db.getFirstAsync(query, [orderId, userId]);

      if (order) {
        // Get order items
        const itemsQuery = `
          SELECT oi.*, p.name as product_name, p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `;
        order.items = await databaseService.db.getAllAsync(itemsQuery, [orderId]);
      }

      return order;
    } catch (error) {
      console.error('OrderService - Error getting order by id:', error);
      throw error;
    }
  }

  // Get user orders
  async getUserOrders(limit = 20, offset = 0, status = null) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      let query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
      `;
      let params = [userId];

      if (status) {
        query += ' AND o.status = ?';
        params.push(status);
      }

      query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const orders = await databaseService.db.getAllAsync(query, params);

      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const itemsQuery = `
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
          `;
          const items = await databaseService.db.getAllAsync(itemsQuery, [order.id]);
          return { ...order, items };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('OrderService - Error getting user orders:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      const query = `
        UPDATE orders 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `;
      const result = await databaseService.db.runAsync(query, [status, orderId, userId]);
      return result.changes > 0;
    } catch (error) {
      console.error('OrderService - Error updating order status:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason = '') {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Check if order can be cancelled
      const order = await this.getOrderById(orderId);
      if (!order) throw new Error('Order not found');

      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error('Order cannot be cancelled');
      }

      const query = `
        UPDATE orders 
        SET status = 'cancelled', notes = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `;
      const result = await databaseService.db.runAsync(query, [reason, orderId, userId]);
      return result.changes > 0;
    } catch (error) {
      console.error('OrderService - Error cancelling order:', error);
      throw error;
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const stats = {};

      // Total orders
      const totalOrdersResult = await databaseService.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [userId]
      );
      stats.totalOrders = totalOrdersResult.count;

      // Pending orders
      const pendingOrdersResult = await databaseService.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status = "pending"',
        [userId]
      );
      stats.pendingOrders = pendingOrdersResult.count;

      // Completed orders
      const completedOrdersResult = await databaseService.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status = "delivered"',
        [userId]
      );
      stats.completedOrders = completedOrdersResult.count;

      // Total spent
      const totalSpentResult = await databaseService.db.getFirstAsync(
        'SELECT SUM(total_amount) as total FROM orders WHERE user_id = ? AND status = "delivered"',
        [userId]
      );
      stats.totalSpent = totalSpentResult.total || 0;

      // This month orders
      const thisMonthResult = await databaseService.db.getFirstAsync(`
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE user_id = ? AND created_at >= date('now', 'start of month')
      `, [userId]);
      stats.thisMonthOrders = thisMonthResult.count;

      return stats;
    } catch (error) {
      console.error('OrderService - Error getting order stats:', error);
      throw error;
    }
  }

  // Get orders by status
  async getOrdersByStatus(status, limit = 20, offset = 0) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ? AND o.status = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `;
      return await databaseService.db.getAllAsync(query, [userId, status, limit, offset]);
    } catch (error) {
      console.error('OrderService - Error getting orders by status:', error);
      throw error;
    }
  }

  // Get recent orders
  async getRecentOrders(limit = 5) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const query = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ?
      `;
      return await databaseService.db.getAllAsync(query, [userId, limit]);
    } catch (error) {
      console.error('OrderService - Error getting recent orders:', error);
      throw error;
    }
  }

  // Search orders
  async searchOrders(query, limit = 20, offset = 0) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      const searchQuery = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ? AND (
          o.id LIKE ? OR 
          o.status LIKE ? OR 
          o.payment_method LIKE ? OR
          o.shipping_address LIKE ?
        )
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const searchTerm = `%${query}%`;
      return await databaseService.db.getAllAsync(searchQuery, [
        userId, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset
      ]);
    } catch (error) {
      console.error('OrderService - Error searching orders:', error);
      throw error;
    }
  }

  // Get order items
  async getOrderItems(orderId) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not logged in');

      // Verify order belongs to user
      const order = await this.getOrderById(orderId);
      if (!order) throw new Error('Order not found');

      const query = `
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      return await databaseService.db.getAllAsync(query, [orderId]);
    } catch (error) {
      console.error('OrderService - Error getting order items:', error);
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
      console.error('OrderService - Error getting current user ID:', error);
      return null;
    }
  }

  // Get order history for admin (if needed)
  async getAllOrders(limit = 20, offset = 0, status = null) {
    try {
      let query = `
        SELECT o.*, u.username, u.email,
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
      `;
      let params = [];

      if (status) {
        query += ' WHERE o.status = ?';
        params.push(status);
      }

      query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return await databaseService.db.getAllAsync(query, params);
    } catch (error) {
      console.error('OrderService - Error getting all orders:', error);
      throw error;
    }
  }
}

export default new OrderService();