// StartupScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Animated,
  Modal,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

export default function StartupScreen() {
  const navigation = useNavigation();
  const [showWarning, setShowWarning] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const warningScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!showWarning) {
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
    }
  }, [showWarning]);

  const handleContinue = () => {
    setShowWarning(false);
  };

  const renderWarningModal = () => (
    <Modal
      visible={showWarning}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.warningModalContainer}>
        <Animated.View 
          style={[
            styles.warningModal,
            {
              transform: [{ scale: warningScaleAnim }]
            }
          ]}
        >
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={40} color="#FFA726" />
            <Text style={styles.warningTitle}>IMPORTANT NOTICE</Text>
          </View>

          <ScrollView style={styles.warningContent}>
            <Text style={styles.warningText}>
              Ang Mobile Application na ito ay para lamang sa PAROKYA NG SAN RAFAEL ARKANGHEL, MONTALBAN RIZAL, at sa mga nasasakupang lugar ng Parokya.
            </Text>
            
            <View style={styles.warningNote}>
              <Text style={styles.warningNoteText}>
                This mobile application is exclusively for the use of St. Raphael the Archangel Parish, Montalban Rizal, and its covered areas.
              </Text>
            </View>

            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Available Features:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Certificate Requests</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Mass Schedules</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Parish Announcements</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Religious Resources</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>I UNDERSTAND - CONTINUE</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.warningFooter}>
            <Text style={styles.footerText}>
              Bachelor of Science in Computer Technology @SRAP 2025
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  if (showWarning) {
    return renderWarningModal();
  }

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
          <Text style={styles.welcomeText}>Welcome to Our Parish</Text>
          <Text style={styles.welcomeSubtext}>Join our community and stay connected</Text>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        {/* Illustration/Logo */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require("../assets/IMG3.png")} 
            style={styles.mainIllustration} 
          />
        </View>

        {/* Tagline */}
        <Text style={styles.appTagline}>
          <Text style={styles.appTaglineBold}>
            The Official Mobile Application of{'\n'}
          </Text>
          St. Raphael the Archangel Parish
        </Text>

        {/* Create Account Button */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>
            Already have an account?
          </Text>
        </TouchableOpacity>

        {/* Footer in Main Screen */}
        <View style={styles.mainFooter}>
          <Text style={styles.mainFooterText}>
            Bachelor of Science in Computer Technology @SRAP 2025
          </Text>
        </View>

        <StatusBar style="auto" />
      </Animated.View>
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.05,
  },
  illustrationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.04,
  },
  mainIllustration: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: (width * 0.5) / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  appTagline: {
    fontSize: width * 0.045,
    textAlign: "center",
    marginBottom: height * 0.06,
    color: '#636e72',
    lineHeight: width * 0.06,
  },
  appTaglineBold: {
    fontWeight: "bold",
    fontSize: width * 0.05,
    color: '#2d3436',
  },
  createAccountButton: {
    width: "100%",
    height: height * 0.065,
    backgroundColor: "#6A9B6B",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: height * 0.02,
    shadowColor: "#6A9B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  createAccountButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold"
  },
  loginButton: {
    width: "100%",
    height: height * 0.065,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: height * 0.02,
    borderWidth: 2,
    borderColor: "#6A9B6B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: {
    color: "#6A9B6B",
    fontSize: width * 0.04,
    fontWeight: "bold"
  },
  mainFooter: {
    position: 'absolute',
    bottom: height * 0.03,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mainFooterText: {
    fontSize: width * 0.03,
    color: '#636e72',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Warning Modal Styles
  warningModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  warningModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warningHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#D84315',
    marginTop: 10,
    textAlign: 'center',
  },
  warningContent: {
    flexGrow: 0,
  },
  warningText: {
    fontSize: width * 0.04,
    textAlign: 'center',
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
    fontWeight: '600',
  },
  warningNote: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  warningNoteText: {
    fontSize: width * 0.035,
    color: '#E65100',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  featuresList: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 5,
  },
  featureText: {
    fontSize: width * 0.035,
    color: '#333',
    marginLeft: 10,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  continueButtonText: {
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  warningFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: width * 0.03,
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});