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

const { height, width } = Dimensions.get("window");

const PamisaSaPatayScreen = () => {
  const { loggedInUser } = useAuth();  // makukuha mo na yung email dito
  const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

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
  email_norm: loggedInUser?.email || "guest@example.com" // ✨ palitan na agad dito
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

  const handleChange = (field, value) => {
    // Special handling for numeric fields
    if (['age', 'deathYear', 'phone', 'cellphone', 'donationAmount'].includes(field)) {
      // Remove any non-digit characters
      value = value.replace(/[^0-9]/g, '');
    }

    // Special handling for date fields
    if (field === 'burialDate' || field === 'deathDate') {
      // Allow only digits and dashes
      value = value.replace(/[^0-9-]/g, '');

      // Auto-format as YYYY-MM-DD for burialDate, or MM-DD for deathDate
      if (field === 'burialDate') {
        if (value.length === 4 && !value.includes('-')) value = value + '-';
        else if (value.length === 7 && value.split('-').length === 2) value = value + '-';
      } else if (field === 'deathDate') {
        // simple auto dash after 2 digits -> MM-DD
        if (value.length === 2 && !value.includes('-')) value = value + '-';
      }
    }

    // Special handling for time field
    if (field === 'burialTime') {
      // Allow only digits and colons
      value = value.replace(/[^0-9:]/g, '');

      // Auto-format as HH:MM
      if (value.length === 2 && !value.includes(':')) {
        value = value + ':';
      }
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

    // Validate date format (YYYY-MM-DD) for burialDate if provided
    if (formData.burialDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.burialDate)) {
      Alert.alert("Invalid Input", "Please enter burial date in YYYY-MM-DD format.");
      return false;
    }

    // Validate time format (HH:MM)
    if (formData.burialTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.burialTime)) {
      Alert.alert("Invalid Input", "Please enter burial time in HH:MM format.");
      return false;
    }

    // Validate date format (MM-DD) for deathDate if provided
    if (formData.deathDate && !/^\d{2}-\d{2}$/.test(formData.deathDate)) {
      Alert.alert("Invalid Input", "Please enter death date in MM-DD format.");
      return false;
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
        const serverUrl = "http://10.203.3.62/system/funeral_submit.php";

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
            jsonResponse.message || "FUNERAL APPLICATION DATA SUBMITTED. Mag intay lamang po ng text message mula sa ating Secretary para sa pag kumpirma ng aplikasyon.",
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
      fields: [
        { label: "Petsa ng Libing", key: "burialDate", placeholder: "YYYY-MM-DD", keyboardType: "numbers-and-punctuation", maxLength: 10, icon: "calendar" },
        { label: "Oras", key: "burialTime", placeholder: "HH:MM", keyboardType: "numbers-and-punctuation", maxLength: 5, icon: "time" },
      ]
    },
    {
      title: "Deceased Information",
      fields: [
        { label: "Pangalan ng Namatay", key: "deceasedName", icon: "person" },
        { label: "Edad", key: "age", keyboardType: "numeric", maxLength: 3, icon: "ellipsis-horizontal" },
        { label: "Kailan Namatay (Buwan at Araw)", key: "deathDate", placeholder: "MM-DD", keyboardType: "numbers-and-punctuation", maxLength: 5, icon: "calendar" },
        { label: "Anong Taon", key: "deathYear", keyboardType: "numeric", maxLength: 4, icon: "calendar" },
        { label: "Pangalan ng Ama", key: "fatherName", icon: "man" },
        { label: "Pangalan ng Ina", key: "motherName", icon: "woman" },
        { label: "Pangalan ng Asawa", key: "spouseName", icon: "heart" },
        { label: "Kasalukuyang Tirahan", key: "residence", multiline: true, icon: "home" },
        { label: "Kung hindi tumanggap ng sakramento, bakit?", key: "reasonNoSacrament", multiline: true, icon: "help-circle" },
        { label: "Sanhi ng Pagkamatay", key: "causeOfDeath", multiline: true, icon: "medical" },
      ]
    },
    {
      title: "Contact Information",
      fields: [
        { label: "Pangalan ng Tagapag-ugnay", key: "contactName", icon: "person" },
        { label: "Kasalukuyang Tirahan (Tagapag-ugnay)", key: "contactResidence", multiline: true, icon: "home" },
        { label: "Telepono", key: "phone", keyboardType: "numeric", maxLength: 15, icon: "call" },
        { label: "Cellphone #", key: "cellphone", keyboardType: "numeric", maxLength: 15, icon: "phone-portrait" },
        { label: "Donation Amount", key: "donationAmount", keyboardType: "numeric", maxLength: 10, icon: "cash" },
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
                {section.fields.map((field) => (
                  <View key={field.key} style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                      {field.icon && (
                        <Ionicons name={field.icon} size={16} color="#555" style={styles.fieldIcon} />
                      )}
                      <Text style={styles.label}>{field.label}:</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input, 
                        field.multiline && styles.multilineInput
                      ]}
                      value={String(formData[field.key] ?? "")}
                      onChangeText={(text) => handleChange(field.key, text)}
                      keyboardType={field.keyboardType || "default"}
                      placeholder={field.placeholder || ""}
                      maxLength={field.maxLength}
                      multiline={field.multiline}
                      numberOfLines={field.multiline ? 3 : 1}
                      textAlignVertical={field.multiline ? "top" : "center"}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

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
                    <Text style={demandStyles.listText}>Baptismal Certificate of the Deceased</Text>
                  </View>
                  <View style={demandStyles.listItem}>
                    <View style={demandStyles.bullet} />
                    <Text style={demandStyles.listText}>Letter of Request for Mass</Text>
                  </View>
                  <View style={demandStyles.listItem}>
                    <View style={demandStyles.bullet} />
                    <Text style={demandStyles.listText}>Valid ID of the Contact Person</Text>
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
                      <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Regular Mass - ₱1,000</Text> (Monday - Saturday)</Text>
                    </View>
                    <View style={demandStyles.feeOption}>
                      <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                      <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Sunday Mass - ₱1,500</Text></Text>
                    </View>
                    <View style={demandStyles.feeOption}>
                      <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                      <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Special Request - ₱2,000</Text> (Outside regular schedule)</Text>
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

// styles below unchanged...
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
