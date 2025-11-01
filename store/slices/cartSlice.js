// features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../../services/cartService";

export const fetchCartByUser = createAsyncThunk(
  "cart/fetchCartByUser",
  async (_, { rejectWithValue }) => {
    try {
      const cartItems = await cartService.getCartItems();
      // Calculate totals
      const total = await cartService.getCartTotal();
      return {
        items: cartItems || [],
        total: total.total || 0,
        item_count: total.itemCount || 0
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product_id, quantity = 1 }, { rejectWithValue, dispatch }) => {
    try {
      await cartService.addToCart(product_id, quantity);
      // Sau khi thêm thành công, cập nhật lại giỏ hàng
      await dispatch(fetchCartByUser());
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ product_id, quantity }, { rejectWithValue, dispatch }) => {
    try {
      await cartService.updateCartItem(product_id, quantity);
      // Sau khi cập nhật thành công, cập nhật lại giỏ hàng
      await dispatch(fetchCartByUser());
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (product_id, { rejectWithValue, dispatch }) => {
    try {
      await cartService.removeFromCart(product_id);
      // Sau khi xóa thành công, cập nhật lại giỏ hàng
      await dispatch(fetchCartByUser());
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  cart: null,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCartByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cart = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchCartByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cart = action.payload;
        }
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Cart
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cart = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from Cart
      .addCase(removeCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cart = action.payload;
        }
        state.error = null;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
