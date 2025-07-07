import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SimpleLoginScreen from "../screens/auth/SimpleLoginScreen";
import SimpleHomeScreen from "../screens/SimpleHomeScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SimpleLogin">
        <Stack.Screen
          name="SimpleLogin"
          component={SimpleLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SimpleHome"
          component={SimpleHomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
