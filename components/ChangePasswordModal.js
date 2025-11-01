import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MinimalLoading } from './Loading';
import { COLORS } from '../constants/colors';
import authService from '../services/authService';

// Validate password helper
const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }
    return { isValid: true };
};

const ChangePasswordModal = ({
    visible = false,
    onClose,
    currentPassword = '',
    newPassword = '',
    confirmPassword = '',
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    onSave,
    onSubmit,
    isLoading = false,
}) => {
    const [loading, setLoading] = useState(false);
    const loadingState = isLoading !== undefined ? isLoading : loading;
    const [errors, setErrors] = useState({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClose = () => {
        setErrors({});
        if (setCurrentPassword) setCurrentPassword('');
        if (setNewPassword) setNewPassword('');
        if (setConfirmPassword) setConfirmPassword('');
        if (onClose) onClose();
    };

    const validate = () => {
        const newErrors = {};

        // Safety check - ensure values are strings
        const currentPass = String(currentPassword || '');
        const newPass = String(newPassword || '');
        const confirmPass = String(confirmPassword || '');

        if (!currentPass || currentPass.trim() === '') {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!newPass || newPass.trim() === '') {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else {
            const passwordValidation = validatePassword(newPass);
            if (!passwordValidation.isValid) {
                newErrors.newPassword = passwordValidation.error;
            }
        }

        if (!confirmPass || confirmPass.trim() === '') {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (newPass !== confirmPass) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (currentPass === newPass && currentPass !== '') {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        if (onSubmit) {
            // Use onSubmit if provided (from ProfileScreen)
            onSubmit();
            return;
        }

        setLoading(true);
        try {
            if (onSave) {
                await onSave({
                    currentPassword,
                    newPassword,
                });
            } else {
                // Default implementation
                try {
                    const result = await authService.changePassword(currentPassword, newPassword);

                    if (result) {
                        Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
                            {
                                text: 'OK',
                                onPress: handleClose,
                            },
                        ]);
                    } else {
                        Alert.alert('Lỗi', 'Đổi mật khẩu thất bại');
                    }
                } catch (error) {
                    Alert.alert('Lỗi', error.message || 'Đổi mật khẩu thất bại');
                }
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.overlay}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.backdrop}
                        onPress={handleClose}
                    />
                </View>

                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Đổi Mật Khẩu</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            {/* Current Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu hiện tại</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        placeholderTextColor={COLORS.text.secondary}
                                        value={String(currentPassword || '')}
                                        onChangeText={(text) => setCurrentPassword && setCurrentPassword(text)}
                                        secureTextEntry={!showCurrentPassword}
                                        autoCapitalize="none"
                                        editable={!loadingState}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        <Text style={styles.eyeButtonText}>
                                            {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {errors && errors.currentPassword && (
                                    <Text style={styles.errorText}>{errors.currentPassword}</Text>
                                )}
                            </View>

                            {/* New Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu mới</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mật khẩu mới"
                                        placeholderTextColor={COLORS.text.secondary}
                                        value={String(newPassword || '')}
                                        onChangeText={(text) => setNewPassword && setNewPassword(text)}
                                        secureTextEntry={!showNewPassword}
                                        autoCapitalize="none"
                                        editable={!loadingState}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        <Text style={styles.eyeButtonText}>
                                            {showNewPassword ? '👁️' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {errors && errors.newPassword && (
                                    <Text style={styles.errorText}>{errors.newPassword}</Text>
                                )}
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập lại mật khẩu mới"
                                        placeholderTextColor={COLORS.text.secondary}
                                        value={String(confirmPassword || '')}
                                        onChangeText={(text) => setConfirmPassword && setConfirmPassword(text)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={!loadingState}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Text style={styles.eyeButtonText}>
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {errors && errors.confirmPassword && (
                                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={loadingState}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.saveButton,
                                    loadingState && styles.disabledButton,
                                ]}
                                onPress={handleSave}
                                disabled={loadingState}
                            >
                                {loadingState ? (
                                    <MinimalLoading size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Đổi Mật Khẩu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: COLORS.text.secondary,
    },
    content: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.primary,
        marginBottom: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.light,
        borderRadius: 8,
        backgroundColor: COLORS.background,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: 12,
        fontSize: 16,
        color: COLORS.text.primary,
    },
    eyeButton: {
        padding: 12,
    },
    eyeButtonText: {
        fontSize: 20,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border.light,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default ChangePasswordModal;
