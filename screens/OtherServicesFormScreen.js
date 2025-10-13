import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  useColorScheme
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const OtherServicesScreenForm = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const services = [
    {
      id: 1,
      title: "Pamisa sa Patay",
      description: "Request for memorial masses and funeral services",
      icon: "cross",
      color: "#1a6b8e",
      screen: "PamisaSaPatay",
    },
    {
      id: 2,
      title: "Blessing",
      description: "Home, vehicle, and personal blessings",
      icon: "hands-pray",
      color: "#219ebc",
      screen: "Blessing",
    },
    {
      id: 3,
      title: "Pamisa",
      description: "Schedule your regular masses and prayers",
      icon: "church",
      color: "#8ecae6",
      screen: "Pamisa",
    }
  ];

  const infoItems = [
    {
      id: 1,
      icon: "time-outline",
      color: "#1a6b8e",
      title: "Processing Time",
      text: "Requests are typically processed within 24-48 hours"
    },
    {
      id: 2,
      icon: "checkmark-done-outline",
      color: "#219ebc",
      title: "Confirmation",
      text: "You will receive a confirmation once your request is scheduled"
    },
    {
      id: 3,
      icon: "call-outline",
      color: "#8ecae6",
      title: "Urgent Requests",
      text: "For urgent requests, please contact the parish office directly"
    }
  ];

  const [activeCard, setActiveCard] = useState(null);

  const handleCardPressIn = (id) => {
    setActiveCard(id);
  };

  const handleCardPressOut = () => {
    setActiveCard(null);
  };

  const renderServiceCard = (service, index) => (
    <Animated.View 
      key={service.id}
      style={[
        { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          activeCard === service.id && styles.cardActive,
          { borderLeftColor: service.color, borderLeftWidth: 4 }
        ]}
        onPress={() => navigation.navigate(service.screen)}
        onPressIn={() => handleCardPressIn(service.id)}
        onPressOut={handleCardPressOut}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={[styles.cardIconContainer, { backgroundColor: service.color }]}>
            <MaterialCommunityIcons name={service.icon} size={isSmallDevice ? 24 : 28} color="#fff" />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFF' : '#2c3e50' }]}>{service.title}</Text>
            <Text style={[styles.cardDesc, { color: isDarkMode ? '#CCCCCC' : '#666' }]}>{service.description}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#999' : '#888'} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderInfoItem = (item) => (
    <Animated.View 
      key={item.id} 
      style={[
        styles.infoItem,
        { transform: [{ translateY: cardSlideAnim }], opacity: fadeAnim }
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={18} color="#FFF" />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoTitle, { color: isDarkMode ? '#FFF' : '#2c3e50' }]}>{item.title}</Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#CCCCCC' : '#666' }]}>{item.text}</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F5F7FA' }]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['rgba(255, 226, 89, 0.8)', 'rgba(255, 167, 81, 0.8)']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Spiritual Services</Text>
              <Text style={styles.subtitle}>Request prayers, blessings, and masses</Text>
            </View>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="hands-pray" size={28} color="#fff" />
            </View>
          </View>

          {/* Welcome Section */}
          <Animated.View 
            style={[
              styles.welcomeContainer, 
              { 
                backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
                transform: [{ translateY: cardSlideAnim }]
              }
            ]}
          >
            <Text style={[styles.welcomeText, { color: isDarkMode ? '#FFF' : '#2c3e50' }]}>How can we serve you today?</Text>
            <Text style={[styles.description, { color: isDarkMode ? '#CCCCCC' : '#666' }]}>
              Select from our spiritual services to request prayers, blessings, or masses. 
              Our parish is here to support your spiritual journey.
            </Text>
          </Animated.View>

          {/* Service Cards */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#2c3e50' }]}>Available Services</Text>
            <View style={[styles.sectionLine, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />
          </View>
          
          <View style={styles.cardsContainer}>
            {services.map((service, index) => renderServiceCard(service, index))}
          </View>

          {/* Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#2c3e50' }]}>Important Information</Text>
            <View style={[styles.sectionLine, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />
          </View>
          
          <View style={[
            styles.infoContainer, 
            { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }
          ]}>
            {infoItems.map(item => renderInfoItem(item))}
          </View>

          {/* Footer Note */}
          <Animated.View 
            style={[
              styles.footer, 
              { 
                backgroundColor: isDarkMode ? 'rgba(26, 107, 142, 0.15)' : 'rgba(26, 107, 142, 0.08)',
                transform: [{ translateY: cardSlideAnim }]
              }
            ]}
          >
            <View style={styles.footerHeader}>
              <Ionicons name="help-circle-outline" size={22} color={isDarkMode ? '#FFF' : '#2c3e50'} />
              <Text style={[styles.footerTitle, { color: isDarkMode ? '#FFF' : '#2c3e50' }]}>Need assistance?</Text>
            </View>
            <Text style={[styles.footerText, { color: isDarkMode ? '#CCCCCC' : '#666' }]}>
              Contact us at contact@srapmontalban.org or call 284750837
            </Text>
            <Text style={[styles.footerHours, { color: isDarkMode ? '#CCCCCC' : '#666' }]}>
              Monday: Closed
            </Text>
            <Text style={[styles.footerHours, { color: isDarkMode ? '#CCCCCC' : '#666' }]}>
              Office hours: Tuesday-Saturday 8:00 AM - 5:00 PM
            </Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingTop: 35,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: '#2d3436',
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    fontWeight: '500',
    textAlign: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContainer: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.25,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    flexShrink: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardActive: {
    transform: [{ scale: 0.99 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  infoContainer: {
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
  },
  footerHours: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default OtherServicesScreenForm;