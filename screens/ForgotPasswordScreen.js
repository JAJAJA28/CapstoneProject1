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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleReset = async () => {
    if (!email || !oldPassword || !newPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // ✅ Strong Password Policy Check
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long and include:\n- 1 uppercase letter\n- 1 lowercase letter\n- 1 number\n- 1 special character"
      );
      return;
    }

    setIsLoading(true);
    try {
      let response = await fetch("http://192.168.1.18/system/reset_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      let result = await response.json();

      if (result.success) {
        Alert.alert("✅ Success", result.message);
        navigation.goBack();
      } else {
        Alert.alert("❌ Error", result.message);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.welcomeText}>Reset Your Password</Text>
          <Text style={styles.welcomeSubtext}>Enter your details to reset your password</Text>
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
          contentContainerStyle={styles.scrollContainer}
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
            <Text style={styles.title}>🔑 Reset Password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Old Password</Text>
              <TextInput
                placeholder="Enter old password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

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
                {showPassword ? "🙈 Hide Passwords" : "Show Passwords"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Back to Login</Text>
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
  scrollContainer: {
    flexGrow: 1,
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
  title: { 
    fontSize: width * 0.07, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: height * 0.03,
    color: "#2d3436"
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
  backButton: {
    alignSelf: "center",
    marginTop: 15,
    padding: 10,
  },
  backText: { 
    color: "#007AFF", 
    fontWeight: "bold",
    fontSize: width * 0.038,
  },
});