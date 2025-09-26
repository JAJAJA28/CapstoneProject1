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
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../AuthContext';
import { StatusBar } from 'react-native';0

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;
  const profileScaleAnim = useRef(new Animated.Value(0.9)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Effect to update status bar style based on dark mode
  useEffect(() => {
    StatusBar.setBarStyle(darkMode ? 'light-content' : 'dark-content');
  }, [darkMode]);

  // Rest of your existing useEffect
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
    formData.append("photo", {
      uri: imageAsset.uri,
      type: `image/${fileType}`,
      name: `profile.${fileType}`,
    });

    try {
      setIsLoading(true);
      const response = await fetch("http://10.203.3.62/system/upload_profile_picture.php", {
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
            setTimeout(() => {
              setLoggedInUser(null);
              setIsLoading(false);
            }, 1000);
          }
        }
      ]
    );
  };

  // Function to handle notification settings
  const handleNotificationSettings = () => {
    Alert.alert(
      "Notification Settings",
      "Customize how you receive notifications",
      [
        {
          text: `Push Notifications: ${notificationsEnabled ? 'On' : 'Off'}`,
          onPress: () => setNotificationsEnabled(!notificationsEnabled)
        },
        {
          text: `Email Notifications: ${emailNotifications ? 'On' : 'Off'}`,
          onPress: () => setEmailNotifications(!emailNotifications)
        },
        {
          text: `Security Alerts: ${securityAlerts ? 'On' : 'Off'}`,
          onPress: () => setSecurityAlerts(!securityAlerts)
        },
        {
          text: "Done",
          style: "cancel"
        }
      ]
    );
  };

  // Function to handle privacy & security settings
  const handlePrivacySecurity = () => {
    Alert.alert(
      "Privacy & Security",
      "Manage your account security and privacy settings",
      [
        {
          text: "Change Password",
          onPress: () => navigation.navigate("ChangePassword")
        },
        {
          text: "Two-Factor Authentication",
          onPress: () => navigation.navigate("TwoFactorAuth")
        },
        {
          text: "Privacy Policy",
          onPress: () => navigation.navigate("PrivacyPolicy")
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Function to handle help & support
  const handleHelpSupport = () => {
    Alert.alert(
      "Help & Support",
      "How can we help you?",
      [
        {
          text: "FAQs",
          onPress: () => navigation.navigate("FAQs")
        },
        {
          text: "Contact Support",
          onPress: () => navigation.navigate("ContactSupport")
        },
        {
          text: "App Feedback",
          onPress: () => navigation.navigate("AppFeedback")
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(previousState => !previousState);
  };

  const renderProfileSection = () => (
    <>
      <Animated.View style={[styles.profileCard, { 
        transform: [{ translateY: cardSlideAnim }, { scale: profileScaleAnim }],
        backgroundColor: darkMode ? '#2d3748' : '#fff'
      }]}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={showImagePickerOptions} disabled={isLoading}>
            <Animated.View style={[styles.profileImageWrapper, { transform: [{ scale: profileScaleAnim }] }]}>
              <Image
                source={
                  selectedImage
                    ? { uri: selectedImage.uri }
                    : loggedInUser?.profilePicture
                      ? { uri: `http://10.203.3.62/system/uploads/${loggedInUser.profilePicture}?t=${new Date().getTime()}` }
                      : require('../assets/AGNUS3.png')
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
          <Text style={[styles.name, { color: darkMode ? '#fff' : '#2d3748' }]}>{loggedInUser?.name || 'No name provided'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="ribbon-outline" size={14} color="#fff" />
            <Text style={styles.role}>Parishioner</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: darkMode ? '#fff' : '#2d3748' }]}>12</Text>
            <Text style={[styles.statLabel, { color: darkMode ? '#a0aec0' : '#718096' }]}>Events</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: darkMode ? '#4a5568' : '#e2e8f0' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: darkMode ? '#fff' : '#2d3748' }]}>5</Text>
            <Text style={[styles.statLabel, { color: darkMode ? '#a0aec0' : '#718096' }]}>Services</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: darkMode ? '#4a5568' : '#e2e8f0' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: darkMode ? '#fff' : '#2d3748' }]}>2</Text>
            <Text style={[styles.statLabel, { color: darkMode ? '#a0aec0' : '#718096' }]}>Years</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.detailsCard, { 
        transform: [{ translateY: cardSlideAnim }],
        backgroundColor: darkMode ? '#2d3748' : '#fff'
      }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={24} color="#6c5ce7" />
          <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#2d3748' }]}>Account Details</Text>
        </View>

        <View style={styles.detailsList}>
          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
              <Feather name="mail" size={18} color="#6c5ce7" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: darkMode ? '#a0aec0' : '#718096' }]}>Email</Text>
              <Text style={[styles.detailText, { color: darkMode ? '#fff' : '#2d3748' }]} numberOfLines={1}>{loggedInUser?.email || 'No email provided'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
              <Feather name="phone" size={18} color="#6c5ce7" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: darkMode ? '#a0aec0' : '#718096' }]}>Phone</Text>
              <Text style={[styles.detailText, { color: darkMode ? '#fff' : '#2d3748' }]}>{loggedInUser?.contactNumber || 'No contact number provided'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
              <Feather name="map-pin" size={18} color="#6c5ce7" />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: darkMode ? '#a0aec0' : '#718096' }]}>Address</Text>
              <Text style={[styles.detailText, { color: darkMode ? '#fff' : '#2d3748' }]}>{loggedInUser?.completeAddress || 'No address provided'}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.reservationCard, { 
        transform: [{ translateY: cardSlideAnim }],
        backgroundColor: darkMode ? '#2d3748' : '#fff'
      }]}>
        <TouchableOpacity
          style={styles.reservationButton}
          onPress={() => {
            if (loggedInUser && loggedInUser.email) {
              navigation.navigate("MyReservations", { userEmail: loggedInUser.email });
            } else {
              Alert.alert("Error", "No logged in user found.");
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.reservationButtonContent}>
            <Ionicons name="calendar" size={22} color="#fff" />
            <Text style={styles.reservationText}>View My Reservations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );

  const renderSettingsSection = () => (
    <Animated.View style={[styles.settingsCard, { 
      transform: [{ translateY: cardSlideAnim }],
      backgroundColor: darkMode ? '#2d3748' : '#fff'
    }]}>
      <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#2d3748' }]}>Preferences</Text>
      
      <TouchableOpacity style={styles.settingsItem} onPress={handleNotificationSettings}>
        <View style={[styles.settingsIcon, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
          <Ionicons name="notifications-outline" size={22} color="#6c5ce7" />
        </View>
        <View style={styles.settingsContent}>
          <Text style={[styles.settingsLabel, { color: darkMode ? '#fff' : '#2d3748' }]}>Notifications</Text>
          <Text style={[styles.settingsDescription, { color: darkMode ? '#a0aec0' : '#718096' }]}>Manage your notification preferences</Text>
        </View>
        <View style={styles.notificationStatus}>
          <Text style={[styles.notificationStatusText, { color: darkMode ? '#a0aec0' : '#718096' }]}>
            {notificationsEnabled ? 'On' : 'Off'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingsItem} onPress={handlePrivacySecurity}>
        <View style={[styles.settingsIcon, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
          <Ionicons name="lock-closed-outline" size={22} color="#6c5ce7" />
        </View>
        <View style={styles.settingsContent}>
          <Text style={[styles.settingsLabel, { color: darkMode ? '#fff' : '#2d3748' }]}>Privacy & Security</Text>
          <Text style={[styles.settingsDescription, { color: darkMode ? '#a0aec0' : '#718096' }]}>Control your privacy settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingsItem} onPress={handleHelpSupport}>
        <View style={[styles.settingsIcon, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
          <Ionicons name="help-buoy-outline" size={22} color="#6c5ce7" />
        </View>
        <View style={styles.settingsContent}>
          <Text style={[styles.settingsLabel, { color: darkMode ? '#fff' : '#2d3748' }]}>Help & Support</Text>
          <Text style={[styles.settingsDescription, { color: darkMode ? '#a0aec0' : '#718096' }]}>Get help and contact support</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
      </TouchableOpacity>
      
      <View style={styles.settingsItem}>
        <View style={[styles.settingsIcon, { backgroundColor: darkMode ? '#4a5568' : '#f0f7ff' }]}>
          <Ionicons name="moon-outline" size={22} color="#6c5ce7" />
        </View>
        <View style={styles.settingsContent}>
          <Text style={[styles.settingsLabel, { color: darkMode ? '#fff' : '#2d3748' }]}>Dark Mode</Text>
          <Text style={[styles.settingsDescription, { color: darkMode ? '#a0aec0' : '#718096' }]}>Toggle dark theme</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#6c5ce7' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: darkMode ? '#121212' : "#f8f9fa" }]}>
      <LinearGradient
        colors={darkMode ? ['rgba(30, 30, 30, 0.8)', 'rgba(50, 50, 50, 0.8)'] : ['rgba(255, 226, 89, 0.8)', 'rgba(255, 167, 81, 0.8)']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode ? "light-content" : "dark-content"}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: darkMode ? '#fff' : "black" }]}>My Profile</Text>
        <TouchableOpacity 
          style={[styles.settingsButton, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]}
          onPress={() => setActiveTab(activeTab === 'profile' ? 'settings' : 'profile')}
        >
          <Ionicons 
            name={activeTab === 'profile' ? "settings-outline" : "person-outline"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: darkMode ? 'rgba(45, 55, 72, 0.2)' : 'rgba(255, 255, 255, 0.2)' }]}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'profile' && [styles.activeTab, { backgroundColor: darkMode ? '#2d3748' : 'white' }]]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && [styles.activeTabText, { color: darkMode ? '#fff' : '#4c669f' }]]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'settings' && [styles.activeTab, { backgroundColor: darkMode ? '#2d3748' : 'white' }]]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && [styles.activeTabText, { color: darkMode ? '#fff' : '#4c669f' }]]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {activeTab === 'profile' ? renderProfileSection() : renderSettingsSection()}
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomActions, { backgroundColor: darkMode ? '#1a202c' : '#fff' }]}>
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
      `http://10.203.3.62/system/get_user_data.php?email=${encodeURIComponent(email)}`
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
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "black",
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#4c669f',
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
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 35,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
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
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reservationCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
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
  },
  reservationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
  settingsCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  settingsDescription: {
    fontSize: 13,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    paddingTop: 14,
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
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationStatusText: {
    fontSize: 14,
    marginRight: 5,
  },
});