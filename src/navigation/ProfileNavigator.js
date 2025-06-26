import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "../screens/profile/ProfileScreen";
import FeedbackScreen from "../screens/profile/FeedbackScreen";
import AppointmentDetailScreen from "../screens/profile/AppointmentDetailScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import FeedbackTypeSelectionScreen from "../screens/profile/FeedbackTypeSelectionScreen";

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
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
