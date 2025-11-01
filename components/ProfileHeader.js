// components/ProfileHeader.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileHeader = ({ profile, onEditPress }) => {
    // Support cả MongoDB fields (avatar, user_name) và SQLite fields (avatar_url, full_name)
    const avatarUrl = profile?.avatar_url || profile?.avatar;
    const userName = profile?.user_name || profile?.full_name || profile?.email || 'User';

    return (
        <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
                <Image
                    source={avatarUrl ? { uri: avatarUrl } : require('../assets/favicon.png')}
                    style={styles.profileImage}
                />
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            <TouchableOpacity style={styles.editProfileButton} onPress={onEditPress}>
                <Ionicons name="create-outline" size={16} color="#13C2C2" />
                <Text style={styles.editProfileText}>Sửa hồ sơ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    profileHeader: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
    profileImageContainer: { position: 'relative' },
    profileImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: '#13C2C2' },
    profileName: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 12 },
    profileEmail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    editProfileButton: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    editProfileText: { color: '#13C2C2', fontWeight: '500', marginLeft: 4 },
});

export default ProfileHeader;
