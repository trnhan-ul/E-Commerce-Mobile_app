import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

export const fetchUserProfile = createAsyncThunk(
    'user/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getUserProfile();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async ({ user_name, avatar, ...otherData }, { rejectWithValue }) => {
        try {
            const response = await userService.updateUserProfile({
                username: user_name,
                avatar_url: avatar,
                ...otherData
            });
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const changePassword = createAsyncThunk(
    'user/changePassword',
    async ({ old_password, new_password }, { rejectWithValue }) => {
        try {
            const result = await userService.changePassword(old_password, new_password);
            return result ? 'Password changed successfully' : 'Failed to change password';
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    profile: {},
    isLoading: false,
    error: null,
    isUpdateSuccess: false,
    isChangePasswordSuccess: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserState: (state) => {
            state.profile = null;
            state.isLoading = false;
            state.error = null;
        },
        resetUpdateSuccess: (state) => {
            state.isUpdateSuccess = false;
        },
        resetChangePasswordSuccess: (state) => {
            state.isChangePasswordSuccess = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.isUpdateSuccess = true;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.isChangePasswordSuccess = false;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isChangePasswordSuccess = true;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isChangePasswordSuccess = false;
            })
    },
});

export const { clearUserState, resetUpdateSuccess, resetChangePasswordSuccess, clearError } = userSlice.actions;
export default userSlice.reducer;
