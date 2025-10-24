// ForgotPasswordScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (countdown > 0) {
      Alert.alert("Please wait", `You can resend OTP in ${countdown} seconds`);
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔄 Sending OTP request for:", email);
      
      let response = await fetch("http://192.168.1.18/system/send_otp_phpmailer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      console.log("📡 Response status:", response.status);
      
      let text = await response.text();
      console.log("📄 Raw response:", text);
      
      let result = JSON.parse(text);
      console.log("✅ Parsed result:", result);

      if (result.success) {
        setCountdown(60);
        Alert.alert("✅ Success", result.message);
        setStep(2);
      } else {
        Alert.alert("❌ Error", result.message);
      }
    } catch (err) {
      console.log("💥 Error details:", err);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    try {
      let response = await fetch("http://192.168.1.18/system/verify_reset_otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      let result = await response.json();

      if (result.success) {
        Alert.alert("✅ Verified", "OTP verified successfully");
        setStep(3);
      } else {
        Alert.alert("❌ Error", result.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter your new password");
      return;
    }

    // Strong Password Policy Check
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and include:\n- 1 uppercase letter\n- 1 lowercase letter\n- 1 number\n- 1 special character"
      );
      return;
    }

    setIsLoading(true);
    try {
      let response = await fetch("http://192.168.1.18/system/reset_password_with_otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      let result = await response.json();

      if (result.success) {
        Alert.alert("✅ Success", "Password reset successfully!", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        Alert.alert("❌ Error", result.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.loginTitle}>🔑 Forgot Password</Text>
      <Text style={styles.stepSubtitle}>
        Enter your email address and we'll send you a code to reset your password.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          placeholder="Enter your registered email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Code</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.loginTitle}>📧 Enter OTP</Text>
      <Text style={styles.stepSubtitle}>
        We sent a 6-digit code to {email}. Enter it below.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          placeholder="Enter 6-digit code"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.forgotPasswordBtn, countdown > 0 && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={countdown > 0}
      >
        <Text style={styles.forgotPasswordText}>
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.loginTitle}>🔄 New Password</Text>
      <Text style={styles.stepSubtitle}>
        Create your new password
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity 
        onPress={() => setShowPassword(!showPassword)}
        style={styles.showPasswordBtn}
      >
        <Text style={styles.showPasswordText}>
          {showPassword ? "Hide Password" : "Show Password"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['rgba(255, 226, 89, 0.8)', 'rgba(255, 167, 81, 0.8)']}
        style={styles.background}
      />
      
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Image source={require("../assets/IMG3.png")} style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.churchName}>ST. RAPHAEL THE ARCHANGEL</Text>
            <Text style={styles.churchName}>PARISH</Text>
            <Text style={styles.subtitle}>Diocese of Antipolo</Text>
            <Text style={styles.subtitle}>Montalban, Rizal, 1860</Text>
          </View>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Password Recovery</Text>
          <Text style={styles.welcomeSubtext}>Follow the steps to reset your password</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.step, step >= 1 && styles.stepActive]}>
                <Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</Text>
              </View>
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.step, step >= 2 && styles.stepActive]}>
                <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</Text>
              </View>
              <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
              <View style={[styles.step, step >= 3 && styles.stepActive]}>
                <Text style={[styles.stepText, step >= 3 && styles.stepTextActive]}>3</Text>
              </View>
            </View>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <TouchableOpacity 
              style={styles.forgotPasswordBtn}
              onPress={() => step === 1 ? navigation.goBack() : setStep(step - 1)}
            >
              <Text style={styles.forgotPasswordText}>
                {step === 1 ? "Back to Login" : "Go Back"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.4,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.03,
  },
  headerContent: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: height * 0.02,
  },
  titleContainer: {
    marginLeft: width * 0.03,
  },
  logo: { 
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: "contain",
    borderRadius: (width * 0.18) / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  churchName: { 
    fontSize: width * 0.045, 
    fontWeight: "800", 
    textAlign: "left",
    color: '#2d3436',
  },
  subtitle: { 
    fontSize: width * 0.03, 
    textAlign: "left", 
    marginTop: 2,
    color: '#636e72',
    fontWeight: '500',
  },
  welcomeContainer: {
    marginTop: height * 0.01,
  },
  welcomeText: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: width * 0.035,
    color: '#636e72',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: "white",
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
    padding: width * 0.06,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: height * 0.05,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.03,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#6A9B6B',
  },
  stepText: {
    color: '#999',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepTextActive: {
    color: 'white',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#6A9B6B',
  },
  loginTitle: { 
    fontSize: width * 0.07, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: height * 0.02,
    color: "#2d3436"
  },
  stepSubtitle: {
    fontSize: width * 0.035,
    textAlign: "center",
    color: "#666",
    marginBottom: height * 0.03,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: height * 0.025,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: { 
    width: "100%", 
    height: height * 0.06, 
    borderWidth: 1.5, 
    borderColor: "#ddd", 
    borderRadius: 12, 
    paddingHorizontal: width * 0.04, 
    fontSize: width * 0.04, 
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: { 
    width: "100%", 
    height: height * 0.065, 
    backgroundColor: "#6A9B6B", 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 12, 
    marginTop: height * 0.01,
    shadowColor: "#6A9B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    color: "white", 
    fontSize: width * 0.045, 
    fontWeight: "bold" 
  },
  showPasswordBtn: { 
    alignSelf: "flex-end", 
    marginBottom: 20,
    padding: 5 
  },
  showPasswordText: { 
    color: "#6a1b9a", 
    fontSize: 14, 
    fontWeight: "600" 
  },
  forgotPasswordBtn: {
    alignSelf: "center",
    marginTop: 15,
    padding: 10,
  },
  forgotPasswordText: { 
    color: "#007AFF", 
    fontWeight: "bold",
    fontSize: width * 0.038,
  },
});