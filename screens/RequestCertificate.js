import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  useColorScheme,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from "../AuthContext";

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const RequestCertificate = () => {
  // ✅ CORRECT: Gamitin ang AuthContext para makuha ang logged in user
  const { loggedInUser } = useContext(AuthContext);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    father: '',
    mother: '',
    purpose: '',
    // ✅ AUTO-SET ang email mula sa loggedInUser
    email: loggedInUser?.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Update formData kapag nagbago ang loggedInUser
  React.useEffect(() => {
    if (loggedInUser?.email) {
      setFormData(prev => ({
        ...prev,
        email: loggedInUser.email
      }));
    }
  }, [loggedInUser]);

  // Color scheme adjustments
  const backgroundColor = isDarkMode ? '#121212' : '#F8F9FA';
  const cardBackground = isDarkMode ? '#1E1E1E' : '#FFF';
  const textColor = isDarkMode ? '#FFF' : '#2c3e50';
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : '#7f8c8d';
  const primaryColor = isDarkMode ? '#7C3AED' : '#6c5ce7';
  const borderColor = isDarkMode ? '#333' : '#EEE';

  const certificateTypes = [
    {
      id: 'baptismal',
      title: 'BAPTISMAL',
      icon: 'water',
      color: isDarkMode ? '#3B82F6' : '#2563EB',
      gradient: isDarkMode ? ['#1E40AF', '#3B82F6'] : ['#2563EB', '#3B82F6']
    },
    {
      id: 'first-communion',
      title: 'FIRST COMMUNION',
      icon: 'bread-slice',
      color: isDarkMode ? '#10B981' : '#059669',
      gradient: isDarkMode ? ['#047857', '#10B981'] : ['#059669', '#10B981']
    },
    {
      id: 'confirmation',
      title: 'CONFIRMATION',
      icon: 'fire',
      color: isDarkMode ? '#8B5CF6' : '#7C3AED',
      gradient: isDarkMode ? ['#7C3AED', '#8B5CF6'] : ['#6D28D9', '#7C3AED']
    }
  ];

  const handleCertificateSelect = (certificate) => {
    // ✅ Check muna kung naka-login
    if (!loggedInUser || !loggedInUser.email) {
      Alert.alert(
        'Login Required', 
        'Please login first to request a certificate.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      return;
    }

    setSelectedCertificate(certificate);
    setShowForm(true);
    // ✅ Reset form data pero keep the email
    setFormData({
      name: '',
      date: '',
      father: '',
      mother: '',
      purpose: '',
      email: loggedInUser.email // ✅ Keep the email from logged in user
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // ✅ Check ulit kung naka-login
    if (!loggedInUser || !loggedInUser.email) {
      Alert.alert('Login Required', 'Please login first to submit a request.');
      return;
    }

    // Basic validation
    if (!formData.name || !formData.date || !formData.father || !formData.mother || !formData.purpose) {
      Alert.alert('Missing Information', 'Please fill out all fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine the API endpoint based on certificate type
      let apiUrl = '';
      switch (selectedCertificate.id) {
        case 'baptismal':
          apiUrl = 'http://192.168.1.18/system/request_baptismal.php';
          break;
        case 'first-communion':
          apiUrl = 'http://192.168.1.18/system/request_firstcommunion.php';
          break;
        case 'confirmation':
          apiUrl = 'http://192.168.1.18/system/request_confirmation.php';
          break;
        default:
          throw new Error('Invalid certificate type');
      }

      console.log('Submitting with data:', formData); // For debugging

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log('Server response:', result); // For debugging

      if (response.ok && result.status === 'success') {
        Alert.alert(
          'Request Submitted Successfully',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowForm(false);
                setSelectedCertificate(null);
                setIsSubmitting(false);
                // Reset form but keep email
                setFormData({
                  name: '',
                  date: '',
                  father: '',
                  mother: '',
                  purpose: '',
                  email: loggedInUser.email
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Submission Failed', result.message || 'Please try again later.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Network Error', 
        'Unable to submit your request. Please check your internet connection and try again.'
      );
      setIsSubmitting(false);
    }
  };

  const renderCertificateButtons = () => {
    return certificateTypes.map((cert) => (
      <TouchableOpacity
        key={cert.id}
        style={styles.certificateButton}
        onPress={() => handleCertificateSelect(cert)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={cert.gradient}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <MaterialCommunityIcons name={cert.icon} size={32} color="#FFF" />
        <Text style={styles.certificateButtonText}>{cert.title}</Text>
        <Text style={styles.certificateButtonSubtext}>Click to request certificate</Text>
      </TouchableOpacity>
    ));
  };

  const renderForm = () => (
    <Modal
      visible={showForm}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !isSubmitting && setShowForm(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => !isSubmitting && setShowForm(false)}
            disabled={isSubmitting}
          >
            <Ionicons name="arrow-back" size={24} color={primaryColor} />
            <Text style={[styles.backButtonText, { color: primaryColor }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            {selectedCertificate?.title} Certificate
          </Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={[styles.formCard, { backgroundColor: cardBackground }]}>
            <Text style={[styles.formTitle, { color: textColor }]}>
              Please fill out the required information
            </Text>
            
            {/* ✅ Display user email for confirmation */}
            <View style={styles.userInfoContainer}>
              <Text style={[styles.userInfoLabel, { color: secondaryTextColor }]}>
                Requested by:
              </Text>
              <Text style={[styles.userInfoEmail, { color: primaryColor }]}>
                {loggedInUser?.email || 'Not logged in'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: borderColor,
                  color: textColor
                }]}
                placeholder="Enter full name"
                placeholderTextColor={secondaryTextColor}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Date of Sacrament *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: borderColor,
                  color: textColor
                }]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={secondaryTextColor}
                value={formData.date}
                onChangeText={(text) => handleInputChange('date', text)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Father's Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: borderColor,
                  color: textColor
                }]}
                placeholder="Enter father's full name"
                placeholderTextColor={secondaryTextColor}
                value={formData.father}
                onChangeText={(text) => handleInputChange('father', text)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Mother's Name (Maiden Name) *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: borderColor,
                  color: textColor
                }]}
                placeholder="Enter mother's maiden name"
                placeholderTextColor={secondaryTextColor}
                value={formData.mother}
                onChangeText={(text) => handleInputChange('mother', text)}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Purpose *</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#F8F9FA',
                  borderColor: borderColor,
                  color: textColor
                }]}
                placeholder="State the purpose for requesting this certificate"
                placeholderTextColor={secondaryTextColor}
                value={formData.purpose}
                onChangeText={(text) => handleInputChange('purpose', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: isSubmitting ? secondaryTextColor : primaryColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <ActivityIndicator color="#FFF" size="small" style={{ marginRight: 10 }} />
              )}
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>

            {isSubmitting && (
              <Text style={[styles.submittingText, { color: secondaryTextColor }]}>
                Please wait while we process your request...
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
          <Text style={[styles.backButtonText, { color: primaryColor }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Request Certificate</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionContainer}>
          <MaterialCommunityIcons 
            name="certificate" 
            size={48} 
            color={primaryColor} 
            style={styles.mainIcon}
          />
          <Text style={[styles.instructionTitle, { color: textColor }]}>
            Request Church Certificate
          </Text>
          <Text style={[styles.instructionText, { color: secondaryTextColor }]}>
            Select the type of certificate you need to request. Please make sure all information provided is accurate.
          </Text>
          
          {/* ✅ Display current user info */}
          {loggedInUser && (
            <View style={[styles.currentUserContainer, { backgroundColor: cardBackground }]}>
              <Ionicons name="person-circle" size={20} color={primaryColor} />
              <Text style={[styles.currentUserText, { color: secondaryTextColor }]}>
                Logged in as: {loggedInUser.email}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          {renderCertificateButtons()}
        </View>

        <View style={[styles.noteContainer, { backgroundColor: cardBackground }]}>
          <Ionicons name="information-circle" size={20} color={primaryColor} />
          <Text style={[styles.noteText, { color: secondaryTextColor }]}>
            Please allow 3-5 business days for processing. You will be notified when your certificate is ready for pickup.
          </Text>
        </View>
      </ScrollView>

      {renderForm()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  mainIcon: {
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  currentUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  currentUserText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    marginVertical: 20,
  },
  certificateButton: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  certificateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  certificateButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  noteContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfoContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  userInfoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submittingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default RequestCertificate;