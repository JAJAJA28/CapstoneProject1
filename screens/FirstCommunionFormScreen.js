import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  useWindowDimensions,
  Animated,
  Easing
} from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const FirstCommunionFormScreen = ({ navigation }) => {
  const { loggedInUser } = useAuth();
  const { width, height } = useWindowDimensions();
  const [isPortrait, setIsPortrait] = useState(height > width);
  
  // Get current date for minimum date restriction
  const currentDate = new Date();

  // Date picker states - UPDATED: Use unified state
  const [showPicker, setShowPicker] = useState({
    communionDate: false,
    baptismDate: false
  });

  // Current selected dates - ADDED: Store actual Date objects
  const [currentDates, setCurrentDates] = useState({
    communionDate: new Date(),
    baptismDate: new Date()
  });

  const [formData, setFormData] = useState({
    contactNumber: "",
    communionDate: "",
    communicantName: "",
    age: "",
    gradeSection: "",
    address: "",
    parish: "",
    baptismDate: "",
    baptismPlace: "",
    gender: "",
    fee: "",
    email: loggedInUser?.email || "guest@example.com"
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsPortrait(window.height > window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Improved Date handling functions for both Android and iOS
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // UPDATED: Unified date change handler
  const onDateChange = (event, selectedDate, type) => {
    if (Platform.OS === 'android') {
      setShowPicker({
        communionDate: false,
        baptismDate: false
      });
    }
    
    if (selectedDate) {
      setCurrentDates({
        ...currentDates,
        [type]: selectedDate
      });

      // Format and set the form data based on type
      if (type === 'communionDate') {
        handleInputChange("communionDate", formatDate(selectedDate));
      } else if (type === 'baptismDate') {
        handleInputChange("baptismDate", formatDate(selectedDate));
      }

      // For iOS, we need to manually close the picker after selection
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          setShowPicker({
            communionDate: false,
            baptismDate: false
          });
        }, 500);
      }
    }
  };

  // ADDED: Handle iOS modal close
  const handleIOSPickerClose = () => {
    setShowPicker({
      communionDate: false,
      baptismDate: false
    });
  };

  // Function to handle N/A option
  const handleNAOption = (field) => {
    handleInputChange(field, "N/A");
  };

  // Responsive style calculations
  const responsiveStyles = {
    containerPadding: width * 0.05,
    inputFontSize: Math.max(14, width * 0.035),
    titleFontSize: Math.max(20, width * 0.05),
    buttonFontSize: Math.max(14, width * 0.038),
    modalWidth: Math.min(width * 0.9, 500),
    modalMaxHeight: height * 0.8,
    inputHeight: height * 0.06,
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    // Client-side validation: Check for empty fields
    for (let key in formData) {
      if (!formData[key] || String(formData[key]).trim() === "") {
        Alert.alert("Error", "Please fill out all fields before submitting.");
        return;
      }
    }
    openPreviewModal();
  };

  const handleConfirmSubmit = async () => {
    closePreviewModal();

    try {
      const serverUrl = "http://192.168.1.18/system/first_communion_submit.php";

      console.log("Submitting first communion data:", formData);

      const response = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      console.log("Raw first communion submission response:", text);

      if (!text) {
        Alert.alert("Server Error", "Server returned an empty response for first communion form.");
        return;
      }

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError, "Raw text:", text);
        Alert.alert("Server Error", "Received invalid data from server for first communion form.");
        return;
      }

      if (jsonResponse.status === "success") {
        Alert.alert(
          "FIRST COMMUNION DATA SUBMITTED",
          jsonResponse.message || "Kindly wait for the administrator to review and respond."
        );
        navigation.goBack();
      } else {
        Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
      }

    } catch (error) {
      console.error("Network or Server Error during first communion submission:", error);
      Alert.alert(
        "Network Error",
        `Could not connect to the server. Please check your internet connection. Details: ${error.message}`
      );
    }
  };

  const handleCancel = () => {
    Alert.alert("Cancel Confirmation", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => navigation.goBack() },
    ]);
  };

  const openPreviewModal = () => {
    setPreviewModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const closePreviewModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => setPreviewModalVisible(false));
  };

  // Preview Components
  const PreviewSection = ({ title, icon, children }) => (
    <View style={previewStyles.section}>
      <View style={previewStyles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#4a6ea9" />
        <Text style={previewStyles.sectionTitle}>{title}</Text>
      </View>
      <View style={previewStyles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const PreviewField = ({ label, value }) => (
    <View style={previewStyles.field}>
      <Text style={previewStyles.fieldLabel}>{label}:</Text>
      <Text style={previewStyles.fieldValue}>{value || "Not provided"}</Text>
    </View>
  );

  const styles = createStyles(responsiveStyles, isPortrait);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: '#f8f9fa' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Preview Modal */}
          <Modal visible={previewModalVisible} animationType="fade" transparent>
            <View style={previewStyles.modalContainer}>
              <Animated.View style={[previewStyles.modalContent, { opacity: fadeAnim }]}>
                <View style={previewStyles.modalHeader}>
                  <Text style={previewStyles.modalTitle}>First Communion Form Preview</Text>
                  <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                </View>

                <ScrollView style={previewStyles.scrollContainer}>
                  <PreviewSection title="Contact & Schedule" icon="calendar">
                    <PreviewField label="Contact Number" value={formData.contactNumber} />
                    <PreviewField label="Communion Date" value={formData.communionDate} />
                  </PreviewSection>

                  <PreviewSection title="Communicant Information" icon="person">
                    <PreviewField label="Communicant Name" value={formData.communicantName} />
                    <PreviewField label="Age" value={formData.age} />
                    <PreviewField label="Grade & Section" value={formData.gradeSection} />
                    <PreviewField label="Address" value={formData.address} />
                    <PreviewField label="Gender" value={formData.gender} />
                  </PreviewSection>

                  <PreviewSection title="Sacramental Information" icon="book">
                    <PreviewField label="Parish" value={formData.parish} />
                    <PreviewField label="Baptism Date" value={formData.baptismDate} />
                    <PreviewField label="Baptism Place" value={formData.baptismPlace} />
                  </PreviewSection>

                  <PreviewSection title="Payment" icon="card">
                    <PreviewField label="Fee" value={formData.fee} />
                  </PreviewSection>
                </ScrollView>

                <View style={previewStyles.modalFooter}>
                  <TouchableOpacity
                    style={[previewStyles.footerButton, previewStyles.editButton]}
                    onPress={closePreviewModal}
                  >
                    <Ionicons name="create-outline" size={18} color="#4a6ea9" />
                    <Text style={previewStyles.editButtonText}>Edit Information</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[previewStyles.footerButton, previewStyles.submitButton]}
                    onPress={handleConfirmSubmit}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                    <Text style={previewStyles.submitButtonText}>Confirm Submission</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

          {/* UPDATED: Date Pickers with minimumDate */}
          {showPicker.communionDate && (
            Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker.communionDate}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={handleIOSPickerClose}>
                      <Text style={styles.iosPickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.iosPickerTitle}>Select Communion Date</Text>
                    <TouchableOpacity onPress={() => onDateChange(null, currentDates.communionDate, 'communionDate')}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={currentDates.communionDate}
                    mode="date"
                    display="spinner"
                    minimumDate={currentDate} // BLOCK PAST DATES
                    onChange={(event, date) => setCurrentDates({...currentDates, communionDate: date})}
                    style={styles.iosPicker}
                  />
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={currentDates.communionDate}
                mode="date"
                display="default"
                minimumDate={currentDate} // BLOCK PAST DATES
                onChange={(event, date) => onDateChange(event, date, 'communionDate')}
              />
            )
          )}

          {showPicker.baptismDate && (
            Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker.baptismDate}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={handleIOSPickerClose}>
                      <Text style={styles.iosPickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.iosPickerTitle}>Select Baptism Date</Text>
                    <TouchableOpacity onPress={() => onDateChange(null, currentDates.baptismDate, 'baptismDate')}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={currentDates.baptismDate}
                    mode="date"
                    display="spinner"
                    maximumDate={currentDate} // For baptism date, block future dates
                    onChange={(event, date) => setCurrentDates({...currentDates, baptismDate: date})}
                    style={styles.iosPicker}
                  />
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={currentDates.baptismDate}
                mode="date"
                display="default"
                maximumDate={currentDate} // For baptism date, block future dates
                onChange={(event, date) => onDateChange(event, date, 'baptismDate')}
              />
            )
          )}

          {/* Requirements Modal */}
          <Modal animationType="fade" transparent={true} visible={modalVisible}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { width: responsiveStyles.modalWidth, maxHeight: responsiveStyles.modalMaxHeight }]}>
                {/* Modal header with close button */}
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalTitleContainer}>
                    <Ionicons name="list-circle" size={isPortrait ? 24 : 20} color="#2c843e" />
                    <Text style={styles.modalTitle}>First Communion Requirements</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeIconButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={isPortrait ? 28 : 24} color="#7f8c8d" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="document-attach" size={isPortrait ? 20 : 18} color="#4a6fa5" />
                      <Text style={styles.sectionTitle}>Required Documents</Text>
                    </View>

                    <View style={styles.requirementsList}>
                      <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={isPortrait ? 18 : 16} color="#2c843e" />
                        <Text style={styles.requirementText}>Kopya ng Baptismal Certificate</Text>
                      </View>
                      <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={isPortrait ? 18 : 16} color="#2c843e" />
                        <Text style={styles.requirementText}>1x1 o 2x2 ID Picture (2 pcs.)</Text>
                      </View>
                      <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={isPortrait ? 18 : 16} color="#2c843e" />
                        <Text style={styles.requirementText}>Photocopy ng Birth Certificate</Text>
                      </View>
                      <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={isPortrait ? 18 : 16} color="#2c843e" />
                        <Text style={styles.requirementText}>Request Form from School</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="megaphone" size={isPortrait ? 20 : 18} color="#4a6fa5" />
                      <Text style={styles.sectionTitle}>Important Reminders</Text>
                    </View>

                    <View style={styles.remindersList}>
                      <View style={styles.reminderItem}>
                        <Ionicons name="alert-circle" size={isPortrait ? 16 : 14} color="#e63946" />
                        <Text style={styles.reminderText}>Siguraduhing kumpleto ang mga dokumento bago isumite</Text>
                      </View>
                      <View style={styles.reminderItem}>
                        <Ionicons name="alert-circle" size={isPortrait ? 16 : 14} color="#e63946" />
                        <Text style={styles.reminderText}>Ang bata ay dapat may sapat na kaalaman sa pananampalataya</Text>
                      </View>
                      <View style={styles.reminderItem}>
                        <Ionicons name="alert-circle" size={isPortrait ? 16 : 14} color="#e63946" />
                        <Text style={styles.reminderText}>Dumalo sa Catechism Seminar bago ang First Communion</Text>
                      </View>
                      <View style={styles.reminderItem}>
                        <Ionicons name="alert-circle" size={isPortrait ? 16 : 14} color="#e63946" />
                        <Text style={styles.reminderText}>Magsuot ng angkop na kasuotan sa araw ng komunyon (Puting damit)</Text>
                      </View>
                      <View style={styles.reminderItem}>
                        <Ionicons name="alert-circle" size={isPortrait ? 16 : 14} color="#e63946" />
                        <Text style={styles.reminderText}>Huwag kalimutang ipasa ang requirements bago ang takdang petsa</Text>
                      </View>
                      <View style={styles.reminderItem}>
                        <Ionicons name="alert-circle" size={isPortrait ? 16 : 14} color="#e63946" />
                        <Text style={styles.reminderText}>School po ang magpapa schdule sa simbahan, kung mangyaring mag fill up po kayo dito, isasave namin ito bilang reference pansamantala.</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Form Content */}
          <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: responsiveStyles.containerPadding }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { fontSize: responsiveStyles.titleFontSize }]}>First Communion Registration</Text>
              <Text style={styles.subtitle}>Please fill out all required information</Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Contact Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formData.contactNumber}
                onChangeText={(text) => handleInputChange("contactNumber", text)}
              />
              
              {/* Communion Date with Date Picker */}
              <View style={styles.dateInputContainer}>
                <TouchableOpacity
                  style={[styles.dateInput, {
                    height: responsiveStyles.inputHeight,
                    flex: 1
                  }]}
                  onPress={() => setShowPicker({...showPicker, communionDate: true})}
                >
                  <Text style={formData.communionDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                    {formData.communionDate || "Petsa ng Komunyon (Pindutin para pumili)"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.naButton}
                  onPress={() => handleNAOption("communionDate")}
                >
                  <Text style={styles.naButtonText}>N/A</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Pangalan ng Magkokomunyon"
                placeholderTextColor="#999"
                value={formData.communicantName}
                onChangeText={(text) => handleInputChange("communicantName", text)}
              />
              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Edad"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => handleInputChange("age", text)}
              />
              
              {/* Grade and Section with N/A option */}
              <View style={styles.inputWithNA}>
                <TextInput
                  style={[styles.input, {
                    fontSize: responsiveStyles.inputFontSize,
                    height: responsiveStyles.inputHeight,
                    flex: 1
                  }]}
                  placeholder="Greyd at Seksyon"
                  placeholderTextColor="#999"
                  value={formData.gradeSection}
                  onChangeText={(text) => handleInputChange("gradeSection", text)}
                />
                <TouchableOpacity
                  style={styles.naButton}
                  onPress={() => handleNAOption("gradeSection")}
                >
                  <Text style={styles.naButtonText}>N/A</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Tirahan"
                placeholderTextColor="#999"
                value={formData.address}
                onChangeText={(text) => handleInputChange("address", text)}
              />
              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Taga-saang Parokya"
                placeholderTextColor="#999"
                value={formData.parish}
                onChangeText={(text) => handleInputChange("parish", text)}
              />
              
              {/* Baptism Date with Date Picker and N/A option */}
              <View style={styles.dateInputContainer}>
                <TouchableOpacity
                  style={[styles.dateInput, {
                    height: responsiveStyles.inputHeight,
                    flex: 1
                  }]}
                  onPress={() => setShowPicker({...showPicker, baptismDate: true})}
                >
                  <Text style={formData.baptismDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                    {formData.baptismDate || "Petsa ng Binyag (Pindutin para pumili)"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.naButton}
                  onPress={() => handleNAOption("baptismDate")}
                >
                  <Text style={styles.naButtonText}>N/A</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Saan Bininyagan"
                placeholderTextColor="#999"
                value={formData.baptismPlace}
                onChangeText={(text) => handleInputChange("baptismPlace", text)}
              />
              <TextInput
                style={[styles.input, {
                  fontSize: responsiveStyles.inputFontSize,
                  height: responsiveStyles.inputHeight
                }]}
                placeholder="Kasarian (Lalaki o Babae)"
                placeholderTextColor="#999"
                value={formData.gender}
                onChangeText={(text) => handleInputChange("gender", text)}
              />
              
              {/* Fee with N/A option */}
              <View style={styles.inputWithNA}>
                <TextInput
                  style={[styles.input, {
                    fontSize: responsiveStyles.inputFontSize,
                    height: responsiveStyles.inputHeight,
                    flex: 1
                  }]}
                  placeholder="Bayad (Fee)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.fee}
                  onChangeText={(text) => handleInputChange("fee", text)}
                />
                <TouchableOpacity
                  style={styles.naButton}
                  onPress={() => handleNAOption("fee")}
                >
                  <Text style={styles.naButtonText}>N/A</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                <Ionicons name="eye-outline" size={isPortrait ? 18 : 16} color="#fff" />
                <Text style={[styles.buttonText, { fontSize: responsiveStyles.buttonFontSize }]}>Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Ionicons name="close-circle-outline" size={isPortrait ? 18 : 16} color="#fff" />
                <Text style={[styles.buttonText, { fontSize: responsiveStyles.buttonFontSize }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.requirementsButton]} onPress={() => setModalVisible(true)}>
                <Ionicons name="document-text-outline" size={isPortrait ? 18 : 16} color="#fff" />
                <Text style={[styles.buttonText, { fontSize: responsiveStyles.buttonFontSize }]}>Demands</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const createStyles = (responsiveStyles, isPortrait) => StyleSheet.create({
  container: {
    paddingBottom: 30,
    paddingTop: 50,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: isPortrait ? 25 : 15,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: isPortrait ? 16 : 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isPortrait ? 20 : 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: "#000",
  },
  dateInputPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  inputWithNA: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  naButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  naButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isPortrait ? 16 : 12,
    borderRadius: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: "#27ae60",
  },
  cancelButton: {
    backgroundColor: "#e74c3c"
  },
  requirementsButton: {
    backgroundColor: "#3498db"
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: isPortrait ? 24 : 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  closeIconButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
  },
  modalTitle: {
    fontSize: isPortrait ? 22 : 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginLeft: 10,
  },
  modalScroll: {
    maxHeight: 300,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: isPortrait ? 18 : 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: isPortrait ? 15 : 13,
    color: '#2c3e50',
    flex: 1,
  },
  remindersList: {
    gap: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  reminderText: {
    fontSize: isPortrait ? 14 : 12,
    color: '#2c3e50',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
});

// Preview Modal Styles (keep the same)
const previewStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#7f8c8d",
  },
  scrollContainer: {
    padding: 15,
    maxHeight: Dimensions.get("window").height * 0.5,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 10,
  },
  sectionContent: {
    paddingHorizontal: 5,
  },
  field: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 2,
    textAlign: "right",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#f8f9fa",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4a6ea9",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonText: {
    color: "#4a6ea9",
    fontWeight: "600",
    marginLeft: 8,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default FirstCommunionFormScreen;