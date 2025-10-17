import React, { useRef, useEffect, useState, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;
  const profileScaleAnim = useRef(new Animated.Value(0.9)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationPulse] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSpinAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.spring(profileScaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (loggedInUser?.email) {
      fetchUnreadNotifications();
      // Set up interval to check for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [loggedInUser?.email]);

  // Pulse animation for notification bell
  useEffect(() => {
    if (unreadNotifications > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(notificationPulse, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(notificationPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [unreadNotifications]);

  // Spin animation for refresh icon
  const startRefreshAnimation = () => {
    refreshSpinAnim.setValue(0);
    Animated.timing(refreshSpinAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  };

  const spin = refreshSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const fetchUnreadNotifications = async () => {
    try {
      if (!loggedInUser?.email) {
        console.log('No user email available');
        return;
      }

      const response = await fetch(
        `http://192.168.1.18/system/get_unread_notifications.php?email=${encodeURIComponent(loggedInUser.email)}`
      );
      
      // First, check if response is OK
      if (!response.ok) {
        console.error('HTTP error:', response.status);
        return;
      }

      const text = await response.text();
      console.log('Raw response:', text); // Debug log

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        return;
      }
      
      if (result.status === 'success') {
        setUnreadNotifications(result.unread_count);
      } else {
        console.error('API error:', result.message);
      }
    } catch (error) {
      console.error('Network error fetching notifications:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      if (!loggedInUser?.email) return;

      const updatedUserData = await fetchUserData(loggedInUser.email);
      if (updatedUserData) {
        setLoggedInUser(updatedUserData);
      }
      
      await fetchUnreadNotifications();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    startRefreshAnimation();
    
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  const handleManualRefresh = () => {
    if (!refreshing) {
      onRefresh();
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      if (!loggedInUser?.email) {
        console.log('No user email available');
        return;
      }

      const response = await fetch(
        'http://192.168.1.18/system/mark_notifications_read.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: loggedInUser.email })
        }
      );

      // First, check if response is OK
      if (!response.ok) {
        console.error('HTTP error:', response.status);
        return;
      }

      const text = await response.text();
      console.log('Mark read raw response:', text); // Debug log

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        return;
      }

      if (result.status === 'success') {
        setUnreadNotifications(0);
      } else {
        console.error('API error:', result.message);
      }
    } catch (error) {
      console.error('Network error marking notifications as read:', error);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takePhoto()
        },
        {
          text: "Choose from Library",
          onPress: () => pickImage(false)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      setSelectedImage(imageAsset);
      await uploadProfilePicture(imageAsset);
    }
  };

  const pickImage = async (useCamera = false) => {
    const permissionType = useCamera ? 
      await ImagePicker.requestCameraPermissionsAsync() :
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      
    if (permissionType.status !== 'granted') {
      Alert.alert("Permission Denied", `${useCamera ? 'Camera' : 'Gallery'} access is required.`);
      return;
    }

    const result = useCamera ? 
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      }) :
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      setSelectedImage(imageAsset);
      await uploadProfilePicture(imageAsset);
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    if (!imageAsset) {
      Alert.alert("Error", "No image selected.");
      return;
    }

    const uriParts = imageAsset.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const email = loggedInUser.email;

    const formData = new FormData();
    formData.append("email", email);
    
    // FIXED: Use string concatenation instead of template literals
    formData.append("photo", {
      uri: imageAsset.uri,
      type: "image/" + fileType, // Changed from template literal
      name: "profile." + fileType, // Changed from template literal
    });

    try {
      setIsLoading(true);
      const response = await fetch("http://192.168.1.18/system/upload_profile_picture.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.status === "success") {
        const updatedUserData = await fetchUserData(email);
        setLoggedInUser(updatedUserData);
        Alert.alert("Success", "Profile picture updated successfully.");
      } else {
        Alert.alert("Upload Failed", result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsPress = () => {
    // Mark notifications as read when user views them
    markNotificationsAsRead();
    navigation.navigate("MyReservations", { userEmail: loggedInUser.email });
  };

// ProfileScreen.js - LOGOUT FUNCTION ONLY
const handleLogout = () => {
  Alert.alert(
    "Confirm Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setIsLoading(true);
          setLoggedInUser(null);
          
          // SIMPLE NAVIGATION LANG
          setTimeout(() => {
            navigation.navigate('Login');
            setIsLoading(false);
          }, 500);
        }
      }
    ]
  );
};
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['rgba(255, 226, 89, 0.8)', 'rgba(255, 167, 81, 0.8)']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
            onPress={handleManualRefresh}
            disabled={refreshing}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons 
                name="refresh-circle" 
                size={32} 
                color={refreshing ? "#ccc" : "#2d3748"} 
              />
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <Animated.View style={{ transform: [{ scale: notificationPulse }] }}>
              <Ionicons name="notifications" size={24} color="#2d3748" />
            </Animated.View>
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFE259']}
            progressBackgroundColor="#ffffff"
            tintColor="#FFE259"
            title="Refreshing..."
            titleColor="#2d3748"
          />
        }
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Profile Card */}
          <Animated.View style={[styles.profileCard, { 
            transform: [{ translateY: cardSlideAnim }, { scale: profileScaleAnim }]
          }]}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity onPress={showImagePickerOptions} disabled={isLoading}>
                <Animated.View style={[styles.profileImageWrapper, { transform: [{ scale: profileScaleAnim }] }]}>
                  <Image
                    source={
                      selectedImage
                        ? { uri: selectedImage.uri }
                        : loggedInUser?.profilePicture
                          ? { uri: `http://192.168.1.18/system/uploads/${loggedInUser.profilePicture}?t=${new Date().getTime()}` }
                          : require('../assets/DEFAULT.png')
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.cameraIconContainer}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="camera" size={20} color="#fff" />
                    )}
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{loggedInUser?.name || 'No name provided'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="ribbon-outline" size={14} color="#fff" />
                <Text style={styles.role}>Parishioner</Text>
              </View>
            </View>

            {/* Notification Alert */}
            {unreadNotifications > 0 && (
              <View style={styles.notificationAlert}>
                <Ionicons name="information-circle" size={16} color="#fff" />
                <Text style={styles.notificationAlertText}>
                  You have {unreadNotifications} new status update{unreadNotifications > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Account Details Card */}
          <Animated.View style={[styles.detailsCard, { 
            transform: [{ translateY: cardSlideAnim }]
          }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#6c5ce7" />
              <Text style={styles.sectionTitle}>Account Details</Text>
            </View>

            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <View style={styles.iconContainer}>
                  <Feather name="mail" size={18} color="#6c5ce7" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailText} numberOfLines={1}>{loggedInUser?.email || 'No email provided'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconContainer}>
                  <Feather name="phone" size={18} color="#6c5ce7" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailText}>{loggedInUser?.contactNumber || 'No contact number provided'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconContainer}>
                  <Feather name="map-pin" size={18} color="#6c5ce7" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailText}>{loggedInUser?.completeAddress || 'No address provided'}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Reservations Card */}
          <Animated.View style={[styles.reservationCard, { 
            transform: [{ translateY: cardSlideAnim }]
          }]}>
            <TouchableOpacity
              style={styles.reservationButton}
              onPress={handleNotificationsPress}
              activeOpacity={0.7}
            >
              <View style={styles.reservationButtonContent}>
                <Ionicons name="calendar" size={22} color="#fff" />
                <Text style={styles.reservationText}>View My Reservations</Text>
                {unreadNotifications > 0 && (
                  <View style={styles.reservationBadge}>
                    <Text style={styles.reservationBadgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="logout" size={18} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const fetchUserData = async (email) => {
  try {
    const response = await fetch(
      `http://192.168.1.18/system/get_user_data.php?email=${encodeURIComponent(email)}`
    );
    const data = await response.json();
    if (data.status === 'success') return data.user;
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "black",
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 4,
    marginRight: 8,
    borderRadius: 20,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImageWrapper: {
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  profileImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 5,
    borderColor: "#4c669f",
    backgroundColor: "#f1f1f1",
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4c669f',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: '#2d3748'
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  role: {
    fontSize: 13,
    color: "#fff",
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  notificationAlertText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    paddingBottom: 14,
    borderBottomColor: '#e2e8f0'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
    color: '#2d3748'
  },
  detailsList: {
    paddingHorizontal: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#f0f7ff'
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: '500',
    color: '#718096'
  },
  detailText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3748'
  },
  reservationCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  reservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 14,
  },
  reservationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  reservationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
  reservationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  reservationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    paddingTop: 14,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#e63946",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});