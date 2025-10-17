import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Modal,
    Alert,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const PamisaScreen = ({ navigation }) => {
    const { loggedInUser } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [donation, setDonation] = useState('');
    const [name, setName] = useState('');
    const [offeredBy, setOfferedBy] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedIntention, setSelectedIntention] = useState('');
    const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const timeOptions = ['6AM', '8AM', '5:30PM','7:00PM'];
    const intentionOptions = ['Pasasalamat', 'Kaarawan', 'Kahilingan', 'Kagalingan', 'Kaluluwa'];

    // Format date to MM/DD/YYYY
    const formatDate = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    // Validate donation input to accept only numbers and decimal
    const handleDonationChange = (text) => {
        // Remove any non-digit characters except decimal point
        const cleaned = text.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            return;
        }
        
        // If there's a decimal part, limit to 2 digits
        if (parts.length === 2 && parts[1].length > 2) {
            return;
        }
        
        setDonation(cleaned);
    };

    const openPreviewModal = () => {
        if (!selectedDate || !selectedTime || !selectedIntention || !name || !offeredBy || !donation) {
            Alert.alert('Incomplete Form', 'Please fill out all fields before previewing.');
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

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime || !selectedIntention || !name || !offeredBy || !donation) {
            Alert.alert('Incomplete Form', 'Please fill out all fields before submitting.');
            return;
        }
        openPreviewModal();
    };

   const handleConfirm = async () => {
        closePreviewModal();
        const formData = {
            date: formatDate(selectedDate),
            selectedTime,
            selectedIntention,
            name,
            offeredBy,
            donation: parseFloat(donation) || 0,
            email: loggedInUser?.email || "guest@example.com"
        };

        try {
            const serverUrl = "http://192.168.1.18/system/pamisa_submit.php";

            console.log("Submitting Pamisa request:", formData);

            const response = await fetch(serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text();
            console.log("📦 Raw Pamisa submission response:", text);

            if (!text) {
                Alert.alert("Server Error", "Server returned an empty response for Pamisa form.");
                return;
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("❌ JSON parsing error for Pamisa form:", parseError, "Raw text:", text);
                Alert.alert("Server Error", "Received invalid data from server for Pamisa form.");
                return;
            }

            if (jsonResponse.status === "success") {
                Alert.alert(
                    "Submitted!",
                    jsonResponse.message || "Ang iyong Pamisa ay naipasa na, mangyaring magpunta na lamang po sa Parish Office para sa payment.",
                    [{ text: "OK", onPress: () => navigation.navigate("MainTabs", { screen: "Dashboard" }) }]
                );
                setSelectedDate(new Date());
                setDonation('');
                setName('');
                setOfferedBy('');
                setSelectedTime('');
                setSelectedIntention('');
            } else {
                Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
                if (jsonResponse.details) {
                    console.error("Server submission error details:", jsonResponse.details);
                }
            }

        } catch (error) {
            console.error("❌ Network or Server Error during Pamisa submission:", error);
            Alert.alert(
                "Network Error",
                `Could not connect to the server. Please check your internet connection. Details: ${error.message}`
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Pamisa Reservation</Text>
                        <Text style={styles.subtitle}>Fill out the form to schedule your mass</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* PETSA NG PAMISA - NOW WITH DATE PICKER */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>📅 Petsa ng Pamisa</Text>
                            <TouchableOpacity 
                                style={styles.datePickerButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color="#4a6ea9" style={styles.dateIcon} />
                                <Text style={styles.dateText}>
                                    {formatDate(selectedDate)}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>

                        {/* ORAS NG PAMISA */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>⏰ Oras</Text>
                            <View style={styles.optionsContainer}>
                                {timeOptions.map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.optionButton, 
                                            selectedTime === time && styles.selectedOption
                                        ]}
                                        onPress={() => setSelectedTime(time)}
                                    >
                                        <Text style={[
                                            styles.optionText, 
                                            selectedTime === time && styles.selectedOptionText
                                        ]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* INTENSIYON NG PAMISA */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>🙏 Intensiyon</Text>
                            <View style={styles.verticalOptionsContainer}>
                                {intentionOptions.map((intention) => (
                                    <TouchableOpacity
                                        key={intention}
                                        style={[
                                            styles.verticalOptionButton, 
                                            selectedIntention === intention && styles.selectedOption
                                        ]}
                                        onPress={() => setSelectedIntention(intention)}
                                    >
                                        <Text style={[
                                            styles.optionText, 
                                            selectedIntention === intention && styles.selectedOptionText
                                        ]}>
                                            {intention}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* PANGALAN NG PAMISA */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>📜 Pangalan (Pamisa)</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Full name for the mass" 
                                value={name} 
                                onChangeText={setName} 
                            />
                        </View>

                        {/* NAGPAMISA */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>👤 Nagpamisa</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Your full name" 
                                value={offeredBy} 
                                onChangeText={setOfferedBy} 
                            />
                        </View>

                        {/* DONASYON - NOW WITH NUMERIC VALIDATION */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>💰 Donasyon</Text>
                            <View style={styles.donationContainer}>
                                <Text style={styles.currencySymbol}>₱</Text>
                                <TextInput 
                                    style={[styles.input, styles.donationInput]} 
                                    placeholder="0.00"
                                    value={donation} 
                                    onChangeText={handleDonationChange} 
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* BUTTONS */}
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
                    </View>

                    {/* Requirements Modal */}
                    <Modal visible={requirementsModalVisible} animationType="fade" transparent>
                        <View style={demandStyles.modalContainer}>
                            <View style={demandStyles.modalContent}>
                                <View style={demandStyles.header}>
                                    <Text style={demandStyles.title}>Requirements for Pamisa</Text>
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
                                            <Text style={demandStyles.sectionTitle}>Required Information</Text>
                                        </View>
                                        <View style={demandStyles.list}>
                                            <View style={demandStyles.listItem}>
                                                <View style={demandStyles.bullet} />
                                                <Text style={demandStyles.listText}>Complete name for the mass intention</Text>
                                            </View>
                                            <View style={demandStyles.listItem}>
                                                <View style={demandStyles.bullet} />
                                                <Text style={demandStyles.listText}>Name of the person requesting the mass</Text>
                                            </View>
                                            <View style={demandStyles.listItem}>
                                                <View style={demandStyles.bullet} />
                                                <Text style={demandStyles.listText}>Preferred date and time for the mass</Text>
                                            </View>
                                            <View style={demandStyles.listItem}>
                                                <View style={demandStyles.bullet} />
                                                <Text style={demandStyles.listText}>Type of intention (Thanksgiving, Birthday, Special Request, etc.)</Text>
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
                                                    <Text style={demandStyles.reminderTitle}>Nothing to see here..</Text>
                                                </View>                                                                                     
                                            </View>
                                            
                                            <View style={demandStyles.note}>
                                                <Ionicons name="time" size={16} color="#f39c12" />
                                                <Text style={demandStyles.noteText}>Please schedule your mass at least 3 days in advance.</Text>
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
                                    <Text style={previewStyles.modalTitle}>Pamisa Form Preview</Text>
                                    <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                                </View>

                                <ScrollView style={previewStyles.scrollContainer}>
                                    <PreviewSection title="Mass Details" icon="calendar">
                                        <PreviewField label="Date" value={formatDate(selectedDate)} />
                                        <PreviewField label="Time" value={selectedTime} />
                                        <PreviewField label="Intention" value={selectedIntention} />
                                    </PreviewSection>

                                    <PreviewSection title="Mass Information" icon="document-text">
                                        <PreviewField label="Name for Mass" value={name} />
                                        <PreviewField label="Offered By" value={offeredBy} />
                                        <PreviewField label="Donation" value={`₱${donation}`} />
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 5,
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    // NEW STYLES FOR DATE PICKER
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    dateIcon: {
        marginRight: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    donationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginRight: 10,
        padding: 5,
        backgroundColor: '#ecf0f1',
        borderRadius: 5,
    },
    donationInput: {
        flex: 1,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    optionButton: {
        width: '48%',
        padding: 12,
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
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#7f8c8d',
    },
    selectedOptionText: {
        color: '#fff',
    },
    verticalOptionsContainer: {
        width: '100%',
    },
    verticalOptionButton: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    buttonContainer: {
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    submitButton: {
        backgroundColor: '#27ae60',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    requirementsButton: {
        backgroundColor: '#3498db',
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

const previewStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
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
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#f8f9fa',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        color: '#7f8c8d',
    },
    scrollContainer: {
        padding: 15,
        maxHeight: height * 0.4,
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 10,
    },
    sectionContent: {
        paddingHorizontal: 5,
    },
    field: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    fieldLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
        flex: 1,
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 2,
        textAlign: 'right',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#f8f9fa',
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    editButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4a6ea9',
    },
    submitButton: {
        backgroundColor: '#27ae60',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    editButtonText: {
        color: '#4a6ea9',
        fontWeight: '600',
        marginLeft: 8,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
});

const demandStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,
        elevation: 9,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 10,
    },
    list: {
        paddingLeft: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4a6ea9',
        marginTop: 8,
        marginRight: 12,
    },
    listText: {
        fontSize: 15,
        color: '#34495e',
        flex: 1,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: '#ecf0f1',
        marginVertical: 20,
    },
    reminderContainer: {
        paddingLeft: 10,
    },
    reminderCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reminderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 8,
    },
    feeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    feeText: {
        fontSize: 14,
        color: '#34495e',
        marginLeft: 8,
    },
    bold: {
        fontWeight: 'bold',
    },
    note: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff4e5',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    noteText: {
        fontSize: 13,
        color: '#e67e22',
        marginLeft: 8,
        flex: 1,
        fontStyle: 'italic',
    },
    acknowledgeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        padding: 16,
        margin: 20,
        borderRadius: 8,
    },
    acknowledgeButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});

export default PamisaScreen;