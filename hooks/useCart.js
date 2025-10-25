// hooks/useCart.js
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
} from "../store/slices/cartSlice";
import cartService from "../services/cartService";

export default function useCart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Tính tổng tiền
  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  // ✅ Tổng số sản phẩm
  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // ✅ Load cart từ AsyncStorage khi app khởi động
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem("cart");
        if (storedCart) {
          dispatch(setCart(JSON.parse(storedCart)));
        }
      } catch (err) {
        console.error("Lỗi khi load giỏ hàng:", err);
      }
    };
    loadCart();
  }, [dispatch]);

  // ✅ Lưu giỏ hàng mỗi khi thay đổi
  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Các hành động xử lý
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      await cartService.addItem(product, quantity);
      dispatch(addToCart({ product, quantity }));
    } catch (err) {
      setError(err.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      setLoading(true);
      await cartService.removeItem(productId);
      dispatch(removeFromCart(productId));
    } catch (err) {
      setError(err.message || "Không thể xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      await cartService.updateQuantity(productId, quantity);
      dispatch(updateQuantity({ productId, quantity }));
    } catch (err) {
      setError(err.message || "Không thể cập nhật số lượng");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    await AsyncStorage.removeItem("cart");
    dispatch(clearCart());
  };

  const getCartTotal = () => total;

  return {
    cartItems,
    itemCount,
    total,
    loading,
    error,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    getCartTotal,
  };
}
