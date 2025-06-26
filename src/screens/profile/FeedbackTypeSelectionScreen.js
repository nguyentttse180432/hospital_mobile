import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import FeedbackTypeSelectionSimple from "./FeedbackTypeSelectionSimple";

const FeedbackTypeSelectionScreen = ({ route, navigation }) => {
  const { appointmentCode, feedbackStatus, fromAppointmentDetail } =
    route.params;
  const [modalVisible, setModalVisible] = useState(true);

  const handleClose = () => {
    setModalVisible(false);
    if (fromAppointmentDetail) {
      navigation.navigate("AppointmentDetail", {
        appointmentCode,
      });
    } else {
      navigation.goBack();
    }
  };

  const handleSelectType = (appointmentCode, feedbackType, isViewMode) => {
    setModalVisible(false);
    console.log("🚀 Navigation to Feedback screen with:", {
      appointmentCode,
      feedbackType,
      isViewMode,
    });
    // Navigate to Feedback screen and replace current screen in the stack
    // This will make the back button in Feedback go directly to Profile
    navigation.replace("Feedback", {
      appointmentCode,
      feedbackType,
      isViewMode,
      fromAppointmentDetail,
    });
  };

  console.log("FeedbackTypeSelectionScreen rendered with:", {
    appointmentCode,
    feedbackStatus,
  });

  return (
    <View style={styles.container}>
      <FeedbackTypeSelectionSimple
        visible={modalVisible}
        onClose={handleClose}
        onSelectType={handleSelectType}
        appointmentCode={appointmentCode}
        feedbackStatus={
          feedbackStatus || {
            hasDoctorFeedback: false,
            hasServiceFeedback: false,
            hasAllFeedbacks: false,
          }
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FeedbackTypeSelectionScreen;
