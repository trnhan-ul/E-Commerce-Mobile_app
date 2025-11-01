import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import reviewService from '../../services/reviewService';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const reviews = await reviewService.getProductReviewsByProductId(productId);
      return { productId, reviews };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Alias for fetchProductReviews (backward compatibility)
export const fetchProductReviewsByProductId = createAsyncThunk(
  'reviews/fetchProductReviewsByProductId',
  async (productId, { rejectWithValue }) => {
    try {
      const reviews = await reviewService.getProductReviewsByProductId(productId);
      return { productId, reviews };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const result = await reviewService.addReview(reviewData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const result = await reviewService.updateReview(reviewId, reviewData);
      return { reviewId, reviewData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const result = await reviewService.deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async ({ userId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const reviews = await reviewService.getUserReviews(userId, limit, offset);
      return reviews;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReviewStats = createAsyncThunk(
  'reviews/fetchReviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await reviewService.getReviewStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  productReviews: [],
  userReviews: [],
  currentReview: null,
  reviewStats: null,
  loading: false,
  error: null,
  productId: null,
};

// Slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReviews: (state) => {
      state.productReviews = [];
      state.userReviews = [];
      state.currentReview = null;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    setProductId: (state, action) => {
      state.productId = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch product reviews
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, reviews } = action.payload;
        state.productId = productId;
        // Merge reviews into existing list (avoid duplicates)
        const existingIds = state.productReviews.map(r => r.id);
        const newReviews = reviews.filter(r => !existingIds.includes(r.id));
        state.productReviews = [...state.productReviews, ...newReviews];
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch product reviews by product ID (alias)
    builder
      .addCase(fetchProductReviewsByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviewsByProductId.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, reviews } = action.payload;
        state.productId = productId;
        // Merge reviews into existing list (avoid duplicates)
        const existingIds = state.productReviews.map(r => r.id);
        const newReviews = reviews.filter(r => !existingIds.includes(r.id));
        state.productReviews = [...state.productReviews, ...newReviews];
      })
      .addCase(fetchProductReviewsByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add review
    builder
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        // Reload reviews after adding
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update review
    builder
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const { reviewId, reviewData } = action.payload;
        state.productReviews = state.productReviews.map(review =>
          review.id === reviewId ? { ...review, ...reviewData } : review
        );
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete review
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = state.productReviews.filter(
          review => review.id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user reviews
    builder
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch review stats
    builder
      .addCase(fetchReviewStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewStats = action.payload;
      })
      .addCase(fetchReviewStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearReviews,
  clearCurrentReview,
  setProductId
} = reviewSlice.actions;

// Selectors - Memoized để tránh unnecessary rerenders
const selectAllProductReviews = (state) => state.reviews?.productReviews || [];
const selectAllUserReviews = (state) => state.reviews?.userReviews || [];

// Tạo base selector cho product reviews
const makeSelectProductReviews = () => {
  return createSelector(
    [selectAllProductReviews, (state, productId) => productId],
    (reviews, productId) => {
      if (!productId) return reviews;
      // Trả về reference mới chỉ khi reviews hoặc productId thay đổi
      return reviews.filter(review => review.product_id === productId || review.productId === productId);
    }
  );
};

// Selector factory pattern - tạo memoized selector instance
const selectProductReviewsInstances = {};

// Memoized selector cho product reviews với productId
export const selectProductReviews = (state, productId) => {
  // Tạo cache key từ productId
  const cacheKey = productId || 'all';

  // Nếu chưa có instance cho productId này, tạo mới
  if (!selectProductReviewsInstances[cacheKey]) {
    selectProductReviewsInstances[cacheKey] = createSelector(
      [selectAllProductReviews],
      (reviews) => {
        if (!productId) return reviews;
        return reviews.filter(review => review.product_id === productId || review.productId === productId);
      }
    );
  }

  return selectProductReviewsInstances[cacheKey](state);
};

// Memoized selector cho review stats
export const selectReviewStats = createSelector(
  [(state) => state.reviews?.reviewStats],
  (stats) => stats || null
);

// Memoized selector cho user reviews
const selectUserReviewsInstances = {};

export const selectUserReviews = (state, userId) => {
  const cacheKey = userId || 'all';

  if (!selectUserReviewsInstances[cacheKey]) {
    selectUserReviewsInstances[cacheKey] = createSelector(
      [selectAllUserReviews],
      (reviews) => {
        if (!userId) return reviews;
        return reviews.filter(review => review.user_id === userId || review.userId === userId);
      }
    );
  }

  return selectUserReviewsInstances[cacheKey](state);
};

export default reviewSlice.reducer;