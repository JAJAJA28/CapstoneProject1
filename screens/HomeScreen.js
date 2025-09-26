import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  TouchableOpacity, 
  Image, 
  Modal, 
  ScrollView, 
  Platform,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Linking,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isIOS = Platform.OS === 'ios';

const HomeScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const fadeAnimPray = useRef(new Animated.Value(0)).current;
  const fadeAnimFast = useRef(new Animated.Value(0)).current;
  const fadeAnimGive = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [massModalVisible, setMassModalVisible] = useState(false);
  const [readingsModalVisible, setReadingsModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState({ title: '', text: '' });
  const [activeSlide, setActiveSlide] = useState(0);

  const images = [
    require("../assets/Paeng.jpg"),
    require("../assets/red.jpg"),
    require("../assets/BGAdmin.jpg"),
    require("../assets/mass3.jpg"),
    require("../assets/mass4.jpg"),
    require("../assets/MASS9.jpg"),
    require("../assets/MASS13.jpg"),
    require("../assets/MASS14.jpg"),
    require("../assets/MASS15.jpg"),
    require("../assets/MASS16.jpg"),
  ];

  useEffect(() => {
    // PRAY/HEAL/HOPE animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnimPray, { 
          toValue: 1, 
          duration: 2000, 
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        Animated.timing(fadeAnimFast, { 
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        Animated.timing(fadeAnimGive, { 
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        Animated.timing(fadeAnimPray, { 
          toValue: 0, 
          duration: 1000, 
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        Animated.timing(fadeAnimFast, { 
          toValue: 0, 
          duration: 1000, 
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        Animated.timing(fadeAnimGive, { 
          toValue: 0, 
          duration: 1000, 
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
      ])
    ).start();

    // Entrance animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, []);

  const openPrayerModal = (type) => {
    let prayerData = { title: '', text: '' };
    switch (type) {
      case 'Protection':
        prayerData.title = 'Prayer for Protection';
        prayerData.text = `St. Rafael, please shield us with your protection from harm and danger. 
Grant safety to our families, our friends, and all who are in need of your care. 
Help us to walk securely in faith, hope, and love, trusting in Your divine guidance. Amen.`;
        break;
      case 'Healing':
        prayerData.title = 'Prayer for Healing';
        prayerData.text = `St. Rafael, bring your healing touch to the sick and afflicted. 
Comfort those who are suffering in body, mind, or spirit. 
Restore health, peace, and strength to all in need, and help us to support one another with love and patience. Amen.`;
        break;
      case 'Travelers':
        prayerData.title = 'Prayer for Travelers';
        prayerData.text = `St. Rafael, guide and protect all travelers on their journeys. 
Keep them safe from accidents, delays, and unforeseen dangers. 
Bless their steps with clarity, calm, and divine guidance, and bring them safely to their destinations. Amen.`;
        break;
      case 'Guidance':
        prayerData.title = 'Prayer for Guidance';
        prayerData.text = `St. Rafael, lead us in making the right choices and decisions. 
Open our hearts to discernment, patience, and wisdom. 
Help us follow Your path with courage and trust, and inspire us to act with love and compassion. Amen.`;
        break;
      default:
        break;
    }
    setCurrentPrayer(prayerData);
    setModalVisible(true);
  };

  // Color scheme adjustments
  const backgroundColor = isDarkMode ? '#121212' : '#F8F9FA';
  const cardBackground = isDarkMode ? '#1E1E1E' : '#FFF';
  const textColor = isDarkMode ? '#FFF' : '#2c3e50';
  const secondaryTextColor = isDarkMode ? '#AAAAAA' : '#7f8c8d';
  const headerBg = isDarkMode ? '#1a1a1a' : '#FFF';
  const borderColor = isDarkMode ? '#333' : '#EEE';
  const primaryColor = isDarkMode ? '#7C3AED' : '#6c5ce7';
  const accentColor = isDarkMode ? '#A78BFA' : '#A6D1E6';

  // Mass schedule data
  const massSchedules = [
    { day: 'Monday - Friday', times: ['6:00 AM', '5:30 PM'] },
    { day: 'Saturday', times: ['6:00 AM', '6:00 PM (Anticipated Mass)'] },
    { day: 'Sunday', times: ['5:00 AM', '6:30 AM', '8:00 AM', '9:30 AM', '4:00 PM', '5:30 PM', '7:00 PM'] },
  ];

  // Daily readings data
  const dailyReadings = {
    date: 'November 15, 2023',
    firstReading: {
      title: 'Wisdom 7:22b–8:1',
      text: 'For wisdom, the fashioner of all things, taught me...'
    },
    psalm: {
      title: 'Psalm 119:89, 90, 91, 130, 135, 175',
      text: 'Your word is for ever, O Lord.'
    },
    secondReading: {
      title: '1 Thessalonians 1:5c-10',
      text: 'You turned to God from idols, to serve him who is living and true...'
    },
    gospel: {
      title: 'Matthew 25:14-30',
      text: 'Well done, good and faithful servant...'
    }
  };

  // About church data
  const aboutChurch = {
    history: 'St. Raphael the Archangel Parish was established in 1985 to serve the growing Catholic community in Montalban, Rizal. The parish is dedicated to serving the spiritual needs of the community through various ministries and programs.',
    mission: 'Our mission is to proclaim the Gospel of Jesus Christ, celebrate the sacraments, and serve the community through works of charity and justice.',
    vision: 'To be a vibrant, welcoming, and missionary community of disciples of Jesus Christ.',
    contact: {
      address: 'San Rafael, Rodriguez, Rizal, 1860',
      phone: '(123) 456-7890',
      email: 'st.raphael.parish@example.com'
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['rgba(255, 226, 89, 0.8)', 'rgba(255, 167, 81, 0.8)']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: 'transparent',
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/IMG3.png")} style={styles.logo} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.churchName, { color: '#2d3436' }]} numberOfLines={1} adjustsFontSizeToFit>
                ST. RAPHAEL THE ARCHANGEL
              </Text>
              <Text style={[styles.churchName, { color: '#2d3436' }]} numberOfLines={1} adjustsFontSizeToFit>
                PARISH
              </Text>
              <Text style={[styles.subtitle, { color: '#636e72' }]} numberOfLines={1} adjustsFontSizeToFit>
                Diocese of Antipolo
              </Text>
              <Text style={[styles.subtitle, { color: '#636e72' }]} numberOfLines={1} adjustsFontSizeToFit>
                Montalban, Rizal 1860
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => {}}
          >
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

     
      </Animated.View>

    
<ScrollView 
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
  nestedScrollEnabled={true}
  bounces={false} // Add this to prevent bouncing in the parent ScrollView
>
        {/* Image Slider */}
         <Animated.View 
    style={[
      styles.sliderContainer, 
      { 
        transform: [{ scale: scaleAnim }] 
      }
    ]}
  >
       
 <Swiper 
      autoplay
      loop
      autoplayTimeout={4}
      showsPagination
      dotStyle={styles.dotStyle}
      activeDotStyle={styles.activeDotStyle}
      removeClippedSubviews={false}
      scrollEnabled={true}
      style={{ height: height * 0.28 }}
      onIndexChanged={(index) => setActiveSlide(index)}
      bounces={false} // Ensure this is set to false
      scrollEventThrottle={200} // Add this for smoother scrolling
      directionalLockEnabled={true} // Add this to prevent diagonal scrolling
    >
      {images.map((img, idx) => (
        <View key={idx} style={styles.slide}>
          <Image source={img} style={styles.slideImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'transparent']}
            style={styles.imageGradient}
          />
          <View style={styles.slideOverlay}>
            <Text style={styles.slideText}>St. Raphael Parish</Text>
            <Text style={styles.slideSubText}>Community in Faith</Text>
          </View>
        </View>
      ))}
    </Swiper>
  </Animated.View>
        {/* PRAY / HEAL / HOPE Animation */}
        <Animated.View 
          style={[
            styles.textContainer, 
            { 
              transform: [{ translateY: slideAnim }],
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(108, 92, 231, 0.1)',
            }
          ]}
        >
          <Animated.Text style={[styles.pray, { opacity: fadeAnimPray, color: isDarkMode ? '#A6D1E6' : '#6c5ce7' }]}>PRAY</Animated.Text>
          <Animated.Text style={[styles.fast, { opacity: fadeAnimFast, color: isDarkMode ? '#FEC0CB' : '#e84393' }]}>HEAL</Animated.Text>
          <Animated.Text style={[styles.give, { opacity: fadeAnimGive, color: isDarkMode ? '#FEC260' : '#fdcb6e' }]}>HOPE</Animated.Text>
        </Animated.View>

        {/* Donation Button */}
        <Animated.View 
          style={[
            styles.donationContainer, 
            { 
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.donationButton]} 
            onPress={() => navigation.navigate('DonationFormScreen')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#7C3AED', '#6D28D9'] : ['#6c5ce7', '#5b4cdb']}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <MaterialCommunityIcons name="heart-outline" size={20} color="#FFF" />
            <Text style={styles.donationButtonText}>Make a Donation</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Prayer Buttons Grid */}
        <Animated.View 
          style={[
            styles.prayerGrid, 
            { 
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.buttonRow}>
            <PrayerButton 
              title="Protection" 
              icon="shield-check" 
              color="#6c5ce7" 
              onPress={() => openPrayerModal('Protection')}
              isDarkMode={isDarkMode}
            />
            <PrayerButton 
              title="Healing" 
              icon="heart-pulse" 
              color="#00b894" 
              onPress={() => openPrayerModal('Healing')}
              isDarkMode={isDarkMode}
            />
          </View>
          <View style={styles.buttonRow}>
            <PrayerButton 
              title="Travelers" 
              icon="airplane" 
              color="#fdcb6e" 
              onPress={() => openPrayerModal('Travelers')}
              isDarkMode={isDarkMode}
            />
            <PrayerButton 
              title="Guidance" 
              icon="compass" 
              color="#d63031" 
              onPress={() => openPrayerModal('Guidance')}
              isDarkMode={isDarkMode}
            />
          </View>
        </Animated.View>

        {/* Quick Links Section */}
        <Animated.View 
          style={[
            styles.quickLinksContainer, 
            { 
              backgroundColor: cardBackground,
              transform: [{ translateY: slideAnim }],
              shadowColor: isDarkMode ? '#000' : 'rgba(0,0,0,0.1)',
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Links</Text>
          <View style={styles.quickLinksRow}>
            <QuickLink 
              icon="calendar-clock" 
              title="Mass Schedule" 
              onPress={() => setMassModalVisible(true)}
              isDarkMode={isDarkMode}
              color={primaryColor}
            />
            <QuickLink 
              icon="book-open-variant" 
              title="Readings" 
              onPress={() => setReadingsModalVisible(true)}
              isDarkMode={isDarkMode}
              color={primaryColor}
            />
            <QuickLink 
              icon="information" 
              title="About" 
              onPress={() => setAboutModalVisible(true)}
              isDarkMode={isDarkMode}
              color={primaryColor}
            />
          </View>
        </Animated.View>

        {/* Upcoming Events Section */}
        <Animated.View 
          style={[
            styles.eventsContainer, 
            { 
              backgroundColor: cardBackground,
              transform: [{ translateY: slideAnim }],
              shadowColor: isDarkMode ? '#000' : 'rgba(0,0,0,0.1)',
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: primaryColor }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.eventItem}>
            <View style={[styles.eventDate, { backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(108, 92, 231, 0.1)' }]}>
              <Text style={[styles.eventDay, { color: primaryColor }]}>20</Text>
              <Text style={[styles.eventMonth, { color: primaryColor }]}>NOV</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={[styles.eventTitle, { color: textColor }]}>Parish Feast Day Celebration</Text>
              <Text style={[styles.eventTime, { color: secondaryTextColor }]}>8:00 AM - 8:00 PM</Text>
            </View>
          </View>
          <View style={styles.eventItem}>
            <View style={[styles.eventDate, { backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(108, 92, 231, 0.1)' }]}>
              <Text style={[styles.eventDay, { color: primaryColor }]}>24</Text>
              <Text style={[styles.eventMonth, { color: primaryColor }]}>DEC</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={[styles.eventTitle, { color: textColor }]}>Christmas Eve Mass</Text>
              <Text style={[styles.eventTime, { color: secondaryTextColor }]}>6:00 PM - 12:00 AM</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Prayer Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <BlurView intensity={90} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: textColor }]}>{currentPrayer.title}</Text>
                <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />
                <Text style={[styles.modalText, { color: secondaryTextColor }]}>{currentPrayer.text}</Text>
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: primaryColor }]} 
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Mass Schedule Modal */}
      <Modal visible={massModalVisible} transparent animationType="slide">
        <BlurView intensity={90} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBackground, maxHeight: '80%' }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: textColor }]}>Mass Schedule</Text>
                <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />
                
                {massSchedules.map((schedule, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <Text style={[styles.scheduleDay, { color: textColor }]}>{schedule.day}</Text>
                    <View style={styles.timesContainer}>
                      {schedule.times.map((time, timeIndex) => (
                        <View key={timeIndex} style={[styles.timeChip, { backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(108, 92, 231, 0.1)' }]}>
                          <Text style={[styles.timeText, { color: primaryColor }]}>{time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
                
                <View style={styles.noteContainer}>
                  <Ionicons name="information-circle" size={16} color={secondaryTextColor} />
                  <Text style={[styles.noteText, { color: secondaryTextColor, marginLeft: 5 }]}>
                    Schedules may change during holidays and special occasions.
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: primaryColor }]} 
                  onPress={() => setMassModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Readings Modal */}
      <Modal visible={readingsModalVisible} transparent animationType="slide">
        <BlurView intensity={90} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBackground, maxHeight: '80%' }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: textColor }]}>Daily Readings</Text>
                <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />
                <Text style={[styles.readingsDate, { color: secondaryTextColor }]}>{dailyReadings.date}</Text>
                
                <View style={styles.readingSection}>
                  <Text style={[styles.readingTitle, { color: textColor }]}>First Reading</Text>
                  <Text style={[styles.readingReference, { color: primaryColor }]}>{dailyReadings.firstReading.title}</Text>
                  <Text style={[styles.readingText, { color: secondaryTextColor }]}>{dailyReadings.firstReading.text}</Text>
                </View>
                
                <View style={styles.readingSection}>
                  <Text style={[styles.readingTitle, { color: textColor }]}>Responsorial Psalm</Text>
                  <Text style={[styles.readingReference, { color: primaryColor }]}>{dailyReadings.psalm.title}</Text>
                  <Text style={[styles.readingText, { color: secondaryTextColor }]}>{dailyReadings.psalm.text}</Text>
                </View>
                
                <View style={styles.readingSection}>
                  <Text style={[styles.readingTitle, { color: textColor }]}>Second Reading</Text>
                  <Text style={[styles.readingReference, { color: primaryColor }]}>{dailyReadings.secondReading.title}</Text>
                  <Text style={[styles.readingText, { color: secondaryTextColor }]}>{dailyReadings.secondReading.text}</Text>
                </View>
                
                <View style={styles.readingSection}>
                  <Text style={[styles.readingTitle, { color: textColor }]}>Gospel</Text>
                  <Text style={[styles.readingReference, { color: primaryColor }]}>{dailyReadings.gospel.title}</Text>
                  <Text style={[styles.readingText, { color: secondaryTextColor }]}>{dailyReadings.gospel.text}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: primaryColor }]} 
                  onPress={() => setReadingsModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* About Modal */}
      <Modal visible={aboutModalVisible} transparent animationType="slide">
        <BlurView intensity={90} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBackground, maxHeight: '80%' }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: textColor }]}>About Our Parish</Text>
                <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]} />
                
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutTitle, { color: textColor }]}>History</Text>
                  <Text style={[styles.aboutText, { color: secondaryTextColor }]}>{aboutChurch.history}</Text>
                </View>
                
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutTitle, { color: textColor }]}>Mission</Text>
                  <Text style={[styles.aboutText, { color: secondaryTextColor }]}>{aboutChurch.mission}</Text>
                </View>
                
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutTitle, { color: textColor }]}>Vision</Text>
                  <Text style={[styles.aboutText, { color: secondaryTextColor }]}>{aboutChurch.vision}</Text>
                </View>
                
                <View style={styles.aboutSection}>
                  <Text style={[styles.aboutTitle, { color: textColor }]}>Contact Information</Text>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={16} color={primaryColor} />
                    <TouchableOpacity onPress={() => Linking.openURL(`mailto:${aboutChurch.contact.email}`)}>
                      <Text style={[styles.contactText, { color: primaryColor, marginLeft: 10 }]}>{aboutChurch.contact.email}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={16} color={primaryColor} />
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${aboutChurch.contact.phone}`)}>
                      <Text style={[styles.contactText, { color: primaryColor, marginLeft: 10 }]}>{aboutChurch.contact.phone}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={16} color={primaryColor} />
                    <Text style={[styles.contactText, { color: secondaryTextColor, marginLeft: 10 }]}>{aboutChurch.contact.address}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: primaryColor }]} 
                  onPress={() => setAboutModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

// Prayer Button Component
const PrayerButton = ({ title, icon, color, onPress, isDarkMode }) => (
  <TouchableOpacity 
    style={[styles.prayerButton, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={[color, `${color}DD`]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
    <MaterialCommunityIcons name={icon} size={24} color="#FFF" style={styles.prayerButtonIcon} />
    <Text style={styles.prayerButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Quick Link Component
const QuickLink = ({ icon, title, onPress, isDarkMode, color }) => (
  <TouchableOpacity 
    style={[styles.quickLink, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(108, 92, 231, 0.1)' }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons 
      name={icon} 
      size={24} 
      color={color} 
    />
    <Text style={[styles.quickLinkText, { color: isDarkMode ? '#FFF' : color }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isIOS ? 30 : 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
logo: { 
  width: width * 0.18,
  height: width * 0.18,
  resizeMode: "contain",
  borderRadius: (width * 0.22) / 1, // gawin circle
  backgroundColor: "#fff", // para hindi butas
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
},


  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  churchName: { 
    fontSize: width * 0.045, 
    fontWeight: "800", 
    textAlign: "left",
  },
  subtitle: { 
    fontSize: width * 0.03, 
    textAlign: "left", 
    marginTop: 2,
    fontWeight: '500',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginTop: 10,
  },
  welcomeText: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.8)',
  },
  sliderContainer: {
    height: height * 0.28,
    marginVertical: 20,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
// Update your slideImage style to ensure consistent rendering:
slideImage: {
  width: '100%',
  height: '100%',
  borderRadius: 20, // Add this to match the container
},
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  slideText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  slideSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  dotStyle: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDotStyle: {
    backgroundColor: '#FFF',
    width: 20,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: width * 0.9,
    alignSelf: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 16,
    marginTop: 5,
    marginBottom: 20,
  },
  pray: { 
    fontSize: width * 0.07, 
    fontWeight: '800', 
    marginHorizontal: width * 0.03,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  fast: { 
    fontSize: width * 0.07, 
    fontWeight: '800', 
    marginHorizontal: width * 0.03,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  give: { 
    fontSize: width * 0.07, 
    fontWeight: '800', 
    marginHorizontal: width * 0.03,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  donationContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  donationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  donationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  prayerGrid: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  prayerButton: {
    width: (width - 55) / 2,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  prayerButtonIcon: {
    marginBottom: 8,
  },
  prayerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickLinksContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLink: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: (width - 90) / 3,
  },
  quickLinkText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventDate: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '800',
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  // Mass Schedule Modal Styles
  scheduleItem: {
    marginBottom: 20,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },
  // Readings Modal Styles
  readingsDate: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  readingSection: {
    marginBottom: 20,
  },
  readingTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  readingReference: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  readingText: {
    fontSize: 15,
    lineHeight: 22,
  },
  // About Modal Styles
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
  },
});

export default HomeScreen;