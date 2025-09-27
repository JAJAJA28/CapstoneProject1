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
  Dimensions, 
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing
} from 'react-native'; import { Ionicons } from '@expo/vector-icons';
  import { useAuth } from "../AuthContext";

const { width, height } = Dimensions.get("window");

const SickCallFormScreen = ({ navigation }) => {
  const { loggedInUser } = useAuth();  // makukuha mo na yung email dito
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    age: '',
    status: '',
    sickness: '',
    contactPerson: '',
    contactNumber: '',
    dateOfVisit: '',
    remarks: '',
    email: loggedInUser?.email || "guest@example.com" // auto from login
  });

    // 🔄 Sync email kapag nagbago ang loggedInUser
  useEffect(() => {
    if (loggedInUser?.email) {
      setFormData((prev) => ({
        ...prev,
        email: loggedInUser.email
      }));
    }
  }, [loggedInUser]);
    
    const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
    const openPreviewModal = () => {
        // Client-side validation: Check if all fields are filled
        const isComplete = Object.values(formData).every(field => String(field).trim() !== '');
        if (!isComplete) {
            Alert.alert("Incomplete Form", "Please fill out all fields before previewing.");
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

   const handleSubmit = async () => {
  try {
    const serverUrl = "http://192.168.1.34/system/sickcall_submit.php";

    const payload = {
      ...formData,
      email_norm: formData.email.toLowerCase().trim(),
      createdAt: new Date().toISOString()
    };

    console.log("Submitting sick call data:", payload);

    const response = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

            const text = await response.text();
            console.log("📦 Raw sick call submission response:", text);

            if (!text) {
                Alert.alert("Server Error", "Server returned an empty response for sick call form. This might indicate a PHP error.");
                return;
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("❌ JSON parsing error for sick call form:", parseError, "Raw text:", text);
                Alert.alert("Server Error", "Received invalid data from server for sick call form. Check server logs. Details: " + text.substring(0, 100) + "...");
                return;
            }

            if (jsonResponse.status === "success") {
                Alert.alert(
                    "Confirmed",
                    jsonResponse.message || "Your Sick Call Request has been sent. Please wait for a text message from our Secretary for confirmation."
                );
                // Reset form data on successful submission
                setFormData({
                    name: '',
                    address: '',
                    age: '',
                    status: '',
                    sickness: '',
                    contactPerson: '',
                    contactNumber: '',
                    dateOfVisit: '',
                    remarks: '',
                    email: loggedInUser?.email || ""  // ✅ include user email
                });
                navigation.goBack();
            } else {
                Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
                if (jsonResponse.details) {
                    console.error("Server submission error details:", jsonResponse.details);
                }
            }

        } catch (error) {
            console.error("❌ Network or Server Error during sick call submission:", error);
            Alert.alert(
                "Network Error",
                `Could not connect to the server or a server error occurred. Please check your internet connection or server status. Details: ${error.message}`
            );
        }
    };

    const handleCancel = () => {
        Alert.alert(
            "Cancel Confirmation",
            "Are you sure you want to cancel? Your input will be lost.",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => navigation.goBack() }
            ]
        );
    };

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

    const requirements = [
        "Valid ID with picture",
        "Medical certificate from your doctor",
        "Recent medical test results (if available)",
        "Proof of address (utility bill, etc.)",
        "Contact information of your designated person"
    ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>SICK CALL FORM</Text>
          </View>
          
          {/* Form Fields */}
          {[
            { label: "NAME:", field: "name", placeholder: "Enter full name" },
            { label: "ADDRESS:", field: "address", placeholder: "Enter complete address" },
            { label: "AGE:", field: "age", placeholder: "Enter age", keyboardType: "numeric" },
            { label: "STATUS:", field: "status", placeholder: "Enter status (e.g., Single, Married)" },
            { label: "SICKNESS:", field: "sickness", placeholder: "Describe the sickness or condition" },
            { label: "CONTACT PERSON:", field: "contactPerson", placeholder: "Enter contact person's name" },
            { label: "CONTACT NUMBER:", field: "contactNumber", placeholder: "Enter contact number", keyboardType: "phone-pad" },
            { label: "DATE OF VISIT:", field: "dateOfVisit", placeholder: "Enter date of visit (MM/DD/YYYY)", keyboardType: "numbers-and-punctuation" },
          ].map((item, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <TextInput
                style={styles.input}
                value={formData[item.field]}
                onChangeText={(value) => handleChange(item.field, value)}
                placeholder={item.placeholder}
                keyboardType={item.keyboardType || "default"}
              />
            </View>
          ))}
          
          {/* Remarks Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>REMARKS:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.remarks}
              onChangeText={(value) => handleChange("remarks", value)}
              placeholder="Additional remarks or notes"
              multiline={true}
              numberOfLines={4}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
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

          {/* Improved Requirements Modal */}
          <Modal visible={requirementsModalVisible} animationType="fade" transparent>
            <View style={demandStyles.modalContainer}>
              <View style={demandStyles.modalContent}>
                <View style={demandStyles.header}>
                  <Text style={demandStyles.title}>Requirements for Sick Call</Text>
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
                      {requirements.map((item, index) => (
                        <View key={index} style={demandStyles.listItem}>
                          <View style={demandStyles.bullet} />
                          <Text style={demandStyles.listText}>{item}</Text>
                        </View>
                      ))}
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
                          <Text style={demandStyles.reminderTitle}>Procedure</Text>
                        </View>
                        <View style={demandStyles.feeOption}>
                          <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                          <Text style={demandStyles.feeText}>Submit this form with all required documents</Text>
                        </View>
                        <View style={demandStyles.feeOption}>
                          <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                          <Text style={demandStyles.feeText}>Wait for confirmation from the parish office</Text>
                        </View>
                        <View style={demandStyles.feeOption}>
                          <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                          <Text style={demandStyles.feeText}>A priest will visit at the scheduled date and time</Text>
                        </View>
                      </View>
                      
                      <View style={demandStyles.note}>
                        <Ionicons name="time" size={16} color="#f39c12" />
                        <Text style={demandStyles.noteText}>Please submit all requirements at least 3 days before the requested visit date.</Text>
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
                  <Text style={previewStyles.modalTitle}>Sick Call Form Preview</Text>
                  <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                </View>

                <ScrollView style={previewStyles.scrollContainer}>
                  <PreviewSection title="Personal Information" icon="person">
                    <PreviewField label="Name" value={formData.name} />
                    <PreviewField label="Address" value={formData.address} />
                    <PreviewField label="Age" value={formData.age} />
                    <PreviewField label="Status" value={formData.status} />
                  </PreviewSection>

                  <PreviewSection title="Medical Information" icon="medkit">
                    <PreviewField label="Sickness/Condition" value={formData.sickness} />
                    <PreviewField label="Remarks" value={formData.remarks} />
                  </PreviewSection>

                  <PreviewSection title="Contact Information" icon="call">
                    <PreviewField label="Contact Person" value={formData.contactPerson} />
                    <PreviewField label="Contact Number" value={formData.contactNumber} />
                  </PreviewSection>

                  <PreviewSection title="Visit Details" icon="calendar">
                    <PreviewField label="Date of Visit" value={formData.dateOfVisit} />
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#f0f7ff',
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: height * 0.05
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2c6fb0',
    flex: 1
  },
  inputContainer: { 
    marginBottom: 15 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600',
    marginBottom: 5,
    color: '#444'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 100, 
    textAlignVertical: 'top'
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: Platform.OS === "android" ? 30 : 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    borderRadius: 8,
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButton: { 
    backgroundColor: "#27ae60",
  },
  cancelButton: { 
    backgroundColor: "#e74c3c",
  },
  requirementsButton: { 
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
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

export default SickCallFormScreen;