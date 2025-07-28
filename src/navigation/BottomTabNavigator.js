import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, SafeAreaView, StyleSheet, View, Text } from "react-native";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import MainBookingTypeScreen from "../screens/booking/MainBookingTypeScreen";
import ProfileNavigator from "./ProfileNavigator";
import PatientRecordsScreen from "../screens/patientProfile/PatientRecordsScreen";
import ExaminationNavigator from "./ExaminationNavigator";
import NotificationsScreen from "../screens/notification/NotificationsScreen";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#1e88e5",
          tabBarInactiveTintColor: "#757575",
          tabBarStyle: {
            height:
              Platform.OS === "android"
                ? Math.max(60 + insets.bottom, 75) // Ensure enough height on Android
                : 60 + insets.bottom,
            paddingBottom:
              Platform.OS === "android"
                ? Math.max(insets.bottom + 8, 12) // More padding on Android
                : 8 + insets.bottom,
            paddingTop: 8, // Add top padding for better visual balance
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case "Trang chủ":
                iconName = "home";
                break;
              case "Đặt lịch":
                iconName = "calendar-outline";
                break;
              case "Hồ sơ bệnh án":
                iconName = "document-text-outline";
                break;
              case "Phiếu khám":
                iconName = "medical-outline";
                break;
              // case "Thông báo":
              //   iconName = "notifications-outline";
              //   break;
              case "Tài khoản":
                iconName = "person-outline";
                break;
              default:
                iconName = "ellipse";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Trang chủ" component={HomeScreen} />
        <Tab.Screen name="Đặt lịch" component={MainBookingTypeScreen} />
        <Tab.Screen
          name="Hồ sơ bệnh án"
          component={PatientRecordsScreen}
          options={{ title: "Hồ sơ" }}
        />
        <Tab.Screen
          name="Phiếu khám"
          component={ExaminationNavigator}
          options={{ title: "Phiếu khám" }}
        />
        {/* <Tab.Screen
        name="Thông báo"
        component={NotificationsScreen}
        options={{ title: "Thông báo" }}
      /> */}
        <Tab.Screen name="Tài khoản" component={ProfileNavigator} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default BottomTabNavigator;
