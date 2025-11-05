import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // Only return active categories for UI
      const categories = await categoryService.getActiveCategories(100);
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const category = await categoryService.getCategoryById(categoryId);
      return category;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCategories = createAsyncThunk(
  'categories/searchCategories',
  async (query, { rejectWithValue }) => {
    try {
      const categories = await categoryService.searchCategories(query);
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoriesWithProductCount = createAsyncThunk(
  'categories/fetchCategoriesWithProductCount',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategoriesWithProductCount();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPopularCategories = createAsyncThunk(
  'categories/fetchPopularCategories',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getPopularCategories(limit);
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  currentCategory: null,
  searchResults: [],
  categoriesWithProductCount: [],
  popularCategories: [],
  loading: false,
  error: null,
  searchQuery: ''
};

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search categories
    builder
      .addCase(searchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch categories with product count
    builder
      .addCase(fetchCategoriesWithProductCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesWithProductCount.fulfilled, (state, action) => {
        state.loading = false;
        state.categoriesWithProductCount = action.payload;
      })
      .addCase(fetchCategoriesWithProductCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch popular categories
    builder
      .addCase(fetchPopularCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.popularCategories = action.payload;
      })
      .addCase(fetchPopularCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSearchResults,
  setSearchQuery,
  clearCurrentCategory
} = categorySlice.actions;

export default categorySlice.reducer;