import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

const ConfessionFormScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PAALALA</Text>
            <View style={styles.divider} />
          </View>
          
          {/* Notice */}
          <View style={styles.noticeContainer}>
            <Icon name="information" size={24} color="#d9534f" style={styles.noticeIcon} />
            <Text style={styles.notice}>Ang Oras po ng ating Pangungumpisal ay Bago o Matapos ang Misa</Text>
          </View>

          {/* Mass Schedule Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="clock-outline" size={22} color="#8B4513" />
              <Text style={styles.sectionTitle}>MGA ARAW AT ORAS NG MISA</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.schedule}>
                <Text style={styles.bold}>LUNES</Text> - 6AM{"\n"}
                <Text style={styles.bold}>MARTES</Text> - 6PM{"\n"}
                <Text style={styles.bold}>MIYERKULES</Text> - 6AM{"\n"}
                <Text style={styles.indent}>* Novena sa Ina ng Laging Saklolo{"\n"}</Text>
                <Text style={styles.indent}>* 6AM - Banal na Misa{"\n"}</Text>
                <Text style={styles.bold}>HUWEBES</Text> - 6PM{"\n"}
                <Text style={styles.bold}>BIYERNES</Text> - 6AM{"\n"}
                <Text style={styles.bold}>SABADO</Text> (PANANAGUTAN MASS) - 6AM{"\n"}
                <Text style={styles.bold}>LINGGO</Text> SCHEDULE NG MISA:{"\n"}
                <Text style={styles.indent}>- 6AM at 8AM (Umaga){"\n"}</Text>
                <Text style={styles.indent}>- 5:30PM at 7PM (Hapon)</Text>
              </Text>
            </View>
          </View>

          {/* Confession Instructions Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="book-open-variant" size={22} color="#8B4513" />
              <Text style={styles.sectionTitle}>MGA DAPAT GAWIN BAGO AT MATAPOS MAGKUMPISAL</Text>
            </View>
            <View style={styles.sectionContent}>
              {[
                "Magsisi ng taos-puso sa mga nagawang kasalanan.",
                "Gumawa ng taimtim na panalangin.",
                "Maghanda ng sarili sa pagpasok sa kumpisalan.",
                "Sundin ang mga tagubilin ng pari.",
                "Magpasalamat sa Diyos pagkatapos ng kumpisal."
              ].map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.number}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B4513', '#A0522D']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="close" size={20} color="#fff" />
              <Text style={styles.closeText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8B4513',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#8B4513',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    height: 3,
    width: 60,
    backgroundColor: '#8B4513',
    marginTop: 10,
    borderRadius: 2,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#d9534f',
  },
  noticeIcon: {
    marginRight: 10,
  },
  notice: {
    fontSize: 16,
    flex: 1,
    color: '#721c24',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    color: '#2C3E50',
    flex: 1,
  },
  sectionContent: {
    padding: 15,
  },
  schedule: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  indent: {
    marginLeft: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  numberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  number: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionText: {
    fontSize: 16,
    color: '#34495E',
    flex: 1,
    lineHeight: 22,
  },
  closeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
    alignSelf: 'center',
    width: '60%',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ConfessionFormScreen;