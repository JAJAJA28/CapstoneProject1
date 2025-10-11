import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const BlessingScreen = ({ navigation }) => {
    // Form states
    const [email, setEmail] = useState('');
    const [establishment, setEstablishment] = useState('');
    const [otherEstablishment, setOtherEstablishment] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [telNo, setTelNo] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [place, setPlace] = useState('');
    const [minister, setMinister] = useState('');
    
    // Date and Time Picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    
    // Modal states
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const civilStatusOptions = [
        { label: '👤 Single', value: 'Single' },
        { label: '💍 Married (Church/Civil)', value: 'Married' },
        { label: '🚫 Not Married', value: 'Not Married' },
        { label: '🕊️ Widow/Widower', value: 'Widow/Widower' },
    ];

    const establishmentOptions = [
        { label: '🏡 House', value: 'House' },
        { label: '🏬 Store', value: 'Store' },
        { label: '📌 Others', value: 'Others' },
    ];

    // Date and Time handling functions
    const formatDate = (selectedDate) => {
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatTime = (selectedTime) => {
        let hours = selectedTime.getHours();
        let minutes = selectedTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes.toString().padStart(2, '0');
        
        return `${hours}:${minutes} ${ampm}`;
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(formatDate(selectedDate));
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(formatTime(selectedTime));
        }
    };

    const validateForm = () => {
        if (!name || !email || !address || !telNo || !civilStatus || !establishment || !date || !time || !place || !minister) {
            Alert.alert('Incomplete Form', 'Please fill out all fields before submitting.');
            return false;
        }

        if (establishment === 'Others' && !otherEstablishment.trim()) {
            Alert.alert('Incomplete Form', 'Please specify the "Other Establishment".');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return false;
        }

        return true;
    };

    const handlePreview = () => {
        Keyboard.dismiss();
        if (validateForm()) {
            setShowSummaryModal(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start();
        }
    };

    const closePreviewModal = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => setShowSummaryModal(false));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        const formData = {
            name,
            email,
            address,
            telNo,
            civilStatus,
            establishment: establishment === 'Others' ? otherEstablishment : establishment,
            date,
            time,
            place,
            minister,
        };

        try {
            const serverUrl = "http://192.168.1.18/system/blessing_submit.php";

            const response = await fetch(serverUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const text = await response.text();
            let jsonResponse;

            try {
                jsonResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("JSON parsing error:", parseError);
                Alert.alert("Server Error", "Invalid server response.");
                setIsSubmitting(false);
                return;
            }

            if (jsonResponse.status === "success") {
                Alert.alert(
                    "Submitted",
                    jsonResponse.message || "Your Blessing request has been submitted successfully.",
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                // Clear form
                resetForm();
            } else {
                Alert.alert("Submission Failed", jsonResponse.message || "Unknown error.");
            }

        } catch (error) {
            console.error("Network or Server Error:", error);
            Alert.alert(
                "Network Error",
                "Could not connect to the server. Please try again later."
            );
        } finally {
            setIsSubmitting(false);
            setShowSummaryModal(false);
        }
    };

    const resetForm = () => {
        setEstablishment('');
        setOtherEstablishment('');
        setName('');
        setEmail('');
        setAddress('');
        setTelNo('');
        setCivilStatus('');
        setDate('');
        setTime('');
        setPlace('');
        setMinister('');
    };

    const handleCancel = () => {
        Alert.alert("Cancel Confirmation", "Are you sure you want to cancel?", [
            { text: "No", style: "cancel" },
            { text: "Yes", onPress: () => navigation.goBack() },
        ]);
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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Date and Time Pickers */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}

                    <Text style={styles.title}>Blessing Request Form</Text>
                    
                    <View style={styles.formContainer}>
                        {/* NAME */}
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter your full name" 
                            value={name} 
                            onChangeText={setName} 
                        />

                        {/* EMAIL */}
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* ADDRESS */}
                        <Text style={styles.label}>Address</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter your complete address" 
                            value={address} 
                            onChangeText={setAddress} 
                        />

                        {/* TEL. NO */}
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter your phone number" 
                            value={telNo} 
                            onChangeText={setTelNo} 
                            keyboardType="phone-pad" 
                        />

                        {/* CIVIL STATUS */}
                        <Text style={styles.label}>Civil Status</Text>
                        <View style={styles.optionContainer}>
                            {civilStatusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton, 
                                        civilStatus === option.value && styles.selectedOption
                                    ]}
                                    onPress={() => setCivilStatus(option.value)}
                                >
                                    <Text style={[
                                        styles.optionText, 
                                        civilStatus === option.value && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Establishment */}
                        <Text style={styles.label}>Type of Establishment</Text>
                        <View style={styles.optionContainer}>
                            {establishmentOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton, 
                                        establishment === option.value && styles.selectedOption
                                    ]}
                                    onPress={() => setEstablishment(option.value)}
                                >
                                    <Text style={[
                                        styles.optionText, 
                                        establishment === option.value && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Input Field for "Others" Establishment */}
                        {establishment === 'Others' && (
                            <>
                                <Text style={styles.label}>Specify Establishment</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Please specify the establishment type"
                                    value={otherEstablishment}
                                    onChangeText={setOtherEstablishment}
                                />
                            </>
                        )}

                        {/* DATE */}
                        <Text style={styles.label}>Date of Blessing</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={date ? styles.dateInputText : styles.dateInputPlaceholder}>
                                {date || "Select date (MM/DD/YYYY)"}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* TIME */}
                        <Text style={styles.label}>Time of Blessing</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={time ? styles.dateInputText : styles.dateInputPlaceholder}>
                                {time || "Select time (HH:MM AM/PM)"}
                            </Text>
                            <Ionicons name="time" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* PLACE */}
                        <Text style={styles.label}>Place of Blessing</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter the venue or location" 
                            value={place} 
                            onChangeText={setPlace} 
                        />

                        {/* MINISTER */}
                        <Text style={styles.label}>Preferred Minister</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter minister's name" 
                            value={minister} 
                            onChangeText={setMinister} 
                        />
                    </View>

                    {/* BUTTONS */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.previewButton]}
                            onPress={handlePreview}
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
                                    <Text style={demandStyles.title}>Requirements for Blessing</Text>
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
                                                <Text style={demandStyles.listText}>Proof of Ownership or Authorization</Text>
                                            </View>
                                            <View style={demandStyles.listItem}>
                                                <View style={demandStyles.bullet} />
                                                <Text style={demandStyles.listText}>Valid ID of the Requestor</Text>
                                            </View>
                                            <View style={demandStyles.listItem}>
                                                <View style={demandStyles.bullet} />
                                                <Text style={demandStyles.listText}>Recent Photo of the Establishment</Text>
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
                                                    <Text style={demandStyles.reminderTitle}>Fee Information</Text>
                                                </View>
                                                <View style={demandStyles.feeOption}>
                                                    <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                                                    <View style={{ marginLeft: 8 }}>
                                                        <Text style={demandStyles.feeText}>
                                                            <Text style={demandStyles.bold}>Standard Fee - ₱500</Text> (Residential)
                                                        </Text>
                                                        <Text style={demandStyles.feeText}>
                                                            <Text style={demandStyles.bold}>Business Fee - ₱1,000</Text> (Commercial)
                                                        </Text>
                                                    </View>
                                                </View>
                                                
                                                <View style={demandStyles.note}>
                                                    <Ionicons name="time" size={16} color="#f39c12" />
                                                    <Text style={demandStyles.noteText}>Please schedule your blessing at least one week in advance.</Text>
                                                </View>
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
                    <Modal visible={showSummaryModal} animationType="fade" transparent>
                        <View style={previewStyles.modalContainer}>
                            <Animated.View style={[previewStyles.modalContent, { opacity: fadeAnim }]}>
                                <View style={previewStyles.modalHeader}>
                                    <Text style={previewStyles.modalTitle}>Blessing Form Preview</Text>
                                    <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                                </View>

                                <ScrollView style={previewStyles.scrollContainer}>
                                    <PreviewSection title="Personal Information" icon="person">
                                        <PreviewField label="Full Name" value={name} />
                                        <PreviewField label="Email" value={email} />
                                        <PreviewField label="Address" value={address} />
                                        <PreviewField label="Phone Number" value={telNo} />
                                        <PreviewField label="Civil Status" value={civilStatus} />
                                    </PreviewSection>

                                    <PreviewSection title="Blessing Details" icon="calendar">
                                        <PreviewField label="Establishment Type" value={establishment === 'Others' ? otherEstablishment : establishment} />
                                        <PreviewField label="Date" value={date} />
                                        <PreviewField label="Time" value={time} />
                                        <PreviewField label="Place" value={place} />
                                        <PreviewField label="Minister" value={minister} />
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
                                        disabled={isSubmitting}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                                        <Text style={previewStyles.submitButtonText}>
                                            {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    </Modal>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        alignItems: 'center',
        padding: 60,
        paddingBottom: 40,
    },
    formContainer: {
        width: '100%',
        maxWidth: 500,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#2c3e50',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#34495e',
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 20,
        fontSize: 16,
    },
    dateInput: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 20,
        fontSize: 16,
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
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    optionButton: {
        width: '48%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
    },
    selectedOptionText: {
        color: '#fff',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
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
    previewButton: {
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
        alignItems: "flex-start",
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

export default BlessingScreen;