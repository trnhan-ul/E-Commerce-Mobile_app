import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm đăng nhập
export async function loginApi({ email, password }) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/user/sign-in',
            { email, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Login failed');
        }

        return {
            user: data.data,
            token: data.token.access_token,
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
}

// ✅ Hàm gửi OTP
export async function sendOtpApi({ user_name, email, password }) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/auth/register/send-otp',
            { user_name, email, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Send OTP failed');
        }

        return data; // { status: 'OK', message: 'OTP sent to email' }
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Send OTP failed');
    }
}

export async function confirmOtpApi(otp) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/auth/register/confirm',
            { otp },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Confirm OTP failed');
        }

        return data; // { status: 'OK', message: 'Register successfully' }
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Confirm OTP failed');
    }
}

// Hàm gọi API với token từ AsyncStorage
export async function apiCall(url, options = {}) {
    try {
        const token = await AsyncStorage.getItem('token');

        const config = {
            method: options.method || 'GET',
            url,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...(options.data && { data: options.data }),
            ...(options.params && { params: options.params }),
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'API call failed');
    }
}


// Hàm gửi yêu cầu quên mật khẩu
export async function forgotPasswordApi({ email }) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/auth/forgot-password',
            { email },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Failed to send OTP');
        }

        return {
            message: data.message, // Chứa thông báo thành công từ server
        };
    } catch (error) {
        // Bắt lỗi từ axios
        throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
}

// Hàm thay đổi mật khẩu
export async function changePasswordApi({ old_password, new_password }) {
    try {
        // Lấy token từ AsyncStorage
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error('Bạn cần phải đăng nhập để thay đổi mật khẩu');
        }

        // Gửi yêu cầu PUT để thay đổi mật khẩu
        const response = await axios.put(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/user/change-password',
            {
                old_password,
                new_password,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Lỗi thay đổi mật khẩu');
        }

        return {
            status: 'OK',
            message: 'Thay đổi mật khẩu thành công',
        };
    } catch (error) {
        console.error('changePasswordApi error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi thay đổi mật khẩu');
    }
}

// Hàm đặt lại mật khẩu với OTP
export async function resetPasswordApi({ email, otp, newPassword }) {
    try {
        const response = await axios.post(
            'https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/auth/reset-password',
            { email, otp, newPassword },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data;

        if (data.status !== 'OK') {
            throw new Error(data.message || 'Reset password failed');
        }

        return {
            message: data.message,
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'Reset password failed');
    }
}