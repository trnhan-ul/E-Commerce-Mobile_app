// hooks/useOrders.js
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../store/slices/orderSlice";
import orderService from "../services/orderService";

export default function useOrders() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.order.orders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Tạo đơn hàng mới
  const handleCreateOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await orderService.createOrder(orderData);
      dispatch(createOrder(response));
      return response;
    } catch (err) {
      setError(err.message || "Không thể tạo đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy toàn bộ đơn hàng
  const handleGetOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      dispatch(getOrders(response));
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy chi tiết đơn hàng theo ID
  const handleGetOrderById = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId);
      dispatch(getOrderById(response));
      return response;
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      const response = await orderService.updateOrderStatus(orderId, status);
      dispatch(updateOrderStatus({ orderId, status }));
      return response;
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderService.cancelOrder(orderId);
      dispatch(cancelOrder(orderId));
      return response;
    } catch (err) {
      setError(err.message || "Không thể hủy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load danh sách đơn hàng khi mount
  useEffect(() => {
    handleGetOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    createOrder: handleCreateOrder,
    getOrders: handleGetOrders,
    getOrderById: handleGetOrderById,
    updateOrderStatus: handleUpdateOrderStatus,
    cancelOrder: handleCancelOrder,
  };
}
