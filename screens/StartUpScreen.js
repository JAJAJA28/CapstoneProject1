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
    Animated.spring(warningScaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

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

  // SIMPLE NAVIGATION LANG - WAG GUMAMIT NG REPLACE
  const handleNavigateTo = (screenName) => {
    navigation.navigate(screenName);
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
            <Ionicons name="location" size={44} color="#D84315" />
            <Text style={styles.warningTitle}>GEOGRAPHICAL RESTRICTION</Text>
          </View>

          <ScrollView 
            style={styles.warningContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.importantNotice}>
              <Ionicons name="alert-circle" size={24} color="#D84315" />
              <Text style={styles.importantNoticeText}>
                FOR PARISHIONERS ONLY
              </Text>
            </View>

            <Text style={styles.warningText}>
              Ang Mobile Application na ito ay para LAMANG sa mga LEGITIMONG PARISHIONER ng PAROKYA NG SAN RAFAEL ARKANGHEL, MONTALBAN RIZAL.
            </Text>
            
            <View style={styles.transactionWarning}>
              <Ionicons name="warning" size={20} color="#D84315" />
              <Text style={styles.transactionWarningText}>
                MGA TRANSACTION AY HINDI MA-PROPROSESO KUNG HINDI LEGITIMONG NASAKUPAN NG PAROKYA
              </Text>
            </View>

            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Available Features for Parishioners:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.featureText}>Sacrament Reservations</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.featureText}>Certificate Issuance</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.featureText}>Mass Schedules</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.featureText}>Realtime</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.featureText}>Donations</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.agreementSection}>
            <Text style={styles.agreementText}>
              By continuing, I confirm that I am a legitimate parishioner of St. Raphael the Archangel Parish within the covered areas.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
            <Text style={styles.continueButtonText}>CONFIRM & CONTINUE</Text>
          </TouchableOpacity>

          <View style={styles.warningFooter}>
            <Text style={styles.footerText}>
              St. Raphael the Archangel Parish • Diocese of Antipolo
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
          <Text style={styles.welcomeText}>Welcome Parishioner!</Text>
          <Text style={styles.welcomeSubtext}>Access exclusive parish services</Text>
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
        <View style={styles.illustrationContainer}>
          <Image 
            source={require("../assets/IMG3.png")} 
            style={styles.mainIllustration} 
          />
        </View>

        <Text style={styles.appTagline}>
          <Text style={styles.appTaglineBold}>
            Exclusive Parish Mobile App{'\n'}
          </Text>
          For St. Raphael the Archangel Parishioners
        </Text>

        <View style={styles.coverageReminder}>
          <Ionicons name="information-circle" size={16} color="#636e72" />
          <Text style={styles.coverageReminderText}>
            Available only for legitimate parishioners within parish coverage
          </Text>
        </View>

        {/* SIMPLE NAVIGATION LANG */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.createAccountButtonText}>Register as Parishioner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="log-in" size={20} color="#6A9B6B" />
          <Text style={styles.loginButtonText}>
            Existing Parishioner Login
          </Text>
        </TouchableOpacity>

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
    fontSize: width * 0.04,
    textAlign: "center",
    marginBottom: height * 0.03,
    color: '#636e72',
    lineHeight: width * 0.055,
  },
  appTaglineBold: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    color: '#2d3436',
  },
  coverageReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.04,
    paddingHorizontal: 10,
    backgroundColor: '#FFF9C4',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  coverageReminderText: {
    fontSize: width * 0.03,
    color: '#5D4037',
    marginLeft: 6,
    fontStyle: 'italic',
    fontWeight: '500',
    flex: 1,
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
    flexDirection: 'row',
  },
  createAccountButtonText: {
    color: "white",
    fontSize: width * 0.04,
    fontWeight: "bold",
    marginLeft: 8,
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
    flexDirection: 'row',
  },
  loginButtonText: {
    color: "#6A9B6B",
    fontSize: width * 0.038,
    fontWeight: "bold",
    marginLeft: 8,
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
    fontWeight: '500',
  },
  // Warning Modal Styles
  warningModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  warningModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  warningHeader: {
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  warningTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#D84315',
    marginTop: 8,
    textAlign: 'center',
  },
  importantNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#D84315',
  },
  importantNoticeText: {
    fontSize: width * 0.038,
    fontWeight: 'bold',
    color: '#D84315',
    marginLeft: 8,
  },
  warningContent: {
    flexGrow: 0,
    maxHeight: height * 0.5,
  },
  warningText: {
    fontSize: width * 0.038,
    textAlign: 'center',
    lineHeight: 22,
    color: '#333',
    marginBottom: 20,
    fontWeight: '600',
  },
  transactionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  transactionWarningText: {
    fontSize: width * 0.032,
    color: '#E65100',
    marginLeft: 8,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 15,
  },
  featuresTitle: {
    fontSize: width * 0.036,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 5,
  },
  featureText: {
    fontSize: width * 0.032,
    color: '#2D3748',
    marginLeft: 10,
    fontWeight: '500',
  },
  agreementSection: {
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  agreementText: {
    fontSize: width * 0.032,
    color: '#22543D',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: width * 0.038,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: width * 0.03,
    color: '#757575',
    textAlign: 'center',
    fontWeight: '500',
  },
});