import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
  StatusBar
} from 'react-native';
import Signature from 'react-native-signature-canvas';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const DonationFormScreen = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    donationPurpose: '',
    amount: '',
  });
  const [signature, setSignature] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signatureRef = useRef();
  const navigation = useNavigation();
  
  // Animation values
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
      })
    ]).start();
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleSignatureOk = (sig) => {
    setSignature(sig);
    setErrors({ ...errors, signature: '' });
    setShowSignatureModal(false);
  };

  const handleSignatureEmpty = () => {
    setSignature(null);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
  };

  const handleOpenSignatureModal = () => {
    setShowSignatureModal(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.donationPurpose.trim()) newErrors.donationPurpose = 'Donation purpose is required';
    if (!formData.amount.trim() || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!signature) newErrors.signature = 'Signature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      const payload = { ...formData, signature };
      try {
        const response = await fetch("http://192.168.1.18/system/donation.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await response.text();
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(text);
        } catch (err) {
          Alert.alert("Server Error", "Invalid response from server");
          return;
        }

        if (jsonResponse.status === "success") {
          Alert.alert("Donation Submitted", "Thank you for your generous donation!");
          setFormData({ fullName: '', contactNumber: '', donationPurpose: '', amount: '' });
          setSignature(null);
          navigation.goBack();
        } else {
          Alert.alert("Error", jsonResponse.message || "Unknown error occurred.");
        }
      } catch (error) {
        Alert.alert("Network Error", "Cannot connect to server. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Alert.alert('Incomplete Form', 'Please fill in all required information.');
    }
  };

  const handleCancel = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFE259" barStyle="dark-content" />
      <LinearGradient
        colors={['rgba(255, 226, 89, 0.8)', 'rgba(255, 167, 81, 0.8)']}
        style={styles.background}
      />
      
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Image source={require("../assets/IMG3.png")} style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.churchName}>ST. RAPHAEL THE ARCHANGEL</Text>
            <Text style={styles.churchName}>PARISH</Text>
            <Text style={styles.subtitle}>Diocese of Antipolo</Text>
            <Text style={styles.subtitle}>Montalban, Rizal, 1860</Text>
          </View>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Make a Donation</Text>
          <Text style={styles.welcomeSubtext}>Your generosity helps our parish community</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.formContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {/* Donation Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={require("../assets/DONATION.png")} 
                style={styles.donationImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Donation Form</Text>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.fullName && styles.errorInputWrapper]}>
                <Ionicons name="person" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={formData.fullName}
                  onChangeText={(text) => handleChange('fullName', text)}
                  returnKeyType="next"
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Contact Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Number <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.contactNumber && styles.errorInputWrapper]}>
                <Ionicons name="call" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 09XXXXXXXXX"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={formData.contactNumber}
                  onChangeText={(text) => handleChange('contactNumber', text)}
                  returnKeyType="next"
                />
              </View>
              {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
            </View>

            {/* Donation Purpose */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Donation Purpose <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.donationPurpose && styles.errorInputWrapper]}>
                <Ionicons name="document-text" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. For church maintenance"
                  placeholderTextColor="#999"
                  value={formData.donationPurpose}
                  onChangeText={(text) => handleChange('donationPurpose', text)}
                  returnKeyType="next"
                />
              </View>
              {errors.donationPurpose && <Text style={styles.errorText}>{errors.donationPurpose}</Text>}
            </View>

            {/* Donation Amount */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Donation Amount (₱) <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.amount && styles.errorInputWrapper]}>
                <Ionicons name="cash" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 500"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(text) => handleChange('amount', text)}
                  returnKeyType="done"
                />
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {/* Signature Section */}
            <View style={styles.signatureSection}>
              <Text style={styles.label}>Signature <Text style={styles.required}>*</Text></Text>
              
              <TouchableOpacity 
                style={[styles.signatureButtonContainer, errors.signature && styles.errorInputWrapper]}
                onPress={handleOpenSignatureModal}
              >
                {signature ? (
                  <View style={styles.signaturePreview}>
                    <Image source={{ uri: signature }} style={styles.signatureImage} />
                    <Text style={styles.signaturePreviewText}>Tap to change signature</Text>
                  </View>
                ) : (
                  <View style={styles.signaturePlaceholder}>
                    <Ionicons name="pencil" size={24} color="#999" />
                    <Text style={styles.signaturePlaceholderText}>Tap to sign</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {errors.signature && <Text style={styles.errorText}>{errors.signature}</Text>}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={handleCancel}
              >
                <LinearGradient
                  colors={['#f8f9fa', '#e9ecef']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.submitButton, isSubmitting && styles.buttonDisabled]} 
                onPress={handleSubmit} 
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#6A9B6B', '#5a8a5b']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="" size={18} color="#FFF" />
                    <Text style={styles.submitButtonText}>Submit Donation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSignatureModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Provide Your Signature</Text>
            <TouchableOpacity 
              onPress={() => setShowSignatureModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.signaturePadContainer}>
            <Signature
              ref={signatureRef}
              onOK={handleSignatureOk}
              onEmpty={handleSignatureEmpty}
              webStyle={webStyle}
              autoClear={false}
              backgroundColor="#ffffff"
              penColor="#000000"
              style={styles.signaturePad}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.clearButton]} 
              onPress={handleClearSignature}
            >
              <LinearGradient
                colors={['#dc3545', '#c82333']}
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name="trash" size={18} color="#FFF" />
              <Text style={styles.modalButtonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]} 
              onPress={() => signatureRef.current?.readSignature()}
            >
              <LinearGradient
                colors={['#6A9B6B', '#5a8a5b']}
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.modalButtonText}>Save Signature</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const webStyle = `
  .m-signature-pad {
    box-shadow: none;
    border: none;
    border-radius: 8px;
    margin: 0;
  }
  .m-signature-pad--body {
    border: none;
    border-radius: 8px;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body, html {
    width: 100%; 
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: transparent;
  }
  .m-signature-pad--body canvas {
    border-radius: 8px;
    border: 2px dashed #ddd;
  }
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.3,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  headerContent: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: height * 0.01,
  },
  titleContainer: {
    marginLeft: width * 0.03,
  },
  logo: { 
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: "contain",
    borderRadius: (width * 0.15) / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  churchName: { 
    fontSize: width * 0.04, 
    fontWeight: "800", 
    textAlign: "left",
    color: '#2d3436',
  },
  subtitle: { 
    fontSize: width * 0.028, 
    textAlign: "left", 
    marginTop: 2,
    color: '#636e72',
    fontWeight: '500',
  },
  welcomeContainer: {
    marginTop: height * 0.005,
  },
  welcomeText: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 2,
  },
  welcomeSubtext: {
    fontSize: width * 0.032,
    color: '#636e72',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    backgroundColor: "white",
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
    padding: width * 0.05,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: height * 0.03,
  },
  // New image container styles
  imageContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  donationImage: {
    width: width * 0.9,
    height: width * 0.3,
    borderRadius: 10,
  },
  title: { 
    fontSize: width * 0.06, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: height * 0.03,
    color: "#2d3436"
  },
  inputContainer: {
    marginBottom: height * 0.025,
  },
  label: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: "#ddd", 
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: { 
    marginLeft: width * 0.04,
    marginRight: 10 
  },
  input: { 
    flex: 1,
    height: height * 0.055, 
    paddingHorizontal: width * 0.04, 
    fontSize: width * 0.04, 
    color: '#2d3436',
  },
  errorInputWrapper: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  signatureSection: {
    marginBottom: height * 0.03,
  },
  signatureButtonContainer: {
    height: 120,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: "#f9f9f9",
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  signaturePreview: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  signatureImage: {
    width: '80%',
    height: 80,
    resizeMode: 'contain',
  },
  signaturePreviewText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: height * 0.02,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.06,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden', // Important for gradient background
  },
  cancelButton: {
    borderWidth: 0, // Remove border since we're using gradient
  },
  submitButton: {
    borderWidth: 0, // Remove border since we're using gradient
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#6A9B6B',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  signaturePadContainer: {
    flex: 1,
    margin: 20,
  },
  signaturePad: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    overflow: 'hidden', // Important for gradient background
  },
  clearButton: {
    borderWidth: 0,
  },
  saveButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DonationFormScreen;