import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get("window");

export default function FormsMenuScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [downloading, setDownloading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const forms = [
    { name: "Baptismal Form", url: "http://192.168.1.34/system/forms/baptismal%20form.docx", icon: "water", category: "Sacraments" },
    { name: "Confirmation Form", url: "http://192.168.1.34/system/forms/CONFIRMATION%20form.docx", icon: "checkmark-done-circle", category: "Sacraments" },
    { name: "Pamisa Form", url: "http://192.168.1.34/system/forms/PAMISA-new.docx", icon: "flower", category: "Services" },
    { name: "Wedding Form", url: "http://192.168.1.34/system/forms/WeddingForm.pdf", icon: "heart", category: "Sacraments" },
    { name: "Sick Call Form", url: "http://192.168.1.34/system/forms/NEW%20SICK%20CALL%20FORM.doc", icon: "medkit", category: "Services" },
    { name: "Funeral Form", url: "http://192.168.1.34/system/forms/Funeral%20Form.doc", icon: "cloudy-night", category: "Services" },
    { name: "Blessing Form", url: "http://192.168.1.34/system/forms/BLESSING.doc", icon: "sparkles", category: "Services" },
    { name: "First Communion Form", url: "http://192.168.1.34/system/forms/First%20Communion%20form.docx", icon: "wine", category: "Sacraments" },
  ];

  const categories = ["All", "Sacraments", "Services"];

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || form.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (url, formName) => {
    setDownloading(formName);
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        alert('Cannot open this file type');
      }
    } catch (error) {
      alert('Failed to download file: ' + error.message);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const renderFormCard = (form, index) => (
    <Animated.View
      key={index}
      style={[
        styles.formCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.formCardInner}
        onPress={() => handleDownload(form.url, form.name)}
        activeOpacity={0.9}
        disabled={downloading === form.name}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={form.icon} size={24} color="#4c669f" />
          </View>
          
          <View style={styles.cardTextContainer}>
            <Text style={styles.formName}>{form.name}</Text>
            <View style={styles.cardMeta}>
              <View style={[
                styles.categoryTag,
                form.category === "Sacraments" ? styles.sacramentTag : styles.serviceTag
              ]}>
                <Text style={styles.categoryText}>{form.category}</Text>
              </View>
              <Text style={styles.fileType}>
                {form.url.split(".").pop().toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.downloadContainer}>
            {downloading === form.name ? (
              <ActivityIndicator size="small" color="#4c669f" />
            ) : (
              <View style={styles.downloadButton}>
                <Ionicons name="download-outline" size={20} color="#4c669f" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['rgba(255, 226, 90, 0.9)', 'rgba(255, 167, 90, 0.9)']}
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parish Forms</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Search Container */}
        <Animated.View 
          style={[
            styles.searchContainer, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search forms..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#718096"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#718096" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View 
          style={[
            styles.categoryWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.categoryButtonActive
                ]}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.formsContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.subtitle}>Select a form to download</Text>
          </Animated.View>

          {filteredForms.length > 0 ? (
            filteredForms.map(renderFormCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={60} color="#cbd5e0" />
              <Text style={styles.emptyStateText}>No forms found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.2,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "black",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2d3748",
    padding: 0,
  },
  categoryWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryContainer: {
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryButtonActive: {
    backgroundColor: "#4c669f",
    borderColor: "#4c669f",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a5568",
  },
  categoryButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  formsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formCardInner: {
    padding: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#f0f7ff",
  },
  cardTextContainer: {
    flex: 1,
  },
  formName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  sacramentTag: {
    backgroundColor: "#ebf4ff",
  },
  serviceTag: {
    backgroundColor: "#faf5ff",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sacramentText: {
    color: "#4c669f",
  },
  serviceText: {
    color: "#6c5ce7",
  },
  fileType: {
    fontSize: 12,
    color: "#718096",
  },
  downloadContainer: {
    marginLeft: 12,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
});