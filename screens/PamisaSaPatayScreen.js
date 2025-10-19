import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const { height, width } = Dimensions.get("window");

const PamisaSaPatayScreen = () => {
  const { loggedInUser } = useAuth();
  const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Date picker states
  const [showBurialDatePicker, setShowBurialDatePicker] = useState(false);
  const [showBurialTimePicker, setShowBurialTimePicker] = useState(false);
  const [showDeathDatePicker, setShowDeathDatePicker] = useState(false);

  const initialFormState = {
    burialDate: "",
    burialTime: "",
    deceasedName: "",
    age: "",
    deathDate: "",
    deathYear: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    residence: "",
    reasonNoSacrament: "",
    causeOfDeath: "",
    contactName: "",
    contactResidence: "",
    phone: "",
    cellphone: "",
    donationAmount: "",
    email_norm: loggedInUser?.email || "guest@example.com"
  };

  const [formData, setFormData] = useState(initialFormState);

  // 🔄 Sync email kapag nagbago ang loggedInUser
  useEffect(() => {
    if (loggedInUser?.email) {
      setFormData((prev) => ({
        ...prev,
        email: loggedInUser.email
      }));
    }
  }, [loggedInUser]);

  // Improved Date handling functions for both Android and iOS
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes.toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatMonthDay = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${month}-${day}`;
  };

  // Date picker handlers
  const onBurialDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowBurialDatePicker(false);
    }
    if (selectedDate) {
      handleChange("burialDate", formatDate(selectedDate));
    }
  };

  const onBurialTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowBurialTimePicker(false);
    }
    if (selectedDate) {
      handleChange("burialTime", formatTime(selectedDate));
    }
  };

  const onDeathDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDeathDatePicker(false);
    }
    if (selectedDate) {
      handleChange("deathDate", formatMonthDay(selectedDate));
      // Auto-fill the year if not set
      if (!formData.deathYear) {
        handleChange("deathYear", selectedDate.getFullYear().toString());
      }
    }
  };

  // Function to handle N/A option
  const handleNAOption = (field) => {
    handleChange(field, "N/A");
  };

  const handleChange = (field, value) => {
    // Special handling for numeric fields
    if (['age', 'deathYear', 'phone', 'cellphone', 'donationAmount'].includes(field)) {
      // Remove any non-digit characters
      value = value.replace(/[^0-9]/g, '');
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validate numeric fields
    const numericFields = ['age', 'deathYear', 'phone', 'cellphone'];
    for (const field of numericFields) {
      if (formData[field] && !/^\d+$/.test(String(formData[field]))) {
        Alert.alert("Invalid Input", `${field.replace(/([A-Z])/g, ' $1')} should contain only digits.`);
        return false;
      }
    }

    // Validate year format (YYYY)
    if (formData.deathYear && !/^\d{4}$/.test(String(formData.deathYear))) {
      Alert.alert("Invalid Input", "Please enter a 4-digit year.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Validate form inputs
    if (!validateForm()) {
      return;
    }

    const emptyFields = Object.entries(formData).filter(([key, value]) => String(value).trim() === "");

    if (emptyFields.length > 0) {
      Alert.alert("Incomplete Form", "Pakisigurado na lahat ng impormasyon ay napunan bago mag-submit.");
    } else {
      try {
        const serverUrl = "http://192.168.1.18/system/funeral_submit.php";

        console.log("Submitting funeral data:", formData);

        const response = await fetch(serverUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const text = await response.text();
        console.log("📦 Raw funeral submission response:", text);

        if (!text) {
          Alert.alert("Server Error", "Server returned an empty response for funeral form. This might indicate a PHP error.");
          return;
        }

        let jsonResponse;
        try {
          jsonResponse = JSON.parse(text);
        } catch (parseError) {
          console.error("❌ JSON parsing error:", parseError, "Raw text:", text);
          Alert.alert("Server Error", "Received invalid data from server. Details: " + text.substring(0, 100) + "...");
          return;
        }

        if (jsonResponse.status === "success") {
          Alert.alert(
            "Notification",
            jsonResponse.message || "FUNERAL APPLICATION DATA SUBMITTED. Kindly wait for the administrator to review and respond.",
            [{ text: "OK", onPress: () => navigation.navigate("MainTabs", { screen: "Dashboard" }) }]
          );
          setFormData(initialFormState);
        } else {
          Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
          if (jsonResponse.details) console.error("Server error details:", jsonResponse.details);
        }
      } catch (error) {
        console.error("❌ Network or Server Error:", error);
        Alert.alert(
          "Network Error",
          `Could not connect to the server or a server error occurred. Details: ${error.message}`
        );
      }
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Confirmation",
      "Are you sure you want to cancel your application? All input data will be lost.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setFormData(initialFormState);
            navigation.navigate("MainTabs", { screen: "Dashboard" });
          },
        },
      ]
    );
  };

  const openPreviewModal = () => {
    // Validate form inputs first
    if (!validateForm()) {
      return;
    }

    const emptyFields = Object.entries(formData).filter(([key, value]) => String(value).trim() === "");

    if (emptyFields.length > 0) {
      Alert.alert("Incomplete Form", "Pakisigurado na lahat ng impormasyon ay napunan bago mag-preview.");
      return;
    }

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

  // Preview Section Component
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

  // Preview Field Component
  const PreviewField = ({ label, value }) => (
    <View style={previewStyles.field}>
      <Text style={previewStyles.fieldLabel}>{label}:</Text>
      <Text style={previewStyles.fieldValue}>{value || "Not provided"}</Text>
    </View>
  );

  // Group fields into logical sections
  const fieldSections = [
    {
      title: "Burial Details",
      icon: "calendar",
      fields: [
        { label: "Petsa ng Libing", key: "burialDate" },
        { label: "Oras", key: "burialTime" },
      ]
    },
    {
      title: "Deceased Information",
      icon: "person",
      fields: [
        { label: "Pangalan ng Namatay", key: "deceasedName" },
        { label: "Edad", key: "age" },
        { label: "Kailan Namatay (Buwan at Araw)", key: "deathDate" },
        { label: "Anong Taon", key: "deathYear" },
        { label: "Pangalan ng Ama", key: "fatherName" },
        { label: "Pangalan ng Ina", key: "motherName" },
        { label: "Pangalan ng Asawa", key: "spouseName" },
        { label: "Kasalukuyang Tirahan", key: "residence" },
        { label: "Kung hindi tumanggap ng sakramento, bakit?", key: "reasonNoSacrament" },
        { label: "Sanhi ng Pagkamatay", key: "causeOfDeath" },
      ]
    },
    {
      title: "Contact Information",
      icon: "call",
      fields: [
        { label: "Pangalan ng Tagapag-ugnay", key: "contactName" },
        { label: "Kasalukuyang Tirahan (Tagapag-ugnay)", key: "contactResidence" },
        { label: "Telepono", key: "phone" },
        { label: "Cellphone #", key: "cellphone" },
        { label: "Donation Amount", key: "donationAmount" },
      ]
    }
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Funeral Mass Application</Text>
            <Text style={styles.subHeader}>Pamisa sa Patay</Text>
          </View>

          {/* Form Sections */}
          {fieldSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.fields.map((field) => {
                  // Special handling for date/time fields
                  if (field.key === "burialDate") {
                    return (
                      <View key={field.key} style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                          <Ionicons name="calendar" size={16} color="#555" style={styles.fieldIcon} />
                          <Text style={styles.label}>{field.label}:</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.dateInput}
                          onPress={() => setShowBurialDatePicker(true)}
                        >
                          <Text style={formData.burialDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                            {formData.burialDate || "Petsa ng Libing (Pindutin para pumili)"}
                          </Text>
                          <Ionicons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    );
                  } else if (field.key === "burialTime") {
                    return (
                      <View key={field.key} style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                          <Ionicons name="time" size={16} color="#555" style={styles.fieldIcon} />
                          <Text style={styles.label}>{field.label}:</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.dateInput}
                          onPress={() => setShowBurialTimePicker(true)}
                        >
                          <Text style={formData.burialTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                            {formData.burialTime || "Oras ng Libing (Pindutin para pumili)"}
                          </Text>
                          <Ionicons name="time" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    );
                  } else if (field.key === "deathDate") {
                    return (
                      <View key={field.key} style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                          <Ionicons name="calendar" size={16} color="#555" style={styles.fieldIcon} />
                          <Text style={styles.label}>{field.label}:</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.dateInput}
                          onPress={() => setShowDeathDatePicker(true)}
                        >
                          <Text style={formData.deathDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                            {formData.deathDate || "Petsa ng Kamatayan (Pindutin para pumili)"}
                          </Text>
                          <Ionicons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    );
                  } else if (field.key === "reasonNoSacrament" || field.key === "causeOfDeath" || field.key === "phone") {
                    return (
                      <View key={field.key} style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                          <Ionicons name={field.icon || "document"} size={16} color="#555" style={styles.fieldIcon} />
                          <Text style={styles.label}>{field.label}:</Text>
                        </View>
                        <View style={styles.inputWithNA}>
                          <TextInput
                            style={[
                              styles.input, 
                              (field.key === 'reasonNoSacrament' || field.key === 'causeOfDeath') && styles.multilineInput,
                              { flex: 1 }
                            ]}
                            value={String(formData[field.key] ?? "")}
                            onChangeText={(text) => handleChange(field.key, text)}
                            keyboardType={field.key === 'phone' ? "numeric" : "default"}
                            placeholder={field.placeholder || ""}
                            maxLength={field.maxLength}
                            multiline={field.key === 'reasonNoSacrament' || field.key === 'causeOfDeath'}
                            numberOfLines={field.key === 'reasonNoSacrament' || field.key === 'causeOfDeath' ? 3 : 1}
                            textAlignVertical={field.key === 'reasonNoSacrament' || field.key === 'causeOfDeath' ? "top" : "center"}
                          />
                          <TouchableOpacity
                            style={styles.naButton}
                            onPress={() => handleNAOption(field.key)}
                          >
                            <Text style={styles.naButtonText}>N/A</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  } else {
                    return (
                      <View key={field.key} style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                          <Ionicons name={field.icon || "document"} size={16} color="#555" style={styles.fieldIcon} />
                          <Text style={styles.label}>{field.label}:</Text>
                        </View>
                        <TextInput
                          style={[
                            styles.input, 
                            (field.key === 'residence' || field.key === 'contactResidence') && styles.multilineInput
                          ]}
                          value={String(formData[field.key] ?? "")}
                          onChangeText={(text) => handleChange(field.key, text)}
                          keyboardType={
                            ['age', 'deathYear', 'cellphone', 'donationAmount'].includes(field.key) 
                              ? "numeric" 
                              : "default"
                          }
                          placeholder={field.placeholder || ""}
                          maxLength={field.maxLength}
                          multiline={
                            field.key === 'residence' || 
                            field.key === 'contactResidence'
                          }
                          numberOfLines={
                            (field.key === 'residence' || field.key === 'contactResidence') 
                              ? 3 
                              : 1
                          }
                          textAlignVertical={
                            (field.key === 'residence' || field.key === 'contactResidence') 
                              ? "top" 
                              : "center"
                          }
                        />
                      </View>
                    );
                  }
                })}
              </View>
            </View>
          ))}

          {/* Date Pickers */}
          {showBurialDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onBurialDateChange}
            />
          )}

          {showBurialTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onBurialTimeChange}
            />
          )}

          {showDeathDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDeathDateChange}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.previewButton]}
              onPress={openPreviewModal}
            >
              <Ionicons name="eye-outline" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Ionicons name="close-circle-outline" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.requirementsButton]} 
              onPress={() => setRequirementsModalVisible(true)}
            >
              <Ionicons name="document-text-outline" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Demands</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Requirements Modal */}
      <Modal 
        visible={requirementsModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setRequirementsModalVisible(false)}
      >
        <View style={demandStyles.modalContainer}>
          <View style={demandStyles.modalContent}>
            <View style={demandStyles.header}>
              <Text style={demandStyles.title}>Requirements for Funeral Mass</Text>
              <TouchableOpacity 
                style={demandStyles.closeButton}
                onPress={() => setRequirementsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={demandStyles.scrollContainer}>
              <View style={demandStyles.section}>
                <View style={demandStyles.sectionHeader}>
                  <Ionicons name="list" size={20} color="#4a6ea9" />
                  <Text style={demandStyles.sectionTitle}>Required Documents</Text>
                </View>
                <View style={demandStyles.list}>
                  <View style={demandStyles.listItem}>
                    <View style={demandStyles.bullet} />
                    <Text style={demandStyles.listText}>Death Certificate</Text>
                  </View>
                  <View style={demandStyles.listItem}>
                    <View style={demandStyles.bullet} />
                    <Text style={demandStyles.listText}>Accomplished Funeral Form</Text>
                  </View>           
              
                </View>
              </View>
              
              <View style={demandStyles.divider} />
              
              <View style={demandStyles.section}>
                <View style={demandStyles.sectionHeader}>
                  <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                  <Text style={demandStyles.sectionTitle}>Important Reminders</Text>
                </View>
                <View style={demandStyles.reminderContainer}>
                  <View style={demandStyles.reminderCard}>
                    <View style={demandStyles.reminderHeader}>
                      <Ionicons name="information-circle" size={18} color="#3498db" />
                      <Text style={demandStyles.reminderTitle}>Donation Options</Text>
                    </View>
                    <View style={demandStyles.feeOption}>
                      <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                      <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Donation Only</Text> (All Weekdays except Monday)</Text>
                    </View>                    
                  </View>
                  
                  <View style={demandStyles.note}>
                    <Ionicons name="time" size={16} color="#f39c12" />
                    <Text style={demandStyles.noteText}>Please submit all requirements at least 3 days before the burial date.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={demandStyles.acknowledgeButton}
              onPress={() => setRequirementsModalVisible(false)}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={demandStyles.acknowledgeButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={previewModalVisible} animationType="fade" transparent>
        <View style={previewStyles.modalContainer}>
          <Animated.View style={[previewStyles.modalContent, { opacity: fadeAnim }]}>
            <View style={previewStyles.modalHeader}>
              <Text style={previewStyles.modalTitle}>Funeral Mass Application Preview</Text>
              <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
            </View>

            <ScrollView style={previewStyles.scrollContainer}>
              {fieldSections.map((section, sectionIndex) => (
                <PreviewSection 
                  key={sectionIndex} 
                  title={section.title} 
                  icon={section.icon || "document"}
                >
                  {section.fields.map((field) => (
                    <PreviewField 
                      key={field.key}
                      label={field.label} 
                      value={formData[field.key]} 
                    />
                  ))}
                </PreviewSection>
              ))}
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
                onPress={() => {
                  closePreviewModal();
                  handleSubmit();
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                <Text style={previewStyles.submitButtonText}>Confirm Submission</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Updated styles to include dateInput and N/A button styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 50
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: '#2c3e50',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 18,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    backgroundColor: '#3498db',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
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
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    minWidth: 110,
    flex: 1,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  previewButton: {
    backgroundColor: "#3498db",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  requirementsButton: {
    backgroundColor: "#f39c12",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

// ... (keep the existing previewStyles and demandStyles objects exactly as they are)
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
    maxHeight: height * 0.5,
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

const demandStyles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 10,
  },
  list: {
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4a6ea9",
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    fontSize: 15,
    color: "#34495e",
    flex: 1,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#ecf0f1",
    marginVertical: 20,
  },
  reminderContainer: {
    paddingLeft: 10,
  },
  reminderCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  feeOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  feeText: {
    fontSize: 14,
    color: "#34495e",
    marginLeft: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff4e5",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: 13,
    color: "#e67e22",
    marginLeft: 8,
    flex: 1,
    fontStyle: "italic",
  },
  acknowledgeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  acknowledgeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PamisaSaPatayScreen;