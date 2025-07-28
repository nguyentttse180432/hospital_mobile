import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import VerifyPhoneScreen from "../screens/auth/VerifyPhoneScreen";
import EnterOtpScreen from "../screens/auth/EnterOtpScreen";
import CreateProfileScreen from "../screens/patientProfile/CreateProfileScreen";
import LinkProfileScreen from "../screens/patientProfile/LinkProfileScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import HomeScreen from "../screens/home/HomeScreen";
import PatientScreen from "../screens/account/ProfileScreen";
import AllPackagesScreen from "../screens/home/AllPackagesScreen";
import PackageDetailScreen from "../screens/home/PackageDetailScreen";
import AllServicesScreen from "../screens/home/AllServicesScreen";
import CheckupResultsScreen from "../screens/checkupRecord/CheckupResultsScreen";
import CheckupResultDetailScreen from "../screens/checkupRecord/CheckupResultDetailScreen";
import ImageViewerScreen from "../screens/checkupRecord/ImageViewerScreen";
import PrescriptionScreen from "../screens/checkupRecord/PrescriptionScreen";
import PackageBookingScreen from "../screens/booking/package/PackageBookingScreen";
import ServiceBookingTypeScreen from "../screens/booking/service/ServiceBookingTypeScreen ";
import DoctorBookingScreen from "../screens/booking/service/DoctorBookingScreen";
import GeneralServiceBookingTypeScreen from "../screens/booking/service/GeneralServiceBookingTypeScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyPhoneScreen"
          component={VerifyPhoneScreen}
          options={{ title: "Xác minh số điện thoại" }}
        />
        <Stack.Screen
          name="EnterOtpScreen"
          component={EnterOtpScreen}
          options={{ title: "Nhập mã OTP" }}
        />
        <Stack.Screen
          name="CreateProfileScreen"
          component={CreateProfileScreen}
          options={{ title: "Tạo hồ sơ" }}
        />
        <Stack.Screen
          name="LinkProfileScreen"
          component={LinkProfileScreen}
          options={{ title: "Liên kết hồ sơ" }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientScreen"
          component={PatientScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AllPackagesScreen"
          component={AllPackagesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PackageDetailScreen"
          component={PackageDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AllServicesScreen"
          component={AllServicesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CheckupResults"
          component={CheckupResultsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CheckupResultDetail"
          component={CheckupResultDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ImageViewer"
          component={ImageViewerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrescriptionScreen"
          component={PrescriptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookAppointmentScreen"
          component={PackageBookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceBookingTypeScreen"
          component={ServiceBookingTypeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookByDoctor"
          component={DoctorBookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GeneralServiceBookingTypeScreen"
          component={GeneralServiceBookingTypeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
