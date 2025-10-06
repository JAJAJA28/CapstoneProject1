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
  Platform
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
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
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
              <Text style={styles.name}>{loggedInUser?.name || 'No name provided'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="ribbon-outline" size={14} color="#fff" />
                <Text style={styles.role}>Parishioner</Text>
              </View>
            </View>
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
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "black",
    letterSpacing: 0.5,
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
    marginBottom: 20,
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
  },
  reservationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
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