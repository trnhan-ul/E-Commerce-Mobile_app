import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import databaseService from '../services/databaseService';
import { formatCurrency } from '../utils/formatCurrency';
import BottomNavigation from '../components/BottomNavigation';

export default function AdminScreen() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdminStats();
    }, []);

    const loadAdminStats = async () => {
        try {
            setLoading(true);
            const isReady = await databaseService.ensureDatabaseReady();
            if (!isReady) {
                console.warn('Database not ready');
                return;
            }
            const adminStats = await databaseService.getAdminStats();
            setStats(adminStats);
        } catch (error) {
            console.error('Error loading admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => dispatch(logoutUser())
                },
            ]
        );
    };

    const StatCard = ({ icon, title, value, color = COLORS.primary }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

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
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>
                            {user?.full_name || user?.email || 'Admin'}
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.statsGrid}>
                            <StatCard
                                icon="people"
                                title="Tổng người dùng"
                                value={stats?.totalUsers || 0}
                                color="#3B82F6"
                            />
                            <StatCard
                                icon="inventory"
                                title="Tổng sản phẩm"
                                value={stats?.totalProducts || 0}
                                color="#10B981"
                            />
                            <StatCard
                                icon="shopping-cart"
                                title="Tổng đơn hàng"
                                value={stats?.totalOrders || 0}
                                color="#F59E0B"
                            />
                            <StatCard
                                icon="attach-money"
                                title="Doanh thu"
                                value={formatCurrency(stats?.totalRevenue || 0)}
                                color="#EF4444"
                            />
                        </View>

                        {stats?.orderStatus && stats.orderStatus.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Đơn hàng theo trạng thái</Text>
                                {stats.orderStatus.map((status, index) => (
                                    <View key={index} style={styles.statusItem}>
                                        <Text style={styles.statusLabel}>{status.status || 'N/A'}</Text>
                                        <Text style={styles.statusValue}>{status.count} đơn</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.infoSection}>
                            <Icon name="info" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>
                                Để quản lý chi tiết, vui lòng truy cập web admin panel
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Icon name="logout" size={20} color="#fff" />
                            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            <BottomNavigation />
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
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 12,
    },
    statusItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statusLabel: {
        fontSize: 14,
        color: COLORS.text.primary,
        textTransform: 'capitalize',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: COLORS.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});