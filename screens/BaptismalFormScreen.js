import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  Easing
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get("window");

const BaptismalFormScreen = () => {
  const { loggedInUser } = useAuth();
  const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Date picker states - FIXED: Use single state for all pickers
  const [showPicker, setShowPicker] = useState({
    baptismDate: false,
    baptismTime: false,
    paymentDate: false,
    birthDate: false
  });

  // Current selected dates - FIXED: Store actual Date objects
  const [currentDates, setCurrentDates] = useState({
    baptismDate: new Date(),
    baptismTime: new Date(),
    paymentDate: new Date(),
    birthDate: new Date()
  });

  const [formData, setFormData] = useState({
    ContactNumber: "",
    BaptismDate: "",
    BaptismTime: "",
    PaymentDate: "",
    ChildName: "",
    Religion: "",
    BirthDate: "",
    BirthPlace: "",
    FatherName: "",
    fatherBirthPlace: "",
    MotherName: "",
    MotherBirthPlace: "",
    Address: "",
    MarriageType: "",
    ninong1: "",
    ninong1_age: "",
    ninong1_address: "",
    ninang1: "",
    ninang1_age: "",
    ninang1_address: "",
    ninong2: "",
    ninong2_age: "",
    ninong2_address: "",
    ninang2: "",
    ninang2_age: "",
    ninang2_address: "",
    email: loggedInUser?.email || "guest@example.com"
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Function to handle N/A button press for age and address
  const handleNotApplicable = (fieldName) => {
    setFormData({ ...formData, [fieldName]: "N/A" });
  };

  // Date handling functions - FIXED: Better date formatting
  const formatDate = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (date) => {
    if (!date) return "";
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes.toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // FIXED: Unified picker handler
  const showDatePicker = (type) => {
    setShowPicker({
      ...showPicker,
      [type]: true
    });
  };

  // FIXED: Unified date change handler
  const onDateChange = (event, selectedDate, type) => {
    // For Android, check if user cancelled
    if (Platform.OS === 'android') {
      setShowPicker({
        baptismDate: false,
        baptismTime: false,
        paymentDate: false,
        birthDate: false
      });
    }

    if (selectedDate) {
      setCurrentDates({
        ...currentDates,
        [type]: selectedDate
      });

      // Format and set the form data based on type
      if (type === 'baptismDate') {
        handleChange("BaptismDate", formatDate(selectedDate));
      } else if (type === 'paymentDate') {
        handleChange("PaymentDate", formatDate(selectedDate));
      } else if (type === 'birthDate') {
        handleChange("BirthDate", formatDate(selectedDate));
      } else if (type === 'baptismTime') {
        handleChange("BaptismTime", formatTime(selectedDate));
      }

      // For iOS, we need to manually close the picker after selection
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          setShowPicker({
            baptismDate: false,
            baptismTime: false,
            paymentDate: false,
            birthDate: false
          });
        }, 500);
      }
    }
  };

  // FIXED: Handle iOS modal close
  const handleIOSPickerClose = () => {
    setShowPicker({
      baptismDate: false,
      baptismTime: false,
      paymentDate: false,
      birthDate: false
    });
  };

  const handleSubmit = async () => {
    // Check only required fields, allow N/A for optional fields
    const requiredFields = [
      "ContactNumber", "BaptismDate", "BaptismTime", "PaymentDate",
      "ChildName", "Religion", "BirthDate", "BirthPlace",
      "FatherName", "fatherBirthPlace", "MotherName", "MotherBirthPlace",
      "Address", "MarriageType", "ninong1", "ninang1"
    ];

    const isEmptyRequiredField = requiredFields.some(
      (field) => !formData[field] || formData[field].trim() === ""
    );

    if (isEmptyRequiredField) {
      Alert.alert("Incomplete Form", "Please fill out all required fields before submitting.");
      return;
    }

    try {
      const serverUrl = "http://192.168.1.18/system/baptismal_submit.php";
      const response = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(text);
      } catch {
        Alert.alert("Server Error", "Invalid response from server.");
        return;
      }

      if (jsonResponse.status === "success") {
        Alert.alert(
          "Success",
          jsonResponse.message ||
            "BAPTISMAL DATA SUBMITTED. Kindly wait for the administrator to review and respond.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Submission Failed", jsonResponse.message || "Unknown error.");
      }
    } catch (error) {
      Alert.alert("Network Error", error.message);
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

  // Component for age input with N/A button
  const AgeInputWithNA = ({ placeholder, value, onChangeText, fieldName }) => (
    <View style={styles.inputWithButtonContainer}>
      <TextInput 
        style={styles.inputWithButton} 
        placeholder={placeholder} 
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText} 
      />
      <TouchableOpacity 
        style={styles.naButton}
        onPress={() => handleNotApplicable(fieldName)}
      >
        <Text style={styles.naButtonText}>N/A</Text>
      </TouchableOpacity>
    </View>
  );

  // Component for address input with N/A button
  const AddressInputWithNA = ({ placeholder, value, onChangeText, fieldName }) => (
    <View style={styles.inputWithButtonContainer}>
      <TextInput 
        style={styles.inputWithButton} 
        placeholder={placeholder} 
        value={value}
        onChangeText={onChangeText} 
      />
      <TouchableOpacity 
        style={styles.naButton}
        onPress={() => handleNotApplicable(fieldName)}
      >
        <Text style={styles.naButtonText}>N/A</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>BAPTISMAL FORM</Text>

          {/* Contact & Schedule */}
          <Text style={styles.sectionHeader}>📞 Contact & Schedule</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Contact Number *" 
            keyboardType="phone-pad"
            value={formData.ContactNumber}
            onChangeText={(text) => handleChange("ContactNumber", text)} 
          />
          
          {/* Baptism Date with Date Picker - FIXED */}
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => showDatePicker('baptismDate')}
          >
            <Text style={formData.BaptismDate ? styles.dateInputText : styles.dateInputPlaceholder}>
              {formData.BaptismDate || "Baptism Date * (Tap to select)"}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>

          {/* Baptism Time with Time Picker - FIXED */}
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => showDatePicker('baptismTime')}
          >
            <Text style={formData.BaptismTime ? styles.dateInputText : styles.dateInputPlaceholder}>
              {formData.BaptismTime || "Baptism Time * (Tap to select)"}
            </Text>
            <Ionicons name="time" size={20} color="#666" />
          </TouchableOpacity>

          {/* Payment Date with Date Picker - FIXED */}
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => showDatePicker('paymentDate')}
          >
            <Text style={formData.PaymentDate ? styles.dateInputText : styles.dateInputPlaceholder}>
              {formData.PaymentDate || "Payment Date * (Tap to select)"}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>

          {/* Child's Information */}
          <Text style={styles.sectionHeader}>👶 Child's Information</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Child's Name *" 
            value={formData.ChildName}
            onChangeText={(text) => handleChange("ChildName", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Religion *" 
            value={formData.Religion}
            onChangeText={(text) => handleChange("Religion", text)} 
          />
          
          {/* Birth Date with Date Picker - FIXED */}
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => showDatePicker('birthDate')}
          >
            <Text style={formData.BirthDate ? styles.dateInputText : styles.dateInputPlaceholder}>
              {formData.BirthDate || "Birth Date * (Tap to select)"}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>

          <TextInput 
            style={styles.input} 
            placeholder="Birth Place *" 
            value={formData.BirthPlace}
            onChangeText={(text) => handleChange("BirthPlace", text)} 
          />

          {/* Parents' Information */}
          <Text style={styles.sectionHeader}>👨‍👩‍👧 Parents' Information</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Father's Name *" 
            value={formData.FatherName}
            onChangeText={(text) => handleChange("FatherName", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Father's Birth Place *" 
            value={formData.fatherBirthPlace}
            onChangeText={(text) => handleChange("fatherBirthPlace", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Mother's Name *" 
            value={formData.MotherName}
            onChangeText={(text) => handleChange("MotherName", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Mother's Birth Place *" 
            value={formData.MotherBirthPlace}
            onChangeText={(text) => handleChange("MotherBirthPlace", text)} 
          />

          {/* Address & Marriage */}
          <Text style={styles.sectionHeader}>🏠 Address & Marriage</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Address *" 
            value={formData.Address}
            onChangeText={(text) => handleChange("Address", text)} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Marriage Type *" 
            value={formData.MarriageType}
            onChangeText={(text) => handleChange("MarriageType", text)} 
          />

          {/* Sponsors */}
          <Text style={styles.sectionHeader}>🎉 Sponsors</Text>

          {/* Ninong 1 */}
          <Text style={styles.sponsorSubHeader}>Ninong 1 (Required)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="NINONG SA BINYAG 1 *" 
            value={formData.ninong1}
            onChangeText={(text) => handleChange("ninong1", text)} 
          />
          
          <AgeInputWithNA
            placeholder="EDAD (Age)"
            value={formData.ninong1_age}
            onChangeText={(text) => handleChange("ninong1_age", text)}
            fieldName="ninong1_age"
          />
          
          <AddressInputWithNA
            placeholder="TIRAHAN (Address)"
            value={formData.ninong1_address}
            onChangeText={(text) => handleChange("ninong1_address", text)}
            fieldName="ninong1_address"
          />

          {/* Ninang 1 */}
          <Text style={styles.sponsorSubHeader}>Ninang 1 (Required)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="NINANG SA BINYAG 1 *" 
            value={formData.ninang1}
            onChangeText={(text) => handleChange("ninang1", text)} 
          />
          
          <AgeInputWithNA
            placeholder="EDAD (Age)"
            value={formData.ninang1_age}
            onChangeText={(text) => handleChange("ninang1_age", text)}
            fieldName="ninang1_age"
          />
          
          <AddressInputWithNA
            placeholder="TIRAHAN (Address)"
            value={formData.ninang1_address}
            onChangeText={(text) => handleChange("ninang1_address", text)}
            fieldName="ninang1_address"
          />

          {/* Ninong 2 */}
          <Text style={styles.sponsorSubHeader}>Ninong 2 (Optional)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="NINONG SA BINYAG 2" 
            value={formData.ninong2}
            onChangeText={(text) => handleChange("ninong2", text)} 
          />
          
          <AgeInputWithNA
            placeholder="EDAD (Age)"
            value={formData.ninong2_age}
            onChangeText={(text) => handleChange("ninong2_age", text)}
            fieldName="ninong2_age"
          />
          
          <AddressInputWithNA
            placeholder="TIRAHAN (Address)"
            value={formData.ninong2_address}
            onChangeText={(text) => handleChange("ninong2_address", text)}
            fieldName="ninong2_address"
          />

          {/* Ninang 2 */}
          <Text style={styles.sponsorSubHeader}>Ninang 2 (Optional)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="NINANG SA BINYAG 2" 
            value={formData.ninang2}
            onChangeText={(text) => handleChange("ninang2", text)} 
          />
          
          <AgeInputWithNA
            placeholder="EDAD (Age)"
            value={formData.ninang2_age}
            onChangeText={(text) => handleChange("ninang2_age", text)}
            fieldName="ninang2_age"
          />
          
          <AddressInputWithNA
            placeholder="TIRAHAN (Address)"
            value={formData.ninang2_address}
            onChangeText={(text) => handleChange("ninang2_address", text)}
            fieldName="ninang2_address"
          />

          {/* Required fields note */}
          <Text style={styles.requiredNote}>* Required fields</Text>

          {/* Date Pickers - FIXED: Better implementation */}
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
                onChange={(event, date) => onDateChange(event, date, 'baptismDate')}
              />
            )
          )}

          {showPicker.baptismTime && (
            Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker.baptismTime}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={handleIOSPickerClose}>
                      <Text style={styles.iosPickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.iosPickerTitle}>Select Baptism Time</Text>
                    <TouchableOpacity onPress={() => onDateChange(null, currentDates.baptismTime, 'baptismTime')}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={currentDates.baptismTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, date) => setCurrentDates({...currentDates, baptismTime: date})}
                    style={styles.iosPicker}
                  />
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={currentDates.baptismTime}
                mode="time"
                display="default"
                onChange={(event, date) => onDateChange(event, date, 'baptismTime')}
              />
            )
          )}

          {showPicker.paymentDate && (
            Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker.paymentDate}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={handleIOSPickerClose}>
                      <Text style={styles.iosPickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.iosPickerTitle}>Select Payment Date</Text>
                    <TouchableOpacity onPress={() => onDateChange(null, currentDates.paymentDate, 'paymentDate')}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={currentDates.paymentDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => setCurrentDates({...currentDates, paymentDate: date})}
                    style={styles.iosPicker}
                  />
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={currentDates.paymentDate}
                mode="date"
                display="default"
                onChange={(event, date) => onDateChange(event, date, 'paymentDate')}
              />
            )
          )}

          {showPicker.birthDate && (
            Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker.birthDate}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={handleIOSPickerClose}>
                      <Text style={styles.iosPickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.iosPickerTitle}>Select Birth Date</Text>
                    <TouchableOpacity onPress={() => onDateChange(null, currentDates.birthDate, 'birthDate')}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={currentDates.birthDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => setCurrentDates({...currentDates, birthDate: date})}
                    style={styles.iosPicker}
                  />
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={currentDates.birthDate}
                mode="date"
                display="default"
                onChange={(event, date) => onDateChange(event, date, 'birthDate')}
              />
            )
          )}

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

          {/* Requirements Modal */}
          <Modal visible={requirementsModalVisible} animationType="fade" transparent>
            <View style={demandStyles.modalContainer}>
              <View style={demandStyles.modalContent}>
                <View style={demandStyles.header}>
                  <Text style={demandStyles.title}>Requirements for Baptism</Text>
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
                        <Text style={demandStyles.listText}>Birth Certificate of the child</Text>
                      </View>
                      <View style={demandStyles.listItem}>
                        <View style={demandStyles.bullet} />
                        <Text style={demandStyles.listText}>Marriage Certificate of Parents (if applicable)</Text>
                      </View>
                      <View style={demandStyles.listItem}>
                        <View style={demandStyles.bullet} />
                        <Text style={demandStyles.listText}>Accomplished Baptismal Form</Text>
                      </View>
                      <View style={demandStyles.listItem}>
                        <View style={demandStyles.bullet} />
                        <Text style={demandStyles.listText}>Need to attend a Seminar for Baptism</Text>
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
                          <Text style={demandStyles.reminderTitle}>Fee Options</Text>
                        </View>
                        <View style={demandStyles.feeOption}>
                          <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                          <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Special - ₱1,500</Text> (Tuesday - Saturday)</Text>
                        </View>
                        <View style={demandStyles.feeOption}>
                          <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                          <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Regular - ₱1,000</Text> (Sunday)</Text>
                        </View>
                        <View style={demandStyles.feeOption}>
                          <Ionicons name="close-circle" size={16} color="#e74c3c" />
                          <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Monday</Text> - Parish Office Closed</Text>
                        </View>
                      </View>
                      
                      <View style={demandStyles.note}>
                        <Ionicons name="time" size={16} color="#f39c12" />
                        <Text style={demandStyles.noteText}>Please submit all requirements at least one week before the baptism date.</Text>
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
                  <Text style={previewStyles.modalTitle}>Baptismal Form Preview</Text>
                  <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                </View>

                <ScrollView style={previewStyles.scrollContainer}>
                  <PreviewSection title="Contact & Schedule" icon="calendar">
                    <PreviewField label="Contact Number" value={formData.ContactNumber} />
                    <PreviewField label="Baptism Date" value={formData.BaptismDate} />
                    <PreviewField label="Baptism Time" value={formData.BaptismTime} />
                    <PreviewField label="Payment Date" value={formData.PaymentDate} />
                  </PreviewSection>

                  <PreviewSection title="Child's Information" icon="person">
                    <PreviewField label="Child's Name" value={formData.ChildName} />
                    <PreviewField label="Religion" value={formData.Religion} />
                    <PreviewField label="Birth Date" value={formData.BirthDate} />
                    <PreviewField label="Birth Place" value={formData.BirthPlace} />
                  </PreviewSection>

                  <PreviewSection title="Parents' Information" icon="people">
                    <PreviewField label="Father's Name" value={formData.FatherName} />
                    <PreviewField label="Father's Birth Place" value={formData.fatherBirthPlace} />
                    <PreviewField label="Mother's Name" value={formData.MotherName} />
                    <PreviewField label="Mother's Birth Place" value={formData.MotherBirthPlace} />
                  </PreviewSection>

                  <PreviewSection title="Address & Marriage" icon="home">
                    <PreviewField label="Address" value={formData.Address} />
                    <PreviewField label="Marriage Type" value={formData.MarriageType} />
                  </PreviewSection>

                  <PreviewSection title="Sponsors (Ninong 1)" icon="man">
                    <PreviewField label="Name" value={formData.ninong1} />
                    <PreviewField label="Age" value={formData.ninong1_age} />
                    <PreviewField label="Address" value={formData.ninong1_address} />
                  </PreviewSection>

                  <PreviewSection title="Sponsors (Ninang 1)" icon="woman">
                    <PreviewField label="Name" value={formData.ninang1} />
                    <PreviewField label="Age" value={formData.ninang1_age} />
                    <PreviewField label="Address" value={formData.ninang1_address} />
                  </PreviewSection>

                  <PreviewSection title="Sponsors (Ninong 2)" icon="man">
                    <PreviewField label="Name" value={formData.ninong2} />
                    <PreviewField label="Age" value={formData.ninong2_age} />
                    <PreviewField label="Address" value={formData.ninong2_address} />
                  </PreviewSection>

                  <PreviewSection title="Sponsors (Ninang 2)" icon="woman">
                    <PreviewField label="Name" value={formData.ninang2} />
                    <PreviewField label="Age" value={formData.ninang2_age} />
                    <PreviewField label="Address" value={formData.ninang2_address} />
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

// Add these new styles
const styles = StyleSheet.create({
  inputWithButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputWithButton: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginRight: 8,
  },
  naButton: {
    backgroundColor: '#6A9B6B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  naButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sponsorSubHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a6ea9',
    marginBottom: 8,
    marginTop: 8,
  },
  requiredNote: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  container: { 
    padding: 20, 
    backgroundColor: "#fff",
    paddingBottom: 40 
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: height * 0.05,
    color: "#2c3e50",
  },
  sectionHeader: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginTop: 20, 
    marginBottom: 10,
    color: "#3498db",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
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
  // Add these new styles for iOS picker
  iosPickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  iosPickerCancel: {
    color: '#007AFF',
    fontSize: 16,
  },
  iosPickerDone: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  iosPicker: {
    backgroundColor: 'white',
    height: 200,
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

export default BaptismalFormScreen;