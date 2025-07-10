import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "../screens/account/ProfileScreen";
import FeedbackScreen from "../screens/account/FeedbackScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
