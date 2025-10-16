import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import databaseService from '../services/databaseService';
import { migrations } from '../services/databaseMigrations';

// Async thunks for database operations
export const initializeDatabase = createAsyncThunk(
    'database/initialize',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Initializing database...');

            // Initialize database
            await databaseService.init();

            // Check current version and run migrations
            const currentVersion = await migrations.getCurrentVersion();
            const newVersion = await migrations.runMigrations(currentVersion);

            // Update version if migrations were run
            if (newVersion > currentVersion) {
                await migrations.updateVersion(newVersion);
            }

            // Test connection
            const isConnected = await databaseService.testConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }

            console.log('Database initialized successfully');
            return {
                isInitialized: true,
                version: newVersion,
                lastSync: new Date().toISOString()
            };
        } catch (error) {
            console.error('Database initialization failed:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const syncDataFromAPI = createAsyncThunk(
    'database/syncFromAPI',
    async (apiData, { rejectWithValue }) => {
        try {
            console.log('Syncing data from API...');

            if (!databaseService.isInitialized) {
                throw new Error('Database not initialized');
            }

            // Sync categories
            if (apiData.categories) {
                for (const category of apiData.categories) {
                    const existing = await databaseService.getCategoryById(category.id);
                    if (existing) {
                        await databaseService.updateCategory(category.id, category);
                    } else {
                        await databaseService.addCategory(category);
                    }
                }
            }

            // Sync products
            if (apiData.products) {
                for (const product of apiData.products) {
                    const existing = await databaseService.getProductById(product.id);
                    if (existing) {
                        await databaseService.updateProduct(product.id, product);
                    } else {
                        await databaseService.addProduct(product);
                    }
                }
            }

            console.log('Data synced successfully');
            return {
                lastSync: new Date().toISOString(),
                syncedItems: {
                    categories: apiData.categories?.length || 0,
                    products: apiData.products?.length || 0
                }
            };
        } catch (error) {
            console.error('Data sync failed:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const backupDatabase = createAsyncThunk(
    'database/backup',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Creating database backup...');

            if (!databaseService.isInitialized) {
                throw new Error('Database not initialized');
            }

            const backup = await databaseService.backupDatabase();
            if (!backup) {
                throw new Error('Backup failed');
            }

            console.log('Database backup created successfully');
            return {
                backup,
                backupDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Database backup failed:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const restoreDatabase = createAsyncThunk(
    'database/restore',
    async (backupData, { rejectWithValue }) => {
        try {
            console.log('Restoring database from backup...');

            if (!databaseService.isInitialized) {
                throw new Error('Database not initialized');
            }

            const success = await databaseService.restoreDatabase(backupData);
            if (!success) {
                throw new Error('Restore failed');
            }

            console.log('Database restored successfully');
            return {
                restoreDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Database restore failed:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const clearDatabase = createAsyncThunk(
    'database/clear',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Clearing database...');

            if (!databaseService.isInitialized) {
                throw new Error('Database not initialized');
            }

            const success = await databaseService.clearAllData();
            if (!success) {
                throw new Error('Clear database failed');
            }

            console.log('Database cleared successfully');
            return {
                clearDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Clear database failed:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Database slice
const databaseSlice = createSlice({
    name: 'database',
    initialState: {
        isInitialized: false,
        isInitializing: false,
        isSyncing: false,
        isBackingUp: false,
        isRestoring: false,
        isClearing: false,
        version: 1,
        lastSync: null,
        lastBackup: null,
        lastRestore: null,
        lastClear: null,
        error: null,
        connectionStatus: 'disconnected', // 'connected', 'disconnected', 'error'
        stats: {
            totalProducts: 0,
            totalCategories: 0,
            totalUsers: 0,
            totalOrders: 0,
            totalRevenue: 0
        }
    },
    reducers: {
        setConnectionStatus: (state, action) => {
            state.connectionStatus = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setLastSync: (state, action) => {
            state.lastSync = action.payload;
        },
        updateStats: (state, action) => {
            state.stats = { ...state.stats, ...action.payload };
        },
        resetDatabase: (state) => {
            state.isInitialized = false;
            state.isInitializing = false;
            state.isSyncing = false;
            state.isBackingUp = false;
            state.isRestoring = false;
            state.isClearing = false;
            state.version = 1;
            state.lastSync = null;
            state.lastBackup = null;
            state.lastRestore = null;
            state.lastClear = null;
            state.error = null;
            state.connectionStatus = 'disconnected';
            state.stats = {
                totalProducts: 0,
                totalCategories: 0,
                totalUsers: 0,
                totalOrders: 0,
                totalRevenue: 0
            };
        }
    },
    extraReducers: (builder) => {
        // Initialize database
        builder
            .addCase(initializeDatabase.pending, (state) => {
                state.isInitializing = true;
                state.error = null;
                state.connectionStatus = 'connecting';
            })
            .addCase(initializeDatabase.fulfilled, (state, action) => {
                state.isInitializing = false;
                state.isInitialized = true;
                state.connectionStatus = 'connected';
                state.version = action.payload.version;
                state.lastSync = action.payload.lastSync;
                state.error = null;
            })
            .addCase(initializeDatabase.rejected, (state, action) => {
                state.isInitializing = false;
                state.isInitialized = false;
                state.connectionStatus = 'error';
                state.error = action.payload;
            });

        // Sync data from API
        builder
            .addCase(syncDataFromAPI.pending, (state) => {
                state.isSyncing = true;
                state.error = null;
            })
            .addCase(syncDataFromAPI.fulfilled, (state, action) => {
                state.isSyncing = false;
                state.lastSync = action.payload.lastSync;
                state.error = null;
            })
            .addCase(syncDataFromAPI.rejected, (state, action) => {
                state.isSyncing = false;
                state.error = action.payload;
            });

        // Backup database
        builder
            .addCase(backupDatabase.pending, (state) => {
                state.isBackingUp = true;
                state.error = null;
            })
            .addCase(backupDatabase.fulfilled, (state, action) => {
                state.isBackingUp = false;
                state.lastBackup = action.payload.backupDate;
                state.error = null;
            })
            .addCase(backupDatabase.rejected, (state, action) => {
                state.isBackingUp = false;
                state.error = action.payload;
            });

        // Restore database
        builder
            .addCase(restoreDatabase.pending, (state) => {
                state.isRestoring = true;
                state.error = null;
            })
            .addCase(restoreDatabase.fulfilled, (state, action) => {
                state.isRestoring = false;
                state.lastRestore = action.payload.restoreDate;
                state.error = null;
            })
            .addCase(restoreDatabase.rejected, (state, action) => {
                state.isRestoring = false;
                state.error = action.payload;
            });

        // Clear database
        builder
            .addCase(clearDatabase.pending, (state) => {
                state.isClearing = true;
                state.error = null;
            })
            .addCase(clearDatabase.fulfilled, (state, action) => {
                state.isClearing = false;
                state.lastClear = action.payload.clearDate;
                state.error = null;
            })
            .addCase(clearDatabase.rejected, (state, action) => {
                state.isClearing = false;
                state.error = action.payload;
            });
    }
});

// Export actions
export const {
    setConnectionStatus,
    clearError,
    setLastSync,
    updateStats,
    resetDatabase
} = databaseSlice.actions;

// Selectors
export const selectDatabase = (state) => state.database;
export const selectIsDatabaseInitialized = (state) => state.database.isInitialized;
export const selectIsDatabaseLoading = (state) => state.database.isInitializing;
export const selectDatabaseError = (state) => state.database.error;
export const selectDatabaseStats = (state) => state.database.stats;
export const selectLastSync = (state) => state.database.lastSync;
export const selectConnectionStatus = (state) => state.database.connectionStatus;

// Export reducer
export default databaseSlice.reducer;
