import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    initializeDatabase,
    syncDataFromAPI,
    backupDatabase,
    restoreDatabase,
    clearDatabase,
    setConnectionStatus,
    clearError,
    updateStats
} from '../store/slices/databaseSlice';
import databaseService from '../services/databaseService';

// Custom hook for database operations
export const useDatabase = () => {
    const dispatch = useDispatch();
    const database = useSelector((state) => state.database);

    const [isConnected, setIsConnected] = useState(false);

    // Initialize database
    const initDatabase = useCallback(async () => {
        try {
            await dispatch(initializeDatabase()).unwrap();
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to initialize database:', error);
            setIsConnected(false);
        }
    }, [dispatch]);

    // Sync data from API
    const syncData = useCallback(async (apiData) => {
        try {
            await dispatch(syncDataFromAPI(apiData)).unwrap();
        } catch (error) {
            console.error('Failed to sync data:', error);
        }
    }, [dispatch]);

    // Backup database
    const backup = useCallback(async () => {
        try {
            const result = await dispatch(backupDatabase()).unwrap();
            return result.backup;
        } catch (error) {
            console.error('Failed to backup database:', error);
            return null;
        }
    }, [dispatch]);

    // Restore database
    const restore = useCallback(async (backupData) => {
        try {
            await dispatch(restoreDatabase(backupData)).unwrap();
        } catch (error) {
            console.error('Failed to restore database:', error);
        }
    }, [dispatch]);

    // Clear database
    const clear = useCallback(async () => {
        try {
            await dispatch(clearDatabase()).unwrap();
        } catch (error) {
            console.error('Failed to clear database:', error);
        }
    }, [dispatch]);

    // Test connection
    const testConnection = useCallback(async () => {
        try {
            const connected = await databaseService.testConnection();
            setIsConnected(connected);
            dispatch(setConnectionStatus(connected ? 'connected' : 'disconnected'));
            return connected;
        } catch (error) {
            console.error('Connection test failed:', error);
            setIsConnected(false);
            dispatch(setConnectionStatus('error'));
            return false;
        }
    }, [dispatch]);

    // Clear error
    const clearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Update stats
    const updateDatabaseStats = useCallback(async () => {
        try {
            const stats = await databaseService.getAdminStats();
            if (stats) {
                dispatch(updateStats(stats));
            }
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }, [dispatch]);

    // Auto-initialize on mount
    useEffect(() => {
        if (!database.isInitialized && !database.isInitializing) {
            initDatabase();
        }
    }, [database.isInitialized, database.isInitializing, initDatabase]);

    // Test connection periodically
    useEffect(() => {
        if (database.isInitialized) {
            const interval = setInterval(() => {
                testConnection();
            }, 30000); // Test every 30 seconds

            return () => clearInterval(interval);
        }
    }, [database.isInitialized, testConnection]);

    return {
        // State
        isInitialized: database.isInitialized,
        isInitializing: database.isInitializing,
        isSyncing: database.isSyncing,
        isBackingUp: database.isBackingUp,
        isRestoring: database.isRestoring,
        isClearing: database.isClearing,
        isConnected,
        version: database.version,
        lastSync: database.lastSync,
        lastBackup: database.lastBackup,
        lastRestore: database.lastRestore,
        lastClear: database.lastClear,
        error: database.error,
        connectionStatus: database.connectionStatus,
        stats: database.stats,

        // Actions
        initDatabase,
        syncData,
        backup,
        restore,
        clear,
        testConnection,
        clearError,
        updateStats: updateDatabaseStats
    };
};

// Custom hook for products
export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getProducts = useCallback(async (limit = null, offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getProducts(limit, offset);
            setProducts(result);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getProductById = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getProductById(id);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const addProduct = useCallback(async (product) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.addProduct(product);
            if (result) {
                await getProducts(); // Refresh list
            }
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getProducts]);

    const updateProduct = useCallback(async (id, product) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.updateProduct(id, product);
            if (result) {
                await getProducts(); // Refresh list
            }
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getProducts]);

    const deleteProduct = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.deleteProduct(id);
            if (result) {
                await getProducts(); // Refresh list
            }
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getProducts]);

    const searchProducts = useCallback(async (query, limit = 20) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.searchProducts(query, limit);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getFeaturedProducts = useCallback(async (limit = 10) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getFeaturedProducts(limit);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getNewProducts = useCallback(async (limit = 10) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getNewProducts(limit);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getProductsByCategory = useCallback(async (categoryId, limit = 20, offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getProductsByCategory(categoryId, limit, offset);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        products,
        loading,
        error,
        getProducts,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        searchProducts,
        getFeaturedProducts,
        getNewProducts,
        getProductsByCategory
    };
};

// Custom hook for categories
export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getCategories();
            setCategories(result);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategoryById = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getCategoryById(id);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const addCategory = useCallback(async (category) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.addCategory(category);
            if (result) {
                await getCategories(); // Refresh list
            }
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [getCategories]);

    const updateCategory = useCallback(async (id, category) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.updateCategory(id, category);
            if (result) {
                await getCategories(); // Refresh list
            }
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getCategories]);

    const deleteCategory = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.deleteCategory(id);
            if (result) {
                await getCategories(); // Refresh list
            }
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getCategories]);

    return {
        categories,
        loading,
        error,
        getCategories,
        getCategoryById,
        addCategory,
        updateCategory,
        deleteCategory
    };
};

// Custom hook for cart
export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCart = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getCart(userId);
            setCartItems(result);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (userId, productId, quantity = 1) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.addToCart(userId, productId, quantity);
            if (result) {
                await getCart(userId); // Refresh cart
            }
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [getCart]);

    const updateCartItem = useCallback(async (cartId, quantity) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.updateCartItem(cartId, quantity);
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeFromCart = useCallback(async (cartId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.removeFromCart(cartId);
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCart = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.clearCart(userId);
            if (result) {
                setCartItems([]);
            }
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Calculate cart total
    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    // Get item count
    const getItemCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    return {
        cartItems,
        loading,
        error,
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount
    };
};

// Custom hook for orders
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getOrders = useCallback(async (userId, limit = 20, offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getOrders(userId, limit, offset);
            setOrders(result);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllOrders = useCallback(async (limit = 50, offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getAllOrders(limit, offset);
            setOrders(result);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrderDetails = useCallback(async (orderId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getOrderDetails(orderId);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = useCallback(async (userId, cartItems, totalAmount, shippingAddress, paymentMethod, notes = '') => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.createOrder(userId, cartItems, totalAmount, shippingAddress, paymentMethod, notes);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId, status) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.updateOrderStatus(orderId, status);
            return result;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        orders,
        loading,
        error,
        getOrders,
        getAllOrders,
        getOrderDetails,
        createOrder,
        updateOrderStatus
    };
};

// Custom hook for reviews
export const useReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getProductReviews = useCallback(async (productId, limit = 20, offset = 0) => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.getProductReviews(productId, limit, offset);
            setReviews(result);
            return result;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const addReview = useCallback(async (userId, productId, rating, comment = '') => {
        try {
            setLoading(true);
            setError(null);
            const result = await databaseService.addReview(userId, productId, rating, comment);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        reviews,
        loading,
        error,
        getProductReviews,
        addReview
    };
};
