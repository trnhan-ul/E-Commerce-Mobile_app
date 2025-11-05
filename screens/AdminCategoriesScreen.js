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
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import categoryService from '../services/categoryService';

export default function AdminCategoriesScreen() {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        is_active: true,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const categoriesData = await categoryService.getCategoriesWithProductCount();
            setCategories(categoriesData || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        setFormData({
            name: '',
            description: '',
            image_url: '',
            is_active: true,
        });
        setEditingCategory(null);
        setShowAddModal(true);
    };

    const handleEditCategory = (category) => {
        setFormData({
            name: category.name || '',
            description: category.description || '',
            image_url: category.image_url || '',
            is_active: category.is_active !== undefined ? category.is_active : true,
        });
        setEditingCategory(category);
        setShowAddModal(true);
    };

    const handleSaveCategory = async () => {
        try {
            if (!formData.name) {
                Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
                return;
            }

            const categoryData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                image_url: formData.image_url.trim(),
                is_active: formData.is_active,
            };

            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id || editingCategory._id, categoryData);
                Alert.alert('Thành công', 'Cập nhật danh mục thành công');
            } else {
                await categoryService.addCategory(categoryData);
                Alert.alert('Thành công', 'Thêm danh mục thành công');
            }

            setShowAddModal(false);
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            Alert.alert('Lỗi', 'Không thể lưu danh mục');
        }
    };

    const handleDeleteCategory = (category) => {
        Alert.alert(
            'Xác nhận',
            `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await categoryService.deleteCategory(category.id || category._id);
                            Alert.alert('Thành công', 'Xóa danh mục thành công');
                            loadCategories();
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            Alert.alert('Lỗi', 'Không thể xóa danh mục');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleStatus = async (category) => {
        try {
            await categoryService.toggleCategoryStatus(category.id || category._id);
            loadCategories();
        } catch (error) {
            console.error('Error toggling category status:', error);
            Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
        }
    };

    const CategoryCard = ({ category }) => {
        return (
            <View style={styles.categoryCard}>
                <Image
                    source={{ uri: category.image_url || 'https://via.placeholder.com/150' }}
                    style={styles.categoryImage}
                    defaultSource={require('../assets/icon.png')}
                />
                <View style={styles.categoryInfo}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: category.is_active ? '#10B98120' : '#EF444420' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: category.is_active ? '#10B981' : '#EF4444' }
                            ]}>
                                {category.is_active ? 'Hoạt động' : 'Tạm khóa'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.categoryDescription} numberOfLines={2}>
                        {category.description || 'Không có mô tả'}
                    </Text>
                    <Text style={styles.productCount}>
                        {category.product_count || 0} sản phẩm
                    </Text>
                </View>
                <View style={styles.categoryActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => handleEditCategory(category)}
                    >
                        <Icon name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: category.is_active ? '#F59E0B' : '#10B981'
                        }]}
                        onPress={() => handleToggleStatus(category)}
                    >
                        <Icon
                            name={category.is_active ? 'block' : 'check-circle'}
                            size={20}
                            color="#fff"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleDeleteCategory(category)}
                    >
                        <Icon name="delete" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const AddEditModal = () => {
        if (!showAddModal) return null;

        return (
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <Icon name="close" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.label}>Tên danh mục *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Nhập tên danh mục"
                        />

                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Nhập mô tả"
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.label}>URL hình ảnh</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.image_url}
                            onChangeText={(text) => setFormData({ ...formData, image_url: text })}
                            placeholder="Nhập URL hình ảnh"
                        />

                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        >
                            <Icon
                                name={formData.is_active ? 'check-box' : 'check-box-outline-blank'}
                                size={24}
                                color={formData.is_active ? COLORS.primary : COLORS.text.secondary}
                            />
                            <Text style={styles.checkboxLabel}>Kích hoạt danh mục</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowAddModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={handleSaveCategory}
                        >
                            <Text style={styles.saveButtonText}>Lưu</Text>
                        </TouchableOpacity>
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
                        <Text style={styles.headerTitle}>Quản lý Danh mục</Text>
                        <TouchableOpacity onPress={handleAddCategory}>
                            <Icon name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionTitle}>
                    Tổng số: {categories.length} danh mục
                </Text>

                {categories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="category" size={64} color={COLORS.text.secondary} />
                        <Text style={styles.emptyText}>Không có danh mục nào</Text>
                    </View>
                ) : (
                    categories.map(category => (
                        <CategoryCard key={category.id || category._id} category={category} />
                    ))
                )}
            </ScrollView>

            <AddEditModal />
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
    categoryCard: {
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
    categoryImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    categoryDescription: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginBottom: 8,
    },
    productCount: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },
    categoryActions: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    modalBody: {
        padding: 20,
        maxHeight: 400,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginTop: 12,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.text.primary,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cancelButton: {
        backgroundColor: COLORS.background,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

