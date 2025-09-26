// App.js
import React, { useContext } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Auth Context
import { AuthProvider, AuthContext } from "./AuthContext";

// Screens
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import DashboardScreen from "./screens/DashboardScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BaptismalFormScreen from "./screens/BaptismalFormScreen";
import FirstCommunionFormScreen from "./screens/FirstCommunionFormScreen";
import ConfirmationFormScreen from "./screens/ConfirmationFormScreen";
import ConfessionFormScreen from "./screens/ConfessionFormScreen";
import SickCallFormScreen from "./screens/SickCallFormScreen";
import ReligiousLifeFormScreen from "./screens/ReligiousLifeFormScreen";
import OtherServicesFormScreen from "./screens/OtherServicesFormScreen";
import WeddingFormScreen from "./screens/WeddingFormScreen";
import DonationFormScreen from "./screens/DonationFormScreen";
import PamisaSaPatayScreen from "./screens/PamisaSaPatayScreen";
import BlessingScreen from "./screens/BlessingScreen";
import PamisaScreen from "./screens/PamisaScreen";
import MyReservationsScreen from "./screens/MyReservationsScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import FormsMenuScreen from "./screens/FormsMenuScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Tabs kapag naka-login
const MainTabs = () => {
  const { loggedInUser } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
         backgroundColor: '#FDF6E3',

          height: Platform.OS === "android" ? 90 : 70,
          paddingBottom: Platform.OS === "android" ? 10 : 0,
        },
        tabBarIconStyle: { marginTop: Platform.OS === "ios" ? 0 : 4 },
        tabBarActiveTintColor: "#dc3545",
      }}
    >
    <Tab.Screen
  name="Home"
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="home-outline" color={color} size={30} />
    ),
  }}
  component={HomeScreen}
/>

<Tab.Screen
  name="Dashboard"
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={30} />
    ),
  }}
  component={DashboardScreen}
/>

<Tab.Screen
  name="Profile"
  options={{
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="account-circle-outline" color={color} size={30} />
    ),
  }}
  component={ProfileScreen}
/>

    </Tab.Navigator>
  );
};

// ✅ Auth Wrapper
const AuthWrapper = () => {
  const { loggedInUser } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {loggedInUser ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="FormsMenu" component={FormsMenuScreen} />
          <Stack.Screen name="BaptismalForm" component={BaptismalFormScreen} />
          <Stack.Screen name="FirstCommunionForm" component={FirstCommunionFormScreen} />
          <Stack.Screen name="ConfirmationForm" component={ConfirmationFormScreen} />
          <Stack.Screen name="ConfessionForm" component={ConfessionFormScreen} />
          <Stack.Screen name="SickCallForm" component={SickCallFormScreen} />
          <Stack.Screen name="ReligiousLifeForm" component={ReligiousLifeFormScreen} />
          <Stack.Screen name="OtherServicesForm" component={OtherServicesFormScreen} />
          <Stack.Screen name="WeddingForm" component={WeddingFormScreen} />
          <Stack.Screen name="DonationFormScreen" component={DonationFormScreen} />

          {/* Special Screens */}
          <Stack.Screen name="PamisaSaPatay" component={PamisaSaPatayScreen} />
          <Stack.Screen name="Blessing" component={BlessingScreen} />
          <Stack.Screen name="Pamisa" component={PamisaScreen} />
          <Stack.Screen name="MyReservations" component={MyReservationsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        </>
      )}
    </Stack.Navigator>
  );
};

// ✅ App Entry
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthWrapper />
      </NavigationContainer>
    </AuthProvider>
  );
}
