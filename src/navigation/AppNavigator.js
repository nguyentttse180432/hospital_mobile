import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import VerifyPhoneScreen from "../screens/auth/VerifyPhoneScreen";
import EnterOtpScreen from "../screens/auth/EnterOtpScreen";
import CreateProfileScreen from "../screens/patientProfile/CreateProfileScreen";
import LinkProfileScreen from "../screens/patientProfile/LinkProfileScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import HomeScreen from "../screens/HomeScreen";
import PatientScreen from "../screens/account/ProfileScreen";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
