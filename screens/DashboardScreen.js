import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Easing, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get("window");

const DashboardScreen = ({ navigation }) => {
  return <DashboardContent navigation={navigation} />;
};

const DashboardContent = ({ navigation }) => {
  const services = [
    { name: "BAPTISM",  screen: "BaptismalForm", color: "#4e54c8", gradient: ["#4e54c8", "#8f94fb"], image: require("../assets/Sacra6Baptism.png"), icon: "water" },
    { name: "FIRST COMMUNION", screen: "FirstCommunionForm", color: "#38ef7d", gradient: ["#11998e", "#38ef7d"], image: require("../assets/Sacra5FirstComm.png"), icon: "rice" },
    { name: "CONFIRMATION", screen: "ConfirmationForm", color: "#f5af19", gradient: ["#f12711", "#f5af19"], image: require("../assets/Sacra7Confi.png"), icon: "fire" },
    { name: "CONFESSION", screen: "ConfessionForm", color: "#8E2DE2", gradient: ["#4A00E0", "#8E2DE2"], image: require("../assets/Sacra3Confess.png"), icon: "chat" },
    { name: "SICK CALL", screen: "SickCallForm", color: "#f5576c", gradient: ["#f093fb", "#f5576c"], image: require("../assets/Sacra4SickCall.png"), icon: "hospital" },
    { name: "SACRAMENT OF WEDDING", screen: "WeddingForm", color: "#4facfe", gradient: ["#4facfe", "#00f2fe"], image: require("../assets/Sacra2Wed.png"), icon: "heart" },
    { name: "RELIGIOUS LIFE", screen: "ReligiousLifeForm", color: "#43e97b", gradient: ["#43e97b", "#38f9d7"], image: require("../assets/Sacra1HO.png"), icon: "account-group" },
    { name: "OTHER SERVICES", screen: "OtherServicesForm", color: "#a8c0ff", gradient: ["#a8c0ff", "#3f2b96"], image: require("../assets/LOF.png"), icon: "dots-horizontal" },
  ];

  const [activeCategory, setActiveCategory] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

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
          <Text style={styles.welcomeText}>Welcome to our Parish Services</Text>
          <Text style={styles.welcomeSubtext}>Select a service below to get started</Text>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.buttonContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(service.screen)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={service.gradient}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.buttonIconContainer}>
                  <Icon name={service.icon} size={24} color="white" />
                </View>
                <Image
                  source={service.image}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText}>{service.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.fabContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <LinearGradient
          colors={['#ff7e5f', '#feb47b']}
          style={styles.fabBottom}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity 
            style={styles.fabTouchable}
            onPress={() => navigation.navigate("FormsMenu")}
          >
            <Icon name="file-download" size={20} color="white" />
            <Text style={styles.fabText}>Download Forms</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
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
    height: height * 0.3,
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
  borderRadius: (width * 0.22) / 1, // gawin circle
  backgroundColor: "#fff", // para hindi butas
  justifyContent: "center",
  alignItems: "center",
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
  scrollView: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: height * 0.1,
  },
  button: {
    width: width * 0.43,
    height: height * 0.18,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginVertical: height * 0.012,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  buttonIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 5,
  },
  buttonImage: {
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: "contain",
    marginBottom: 10,
    
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.032,
    textAlign: "center",
    fontWeight: "700",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  fabContainer: {
    position: "absolute",
    bottom: height * 0.03,
    alignSelf: "center",
    width: width * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  fabBottom: {
    borderRadius: 30,
    paddingVertical: height * 0.018,
  },
  fabTouchable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: width * 0.04,
    color: "white",
    fontWeight: "700",
    marginLeft: 8,
  },
});

export default DashboardScreen;