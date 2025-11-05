import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import databaseService from '../services/databaseService';

export default function AdminUsersScreen() {
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            await databaseService.ensureDatabaseReady();

            // Get all users with their order stats
            const query = `
                SELECT u.*,
                       COUNT(DISTINCT o.id) as total_orders,
                       COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) as total_spent
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `;

            const usersData = await databaseService.db.getAllAsync(query);
            setUsers(usersData || []);
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.full_name?.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query)
        );
    });

    const UserCard = ({ user }) => {
        const isAdmin = (user.role_name || user.role)?.toLowerCase() === 'admin';

        return (
            <View style={styles.userCard}>
                <View style={[styles.avatarContainer, { backgroundColor: isAdmin ? COLORS.primary : '#10B981' }]}>
                    <Text style={styles.avatarText}>
                        {(user.full_name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>

                <View style={styles.userInfo}>
                    <View style={styles.userHeader}>
                        <Text style={styles.userName}>
                            {user.full_name || user.username || 'Người dùng'}
                        </Text>
                        {isAdmin && (
                            <View style={[styles.badge, { backgroundColor: COLORS.primary + '20' }]}>
                                <Text style={[styles.badgeText, { color: COLORS.primary }]}>Admin</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.userEmail}>{user.email || 'Không có email'}</Text>
                    {user.phone && (
                        <Text style={styles.userPhone}>{user.phone}</Text>
                    )}
                    <View style={styles.userStats}>
                        <View style={styles.statItem}>
                            <Icon name="shopping-cart" size={16} color={COLORS.text.secondary} />
                            <Text style={styles.statText}>{user.total_orders || 0} đơn</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="attach-money" size={16} color={COLORS.text.secondary} />
                            <Text style={styles.statText}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(user.total_spent || 0)}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.userDate}>
                        Tham gia: {new Date(user.created_at || user.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
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
                        <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
                        <TouchableOpacity onPress={loadUsers}>
                            <Icon name="refresh" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={20} color={COLORS.text.secondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm người dùng..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionTitle}>
                    Tổng số: {filteredUsers.length} người dùng
                </Text>

                {filteredUsers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="people" size={64} color={COLORS.text.secondary} />
                        <Text style={styles.emptyText}>Không có người dùng nào</Text>
                    </View>
                ) : (
                    filteredUsers.map(user => (
                        <UserCard key={user.id || user._id} user={user} />
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
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: COLORS.text.primary,
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
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text.primary,
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: 8,
    },
    userStats: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    userDate: {
        fontSize: 12,
        color: COLORS.text.secondary,
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

