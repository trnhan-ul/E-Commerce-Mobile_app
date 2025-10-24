import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import guestService from '../services/guestService';
import { useProducts, useCategories } from '../hooks/useDatabase';
import ProductCard from '../components/ProductCard';
import CategorySection from '../components/CategorySection';
import SearchBar from '../components/SearchBar';
import TopNavBar from '../components/TopNavBar';

const GuestHomeScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [guestInfo, setGuestInfo] = useState(null);

    const {
        products,
        loading: productsLoading,
        getProducts,
        searchProducts,
        getFeaturedProducts,
        getNewProducts
    } = useProducts();

    const {
        categories,
        loading: categoriesLoading,
        getCategories
    } = useCategories();

    useEffect(() => {
        loadGuestInfo();
        loadData();
    }, []);

    const loadGuestInfo = async () => {
        try {
            const info = await guestService.getGuestInfo();
            setGuestInfo(info);
        } catch (error) {
            console.error('Error loading guest info:', error);
        }
    };

    const loadData = async () => {
        try {
            await Promise.all([
                getProducts(20),
                getCategories(),
                getFeaturedProducts(5),
                getNewProducts(5)
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadData();
            await loadGuestInfo();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            await searchProducts(query);
        } else {
            await getProducts(20);
        }
    };

    const handleAddToCart = async (product) => {
        try {
            await guestService.addToGuestCart(product);
            Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
            await loadGuestInfo(); // Refresh guest info
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
        }
    };

    const handleViewCart = () => {
        navigation.navigate('CartScreen');
    };

    const handleLogin = () => {
        navigation.navigate('LoginScreen');
    };

    const handleRegister = () => {
        navigation.navigate('RegisterScreen');
    };

    return (
        <View style={styles.container}>
            <TopNavBar
                title="Chế độ khách"
                showCart={true}
                cartItemCount={guestInfo?.cart_items || 0}
                onCartPress={handleViewCart}
                onLoginPress={handleLogin}
                onRegisterPress={handleRegister}
            />

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                {/* Guest Info Banner */}
                <View style={styles.guestBanner}>
                    <Text style={styles.guestBannerTitle}>🛍️ Chế độ khách</Text>
                    <Text style={styles.guestBannerText}>
                        Bạn đang mua sắm mà không cần đăng ký.
                        Dữ liệu sẽ được lưu tạm thời trên thiết bị.
                    </Text>
                    {guestInfo && (
                        <View style={styles.guestStats}>
                            <Text style={styles.guestStatsText}>
                                Giỏ hàng: {guestInfo.cart_items} sản phẩm •
                                Tổng: {guestInfo.cart_total.toLocaleString('vi-VN')} VNĐ
                            </Text>
                        </View>
                    )}
                </View>

                {/* Search Bar */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholder="Tìm kiếm sản phẩm..."
                />

                {/* Categories */}
                <CategorySection
                    categories={categories}
                    loading={categoriesLoading}
                    onCategoryPress={(category) => {
                        navigation.navigate('AllProductsScreen', {
                            categoryId: category.id,
                            categoryName: category.name
                        });
                    }}
                />

                {/* Featured Products */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⭐ Sản phẩm nổi bật</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {products
                            .filter(product => product.is_featured)
                            .slice(0, 5)
                            .map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onPress={() => navigation.navigate('ProductDetailScreen', { productId: product.id })}
                                    onAddToCart={() => handleAddToCart(product)}
                                />
                            ))}
                    </ScrollView>
                </View>

                {/* New Products */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🆕 Sản phẩm mới</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {products
                            .filter(product => product.is_new)
                            .slice(0, 5)
                            .map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onPress={() => navigation.navigate('ProductDetailScreen', { productId: product.id })}
                                    onAddToCart={() => handleAddToCart(product)}
                                />
                            ))}
                    </ScrollView>
                </View>

                {/* All Products */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🛒 Tất cả sản phẩm</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AllProductsScreen')}
                        >
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {products.slice(0, 6).map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onPress={() => navigation.navigate('ProductDetailScreen', { productId: product.id })}
                            onAddToCart={() => handleAddToCart(product)}
                        />
                    ))}
                </View>

                {/* Guest Limitations */}
                <View style={styles.limitations}>
                    <Text style={styles.limitationsTitle}>⚠️ Hạn chế chế độ khách</Text>
                    <Text style={styles.limitationsText}>
                        • Không lưu lịch sử đơn hàng{'\n'}
                        • Không thể đánh giá sản phẩm{'\n'}
                        • Dữ liệu có thể bị mất khi xóa app{'\n'}
                        • Đăng ký để có trải nghiệm đầy đủ
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    content: {
        flex: 1
    },
    guestBanner: {
        backgroundColor: '#dbeafe',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb'
    },
    guestBannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 4
    },
    guestBannerText: {
        fontSize: 14,
        color: '#1e40af',
        lineHeight: 20
    },
    guestStats: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#93c5fd'
    },
    guestStatsText: {
        fontSize: 12,
        color: '#1e40af',
        fontWeight: '500'
    },
    section: {
        marginBottom: 24
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        paddingHorizontal: 16,
        marginBottom: 12
    },
    seeAllText: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '500'
    },
    limitations: {
        backgroundColor: '#fef3c7',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b'
    },
    limitationsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#92400e',
        marginBottom: 8
    },
    limitationsText: {
        fontSize: 12,
        color: '#92400e',
        lineHeight: 18
    }
});

export default GuestHomeScreen;
