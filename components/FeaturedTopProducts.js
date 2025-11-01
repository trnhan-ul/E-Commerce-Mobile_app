import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import { COLORS } from '../constants/colors';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { fetchProductReviewsByProductId } from '../store/slices/reviewSlice';
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import { MinimalLoading } from './Loading';

const FeaturedTopProducts = ({ title }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { loading: isLoadingTopSold = false } = useSelector((state) => state.products || {});

    // Use featuredProducts from state instead of topSoldProducts
    const featuredProducts = useSelector((state) => state.products?.featuredProducts || []);

    useEffect(() => {
        // Fetch featured products (top sold) only once when component mounts
        // Chỉ fetch nếu chưa có data và không đang loading
        if (!featuredProducts || featuredProducts.length === 0) {
            if (!isLoadingTopSold) {
                dispatch(fetchFeaturedProducts(6));
            }
        }
    }, [dispatch]); // Loại bỏ featuredProducts khỏi dependencies để tránh vòng lặp

    useEffect(() => {
        // Fetch reviews for all featured products
        if (featuredProducts && featuredProducts.length > 0) {
            featuredProducts.forEach(product => {
                if (product._id || product.id) {
                    dispatch(fetchProductReviewsByProductId(product._id || product.id));
                }
            });
        }
    }, [dispatch, featuredProducts]);

    if (isLoadingTopSold) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <View style={styles.titleUnderline} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <MinimalLoading color={COLORS.primary} />
                </View>
            </View>
        );
    }

    if (!featuredProducts || featuredProducts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <View style={styles.titleUnderline} />
                    </View>
                </View>
                <Text style={styles.errorText}>Không có sản phẩm bán chạy nào.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.titleUnderline} />
                </View>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={200}
                snapToAlignment="center"
            >
                {featuredProducts.slice(0, 6).map((product) => (
                    <View key={product._id || product.id} style={styles.productWrapper}>
                        <ProductCard product={product} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.primary,
        letterSpacing: 0.5,
    },
    titleUnderline: {
        width: 40,
        height: 3,
        backgroundColor: COLORS.primary,
        marginTop: 8,
        borderRadius: 2,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        elevation: 2,
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginRight: 4,
    },
    scrollContent: {
        paddingRight: 16,
        paddingVertical: 8,
    },
    productWrapper: {
        width: 180,
        marginRight: 16,
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.primary,
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});

export default FeaturedTopProducts; 