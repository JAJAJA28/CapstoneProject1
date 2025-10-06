import React, { useEffect, useState, useCallback, useContext } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Alert
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { AuthContext } from "../AuthContext";

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

const sacramentNames = {
  "baptism_data": "Baptism",
  "blessing_data": "Blessing",
  "confirmation_data": "Confirmation",
  "fc_data": "First Communion",
  "funeral_data": "Funeral",
  "pamisa_data": "Pamisa",
  "rl_data": "Religious Life",
  "sickcall_data": "Sick Call",
  "wedding_data": "Wedding"
};

const statusColors = {
  "Pending": { bg: "#fff3cd", text: "#856404", border: "#ffeaa7" },
  "Approved": { bg: "#d4edda", text: "#155724", border: "#c3e6cb" },
  "Completed": { bg: "#d1ecf1", text: "#0c5460", border: "#bee5eb" },
  "Rejected": { bg: "#f8d7da", text: "#721c24", border: "#f5c6cb" },
  "Cancelled": { bg: "#f8d7da", text: "#721c24", border: "#f5c6cb" },
  "Default": { bg: "#e2e3e5", text: "#383d41", border: "#d6d8db" }
};

const MyReservationsScreen = ({ route, navigation }) => {
  const { loggedInUser } = useContext(AuthContext);
  const routeEmail = route?.params?.userEmail;
  const effectiveEmail = (routeEmail || loggedInUser?.email || "").trim().toLowerCase();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!effectiveEmail) {
      console.warn("⚠️ No email available for MyReservationsScreen");
      setLoading(false);
      return;
    }
    fetchReservations(effectiveEmail);
  }, [effectiveEmail]);

  const fetchReservations = async (email) => {
    try {
      const response = await fetch(
        `http://192.168.1.18/system/get_reservations.php?email=${encodeURIComponent(email)}`
      );

      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.log("❌ Invalid JSON from server:", text?.slice(0, 300));
        throw new Error("Invalid JSON from server");
      }

      let dataArray = [];
      if (json.data && Array.isArray(json.data)) {
        dataArray = json.data;
      } else if (Array.isArray(json)) {
        dataArray = json;
      }

      dataArray = dataArray.map(item => ({
        ...item,
        sacrament: sacramentNames[item.type] ?? "Unknown Service",
        time: item.time || item.selectedTime || "N/A",
        intention: item.intention || item.selectedIntention || "N/A",
        offeredBy: item.offeredBy || "N/A",
        donation: item.donation ?? "N/A",
        status: item.status || "Pending"
      }));

      setReservations(dataArray);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ BAGONG DELETE FUNCTION - ITO ANG IPINALIT
  const deleteReservationForUser = async (reservation) => {
    try {
      // Call API to mark reservation as deleted for this user
      const response = await fetch(
        'http://192.168.1.18/system/get_reservations.php', // Same PHP file, different method
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            reservationId: reservation.id,
            userEmail: effectiveEmail,
            collectionName: reservation.type // baptism_data, pamisa_data, etc.
          }),
        }
      );

      const result = await response.json();
      
      if (result.status === "success") {
        // Remove from local state
        setReservations(prev => prev.filter(item => item.id !== reservation.id));
        Alert.alert("Success", "Reservation deleted from your account");
      } else {
        Alert.alert("Error", result.message || "Failed to delete reservation");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Network error occurred");
    }
  };

  const handleDelete = (reservation) => {
    Alert.alert(
      "Delete Reservation",
      `Are you sure you want to delete "${reservation.sacrament}" reservation?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteReservationForUser(reservation)
        }
      ]
    );
  };

  const onRefresh = useCallback(() => {
    if (!effectiveEmail) return;
    setRefreshing(true);
    fetchReservations(effectiveEmail);
  }, [effectiveEmail]);

  const getStatusStyle = (status) => {
    return statusColors[status] || statusColors["Default"];
  };

  const renderReservationCard = ({ item }) => (
    <View style={styles.card}>
      {/* Header with sacrament name and delete button */}
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.sacrament}</Text>
        <TouchableOpacity 
          onPress={() => handleDelete(item)}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { 
        backgroundColor: getStatusStyle(item.status).bg,
        borderColor: getStatusStyle(item.status).border
      }]}>
        <Text style={[styles.statusText, { color: getStatusStyle(item.status).text }]}>
          {item.status}
        </Text>
      </View>

      {/* Reservation Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}><Text style={styles.label}>Reservation ID:</Text> {item.id ?? "N/A"}</Text>
        <Text style={styles.detailText}><Text style={styles.label}>Name:</Text> {item.fullName ?? "N/A"}</Text>
        <Text style={styles.detailText}><Text style={styles.label}>Email:</Text> {item.email ?? "N/A"}</Text>
        <Text style={styles.detailText}><Text style={styles.label}>Date:</Text> {item.date ?? "N/A"}</Text>
        <Text style={styles.detailText}><Text style={styles.label}>Time:</Text> {item.time ?? "N/A"}</Text>

        {item.type === "pamisa_data" && (
          <>
            <Text style={styles.detailText}><Text style={styles.label}>Intention:</Text> {item.intention ?? "N/A"}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Offered By:</Text> {item.offeredBy ?? "N/A"}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Donation:</Text> {item.donation ?? "N/A"}</Text>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0077b6" />
        <Text style={styles.loadingText}>Loading reservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#0077b6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reservations</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {!effectiveEmail ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={48} color="#dc3545" />
          <Text style={styles.errorText}>No user email detected. Please re-login.</Text>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.center}>
          <Feather name="calendar" size={48} color="#0077b6" />
          <Text style={styles.emptyText}>No reservations found</Text>
          <Text style={styles.subText}>for {effectiveEmail}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Feather name="refresh-cw" size={16} color="#0077b6" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#0077b6"]}
              tintColor="#0077b6"
            />
          }
          renderItem={renderReservationCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : height * 0.07,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0077b6",
  },
  headerPlaceholder: {
    width: 28,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#6A1B9A",
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8d7da",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  detailsContainer: {
    gap: 6,
  },
  label: {
    fontWeight: "bold",
    color: "#495057",
  },
  detailText: {
    fontSize: 14,
    color: "#6c757d",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#0077b6",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 5,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  refreshText: {
    color: "#0077b6",
    fontWeight: "500",
  },
});

export default MyReservationsScreen;