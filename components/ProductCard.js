import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { selectProductReviews } from '../store/slices/reviewSlice';
import { formatCurrency } from '../utils/formatCurrency';
import Toast from 'react-native-toast-message';
import { wp, hp, rf, spacing, borderRadius, fontSizes, iconSizes } from '../utils/responsive';

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Icon key={i} name="star" size={16} color="#FFD700" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Icon key="half" name="star-half" size={16} color="#FFD700" />
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Icon key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
    );
  }

  return stars;
};

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Safety check: Don't render inactive products
  if (!product || product.status === false) {
    return null;
  }

  // Get reviews for THIS specific product only
  // Support both _id (from MongoDB style) and id (from SQLite)
  const productId = product._id || product.id;
  // Sử dụng memoized selector để tránh unnecessary rerenders
  const productReviews = useSelector((state) =>
    selectProductReviews(state, productId)
  );

  // Calculate average rating for this specific product
  const averageRating =
    productReviews && productReviews.length > 0
      ? productReviews.reduce((acc, review) => acc + review.rating, 0) /
      productReviews.length
      : 0;

  // Check if product is out of stock
  const isOutOfStock = product.quantity <= 0 || product.stock_quantity <= 0;

  const handlePress = () => {
    navigation.navigate("ProductDetail", { productId: productId });
  };

  const handleAddToCart = async () => {
    if (showLoadingModal || isOutOfStock) return; // Prevent multiple clicks or out of stock

    // Check if user is authenticated
    if (!isAuthenticated) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Bạn có muốn đăng nhập ngay không?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }

    setShowLoadingModal(true);
    try {
      await dispatch(
        addToCart({
          product_id: productId,
          quantity: 1,
        })
      ).unwrap();

      setShowLoadingModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      setShowLoadingModal(false);
      Toast.show({
        type: "error",
        text1: "Không thể thêm vào giỏ hàng",
        text2: error?.toString() || "Có lỗi xảy ra khi thêm sản phẩm",
        position: "top",
        visibilityTime: 2500,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <LinearGradient
        colors={[COLORS.white, COLORS.background]}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              product?.image_url || product?.image
                ? { uri: product.image_url || product.image }
                : require("../assets/favicon.png")
            }
            style={styles.image}
            resizeMode="contain"
            onError={(e) => {
              console.log(
                "Image load error:",
                product?.image_url || product?.image
              );
            }}
          />
          {/* Out of stock overlay */}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Hết hàng</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {truncateText(product.name, 20)}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(averageRating)}
            <Text style={styles.ratingText}>({averageRating.toFixed(1)})</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text
              style={styles.price}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {formatCurrency(product.price)}
            </Text>
            <TouchableOpacity
              style={[
                styles.addButton,
                isOutOfStock && styles.addButtonDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={showLoadingModal || isOutOfStock}
            >
              <Icon
                name={
                  isOutOfStock ? "remove-shopping-cart" : "add-shopping-cart"
                }
                size={16}
                color={isOutOfStock ? "#999" : COLORS.white}
              />
            </TouchableOpacity>
          </View>
          {/* Stock indicator */}
          <View style={styles.stockContainer}>
            {isOutOfStock ? (
              <View style={styles.outOfStockBadge}>
                <Icon name="remove-circle" size={12} color="#ff4757" />
                <Text style={styles.stockTextOutOfStock}>Hết hàng</Text>
              </View>
            ) : (
              <View style={styles.inStockBadge}>
                <Icon
                  name="check-circle"
                  size={12}
                  color={
                    (product.quantity || product.stock_quantity || 0) <= 5
                      ? "#ff9800"
                      : "#4caf50"
                  }
                />
                <Text
                  style={[
                    styles.stockText,
                    (product.quantity || product.stock_quantity || 0) <= 5 &&
                    styles.stockTextLow,
                  ]}
                >
                  {(product.quantity || product.stock_quantity || 0) <= 5
                    ? `Chỉ còn ${product.quantity || product.stock_quantity || 0
                    }`
                    : `Còn hàng (${product.quantity || product.stock_quantity || 0
                    })`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={showLoadingModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalText}>Đang thêm vào giỏ hàng...</Text>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal transparent={true} animationType="fade" visible={showSuccessModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.modalText}>Thêm vào giỏ hàng thành công!</Text>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(280),
    borderRadius: borderRadius.xl,
    elevation: 5,
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    backgroundColor: COLORS.white,
  },
  card: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  imageContainer: {
    height: hp(160),
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#fff",
    fontSize: fontSizes.md,
    fontWeight: "700",
    backgroundColor: "#ff4757",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  infoContainer: {
    padding: spacing.sm,
  },
  name: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: spacing.xs,
    height: hp(40),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  ratingText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonDisabled: {
    backgroundColor: "#e0e0e0",
    shadowOpacity: 0,
  },
  stockContainer: {
    marginTop: 4,
  },
  outOfStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe5e5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  inStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  stockText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  stockTextLow: {
    color: "#ff9800",
  },
  stockTextOutOfStock: {
    color: "#ff4757",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 250,
    elevation: 5,
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginTop: 15,
    textAlign: "center",
  },
});

export default ProductCard;