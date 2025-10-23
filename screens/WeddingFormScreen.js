import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "../AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

const { height, width } = Dimensions.get('window');

// Updated initialFormState with separate date and time fields
const initialFormState = {
    surname: "",
    weddingDate: "", // Just date (MM/DD/YYYY)
    weddingTime: "", // Just time (HH:MM AM/PM)
    malePhone: "",
    maleStatus: "",
    maleAge: "",
    maleAddress: "",
    maleFather: "",
    maleMother: "",
    femalePhone: "",
    femaleStatus: "",
    femaleAge: "",
    femaleAddress: "",
    femaleFather: "",
    femaleMother: "",
    parishScheduleDate: "",
    parishScheduleTime: "",
    priestInterviewDate: "",
    priestInterviewTime: "",
    seminarDate: "",
    seminarTime: "",
    counsellingDate: "",
    counsellingTime: "",
    confessionDate: "",
    confessionTime: "",
    baptismConfirmation: "",
    paymentDate: "",
    arNo: "",
    paymentAmount: "",
    email_norm: "guest@example.com",
};

const WeddingFormScreen = ({ navigation }) => {
    const { loggedInUser } = useAuth();
    const [formData, setFormData] = useState(initialFormState);
    const [requirementsModalVisible, setRequirementsModalVisible] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    // Date picker states
    const [showWeddingDatePicker, setShowWeddingDatePicker] = useState(false);
    const [showWeddingTimePicker, setShowWeddingTimePicker] = useState(false);
    const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
    
    // Schedule Details Date Pickers
    const [showParishDatePicker, setShowParishDatePicker] = useState(false);
    const [showParishTimePicker, setShowParishTimePicker] = useState(false);
    const [showPriestDatePicker, setShowPriestDatePicker] = useState(false);
    const [showPriestTimePicker, setShowPriestTimePicker] = useState(false);
    const [showSeminarDatePicker, setShowSeminarDatePicker] = useState(false);
    const [showSeminarTimePicker, setShowSeminarTimePicker] = useState(false);
    const [showCounsellingDatePicker, setShowCounsellingDatePicker] = useState(false);
    const [showCounsellingTimePicker, setShowCounsellingTimePicker] = useState(false);
    const [showConfessionDatePicker, setShowConfessionDatePicker] = useState(false);
    const [showConfessionTimePicker, setShowConfessionTimePicker] = useState(false);

    // 🔄 Update email_norm when loggedInUser changes
    useEffect(() => {
        if (loggedInUser?.email) {
            setFormData((prev) => ({
                ...prev,
                email_norm: loggedInUser.email.toLowerCase().trim()
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                email_norm: "guest@example.com"
            }));
        }
    }, [loggedInUser]);

    // Get current date for minimum date validation
    const getCurrentDate = () => {
        return new Date();
    };

    // Improved Date handling functions for both Android and iOS
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
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

    // Function to handle N/A option
    const handleNAOption = (field) => {
        handleInputChange(field, "N/A");
    };

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    // Updated Date handling functions with past date blocking
    const onWeddingDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowWeddingDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for the wedding.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("weddingDate", formatDate(selectedDate));
        }
    };

    const onWeddingTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowWeddingTimePicker(false);
        }
        if (selectedDate) {
            handleInputChange("weddingTime", formatTime(selectedDate));
        }
    };

    // Payment Date Handler with validation
    const onPaymentDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPaymentDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for payment.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("paymentDate", formatDate(selectedDate));
        }
    };

    // Schedule Details Handlers with validation
    const onParishDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowParishDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for parish schedule.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("parishScheduleDate", formatDate(selectedDate));
        }
    };

    const onParishTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowParishTimePicker(false);
        }
        if (selectedDate) {
            handleInputChange("parishScheduleTime", formatTime(selectedDate));
        }
    };

    const onPriestDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPriestDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for priest interview.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("priestInterviewDate", formatDate(selectedDate));
        }
    };

    const onPriestTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPriestTimePicker(false);
        }
        if (selectedDate) {
            handleInputChange("priestInterviewTime", formatTime(selectedDate));
        }
    };

    const onSeminarDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowSeminarDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for seminar.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("seminarDate", formatDate(selectedDate));
        }
    };

    const onSeminarTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowSeminarTimePicker(false);
        }
        if (selectedDate) {
            handleInputChange("seminarTime", formatTime(selectedDate));
        }
    };

    const onCounsellingDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowCounsellingDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for counselling.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("counsellingDate", formatDate(selectedDate));
        }
    };

    const onCounsellingTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowCounsellingTimePicker(false);
        }
        if (selectedDate) {
            handleInputChange("counsellingTime", formatTime(selectedDate));
        }
    };

    const onConfessionDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowConfessionDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = getCurrentDate();
            // Check if selected date is in the past
            if (selectedDate < currentDate) {
                Alert.alert(
                    "Invalid Date", 
                    "Please select a future date for confession.",
                    [{ text: "OK" }]
                );
                return;
            }
            handleInputChange("confessionDate", formatDate(selectedDate));
        }
    };

    const onConfessionTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowConfessionTimePicker(false);
        }
        if (selectedDate) {
            handleInputChange("confessionTime", formatTime(selectedDate));
        }
    };

    const resetFormAndGoToDashboard = () => {
        setFormData({
            ...initialFormState,
            email_norm: loggedInUser?.email ? loggedInUser.email.toLowerCase().trim() : "guest@example.com"
        });
        navigation.goBack();
    };

    const handleConfirmSubmit = async () => {
        // Final date validation before submission
        const currentDate = getCurrentDate();
        
        // Validate wedding date
        if (formData.weddingDate && formData.weddingDate !== "N/A") {
            const weddingDate = new Date(formData.weddingDate);
            if (weddingDate < currentDate) {
                Alert.alert("Invalid Date", "Wedding date must be in the future.");
                return;
            }
        }

        // Validate payment date
        if (formData.paymentDate && formData.paymentDate !== "N/A") {
            const paymentDate = new Date(formData.paymentDate);
            if (paymentDate < currentDate) {
                Alert.alert("Invalid Date", "Payment date must be in the future.");
                return;
            }
        }

        // Validate all schedule dates
        const scheduleDates = [
            { field: "parishScheduleDate", label: "Parish Schedule" },
            { field: "priestInterviewDate", label: "Priest Interview" },
            { field: "seminarDate", label: "Seminar" },
            { field: "counsellingDate", label: "Counselling" },
            { field: "confessionDate", label: "Confession" }
        ];

        for (const { field, label } of scheduleDates) {
            if (formData[field] && formData[field] !== "N/A") {
                const scheduleDate = new Date(formData[field]);
                if (scheduleDate < currentDate) {
                    Alert.alert("Invalid Date", `${label} date must be in the future.`);
                    return;
                }
            }
        }

        closePreviewModal();

        try {
            const serverUrl = "http://192.168.1.18/system/wedding_submit.php";

            // Combine date and time fields before sending to server
            const dataToSend = {
                ...formData,
                parishSchedule: formData.parishScheduleDate && formData.parishScheduleTime 
                    ? `${formData.parishScheduleDate} ${formData.parishScheduleTime}`
                    : "",
                priestInterview: formData.priestInterviewDate && formData.priestInterviewTime 
                    ? `${formData.priestInterviewDate} ${formData.priestInterviewTime}`
                    : "",
                seminar: formData.seminarDate && formData.seminarTime 
                    ? `${formData.seminarDate} ${formData.seminarTime}`
                    : "",
                counselling: formData.counsellingDate && formData.counsellingTime 
                    ? `${formData.counsellingDate} ${formData.counsellingTime}`
                    : "",
                confession: formData.confessionDate && formData.confessionTime 
                    ? `${formData.confessionDate} ${formData.confessionTime}`
                    : "",
            };

            console.log("Submitting wedding data:", dataToSend);

            const response = await fetch(serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            const text = await response.text();
            console.log("📦 Raw wedding submission response:", text);

            if (!text) {
                Alert.alert("Server Error", "Server returned an empty response for wedding form.");
                return;
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(text);
            } catch (parseError) {
                console.error("❌ JSON parsing error for wedding form:", parseError, "Raw text:", text);
                Alert.alert("Server Error", "Received invalid data from server for wedding form.");
                return;
            }

            if (jsonResponse.status === "success") {
                Alert.alert(
                    "WEDDING DATA SUBMITTED",
                    jsonResponse.message || "Kindly wait for the administrator to review and respond.",
                    [{ text: "OK", onPress: () => resetFormAndGoToDashboard() }]
                );
            } else {
                Alert.alert("Submission Failed", jsonResponse.message || "An unknown error occurred during submission.");
            }

        } catch (error) {
            console.error("❌ Network or Server Error during wedding submission:", error);
            Alert.alert(
                "Network Error",
                `Could not connect to the server. Please check your internet connection. Details: ${error.message}`
            );
        }
    };

    const handleSubmit = () => {
        // Date validation before preview
        const currentDate = getCurrentDate();
        
        // Validate wedding date
        if (formData.weddingDate && formData.weddingDate !== "N/A") {
            const weddingDate = new Date(formData.weddingDate);
            if (weddingDate < currentDate) {
                Alert.alert("Invalid Date", "Wedding date must be in the future.");
                return;
            }
        }

        // Validate payment date
        if (formData.paymentDate && formData.paymentDate !== "N/A") {
            const paymentDate = new Date(formData.paymentDate);
            if (paymentDate < currentDate) {
                Alert.alert("Invalid Date", "Payment date must be in the future.");
                return;
            }
        }

        // Validate all schedule dates
        const scheduleDates = [
            { field: "parishScheduleDate", label: "Parish Schedule" },
            { field: "priestInterviewDate", label: "Priest Interview" },
            { field: "seminarDate", label: "Seminar" },
            { field: "counsellingDate", label: "Counselling" },
            { field: "confessionDate", label: "Confession" }
        ];

        for (const { field, label } of scheduleDates) {
            if (formData[field] && formData[field] !== "N/A") {
                const scheduleDate = new Date(formData[field]);
                if (scheduleDate < currentDate) {
                    Alert.alert("Invalid Date", `${label} date must be in the future.`);
                    return;
                }
            }
        }

        console.log("Current formData:", formData);

        for (let key in formData) {
            if (typeof formData[key] === 'string' && formData[key].trim() === '') {
                Alert.alert("Error", `Kailangan punan ang lahat ng kinakailangang impormasyon: ${key.replace(/([A-Z])/g, ' $1').toUpperCase()}`);
                return;
            } else if (formData[key] === null || formData[key] === undefined) {
                 Alert.alert("Error", `Kailangan punan ang lahat ng kinakailangang impormasyon: ${key.replace(/([A-Z])/g, ' $1').toUpperCase()}`);
                 return;
            }
        }

        openPreviewModal();
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

    const requirements = [
        "Bagong Baptismal Certificate ng Lalaki (May tatak na for Marriage Purpose)",
        "Bagong Confirmation Certificate ng Lalaki (May tatak na for Marriage Purpose)",
        "Bagong Baptismal Certificate ng Babae (May tatak na for Marriage Purpose)",
        "Bagong Confirmation Certificate ng Babae (May tatak na for Marriage Purpose)",
        "Lisensya ng Kasal galing Munisipyo (No License, No Wedding)",
        "Kung kasal sa Huwes: License No., Reg.No., Date, Place",
        "ARTICLE 34 Affidavit (Kung nagsasama na ng 5 taon pataas ang ikakasal)",
        "Tawag sa Parokya ng Lalaki (Banns) kung hindi sakop ng Parokya",
        "Tawag at Permiso sa Parokya ng Babae (Banns and Permit) kung hindi sakop ng Parokya",
        "Pangalan ng magiging Ninong at Ninang sa kasal (Hindi hihigit sa 10 pares)",
        "Pahintulot galing Obispo (Dispensation of Banns) kung kulang sa tawag o Mixed Marriage)",
        "Death Certificate ng dating asawa kung biyodo/biyuda",
        "Original Copy ng Birth Certificate ng Lalaki",
        "Original Copy ng Birth Certificate ng Babae",
        "Original Copy ng CENOMAR ng Lalaki",
        "Original Copy ng CENOMAR ng Babae",
        "2x2 picture ng Lalaki",
        "2x2 picture ng Babae"
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: '#f8f9fa' }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>KASUNDUAN AT MGA PAPELES NA KAILANGAN NG IKAKASAL</Text>
                    </View>

                    <View style={styles.card}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Apelyido ng mga Ikakasal" 
                            value={formData.surname}
                            onChangeText={(text) => handleInputChange('surname', text)} 
                        />
                        
                        {/* Wedding Date & Time */}
                        <TouchableOpacity 
                            style={styles.dateInput}
                            onPress={() => setShowWeddingDatePicker(true)}
                        >
                            <Text style={formData.weddingDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                {formData.weddingDate || "Petsa ng Kasal (Pindutin para pumili)"}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.dateInput}
                            onPress={() => setShowWeddingTimePicker(true)}
                        >
                            <Text style={formData.weddingTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                                {formData.weddingTime || "Oras ng Kasal (Pindutin para pumili)"}
                            </Text>
                            <Ionicons name="time" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Groom and Bride sections remain the same */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Lalaki</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Telepono/Cellphone" 
                            keyboardType="phone-pad"
                            value={formData.malePhone}
                            onChangeText={(text) => handleInputChange('malePhone', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Katayuan (Status)" 
                            value={formData.maleStatus}
                            onChangeText={(text) => handleInputChange('maleStatus', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Edad" 
                            keyboardType="numeric"
                            value={formData.maleAge}
                            onChangeText={(text) => handleInputChange('maleAge', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Taga-saan" 
                            value={formData.maleAddress}
                            onChangeText={(text) => handleInputChange('maleAddress', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Tatay" 
                            value={formData.maleFather}
                            onChangeText={(text) => handleInputChange('maleFather', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Nanay" 
                            value={formData.maleMother}
                            onChangeText={(text) => handleInputChange('maleMother', text)} 
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Babae</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Telepono/Cellphone" 
                            keyboardType="phone-pad"
                            value={formData.femalePhone}
                            onChangeText={(text) => handleInputChange('femalePhone', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Katayuan (Status)" 
                            value={formData.femaleStatus}
                            onChangeText={(text) => handleInputChange('femaleStatus', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Edad" 
                            keyboardType="numeric"
                            value={formData.femaleAge}
                            onChangeText={(text) => handleInputChange('femaleAge', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Taga-saan" 
                            value={formData.femaleAddress}
                            onChangeText={(text) => handleInputChange('femaleAddress', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Tatay" 
                            value={formData.femaleFather}
                            onChangeText={(text) => handleInputChange('femaleFather', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Nanay" 
                            value={formData.femaleMother}
                            onChangeText={(text) => handleInputChange('femaleMother', text)} 
                        />
                    </View>

                    {/* UPDATED: Schedule Details with Date Pickers and N/A Options */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Schedule Details</Text>
                        
                        {/* Parish Schedule with N/A Options */}
                        <Text style={styles.subSectionTitle}>Petsa at Oras sa Tanggapan ng Parokya</Text>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowParishDatePicker(true)}
                            >
                                <Text style={formData.parishScheduleDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.parishScheduleDate || "Petsa sa Parokya (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("parishScheduleDate")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowParishTimePicker(true)}
                            >
                                <Text style={formData.parishScheduleTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.parishScheduleTime || "Oras sa Parokya (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="time" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("parishScheduleTime")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Priest Interview with N/A Options */}
                        <Text style={styles.subSectionTitle}>Interview ng Pari</Text>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowPriestDatePicker(true)}
                            >
                                <Text style={formData.priestInterviewDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.priestInterviewDate || "Petsa ng Interview (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("priestInterviewDate")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowPriestTimePicker(true)}
                            >
                                <Text style={formData.priestInterviewTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.priestInterviewTime || "Oras ng Interview (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="time" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("priestInterviewTime")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Catechetical Seminar with N/A Options */}
                        <Text style={styles.subSectionTitle}>Catechetical Seminar</Text>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowSeminarDatePicker(true)}
                            >
                                <Text style={formData.seminarDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.seminarDate || "Petsa ng Seminar (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("seminarDate")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowSeminarTimePicker(true)}
                            >
                                <Text style={formData.seminarTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.seminarTime || "Oras ng Seminar (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="time" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("seminarTime")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Pre-cana Counselling with N/A Options */}
                        <Text style={styles.subSectionTitle}>Pre-cana Counselling</Text>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowCounsellingDatePicker(true)}
                            >
                                <Text style={formData.counsellingDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.counsellingDate || "Petsa ng Counselling (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("counsellingDate")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowCounsellingTimePicker(true)}
                            >
                                <Text style={formData.counsellingTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.counsellingTime || "Oras ng Counselling (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="time" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("counsellingTime")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Confession with N/A Options */}
                        <Text style={styles.subSectionTitle}>Kumpisal sa Pari</Text>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowConfessionDatePicker(true)}
                            >
                                <Text style={formData.confessionDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.confessionDate || "Petsa ng Kumpisal (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("confessionDate")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowConfessionTimePicker(true)}
                            >
                                <Text style={formData.confessionTime ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.confessionTime || "Oras ng Kumpisal (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="time" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("confessionTime")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Baptism/Confirmation (remains text input) */}
                        <TextInput 
                            style={styles.input} 
                            placeholder="Binyag o Kumpil" 
                            value={formData.baptismConfirmation}
                            onChangeText={(text) => handleInputChange('baptismConfirmation', text)} 
                        />
                    </View>

                    <View style={[styles.card, styles.noticeContainer]}>
                        <Text style={styles.noticeTitle}>NOTICE!</Text>
                        <Text style={styles.noticeText}>* Hindi matutuloy ang kasal kung may kulang sa papeles.</Text>
                        <Text style={styles.noticeText}>* 15 minutes lang, walang misa.</Text>
                        <Text style={styles.noticeText}>* 30 minutes late seminar = re-schedule.</Text>
                        <Text style={styles.noticeText}>* Kailangan magdeposito ng Php 1,000 (Non-refundable).</Text>
                        <Text style={styles.noticeText}>* Kumpletuhin ang dokumento dalawang Linggo bago ang kasal.</Text>
                    </View>

                    <View style={[styles.card, styles.paymentContainer]}>
                        <Text style={styles.sectionTitle}>Mga Babayaran</Text>
                        <Text style={styles.paymentItem}>Nuptial Mass - Php 8,000 (Incl. Telang gayak at choir)</Text>
                        <Text style={styles.paymentItem}>Additional Flowers - Php 2,000</Text>
                        <Text style={styles.paymentItem}>Wedding Rite Only - Php 4,000</Text>
                        
                        {/* Payment Date with N/A Option */}
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={[styles.dateInput, { flex: 1 }]}
                                onPress={() => setShowPaymentDatePicker(true)}
                            >
                                <Text style={formData.paymentDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                                    {formData.paymentDate || "Petsa ng Bayad (Pindutin para pumili)"}
                                </Text>
                                <Ionicons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("paymentDate")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* A.R. No. with N/A Option */}
                        <View style={styles.inputWithNA}>
                            <TextInput 
                                style={[styles.input, { flex: 1 }]} 
                                placeholder="A.R No." 
                                value={formData.arNo}
                                onChangeText={(text) => handleInputChange('arNo', text)} 
                            />
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("arNo")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>

                        {/* PhP with N/A Option */}
                        <View style={styles.inputWithNA}>
                            <TextInput 
                                style={[styles.input, { flex: 1 }]} 
                                placeholder="Php" 
                                keyboardType="numeric"
                                value={formData.paymentAmount}
                                onChangeText={(text) => handleInputChange('paymentAmount', text)} 
                            />
                            <TouchableOpacity
                                style={styles.naButton}
                                onPress={() => handleNAOption("paymentAmount")}
                            >
                                <Text style={styles.naButtonText}>N/A</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* All Date Pickers with minimumDate */}
                    {showWeddingDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onWeddingDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showWeddingTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onWeddingTimeChange}
                        />
                    )}

                    {showPaymentDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onPaymentDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showParishDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onParishDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showParishTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onParishTimeChange}
                        />
                    )}

                    {showPriestDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onPriestDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showPriestTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onPriestTimeChange}
                        />
                    )}

                    {showSeminarDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onSeminarDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showSeminarTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onSeminarTimeChange}
                        />
                    )}

                    {showCounsellingDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onCounsellingDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showCounsellingTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onCounsellingTimeChange}
                        />
                    )}

                    {showConfessionDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onConfessionDateChange}
                            minimumDate={new Date()} // Block past dates
                        />
                    )}

                    {showConfessionTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onConfessionTimeChange}
                        />
                    )}

                    {/* Buttons */}
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

                    {/* Improved Requirements Modal */}
                    <Modal visible={requirementsModalVisible} animationType="fade" transparent>
                        <View style={demandStyles.modalContainer}>
                            <View style={demandStyles.modalContent}>
                                <View style={demandStyles.header}>
                                    <Text style={demandStyles.title}>Requirements for Wedding</Text>
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
                                                    <Text style={demandStyles.reminderTitle}>Fee Options</Text>
                                                </View>
                                                <View style={demandStyles.feeOption}>
                                                    <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                                                    <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Nuptial Mass - ₱8,000</Text> (Includes decorations and choir)</Text>
                                                </View>
                                                <View style={demandStyles.feeOption}>
                                                    <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                                                    <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Wedding Rite Only - ₱4,000</Text></Text>
                                                </View>
                                                <View style={demandStyles.feeOption}>
                                                    <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                                                    <Text style={demandStyles.feeText}><Text style={demandStyles.bold}>Additional Flowers - ₱2,000</Text></Text>
                                                </View>
                                            </View>
                                            
                                            <View style={demandStyles.note}>
                                                <Ionicons name="time" size={16} color="#f39c12" />
                                                <Text style={demandStyles.noteText}>Please submit all requirements at least two weeks before the wedding date.</Text>
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

                    {/* Preview Modal - Updated to show separate date and time for schedule details */}
                    <Modal visible={previewModalVisible} animationType="fade" transparent>
                        <View style={previewStyles.modalContainer}>
                            <Animated.View style={[previewStyles.modalContent, { opacity: fadeAnim }]}>
                                <View style={previewStyles.modalHeader}>
                                    <Text style={previewStyles.modalTitle}>Wedding Form Preview</Text>
                                    <Text style={previewStyles.modalSubtitle}>Please review your information before submitting</Text>
                                </View>

                                <ScrollView style={previewStyles.scrollContainer}>
                                    <PreviewSection title="Couple Information" icon="people">
                                        <PreviewField label="Surname" value={formData.surname} />
                                        <PreviewField label="Wedding Date" value={formData.weddingDate} />
                                        <PreviewField label="Wedding Time" value={formData.weddingTime} />
                                    </PreviewSection>

                                    <PreviewSection title="Groom's Information" icon="man">
                                        <PreviewField label="Phone" value={formData.malePhone} />
                                        <PreviewField label="Status" value={formData.maleStatus} />
                                        <PreviewField label="Age" value={formData.maleAge} />
                                        <PreviewField label="Address" value={formData.maleAddress} />
                                        <PreviewField label="Father" value={formData.maleFather} />
                                        <PreviewField label="Mother" value={formData.maleMother} />
                                    </PreviewSection>

                                    <PreviewSection title="Bride's Information" icon="woman">
                                        <PreviewField label="Phone" value={formData.femalePhone} />
                                        <PreviewField label="Status" value={formData.femaleStatus} />
                                        <PreviewField label="Age" value={formData.femaleAge} />
                                        <PreviewField label="Address" value={formData.femaleAddress} />
                                        <PreviewField label="Father" value={formData.femaleFather} />
                                        <PreviewField label="Mother" value={formData.femaleMother} />
                                    </PreviewSection>

                                    <PreviewSection title="Schedule Details" icon="calendar">
                                        <PreviewField label="Parish Schedule Date" value={formData.parishScheduleDate} />
                                        <PreviewField label="Parish Schedule Time" value={formData.parishScheduleTime} />
                                        <PreviewField label="Priest Interview Date" value={formData.priestInterviewDate} />
                                        <PreviewField label="Priest Interview Time" value={formData.priestInterviewTime} />
                                        <PreviewField label="Seminar Date" value={formData.seminarDate} />
                                        <PreviewField label="Seminar Time" value={formData.seminarTime} />
                                        <PreviewField label="Counselling Date" value={formData.counsellingDate} />
                                        <PreviewField label="Counselling Time" value={formData.counsellingTime} />
                                        <PreviewField label="Confession Date" value={formData.confessionDate} />
                                        <PreviewField label="Confession Time" value={formData.confessionTime} />
                                        <PreviewField label="Baptism/Confirmation" value={formData.baptismConfirmation} />
                                    </PreviewSection>

                                    <PreviewSection title="Payment Information" icon="card">
                                        <PreviewField label="Payment Date" value={formData.paymentDate} />
                                        <PreviewField label="A.R. No." value={formData.arNo} />
                                        <PreviewField label="Amount" value={formData.paymentAmount} />
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
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        paddingBottom: 40
    },
    header: {
        marginBottom: 30,
        backgroundColor: '#fff',
        padding: 50,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#2c3e50',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 5,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#3498db',
        marginTop: 10,
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
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
    inputWithNA: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
    noticeContainer: {
        backgroundColor: '#fff3cd',
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    noticeText: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 4,
    },
    paymentContainer: {
        backgroundColor: '#d4edda',
        borderLeftWidth: 4,
        borderLeftColor: '#28a745',
    },
    paymentItem: {
        fontSize: 14,
        fontWeight: '600',
        color: '#155724',
        marginBottom: 8,
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

export default WeddingFormScreen;