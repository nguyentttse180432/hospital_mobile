import { createStackNavigator } from "@react-navigation/stack";

import ExaminationRecordsScreen from "../screens/examination/ExaminationRecordsScreen";
import AppointmentDetailScreen from "../screens/account/AppointmentDetailScreen";
import FeedbackScreen from "../screens/account/FeedbackScreen";
import FeedbackTypeSelectionScreen from "../screens/account/FeedbackTypeSelectionScreen";
import TodayCheckupScreen from "../screens/checkupRecord/TodayCheckupScreen";
import CheckupStepsScreen from "../screens/checkupRecord/CheckupStepsScreen";

const Stack = createStackNavigator();

const ExaminationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="ExaminationMain"
    >
      <Stack.Screen
        name="ExaminationMain"
        component={ExaminationRecordsScreen}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
      />
      <Stack.Screen name="TodayCheckup" component={TodayCheckupScreen} />
      <Stack.Screen name="CheckupSteps" component={CheckupStepsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen
        name="FeedbackTypeSelection"
        component={FeedbackTypeSelectionScreen}
      />
    </Stack.Navigator>
  );
};

export default ExaminationNavigator;
