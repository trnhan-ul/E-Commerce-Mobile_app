import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import orderService from '../services/orderService';
import databaseService from '../services/databaseService';
import { formatCurrency } from '../utils/formatCurrency';

const STATUS_COLORS = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    shipping: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
};

const STATUS_LABELS = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
};

export default function AdminOrdersScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState(null);

    useEffect(() => {
        loadOrders();
    }, [selectedStatus]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            await databaseService.ensureDatabaseReady();
            const ordersData = await orderService.getAllOrders(100, 0, selectedStatus);

            // Get items for each order
            const ordersWithItems = await Promise.all(
                ordersData.map(async (order) => {
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

            setOrders(ordersWithItems);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        Alert.alert(
            'Cập nhật trạng thái',
            `Bạn muốn đổi trạng thái thành "${STATUS_LABELS[newStatus]}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            // Admin có thể cập nhật trạng thái bất kỳ đơn hàng nào
                            const query = `
                                UPDATE orders 
                                SET status = ?, updated_at = CURRENT_TIMESTAMP 
                                WHERE id = ?
                            `;
                            await databaseService.db.runAsync(query, [newStatus, orderId]);
                            Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
                            loadOrders();
                        } catch (error) {
                            console.error('Error updating order status:', error);
                            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
                        }
                    },
                },
            ]
        );
    };

    const OrderCard = ({ order }) => {
        const statusColor = STATUS_COLORS[order.status] || COLORS.text.secondary;
        const statusLabel = STATUS_LABELS[order.status] || order.status;

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
                        <Text style={styles.orderDate}>
                            {new Date(order.created_at || order.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                        <Text style={styles.orderCustomer}>
                            {order.username || order.email || 'Khách hàng'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusLabel}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderItems}>
                    {order.items && order.items.slice(0, 3).map((item, index) => (
                        <View key={index} style={styles.orderItem}>
                            <Text style={styles.itemName}>
                                {item.name || item.product_name} x{item.quantity}
                            </Text>
                            <Text style={styles.itemPrice}>
                                {formatCurrency(item.price * item.quantity)}
                            </Text>
                        </View>
                    ))}
                    {order.items && order.items.length > 3 && (
                        <Text style={styles.moreItems}>
                            +{order.items.length - 3} sản phẩm khác
                        </Text>
                    )}
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>
                        Tổng: {formatCurrency(order.total_amount || order.calculated_total || 0)}
                    </Text>
                    <View style={styles.actionButtons}>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <>
                                {order.status === 'pending' && (
                                    <TouchableOpacity
                                        style={[styles.statusButton, { backgroundColor: '#3B82F6' }]}
                                        onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                                    >
                                        <Text style={styles.statusButtonText}>Xác nhận</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === 'confirmed' && (
                                    <TouchableOpacity
                                        style={[styles.statusButton, { backgroundColor: '#8B5CF6' }]}
                                        onPress={() => handleUpdateStatus(order.id, 'shipping')}
                                    >
                                        <Text style={styles.statusButtonText}>Giao hàng</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === 'shipping' && (
                                    <TouchableOpacity
                                        style={[styles.statusButton, { backgroundColor: '#10B981' }]}
                                        onPress={() => handleUpdateStatus(order.id, 'delivered')}
                                    >
                                        <Text style={styles.statusButtonText}>Hoàn thành</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                        {order.status !== 'cancelled' && (
                            <TouchableOpacity
                                style={[styles.statusButton, { backgroundColor: '#EF4444' }]}
                                onPress={() => handleUpdateStatus(order.id, 'cancelled')}
                            >
                                <Text style={styles.statusButtonText}>Hủy đơn</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={COLORS.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <SafeAreaView>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
                        <TouchableOpacity onPress={loadOrders}>
                            <Icon name="refresh" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            selectedStatus === null && styles.filterButtonActive,
                        ]}
                        onPress={() => setSelectedStatus(null)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedStatus === null && styles.filterButtonTextActive,
                            ]}
                        >
                            Tất cả
                        </Text>
                    </TouchableOpacity>
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterButton,
                                selectedStatus === status && styles.filterButtonActive,
                            ]}
                            onPress={() => setSelectedStatus(status)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedStatus === status && styles.filterButtonTextActive,
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionTitle}>
                    Tổng số: {orders.length} đơn hàng
                </Text>

                {orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="shopping-cart" size={64} color={COLORS.text.secondary} />
                        <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                    </View>
                ) : (
                    orders.map(order => (
                        <OrderCard key={order.id || order._id} order={order} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerGradient: {
        paddingTop: 40,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    filterContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filterButtonText: {
        fontSize: 14,
        color: COLORS.text.primary,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 4,
    },
    orderCustomer: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderItems: {
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.text.primary,
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    moreItems: {
        fontSize: 12,
        color: COLORS.text.secondary,
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    statusButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.text.secondary,
        marginTop: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.text.secondary,
    },
});

