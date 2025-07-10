import { createStackNavigator } from "@react-navigation/stack";

import ExaminationRecordsScreen from "../screens/examination/ExaminationRecordsScreen";
import AppointmentDetailScreen from "../screens/appointment/AppointmentDetailScreen";
import FeedbackScreen from "../screens/appointment/FeedbackScreen";
import TodayCheckupScreen from "../screens/checkupRecord/TodayCheckupScreen";
import CheckupStepsScreen from "../screens/checkupRecord/CheckupStepsScreen";
import DoneCheckup from "../screens/checkupRecord/DoneCheckup";
import CheckupResultsScreen from "../screens/checkupRecord/CheckupResultsScreen";
import CheckupResultDetailScreen from "../screens/checkupRecord/CheckupResultDetailScreen";
import ImageViewerScreen from "../screens/checkupRecord/ImageViewerScreen";

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
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="DoneCheckup" component={DoneCheckup} />
      <Stack.Screen name="CheckupResults" component={CheckupResultsScreen} />
      <Stack.Screen
        name="CheckupResultDetail"
        component={CheckupResultDetailScreen}
      />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
    </Stack.Navigator>
  );
};

export default ExaminationNavigator;
