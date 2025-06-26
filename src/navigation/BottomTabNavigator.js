import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

// Screens
import HomeScreen from "../screens/HomeScreen";
import BookAppointmentScreen from "../screens/appointment/AppointmentBookingScreen";
import ProfileNavigator from "./ProfileNavigator";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1e88e5",
        tabBarInactiveTintColor: "#757575",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Appointment":
              iconName = "calendar-outline";
              break;

            case "Profile":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointment" component={BookAppointmentScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
