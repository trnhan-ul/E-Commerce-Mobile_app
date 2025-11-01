import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, clearOrderState } from "../store/slices/orderSlice"; // Adjust path as needed
import { fetchCartByUser } from "../store/slices/cartSlice"; // Import cart action
import { OverlayLoading, MinimalLoading } from "../components/Loading";
import { formatCurrency } from "../utils/formatCurrency";
import Toast from "react-native-toast-message";

const PaymentScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showEditModal, setShowEditModal] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    note: "",
  });

  // Temporary state for editing
  const [tempReceiverInfo, setTempReceiverInfo] = useState(receiverInfo);
  const [fieldErrors, setFieldErrors] = useState({});

  // Clear field error when user starts typing
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Validate field on blur
  const validateField = (fieldName, value) => {
    let error = null;
    switch (fieldName) {
      case "receiver_name":
        error = validateName(value);
        break;
      case "receiver_phone":
        error = validatePhone(value);
        break;
      case "receiver_address":
        error = validateAddress(value);
        break;
      default:
        break;
    }

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
    } else {
      clearFieldError(fieldName);
    }
  };

  // Redux state
  const { isLoading, createSuccess, newOrderId, error } = useSelector(
    (state) => state.orders || {}
  );

  // Get data from navigation params or use default values
  const {
    selectedItems = [],
    orderSummary = null,
    selected_product_ids = [],
  } = route?.params || {};

  // Default order summary if not provided
  const defaultOrderSummary = {
    subtotal: 500000,
    shipping: 0,
    total: 500000,
  };

  const summary = orderSummary || defaultOrderSummary;

  const paymentMethods = [
    {
      id: "cod",
      title: "Thanh toán khi nhận hàng",
      subtitle: "Thanh toán khi bạn nhận được đơn hàng",
      icon: "cash-outline",
      available: true,
    },
    // Other payment methods commented out as in original
  ];

  // Handle order creation success
  useEffect(() => {
    if (createSuccess && newOrderId) {
      // Refresh cart to reflect cleared items
      dispatch(fetchCartByUser());

      Alert.alert(
        "Đặt hàng thành công! 🎉",
        `Mã đơn hàng của bạn: ${newOrderId}\nĐơn hàng của bạn đã được đặt và sẽ được xử lý sớm.`,
        [
          {
            text: "Tiếp tục mua sắm",
            style: "cancel",
            onPress: () => {
              dispatch(clearOrderState());
              navigation.navigate("HomePage");
            },
          },
          {
            text: "Xem đơn hàng",
            onPress: () => {
              dispatch(clearOrderState());
              navigation.navigate("OrderHistory");
            },
          },
        ]
      );
    }
  }, [createSuccess, newOrderId, dispatch, navigation]);

  // Handle order creation error
  useEffect(() => {
    if (error) {
      Alert.alert("Đặt hàng thất bại", error, [
        {
          text: "Thử lại",
          onPress: () => dispatch(clearOrderState()),
        },
      ]);
    }
  }, [error, dispatch]);

  const handleEditAddress = () => {
    // Initialize with current receiver info or empty values
    const currentInfo = {
      receiver_name: receiverInfo.receiver_name || "",
      receiver_phone: receiverInfo.receiver_phone || "",
      receiver_address: receiverInfo.receiver_address || "",
      note: receiverInfo.note || "",
    };
    setTempReceiverInfo(currentInfo);
    setFieldErrors({}); // Clear any previous errors
    setShowEditModal(true);
  };

  // Validation functions
  const validateName = (name) => {
    const nameRegex =
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ\s]+$/;
    if (!name.trim()) {
      return "Vui lòng nhập tên người nhận";
    }
    if (!nameRegex.test(name.trim())) {
      return "Tên không được chứa số hoặc ký tự đặc biệt";
    }
    return null;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phone.trim()) {
      return "Vui lòng nhập số điện thoại người nhận";
    }
    if (!phoneRegex.test(phone.trim())) {
      return "Số điện thoại phải có 10 số, bắt đầu bằng số 0 và không chứa ký tự đặc biệt";
    }
    return null;
  };

  const validateAddress = (address) => {
    const addressRegex =
      /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ\s,./\-]+$/;
    if (!address.trim()) {
      return "Vui lòng nhập địa chỉ giao hàng";
    }
    if (!addressRegex.test(address.trim())) {
      return "Địa chỉ không được chứa ký tự đặc biệt (ngoại trừ dấu phẩy, chấm, gạch ngang)";
    }
    return null;
  };

  const handleSaveAddress = () => {
    // Validate all fields
    const nameError = validateName(tempReceiverInfo.receiver_name);
    if (nameError) {
      Alert.alert("Lỗi", nameError);
      return;
    }

    const phoneError = validatePhone(tempReceiverInfo.receiver_phone);
    if (phoneError) {
      Alert.alert("Lỗi", phoneError);
      return;
    }

    const addressError = validateAddress(tempReceiverInfo.receiver_address);
    if (addressError) {
      Alert.alert("Lỗi", addressError);
      return;
    }

    // All validations passed
    setReceiverInfo(tempReceiverInfo);
    setFieldErrors({}); // Clear any errors
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setTempReceiverInfo(receiverInfo);
    setFieldErrors({}); // Clear any errors
    setShowEditModal(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedPayment) {
      Alert.alert(
        "Cần chọn phương thức thanh toán",
        "Vui lòng chọn phương thức thanh toán để tiếp tục.",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate required data
    if (!selected_product_ids || selected_product_ids.length === 0) {
      Alert.alert(
        "Chưa chọn sản phẩm nào",
        "Vui lòng chọn sản phẩm trước khi đặt hàng.",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate delivery information
    const nameError = validateName(receiverInfo.receiver_name);
    if (nameError) {
      Alert.alert(
        "Lỗi thông tin giao hàng",
        nameError + "\n\nVui lòng chỉnh sửa thông tin giao hàng."
      );
      return;
    }

    const phoneError = validatePhone(receiverInfo.receiver_phone);
    if (phoneError) {
      Alert.alert(
        "Lỗi thông tin giao hàng",
        phoneError + "\n\nVui lòng chỉnh sửa thông tin giao hàng."
      );
      return;
    }

    const addressError = validateAddress(receiverInfo.receiver_address);
    if (addressError) {
      Alert.alert(
        "Lỗi thông tin giao hàng",
        addressError + "\n\nVui lòng chỉnh sửa thông tin giao hàng."
      );
      return;
    }

    Alert.alert(
      "Xác nhận đơn hàng",
      `Đặt hàng với ${paymentMethods.find((m) => m.id === selectedPayment)?.title
      }?\n\nTổng cộng: ${formatCurrency(summary.total)}\nGiao đến: ${receiverInfo.receiver_address
      }`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          style: "default",
          onPress: () => {
            // Prepare order data with all required fields
            const orderData = {
              items: selectedItems.map(item => ({
                product_id: item.id || item.product_id,
                quantity: item.quantity,
                price: item.price
              })),
              total_amount: summary.total,
              shipping_address: receiverInfo.receiver_address,
              payment_method: selectedPayment,
              notes: receiverInfo.notes || ''
            };

            console.log('PaymentScreen - Creating order with data:', orderData);

            // Dispatch create order action
            dispatch(createOrder(orderData));
          },
        },
      ]
    );
  };

  const renderEditAddressModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancelEdit}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleCancelEdit}
            style={styles.modalHeaderButton}
          >
            <Icon name="close" size={24} color="#0d364c" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chỉnh sửa thông tin giao hàng</Text>
          <TouchableOpacity
            onPress={handleSaveAddress}
            style={styles.modalHeaderButton}
          >
            <Text style={styles.saveButtonText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Receiver Name */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Tên người nhận *</Text>
            <TextInput
              style={[
                styles.textInput,
                fieldErrors.receiver_name && styles.textInputError,
              ]}
              value={tempReceiverInfo.receiver_name}
              onChangeText={(text) => {
                setTempReceiverInfo((prev) => ({
                  ...prev,
                  receiver_name: text,
                }));
                clearFieldError("receiver_name");
              }}
              onBlur={() =>
                validateField("receiver_name", tempReceiverInfo.receiver_name)
              }
              placeholder="Nhập tên người nhận"
              placeholderTextColor="#9ca3af"
            />
            {fieldErrors.receiver_name && (
              <Text style={styles.errorText}>{fieldErrors.receiver_name}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Số điện thoại *</Text>
            <TextInput
              style={[
                styles.textInput,
                fieldErrors.receiver_phone && styles.textInputError,
              ]}
              value={tempReceiverInfo.receiver_phone}
              onChangeText={(text) => {
                // Only allow numbers
                const numericText = text.replace(/[^0-9]/g, "");
                setTempReceiverInfo((prev) => ({
                  ...prev,
                  receiver_phone: numericText,
                }));
                clearFieldError("receiver_phone");
              }}
              onBlur={() =>
                validateField("receiver_phone", tempReceiverInfo.receiver_phone)
              }
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {fieldErrors.receiver_phone && (
              <Text style={styles.errorText}>{fieldErrors.receiver_phone}</Text>
            )}
          </View>

          {/* Address */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textAreaInput,
                fieldErrors.receiver_address && styles.textInputError,
              ]}
              value={tempReceiverInfo.receiver_address}
              onChangeText={(text) => {
                setTempReceiverInfo((prev) => ({
                  ...prev,
                  receiver_address: text,
                }));
                clearFieldError("receiver_address");
              }}
              onBlur={() =>
                validateField(
                  "receiver_address",
                  tempReceiverInfo.receiver_address
                )
              }
              placeholder="Nhập địa chỉ giao hàng đầy đủ"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {fieldErrors.receiver_address && (
              <Text style={styles.errorText}>
                {fieldErrors.receiver_address}
              </Text>
            )}
          </View>

          {/* Note */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Ghi chú đơn hàng (Tùy chọn)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={tempReceiverInfo.note}
              onChangeText={(text) =>
                setTempReceiverInfo((prev) => ({
                  ...prev,
                  note: text,
                }))
              }
              placeholder="Thêm hướng dẫn đặc biệt cho việc giao hàng..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Icon name="info-outline" size={16} color="#6b7280" />
            <Text style={styles.infoNoteText}>
              Vui lòng đảm bảo thông tin giao hàng chính xác để tránh các vấn đề
              giao hàng.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      {/* <OverlayLoading text="Đang tải đơn hàng của bạn..." visible={isLoading} /> */}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#0d364c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt" size={20} color="#0d364c" />
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vận chuyển</Text>
              <Text
                style={[
                  styles.summaryValue,
                  summary.shipping === 0 && styles.freeShipping,
                ]}
              >
                {summary.shipping === 0
                  ? "Miễn phí"
                  : formatCurrency(summary.shipping)}
              </Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng số tiền</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(summary.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Selected Items Summary */}
        {selectedItems && selectedItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="shopping-cart" size={20} color="#0d364c" />
              <Text style={styles.sectionTitle}>
                Sản phẩm ({selectedItems.length})
              </Text>
            </View>
            <View style={styles.sectionContent}>
              {selectedItems.slice(0, 3).map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
              {selectedItems.length > 3 && (
                <Text style={styles.moreItemsText}>
                  và {selectedItems.length - 3} sản phẩm khác...
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location-on" size={20} color="#0d364c" />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleEditAddress}
            >
              <Text style={styles.changeButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  {/* <Icon name="home" size={16} color="#0d364c" /> */}
                  <Text style={styles.addressType}></Text>
                </View>
              </View>
              {receiverInfo.receiver_name &&
                receiverInfo.receiver_address &&
                receiverInfo.receiver_phone ? (
                <>
                  <Text style={styles.addressText}>
                    {receiverInfo.receiver_name}
                    {"\n"}
                    {receiverInfo.receiver_address}
                  </Text>
                  <Text style={styles.phoneText}>
                    {receiverInfo.receiver_phone}
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyAddressText}>
                  Vui lòng chỉnh sửa để thêm thông tin giao hàng
                </Text>
              )}
              {receiverInfo.note && (
                <View style={styles.noteContainer}>
                  <Icon name="note" size={14} color="#6b7280" />
                  <Text style={styles.notePreview}>
                    Ghi chú: {receiverInfo.note}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="payment" size={20} color="#0d364c" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.sectionContent}>
            {paymentMethods.map((method, index) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  selectedPayment === method.id && styles.selectedPaymentOption,
                  !method.available && styles.disabledPaymentOption,
                  index < paymentMethods.length - 1 &&
                  styles.paymentOptionBorder,
                ]}
                onPress={() =>
                  method.available && setSelectedPayment(method.id)
                }
                disabled={!method.available}
              >
                <View style={styles.paymentLeft}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedPayment === method.id &&
                      styles.radioButtonSelected,
                      !method.available && styles.radioButtonDisabled,
                    ]}
                  >
                    {selectedPayment === method.id && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <View style={styles.paymentIconContainer}>
                    <Ionicons
                      name={method.icon}
                      size={24}
                      color={method.available ? "#0d364c" : "#d1d5db"}
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text
                      style={[
                        styles.paymentTitle,
                        !method.available && styles.disabledText,
                      ]}
                    >
                      {method.title}
                    </Text>
                    <Text
                      style={[
                        styles.paymentSubtitle,
                        !method.available && styles.disabledText,
                      ]}
                    >
                      {method.subtitle}
                    </Text>
                  </View>
                </View>
                {!method.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Sắp có</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="note" size={20} color="#0d364c" />
            <Text style={styles.sectionTitle}>Ghi chú đơn hàng</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.noteCard}>
              <Icon name="info-outline" size={16} color="#6b7280" />
              <Text style={styles.noteText}>
                Đơn hàng của bạn sẽ được đóng gói cẩn thận và giao trong vòng
                2-3 ngày làm việc. Thanh toán sẽ được thu khi giao hàng.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.placeOrderContainer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!selectedPayment || isLoading) && styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={!selectedPayment || isLoading}
        >
          <View style={styles.placeOrderContent}>
            {isLoading ? (
              <MinimalLoading size="small" color="#ffffff" />
            ) : (
              <Icon name="shopping-bag" size={20} color="#ffffff" />
            )}
            <Text style={styles.placeOrderButtonText}>
              {isLoading
                ? "Đang xử lý..."
                : `Đặt hàng • ${formatCurrency(summary.total)}`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Edit Address Modal */}
      {renderEditAddressModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 150,
  },
  loadingText: {
    marginTop: 12,
    color: "#0d364c",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0d364c",
  },
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0d364c",
    marginLeft: 8,
    flex: 1,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f0fdfd",
    borderWidth: 1,
    borderColor: "#13c2c2",
  },
  changeButtonText: {
    color: "#13c2c2",
    fontSize: 12,
    fontWeight: "500",
  },
  sectionContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  summaryValue: {
    color: "#0d364c",
    fontSize: 14,
    fontWeight: "500",
  },
  freeShipping: {
    color: "#10b981",
    fontWeight: "600",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  totalRow: {
    marginBottom: 0,
  },
  totalLabel: {
    fontWeight: "600",
    color: "#0d364c",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "700",
    color: "#0d364c",
    fontSize: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    color: "#0d364c",
    fontSize: 14,
    fontWeight: "500",
  },
  itemQuantity: {
    color: "#6b7280",
    fontSize: 14,
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: "center",
  },
  itemPrice: {
    color: "#0d364c",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "right",
  },
  moreItemsText: {
    color: "#6b7280",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressType: {
    fontWeight: "600",
    color: "#0d364c",
    marginLeft: 6,
  },
  defaultBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: "#1d4ed8",
    fontSize: 10,
    fontWeight: "500",
  },
  addressText: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  phoneText: {
    color: "#0d364c",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyAddressText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  notePreview: {
    color: "#6b7280",
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    fontStyle: "italic",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  paymentOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedPaymentOption: {
    backgroundColor: "#f0fdfd",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledPaymentOption: {
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: "#13c2c2",
  },
  radioButtonDisabled: {
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#13c2c2",
  },
  paymentIconContainer: {
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontWeight: "600",
    color: "#0d364c",
    fontSize: 16,
    marginBottom: 2,
  },
  paymentSubtitle: {
    color: "#6b7280",
    fontSize: 12,
  },
  disabledText: {
    color: "#d1d5db",
  },
  comingSoonBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: "#d97706",
    fontSize: 10,
    fontWeight: "500",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  noteText: {
    color: "#0f172a",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
  placeOrderContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderButton: {
    backgroundColor: "#0d364c",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#0d364c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderButton: {
    width: 50,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0d364c",
    flex: 1,
    textAlign: "center",
  },
  saveButtonText: {
    color: "#13c2c2",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0d364c",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0d364c",
    backgroundColor: "#ffffff",
  },
  textInputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  textAreaInput: {
    height: 80,
    paddingTop: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
    marginTop: 20,
  },
  infoNoteText: {
    color: "#0f172a",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
export default PaymentScreen;
