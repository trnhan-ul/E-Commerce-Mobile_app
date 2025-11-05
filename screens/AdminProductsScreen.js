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
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { formatCurrency } from '../utils/formatCurrency';

export default function AdminProductsScreen() {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image_url: '',
        category_id: '',
        stock_quantity: '',
        is_featured: false,
        is_new: false,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productService.getProducts(),
                categoryService.getCategories(),
            ]);
            setProducts(productsData || []);
            setCategories(categoriesData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery ||
            product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddProduct = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            image_url: '',
            category_id: '',
            stock_quantity: '',
            is_featured: false,
            is_new: false,
        });
        setEditingProduct(null);
        setShowAddModal(true);
    };

    const handleEditProduct = (product) => {
        setFormData({
            name: product.name || '',
            price: String(product.price || ''),
            description: product.description || '',
            image_url: product.image_url || '',
            category_id: String(product.category_id || ''),
            stock_quantity: String(product.stock_quantity || ''),
            is_featured: product.is_featured || false,
            is_new: product.is_new || false,
        });
        setEditingProduct(product);
        setShowAddModal(true);
    };

    const handleSaveProduct = async () => {
        try {
            if (!formData.name || !formData.price || !formData.category_id) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            const productData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                description: formData.description.trim(),
                image_url: formData.image_url.trim(),
                category_id: parseInt(formData.category_id),
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                is_featured: formData.is_featured,
                is_new: formData.is_new,
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id || editingProduct._id, productData);
                Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
            } else {
                await productService.addProduct(productData);
                Alert.alert('Thành công', 'Thêm sản phẩm thành công');
            }

            setShowAddModal(false);
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
        }
    };

    const handleDeleteProduct = (product) => {
        Alert.alert(
            'Xác nhận',
            `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await productService.deleteProduct(product.id || product._id);
                            Alert.alert('Thành công', 'Xóa sản phẩm thành công');
                            loadData();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
                        }
                    },
                },
            ]
        );
    };

    const ProductCard = ({ product }) => {
        const category = categories.find(c => (c.id || c._id) === product.category_id);

        return (
            <View style={styles.productCard}>
                <Image
                    source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                    defaultSource={require('../assets/icon.png')}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                    <Text style={styles.productCategory}>{category?.name || 'Không có danh mục'}</Text>
                    <Text style={styles.productStock}>Tồn kho: {product.stock_quantity || 0}</Text>
                    <View style={styles.productBadges}>
                        {product.is_featured && (
                            <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                                <Text style={styles.badgeText}>Nổi bật</Text>
                            </View>
                        )}
                        {product.is_new && (
                            <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                                <Text style={styles.badgeText}>Mới</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.productActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => handleEditProduct(product)}
                    >
                        <Icon name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleDeleteProduct(product)}
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
                            {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <Icon name="close" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.label}>Tên sản phẩm *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Nhập tên sản phẩm"
                        />

                        <Text style={styles.label}>Giá *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                            placeholder="Nhập giá"
                            keyboardType="numeric"
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

                        <Text style={styles.label}>Danh mục *</Text>
                        <View style={styles.selectContainer}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id || cat._id}
                                    style={[
                                        styles.selectOption,
                                        String(formData.category_id) === String(cat.id || cat._id) && styles.selectOptionActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, category_id: String(cat.id || cat._id) })}
                                >
                                    <Text style={[
                                        styles.selectOptionText,
                                        String(formData.category_id) === String(cat.id || cat._id) && styles.selectOptionTextActive
                                    ]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Số lượng tồn kho</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.stock_quantity}
                            onChangeText={(text) => setFormData({ ...formData, stock_quantity: text })}
                            placeholder="Nhập số lượng"
                            keyboardType="numeric"
                        />

                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                            >
                                <Icon
                                    name={formData.is_featured ? 'check-box' : 'check-box-outline-blank'}
                                    size={24}
                                    color={formData.is_featured ? COLORS.primary : COLORS.text.secondary}
                                />
                                <Text style={styles.checkboxLabel}>Sản phẩm nổi bật</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setFormData({ ...formData, is_new: !formData.is_new })}
                            >
                                <Icon
                                    name={formData.is_new ? 'check-box' : 'check-box-outline-blank'}
                                    size={24}
                                    color={formData.is_new ? COLORS.primary : COLORS.text.secondary}
                                />
                                <Text style={styles.checkboxLabel}>Sản phẩm mới</Text>
                            </TouchableOpacity>
                        </View>
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
                            onPress={handleSaveProduct}
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
                        <Text style={styles.headerTitle}>Quản lý Sản phẩm</Text>
                        <TouchableOpacity onPress={handleAddProduct}>
                            <Icon name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={20} color={COLORS.text.secondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sản phẩm..."
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
                    Tổng số: {filteredProducts.length} sản phẩm
                </Text>

                {filteredProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="inventory" size={64} color={COLORS.text.secondary} />
                        <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
                    </View>
                ) : (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id || product._id} product={product} />
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
    productCard: {
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
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginBottom: 4,
    },
    productStock: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    productBadges: {
        flexDirection: 'row',
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    productActions: {
        flexDirection: 'column',
        justifyContent: 'center',
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
    selectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    selectOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
        marginBottom: 8,
    },
    selectOptionActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    selectOptionText: {
        fontSize: 14,
        color: COLORS.text.primary,
    },
    selectOptionTextActive: {
        color: '#fff',
    },
    checkboxContainer: {
        marginTop: 16,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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

