import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import FeedbackTypeSelectionSimple from "./FeedbackTypeSelectionSimple";
import ScreenContainer from "../../components/common/ScreenContainer";

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
    <ScreenContainer title="Đánh giá" headerBackgroundColor="#4299e1">
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default FeedbackTypeSelectionScreen;
