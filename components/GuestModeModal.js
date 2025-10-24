import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions
} from 'react-native';
import guestService from '../services/guestService';

const { width, height } = Dimensions.get('window');

const GuestModeModal = ({ visible, onClose, onContinueAsGuest }) => {
    const [guestInfo, setGuestInfo] = useState(null);

    useEffect(() => {
        if (visible) {
            loadGuestInfo();
        }
    }, [visible]);

    const loadGuestInfo = async () => {
        try {
            const info = await guestService.getGuestInfo();
            setGuestInfo(info);
        } catch (error) {
            console.error('Error loading guest info:', error);
        }
    };

    const handleContinueAsGuest = async () => {
        try {
            const guestData = await guestService.initializeGuest();
            if (guestData) {
                onContinueAsGuest(guestData);
                onClose();
            }
        } catch (error) {
            console.error('Error continuing as guest:', error);
            Alert.alert('Lỗi', 'Không thể tiếp tục với chế độ khách');
        }
    };

    const handleClearGuestData = () => {
        Alert.alert(
            'Xóa dữ liệu khách',
            'Bạn có chắc chắn muốn xóa tất cả dữ liệu khách?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await guestService.clearGuestSession();
                            setGuestInfo(null);
                            Alert.alert('Thành công', 'Đã xóa dữ liệu khách');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa dữ liệu khách');
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>🛍️ Chế độ khách</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.description}>
                            Bạn có thể mua sắm mà không cần đăng ký tài khoản.
                            Dữ liệu sẽ được lưu tạm thời trên thiết bị.
                        </Text>

                        {guestInfo && (
                            <View style={styles.guestInfo}>
                                <Text style={styles.infoTitle}>Thông tin phiên khách:</Text>
                                <Text style={styles.infoText}>
                                    • ID: {guestInfo.id.substring(0, 20)}...
                                </Text>
                                <Text style={styles.infoText}>
                                    • Giỏ hàng: {guestInfo.cart_items} sản phẩm
                                </Text>
                                <Text style={styles.infoText}>
                                    • Tổng tiền: {guestInfo.cart_total.toLocaleString('vi-VN')} VNĐ
                                </Text>
                                <Text style={styles.infoText}>
                                    • Tạo lúc: {new Date(guestInfo.created_at).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.features}>
                            <Text style={styles.featureTitle}>Tính năng chế độ khách:</Text>
                            <Text style={styles.featureItem}>✓ Xem sản phẩm</Text>
                            <Text style={styles.featureItem}>✓ Thêm vào giỏ hàng</Text>
                            <Text style={styles.featureItem}>✓ Tạo đơn hàng</Text>
                            <Text style={styles.featureItem}>✓ Lưu trữ tạm thời</Text>
                            <Text style={styles.featureItem}>✗ Không lưu lịch sử đơn hàng</Text>
                            <Text style={styles.featureItem}>✗ Không đánh giá sản phẩm</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinueAsGuest}
                        >
                            <Text style={styles.continueButtonText}>
                                {guestInfo ? 'Tiếp tục phiên khách' : 'Bắt đầu chế độ khách'}
                            </Text>
                        </TouchableOpacity>

                        {guestInfo && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClearGuestData}
                            >
                                <Text style={styles.clearButtonText}>Xóa dữ liệu khách</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Đăng nhập/Đăng ký</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: width * 0.9,
        maxHeight: height * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    closeButton: {
        padding: 5
    },
    closeText: {
        fontSize: 18,
        color: '#6b7280'
    },
    content: {
        padding: 20
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 20
    },
    guestInfo: {
        backgroundColor: '#f9fafb',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8
    },
    infoText: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4
    },
    features: {
        marginBottom: 20
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8
    },
    featureItem: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4
    },
    actions: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb'
    },
    continueButton: {
        backgroundColor: '#2563eb',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    clearButton: {
        backgroundColor: '#dc2626',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10
    },
    clearButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold'
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500'
    }
});

export default GuestModeModal;
