import AsyncStorage from '@react-native-async-storage/async-storage';

class GuestService {
    constructor() {
        this.guestId = null;
        this.guestData = null;
    }

    // Generate unique guest ID
    generateGuestId() {
        return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Initialize guest session
    async initializeGuest() {
        try {
            this.guestId = this.generateGuestId();
            this.guestData = {
                id: this.guestId,
                created_at: new Date().toISOString(),
                cart: [],
                preferences: {
                    theme: 'light',
                    language: 'vi'
                }
            };

            await AsyncStorage.setItem('guest_session', JSON.stringify(this.guestData));
            console.log('Guest session initialized:', this.guestId);
            return this.guestData;
        } catch (error) {
            console.error('Error initializing guest session:', error);
            return null;
        }
    }

    // Get current guest session
    async getGuestSession() {
        try {
            if (this.guestData) {
                return this.guestData;
            }

            const stored = await AsyncStorage.getItem('guest_session');
            if (stored) {
                this.guestData = JSON.parse(stored);
                this.guestId = this.guestData.id;
                return this.guestData;
            }

            return null;
        } catch (error) {
            console.error('Error getting guest session:', error);
            return null;
        }
    }

    // Update guest data
    async updateGuestData(updates) {
        try {
            if (!this.guestData) {
                await this.initializeGuest();
            }

            this.guestData = {
                ...this.guestData,
                ...updates,
                updated_at: new Date().toISOString()
            };

            await AsyncStorage.setItem('guest_session', JSON.stringify(this.guestData));
            return this.guestData;
        } catch (error) {
            console.error('Error updating guest data:', error);
            return null;
        }
    }

    // Add item to guest cart
    async addToGuestCart(product) {
        try {
            const guestData = await this.getGuestSession();
            if (!guestData) {
                await this.initializeGuest();
            }

            const existingItem = this.guestData.cart.find(item => item.product_id === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.guestData.cart.push({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    quantity: 1,
                    added_at: new Date().toISOString()
                });
            }

            await this.updateGuestData({ cart: this.guestData.cart });
            return this.guestData.cart;
        } catch (error) {
            console.error('Error adding to guest cart:', error);
            return null;
        }
    }

    // Remove item from guest cart
    async removeFromGuestCart(productId) {
        try {
            const guestData = await this.getGuestSession();
            if (!guestData) {
                return null;
            }

            this.guestData.cart = this.guestData.cart.filter(item => item.product_id !== productId);
            await this.updateGuestData({ cart: this.guestData.cart });
            return this.guestData.cart;
        } catch (error) {
            console.error('Error removing from guest cart:', error);
            return null;
        }
    }

    // Update guest cart item quantity
    async updateGuestCartItem(productId, quantity) {
        try {
            const guestData = await this.getGuestSession();
            if (!guestData) {
                return null;
            }

            const item = this.guestData.cart.find(item => item.product_id === productId);
            if (item) {
                if (quantity <= 0) {
                    await this.removeFromGuestCart(productId);
                } else {
                    item.quantity = quantity;
                    await this.updateGuestData({ cart: this.guestData.cart });
                }
            }

            return this.guestData.cart;
        } catch (error) {
            console.error('Error updating guest cart item:', error);
            return null;
        }
    }

    // Get guest cart
    async getGuestCart() {
        try {
            const guestData = await this.getGuestSession();
            return guestData ? guestData.cart : [];
        } catch (error) {
            console.error('Error getting guest cart:', error);
            return [];
        }
    }

    // Clear guest cart
    async clearGuestCart() {
        try {
            await this.updateGuestData({ cart: [] });
            return [];
        } catch (error) {
            console.error('Error clearing guest cart:', error);
            return null;
        }
    }

    // Calculate guest cart total
    async getGuestCartTotal() {
        try {
            const cart = await this.getGuestCart();
            return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        } catch (error) {
            console.error('Error calculating guest cart total:', error);
            return 0;
        }
    }

    // Get guest cart item count
    async getGuestCartItemCount() {
        try {
            const cart = await this.getGuestCart();
            return cart.reduce((count, item) => count + item.quantity, 0);
        } catch (error) {
            console.error('Error getting guest cart item count:', error);
            return 0;
        }
    }

    // Set guest preferences
    async setGuestPreferences(preferences) {
        try {
            const guestData = await this.getGuestSession();
            if (!guestData) {
                await this.initializeGuest();
            }

            await this.updateGuestData({
                preferences: {
                    ...this.guestData.preferences,
                    ...preferences
                }
            });

            return this.guestData.preferences;
        } catch (error) {
            console.error('Error setting guest preferences:', error);
            return null;
        }
    }

    // Get guest preferences
    async getGuestPreferences() {
        try {
            const guestData = await this.getGuestSession();
            return guestData ? guestData.preferences : null;
        } catch (error) {
            console.error('Error getting guest preferences:', error);
            return null;
        }
    }

    // Clear guest session
    async clearGuestSession() {
        try {
            await AsyncStorage.removeItem('guest_session');
            this.guestId = null;
            this.guestData = null;
            console.log('Guest session cleared');
            return true;
        } catch (error) {
            console.error('Error clearing guest session:', error);
            return false;
        }
    }

    // Check if user is guest
    async isGuest() {
        try {
            const guestData = await this.getGuestSession();
            return guestData !== null;
        } catch (error) {
            console.error('Error checking guest status:', error);
            return false;
        }
    }

    // Get guest session info
    async getGuestInfo() {
        try {
            const guestData = await this.getGuestSession();
            if (!guestData) {
                return null;
            }

            return {
                id: guestData.id,
                created_at: guestData.created_at,
                cart_items: guestData.cart.length,
                cart_total: await this.getGuestCartTotal(),
                preferences: guestData.preferences
            };
        } catch (error) {
            console.error('Error getting guest info:', error);
            return null;
        }
    }
}

export default new GuestService();
