import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
    small: 320,
    medium: 375,
    large: 414,
    extraLarge: 480,
};

// Check if device is tablet
export const isTablet = () => {
    return SCREEN_WIDTH >= 768;
};

// Check if device is small phone
export const isSmallDevice = () => {
    return SCREEN_WIDTH < BREAKPOINTS.medium;
};

// Responsive width/height based on design (375x812 - iPhone X)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const wp = (size) => {
    return (SCREEN_WIDTH / guidelineBaseWidth) * size;
};

export const hp = (size) => {
    return (SCREEN_HEIGHT / guidelineBaseHeight) * size;
};

// Responsive font size
export const rf = (size) => {
    const scale = SCREEN_WIDTH / guidelineBaseWidth;
    const newSize = size * scale;

    if (Platform.OS === 'ios') {
        return Math.round(newSize);
    } else {
        return Math.round(newSize) - 2;
    }
};

// Get screen dimensions
export const getScreenDimensions = () => ({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
});

// Responsive padding/margin
export const spacing = {
    xs: wp(4),
    sm: wp(8),
    md: wp(16),
    lg: wp(24),
    xl: wp(32),
    xxl: wp(40),
};

// Responsive border radius
export const borderRadius = {
    sm: wp(4),
    md: wp(8),
    lg: wp(12),
    xl: wp(16),
    xxl: wp(24),
    full: 9999,
};

// Responsive icon sizes
export const iconSizes = {
    xs: wp(12),
    sm: wp(16),
    md: wp(20),
    lg: wp(24),
    xl: wp(32),
    xxl: wp(40),
};

// Font sizes
export const fontSizes = {
    xs: rf(10),
    sm: rf(12),
    base: rf(14),
    md: rf(16),
    lg: rf(18),
    xl: rf(20),
    xxl: rf(24),
    xxxl: rf(32),
};

export default {
    wp,
    hp,
    rf,
    spacing,
    borderRadius,
    iconSizes,
    fontSizes,
    isTablet,
    isSmallDevice,
    getScreenDimensions,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
};
