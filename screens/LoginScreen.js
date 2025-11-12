import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react-native';
import useAuth from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { handleLoginSuccess } from '../utils/authUtils';
import Toast from 'react-native-toast-message';
import { wp, hp, rf, spacing, borderRadius, fontSizes } from '../utils/responsive';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();
    const { login, isLoading, error, isAuthenticated, user } = useAuth();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (error) {
            Alert.alert('Đăng Nhập Thất Bại', 'Vui lòng kiểm tra lại email và mật khẩu');
        }
    }, [error]);

    // Tự động chuyển về HomePage khi đăng nhập thành công
    useEffect(() => {
        if (isAuthenticated && user) {
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đăng nhập thành công!',
                visibilityTime: 2000,
            });

            // Sử dụng utility function để navigate
            handleLoginSuccess(navigation, user);
        }
    }, [isAuthenticated, user, navigation]);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }
        login(email.trim(), password);
    };

    const handleGoHome = () => {
        navigation.navigate('HomePage');
    };

    return (
        <LinearGradient
            colors={['#0D364C', '#13C2C2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.backgroundElements}>
                <View style={[styles.circle, styles.circle1]} />
                <View style={[styles.circle, styles.circle2]} />
                <View style={[styles.circle, styles.circle3]} />
                <View style={[styles.circle, styles.circle4]} />
            </View>

            <View style={styles.loginContainer}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header với nút về trang chủ */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={handleGoHome}
                            activeOpacity={0.7}
                        >
                            <Home color="#13C2C2" size={20} />
                            <Text style={styles.homeButtonText}>Về trang chủ</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>Đăng Nhập</Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Mail color="#13C2C2" size={20} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="Email"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Lock color="#13C2C2" size={20} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="Mật khẩu"
                            placeholderTextColor="#aaa"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff color="#13C2C2" size={20} />
                            ) : (
                                <Eye color="#13C2C2" size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                    {/* Forgot Password Button */}
                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={() => navigation.navigate('ForgotPassword')} // Điều hướng đến màn hình quên mật khẩu
                    >
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Đăng nhập</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.footerLink}> Đăng ký</Text>
                        </TouchableOpacity>
                    </View>


                </Animated.View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundElements: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        backgroundColor: '#ffffff20',
        borderRadius: borderRadius.full,
    },
    circle1: {
        width: wp(200),
        height: wp(200),
        top: hp(-50),
        left: wp(-50),
    },
    circle2: {
        width: wp(150),
        height: wp(150),
        bottom: hp(-30),
        right: wp(-30),
    },
    circle3: {
        width: wp(100),
        height: wp(100),
        top: hp(200),
        left: wp(-40),
    },
    circle4: {
        width: wp(120),
        height: wp(120),
        bottom: hp(150),
        right: wp(-40),
    },
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    card: {
        backgroundColor: '#ffffffcc',
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: spacing.sm,
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(19, 194, 194, 0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(19, 194, 194, 0.3)',
    },
    homeButtonText: {
        color: '#13C2C2',
        fontSize: fontSizes.base,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    title: {
        fontSize: fontSizes.xxxl,
        fontWeight: 'bold',
        color: '#0D364C',
        marginBottom: spacing.xxl,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#13C2C2',
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginBottom: spacing.lg,
        backgroundColor: '#fff',
        minHeight: hp(50),
    },
    inputField: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fontSizes.md,
        color: '#000',
        paddingVertical: spacing.sm,
    },
    loginButton: {
        backgroundColor: '#13C2C2',
        paddingVertical: hp(14),
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    footer: {
        marginTop: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: '#333',
        fontSize: fontSizes.base,
    },
    footerLink: {
        color: '#13C2C2',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    forgotPasswordButton: {
        marginRight: spacing.sm,
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        color: '#13C2C2',
        fontWeight: '600',
        fontSize: fontSizes.base,
    },
});

export default LoginScreen;
