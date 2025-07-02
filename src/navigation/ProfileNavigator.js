import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "../screens/account/ProfileScreen";
import FeedbackScreen from "../screens/account/FeedbackScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import FeedbackTypeSelectionScreen from "../screens/account/FeedbackTypeSelectionScreen";

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen
        name="FeedbackTypeSelection"
        component={FeedbackTypeSelectionScreen}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
