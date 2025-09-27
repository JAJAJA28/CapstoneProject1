// LoginScreen.js
import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Animated,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import { AuthContext } from "../AuthContext";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { setLoggedInUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Error", "Please fill in both fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.34/system/login.php",
        { email, password }
      );

      if (response.data.status === "success") {
        setLoggedInUser(response.data.user);
        Alert.alert("Login Successful", `Welcome ${response.data.user.name || ""}!`);
      } else {
        Alert.alert("Login Failed", response.data.message);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Error", "Something went wrong while logging in.");
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
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtext}>Please sign in to access your account</Text>
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
            <Text style={styles.loginTitle}>Log In</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotPasswordBtn}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  loginTitle: { 
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.03,
    flexWrap: "wrap",
  },
  registerText: { 
    fontSize: width * 0.038,
    color: "#666",
  },
  linkText: { 
    color: "#007AFF", 
    fontWeight: "bold",
    fontSize: width * 0.038,
    marginLeft: 5,
  },
});

export default LoginScreen;