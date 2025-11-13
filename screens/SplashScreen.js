import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { wp, hp, rf, spacing, borderRadius, fontSizes } from '../utils/responsive';

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation sequence
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous rotation for loading indicator
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        );
        rotateAnimation.start();

        return () => rotateAnimation.stop();
    }, []);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            {/* Background gradient effect */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />

            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* Logo/Icon container */}
                <View style={styles.logoContainer}>
                    <View style={styles.iconWrapper}>
                        <Text style={styles.iconText}>CarSupper</Text>
                    </View>
                </View>

                {/* App Title */}
                <Text style={styles.title}>CarSupper APP</Text>
                <Text style={styles.subtitle}></Text>

                {/* Custom Loading Indicator */}
                <Animated.View
                    style={[
                        styles.customLoader,
                        { transform: [{ rotate: rotateInterpolate }] }
                    ]}
                >
                    <View style={styles.loaderRing} />
                </Animated.View>

                <Text style={styles.loadingText}>Đang khởi tạo...</Text>
            </Animated.View>

            {/* Version info */}
            <View style={styles.footer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D364C',
        position: 'relative',
    },
    backgroundCircle1: {
        position: 'absolute',
        width: wp(600),
        height: wp(600),
        borderRadius: borderRadius.full,
        backgroundColor: '#13C2C2',
        opacity: 0.1,
        top: hp(-200),
        left: wp(-100),
    },
    backgroundCircle2: {
        position: 'absolute',
        width: wp(400),
        height: wp(400),
        borderRadius: borderRadius.full,
        backgroundColor: '#13C2C2',
        opacity: 0.05,
        bottom: hp(-120),
        right: wp(-120),
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: spacing.xxl,
    },
    iconWrapper: {
        width: wp(120),
        height: wp(120),
        borderRadius: borderRadius.full,
        backgroundColor: '#13C2C2',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 15,
    },
    iconText: {
        fontSize: fontSizes.xxl,
        fontWeight: 'bold',
        color: '#0D364C',
        letterSpacing: 2,
    },
    title: {
        fontSize: rf(36),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: spacing.sm,
        letterSpacing: 3,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: fontSizes.md,
        color: '#13C2C2',
        marginBottom: spacing.xl,
        fontStyle: 'italic',
        opacity: 0.9,
    },
    customLoader: {
        width: wp(60),
        height: wp(60),
        marginBottom: spacing.lg,
    },
    loaderRing: {
        width: wp(60),
        height: wp(60),
        borderRadius: borderRadius.full,
        borderWidth: 4,
        borderColor: 'transparent',
        borderTopColor: '#13C2C2',
        borderRightColor: '#13C2C2',
    },
    loadingText: {
        fontSize: fontSizes.md,
        color: '#13C2C2',
        opacity: 0.8,
    },
    footer: {
        position: 'absolute',
        bottom: hp(50),
        alignItems: 'center',
    },
    versionText: {
        fontSize: fontSizes.sm,
        color: '#FFFFFF',
        opacity: 0.6,
    },
});