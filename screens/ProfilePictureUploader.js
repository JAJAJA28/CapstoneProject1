import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";


const UploadProfilePicture = ({ route }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const userEmail = route?.params?.email;

  if (!userEmail) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User email not found.</Text>
      </View>
    );
  }

const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert('Permission required', 'We need camera roll permission to proceed!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [ImagePicker.MediaType.IMAGE], // ✅ updated
    quality: 1,
    allowsEditing: true,
    base64: false,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    setImage(result.assets[0].uri); // ✅ new format
  }
};


  const uploadImage = async () => {
    if (!image) {
      Alert.alert('No image selected');
      return;
    }

    setUploading(true);

    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append('photo', {
      uri: image,
      name: `profile.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('email', userEmail);

    try {
      const res = await fetch('http://192.168.1.34/system/upload_profile_picture.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await res.json();
      console.log('📷 Upload result:', data);

      if (data.status === 'success') {
        Alert.alert('Success', 'Profile picture uploaded successfully!');
      } else {
        Alert.alert('Upload Failed', data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Error', 'Something went wrong during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Pick an image</Text>
        )}
      </TouchableOpacity>

      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      )}
    </View>
    </SafeAreaView>
  );
};

export default UploadProfilePicture;

// ... styles ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  imageText: {
    color: '#555',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
  },
});
