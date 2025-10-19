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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get("window");

const ReligiousLifeFormScreen = ({ navigation }) => {
    const { loggedInUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        gender: '',
        address: '',
        contactNumber: '',
        email: '',
        educationLevel: '',
        reasonForInterest: '',
        spiritualExperience: '',
        familySupport: '',
        preferredReligiousOrder: '',
        email: loggedInUser?.email || "guest@example.com"
    });

    // Date picker state
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeField, setActiveField] = useState(null);
    const scrollViewRef = useRef();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Improved Date handling functions for both Android and iOS
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            handleChange('birthDate', formatDate(selectedDate));
        }
    };

    // Function to handle N/A option
    const handleNAOption = (field) => {
        handleChange(field, "N/A");
    };

    const handleChange = (field, value) => {
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        // Special handling for contact number to only allow digits
        if (field === 'contactNumber') {
            // Remove any non-digit characters
            value = value.replace(/[^0-9]/g, '');
            // Limit to 11 characters
            if (value.length > 11) value = value.slice(0, 11);
        }
        
        setFormData({ ...formData, [field]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required field validation (excluding N/A fields)
        const requiredFields = ['fullName', 'birthDate', 'gender', 'address', 'contactNumber', 
                              'email', 'educationLevel', 'preferredReligiousOrder'];
        
        requiredFields.forEach(field => {
            if (!formData[field] || String(formData[field]).trim() === '') {
                newErrors[field] = 'This field is required';
            }
        });
        
        // Validate contact number
        if (formData.contactNumber && !/^\d{11}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = "Contact number must be 11 digits";
        }
        
        // Validate email format
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            // Animate to show there are errors
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                    delay: 2000
                })
            ]).start();
            
            return;
        }
        
        openPreviewModal();
    };

    const handleConfirm = async () => {
        closePreviewModal();

        try {
            const serverUrl = "http://192.168.1.18/system/religious_life_submit.php";

            console.log("Submitting religious life inquiry:", formData);

            const response = await fetch(serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text();
            console.log("📦 Raw religious life submission response:", text);

            if (!text) {
                Alert.alert("Server Error", "Server returned an empty response for religious life form. This might indicate a PHP error.");
                return;
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("❌ JSON parsing error for religious life form:", parseError, "Raw text:", text);
                Alert.alert("Server Error", "Received invalid data from server for religious life form. Check server logs. Details: " + text.substring(0, 100) + "...");
                return;
            }

            if (jsonResponse.status === "success") {
                Alert.alert(
                    "Submitted",
                    jsonResponse.message || "Kindly wait for the administrator to review and respond."
                );
                // Reset form data on successful submission
                setFormData({
                    fullName: '',
                    birthDate: '',
                    gender: '',
                    address: '',
                    contactNumber: '',
                    email: '',
                    educationLevel: '',
                    reasonForInterest: '',
                    spiritualExperience: '',
                    familySupport: '',
                    preferredReligiousOrder: '',
                });
                navigation.goBack();
            } else {
                Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
                if (jsonResponse.details) {
                    console.error("Server submission error details:", jsonResponse.details);
                }
            }

        } catch (error) {
            console.error("❌ Network or Server Error during religious life submission:", error);
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

    const focusNextField = (nextField) => {
        if (scrollViewRef.current && nextField) {
            // In a real app, you would use react-native's measure method to scroll to the specific field
            // This is a simplified implementation
            setActiveField(nextField);
        }
    };

    const getFieldLabel = (key) => {
        const labels = {
            fullName: "Full Name",
            birthDate: "Birth Date",
            gender: "Gender",
            address: "Address",
            contactNumber: "Contact Number",
            email: "Email Address",
            educationLevel: "Education Level",
            reasonForInterest: "Reason for Interest",
            spiritualExperience: "Spiritual Experience",
            familySupport: "Family Support",
            preferredReligiousOrder: "Preferred Religious Order"
        };
        
        return labels[key] || key.replace(/([A-Z])/g, ' $1');
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

    const renderField = (key) => {
        const label = getFieldLabel(key);
        
        switch(key) {
            case 'contactNumber':
                return (
                    <View key={key} style={styles.inputContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            style={[styles.input, errors[key] ? styles.inputError : null]}
                            value={formData[key]}
                            onChangeText={(value) => handleChange(key, value)}
                            placeholder={`Enter your ${label.toLowerCase()}`}
                            keyboardType="phone-pad"
                            maxLength={11}
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField('email')}
                            onFocus={() => setActiveField(key)}
                        />
                        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
                    </View>
                );
            case 'birthDate':
                return (
                    <View key={key} style={styles.inputContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <TouchableOpacity
                            style={[styles.dateInput, errors[key] ? styles.inputError : null]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={formData.birthDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                {formData.birthDate || "Select your birth date"}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>
                        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
                    </View>
                );
            case 'email':
                return (
                    <View key={key} style={styles.inputContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            style={[styles.input, errors[key] ? styles.inputError : null]}
                            value={formData[key]}
                            onChangeText={(value) => handleChange(key, value)}
                            placeholder={`Enter your ${label.toLowerCase()}`}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => focusNextField('educationLevel')}
                            onFocus={() => setActiveField(key)}
                        />
                        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
                    </View>
                );
            case 'reasonForInterest':
            case 'spiritualExperience':
            case 'familySupport':
                return (
                    <View key={key} style={styles.inputContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <View style={styles.inputWithNA}>
                            <TextInput
                                style={[styles.input, styles.multilineInput, errors[key] ? styles.inputError : null, { flex: 1 }]}
                                value={formData[key]}
                                onChangeText={(value) => handleChange(key, value)}
                                placeholder={`Tell us about your ${label.toLowerCase()}`}
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                onFocus={() => setActiveField(key)}
                            />
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption(key)}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
                    </View>
                );
            case 'preferredReligiousOrder':
                return (
                    <View key={key} style={styles.inputContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <View style={styles.inputWithNA}>
                            <TextInput
                                style={[styles.input, errors[key] ? styles.inputError : null, { flex: 1 }]}
                                value={formData[key]}
                                onChangeText={(value) => handleChange(key, value)}
                                placeholder={`Enter your ${label.toLowerCase()}`}
                                returnKeyType="next"
                                onFocus={() => setActiveField(key)}
                            />
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption(key)}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
                    </View>
                );
            default:
                return (
                    <View key={key} style={styles.inputContainer}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            style={[styles.input, errors[key] ? styles.inputError : null]}
                            value={formData[key]}
                            onChangeText={(value) => handleChange(key, value)}
                            placeholder={`Enter your ${label.toLowerCase()}`}
                            returnKeyType="next"
                            onFocus={() => setActiveField(key)}
                        />
                        {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
                    </View>
                );
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView 
                    contentContainerStyle={styles.container}
                    ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Date Picker */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                        />
                    )}

                    <View style={styles.header}>
                        <Text style={styles.title}>RELIGIOUS LIFE INQUIRY FORM</Text>
                        <Text style={styles.subtitle}>
                            Begin your spiritual journey with us
                        </Text>
                    </View>
                    
                    <Animated.View style={[styles.errorBanner, { opacity: fadeAnim }]}>
                        <Icon name="error-outline" size={20} color="#fff" />
                        <Text style={styles.errorBannerText}>
                            Please fix the errors in the form before submitting
                        </Text>
                    </Animated.View>
                    
                    <View style={styles.formContainer}>
                        {Object.keys(formData).map((key) => renderField(key))}
                    </View>
                    
                    <Text style={styles.note}>
                        *Matapos mag-fill up, maaring magpunta sa Opisina ng ating Parokya para sa Schedule ng Interview sa Parish Priest.*
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.submitButton]} 
                            onPress={handleSubmit}
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
                                    <Text style={demandStyles.title}>Requirements for Religious Life</Text>
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
                                                <Text style={demandStyles.listText}>Personal Interview from Parish Priest</Text>
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
                                                    <Text style={demandStyles.reminderTitle}>Nothing to see here.</Text>
                                                </View>
                                            </View>
                                            
                                            <View style={demandStyles.note}>
                                                <Ionicons name="time" size={16} color="#f39c12" />
                                                <Text style={demandStyles.noteText}>The discernment process typically takes 6-12 months. Please be patient and prayerful throughout this journey.</Text>
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
                                    <Text style={previewStyles.modalTitle}>Religious Life Inquiry Preview</Text>
                                    <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                                </View>

                                <ScrollView style={previewStyles.scrollContainer}>
                                    <PreviewSection title="Personal Information" icon="person">
                                        <PreviewField label="Full Name" value={formData.fullName} />
                                        <PreviewField label="Birth Date" value={formData.birthDate} />
                                        <PreviewField label="Gender" value={formData.gender} />
                                        <PreviewField label="Address" value={formData.address} />
                                    </PreviewSection>

                                    <PreviewSection title="Contact Information" icon="call">
                                        <PreviewField label="Contact Number" value={formData.contactNumber} />
                                        <PreviewField label="Email Address" value={formData.email} />
                                    </PreviewSection>

                                    <PreviewSection title="Education" icon="school">
                                        <PreviewField label="Education Level" value={formData.educationLevel} />
                                    </PreviewSection>

                                    <PreviewSection title="Spiritual Journey" icon="heart">
                                        <PreviewField label="Reason for Interest" value={formData.reasonForInterest} />
                                        <PreviewField label="Spiritual Experience" value={formData.spiritualExperience} />
                                        <PreviewField label="Family Support" value={formData.familySupport} />
                                    </PreviewSection>

                                    <PreviewSection title="Vocation Preference" icon="star">
                                        <PreviewField label="Preferred Religious Order" value={formData.preferredReligiousOrder} />
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
                                        onPress={handleConfirm}
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
        backgroundColor: '#f8f9fa',
        paddingBottom: 90,
        marginTop: 50
    },
    header: {
        marginBottom: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#7f8c8d',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e74c3c',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorBannerText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '500',
    },
    formContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#2c3e50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        backgroundColor: 'white',
        fontSize: 16,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInputText: {
        fontSize: 16,
        color: '#000',
    },
    dateInputPlaceholder: {
        fontSize: 16,
        color: '#999',
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
    inputError: {
        borderColor: '#e74c3c',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 14,
        marginTop: 4,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    note: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 24,
        color: '#e74c3c',
        backgroundColor: '#ffecb3',
        padding: 12,
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
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

export default ReligiousLifeFormScreen;