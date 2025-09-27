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
    SafeAreaView,
    Animated,
    Easing
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../AuthContext";

const { width, height } = Dimensions.get("window");

const ConfirmationForm = () => {
    const { loggedInUser } = useAuth();  // makukuha mo na yung email dito
    const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const navigation = useNavigation();
    const fadeAnim = useState(new Animated.Value(0))[0];

    const [formData, setFormData] = useState({
        contactNumber: "",
        petsaNgKumpil: "",
        petsaNg1stCommunion: "",
        oras: "",
        pangalanNgKukumpilan: "",
        tirahan: "",
        tagaSaangParokya: "",
        saangLalawigan: "",
        pangalanNgAma: "",
        lugarNgKapanganakanAma: "",
        tagaSaangParokyaAma: "",
        saangLalawiganAma: "",
        pangalanNgIna: "",
        lugarNgKapanganakanIna: "",
        tagaSaangParokyaIna: "",
        saangLalawiganIna: "",
        petsaNgBinyag: "",
        saanBinyag: "",
        pangalanNgNagkumpil: "",
        ninong1: "",
        ninang1: "",
        ninong2: "",
        ninang2: "",
        email: loggedInUser?.email || "guest@example.com" // auto from login
    });

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        const isEmptyField = Object.values(formData).some((value) => {
            return (typeof value === 'string' && value.trim() === '') || value === null || value === undefined;
        });

        if (isEmptyField) {
            Alert.alert("Incomplete Form", "Please fill out all fields before submitting.");
            return;
        }

        openPreviewModal();
    };

    const handleConfirmSubmit = async () => {
        closePreviewModal();

        try {
            const serverUrl = "http://192.168.1.34/system/confirmation_submit.php";

            console.log("Submitting confirmation data:", formData);

            const response = await fetch(serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const text = await response.text();
            console.log("📦 Raw confirmation submission response:", text);

            if (!text) {
                Alert.alert("Server Error", "Server returned an empty response for confirmation form. This might indicate a PHP error.");
                return;
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("❌ JSON parsing error for confirmation form:", parseError, "Raw text:", text);
                Alert.alert("Server Error", "Received invalid data from server for confirmation form. Check server logs. Details: " + text.substring(0, 100) + "...");
                return;
            }

            if (jsonResponse.status === "success") {
                Alert.alert(
                    "Success",
                    jsonResponse.message || "CONFIRMATION DATA SUBMITTED. Mag intay lamang po ng text message mula sa ating Secretary para sa pag kumpirma.",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
                if (jsonResponse.details) {
                    console.error("Server submission error details:", jsonResponse.details);
                }
            }

        } catch (error) {
            console.error("❌ Network or Server Error during confirmation submission:", error);
            Alert.alert(
                "Network Error",
                `Could not connect to the server or a server error occurred. Please check your internet connection or server status. Details: ${error.message}`
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
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={styles.keyboardAvoid}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerStyle={styles.container} 
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.headerContainer}>
                            <Text style={styles.header}>CONFIRMATION FORM</Text>
                            <View style={styles.headerLine} />
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="call" size={20} color="#4A90E2" />
                                <Text style={styles.sectionHeaderText}>Contact Information</Text>
                            </View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="CONTACT #" 
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                onChangeText={(text) => handleChange("contactNumber", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Confirmation Date (MM/DD/YYYY)" 
                                placeholderTextColor="#999"
                                keyboardType="numbers-and-punctuation"
                                onChangeText={(text) => handleChange("petsaNgKumpil", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="First Communion Date (MM/DD/YYYY)" 
                                placeholderTextColor="#999"
                                keyboardType="numbers-and-punctuation"
                                onChangeText={(text) => handleChange("petsaNg1stCommunion", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Time (HH:MM AM/PM)" 
                                placeholderTextColor="#999"
                                keyboardType="numbers-and-punctuation"
                                onChangeText={(text) => handleChange("oras", text)} 
                            />
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="person" size={20} color="#4A90E2" />
                                <Text style={styles.sectionHeaderText}>Personal Information</Text>
                            </View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="FULL NAME" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("pangalanNgKukumpilan", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="ADDRESS" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("tirahan", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="PARISH" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("tagaSaangParokya", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="PROVINCE" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("saangLalawigan", text)} 
                            />
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="man" size={20} color="#4A90E2" />
                                <Text style={styles.sectionHeaderText}>Father's Information</Text>
                            </View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="FATHER'S NAME" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("pangalanNgAma", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="FATHER'S BIRTHPLACE" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("lugarNgKapanganakanAma", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="FATHER'S PARISH" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("tagaSaangParokyaAma", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="FATHER'S PROVINCE" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("saangLalawiganAma", text)} 
                            />
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="woman" size={20} color="#4A90E2" />
                                <Text style={styles.sectionHeaderText}>Mother's Information</Text>
                            </View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="MOTHER'S NAME" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("pangalanNgIna", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="MOTHER'S BIRTHPLACE" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("lugarNgKapanganakanIna", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="MOTHER'S PARISH" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("tagaSaangParokyaIna", text)} 
                            />
                           <TextInput 
                                style={styles.input} 
                                placeholder="MOTHER'S PROVINCE" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("saangLalawiganIna", text)} 
                            />
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="water" size={20} color="#4A90E2" />
                                <Text style={styles.sectionHeaderText}>Baptism Information</Text>
                            </View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="BAPTISM DATE (MM/DD/YYYY)" 
                                placeholderTextColor="#999"
                                keyboardType="numbers-and-punctuation"
                                onChangeText={(text) => handleChange("petsaNgBinyag", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="BAPTISM LOCATION" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("saanBinyag", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="CONFIRMED BY" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("pangalanNgNagkumpil", text)} 
                            />
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="people" size={20} color="#4A90E2" />
                                <Text style={styles.sectionHeaderText}>Sponsors</Text>
                            </View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="GODFATHER 1" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("ninong1", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="GODMOTHER 1" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("ninang1", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="GODFATHER 2" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("ninong2", text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="GODMOTHER 2" 
                                placeholderTextColor="#999"
                                onChangeText={(text) => handleChange("ninang2", text)} 
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
                                        <Text style={demandStyles.title}>Requirements for Confirmation</Text>
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
                                                    <Text style={demandStyles.listText}>Baptismal Certificate</Text>
                                                </View>
                                                <View style={demandStyles.listItem}>
                                                    <View style={demandStyles.bullet} />
                                                    <Text style={demandStyles.listText}>First Communion Certificate</Text>
                                                </View>
                                                <View style={demandStyles.listItem}>
                                                    <View style={demandStyles.bullet} />
                                                    <Text style={demandStyles.listText}>Parent's Consent Form</Text>
                                                </View>
                                                <View style={demandStyles.listItem}>
                                                    <View style={demandStyles.bullet} />
                                                    <Text style={demandStyles.listText}>Confirmation Seminar Attendance</Text>
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
                                                        <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Regular Fee - ₱1,000</Text></Text>
                                                    </View>
                                                    <View style={demandStyles.feeOption}>
                                                        <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                                                        <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Includes certificate and stole</Text></Text>
                                                    </View>
                                                </View>
                                                
                                                <View style={demandStyles.note}>
                                                    <Ionicons name="time" size={16} color="#f39c12" />
                                                    <Text style={demandStyles.noteText}>Please submit all requirements at least one week before the confirmation date.</Text>
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
                                        <Text style={previewStyles.modalTitle}>Confirmation Form Preview</Text>
                                        <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                                    </View>

                                    <ScrollView style={previewStyles.scrollContainer}>
                                        <PreviewSection title="Contact Information" icon="call">
                                            <PreviewField label="Contact Number" value={formData.contactNumber} />
                                            <PreviewField label="Confirmation Date" value={formData.petsaNgKumpil} />
                                            <PreviewField label="First Communion Date" value={formData.petsaNg1stCommunion} />
                                            <PreviewField label="Time" value={formData.oras} />
                                        </PreviewSection>

                                        <PreviewSection title="Personal Information" icon="person">
                                            <PreviewField label="Full Name" value={formData.pangalanNgKukumpilan} />
                                            <PreviewField label="Address" value={formData.tirahan} />
                                            <PreviewField label="Parish" value={formData.tagaSaangParokya} />
                                            <PreviewField label="Province" value={formData.saangLalawigan} />
                                        </PreviewSection>

                                        <PreviewSection title="Father's Information" icon="man">
                                            <PreviewField label="Father's Name" value={formData.pangalanNgAma} />
                                            <PreviewField label="Father's Birthplace" value={formData.lugarNgKapanganakanAma} />
                                            <PreviewField label="Father's Parish" value={formData.tagaSaangParokyaAma} />
                                            <PreviewField label="Father's Province" value={formData.saangLalawiganAma} />
                                        </PreviewSection>

                                        <PreviewSection title="Mother's Information" icon="woman">
                                            <PreviewField label="Mother's Name" value={formData.pangalanNgIna} />
                                            <PreviewField label="Mother's Birthplace" value={formData.lugarNgKapanganakanIna} />
                                            <PreviewField label="Mother's Parish" value={formData.tagaSaangParokyaIna} />
                                            <PreviewField label="Mother's Province" value={formData.saangLalawiganIna} />
                                        </PreviewSection>

                                        <PreviewSection title="Baptism Information" icon="water">
                                            <PreviewField label="Baptism Date" value={formData.petsaNgBinyag} />
                                            <PreviewField label="Baptism Location" value={formData.saanBinyag} />
                                            <PreviewField label="Confirmed By" value={formData.pangalanNgNagkumpil} />
                                        </PreviewSection>

                                        <PreviewSection title="Sponsors" icon="people">
                                            <PreviewField label="Godfather 1" value={formData.ninong1} />
                                            <PreviewField label="Godmother 1" value={formData.ninang1} />
                                            <PreviewField label="Godfather 2" value={formData.ninong2} />
                                            <PreviewField label="Godmother 2" value={formData.ninang2} />
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
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    keyboardAvoid: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        padding: width * 0.04,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 30,
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
    },
    headerLine: {
        width: '30%',
        height: 4,
        backgroundColor: '#4A90E2',
        borderRadius: 2,
    },
    formSection: {
        marginBottom: 25,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EAECEE',
        paddingBottom: 10,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginLeft: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        padding: 14,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        fontSize: 16,
        color: '#2C3E50',
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

export default ConfirmationForm;