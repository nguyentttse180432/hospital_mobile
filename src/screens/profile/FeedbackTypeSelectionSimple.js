import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// Simplified version of feedback type selection
const FeedbackTypeSelectionSimple = ({
  visible,
  onClose,
  onSelectType,
  appointmentCode,
  feedbackStatus = {
    hasDoctorFeedback: false,
    hasServiceFeedback: false,
    hasAllFeedbacks: false,
  },
}) => {
  const handleSelectType = (type, isView = false) => {
    onSelectType(appointmentCode, type, isView);
  };

  // Determine if we're viewing or creating feedback
  const isViewingMode =
    feedbackStatus.hasAllFeedbacks ||
    feedbackStatus.hasDoctorFeedback ||
    feedbackStatus.hasServiceFeedback;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isViewingMode ? "Xem đánh giá" : "Chọn loại đánh giá"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.optionsContainer}>
            {/* Doctor Feedback Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                feedbackStatus.hasDoctorFeedback && styles.optionCardViewed,
              ]}
              onPress={() => {
                console.log("Selected doctor feedback");
                handleSelectType("doctor", feedbackStatus.hasDoctorFeedback);
              }}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  {
                    backgroundColor: feedbackStatus.hasDoctorFeedback
                      ? "#e8f5e9"
                      : "#e3f2fd",
                  },
                ]}
              >
                <Icon
                  name={
                    feedbackStatus.hasDoctorFeedback
                      ? "checkmark-circle"
                      : "medkit"
                  }
                  size={32}
                  color={
                    feedbackStatus.hasDoctorFeedback ? "#4CAF50" : "#1976d2"
                  }
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  {feedbackStatus.hasDoctorFeedback
                    ? "Xem đánh giá bác sĩ"
                    : "Đánh giá bác sĩ"}
                </Text>
                <Text style={styles.optionDescription}>
                  {feedbackStatus.hasDoctorFeedback
                    ? "Xem đánh giá bạn đã gửi về bác sĩ điều trị"
                    : "Đánh giá về chuyên môn, thái độ và cách chăm sóc của bác sĩ điều trị"}
                </Text>
              </View>
              <Icon name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            {/* Service Feedback Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                feedbackStatus.hasServiceFeedback && styles.optionCardViewed,
              ]}
              onPress={() => {
                console.log("Selected service feedback");
                handleSelectType("service", feedbackStatus.hasServiceFeedback);
              }}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  {
                    backgroundColor: feedbackStatus.hasServiceFeedback
                      ? "#e8f5e9"
                      : "#e8f5e9",
                  },
                ]}
              >
                <Icon
                  name={
                    feedbackStatus.hasServiceFeedback
                      ? "checkmark-circle"
                      : "business"
                  }
                  size={32}
                  color={
                    feedbackStatus.hasServiceFeedback ? "#4CAF50" : "#43a047"
                  }
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  {feedbackStatus.hasServiceFeedback
                    ? "Xem đánh giá dịch vụ"
                    : "Đánh giá dịch vụ"}
                </Text>
                <Text style={styles.optionDescription}>
                  {feedbackStatus.hasServiceFeedback
                    ? "Xem đánh giá bạn đã gửi về cơ sở vật chất và dịch vụ"
                    : "Đánh giá về cơ sở vật chất, thời gian chờ, thái độ nhân viên và quy trình khám"}
                </Text>
              </View>
              <Icon name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.illustrationContainer}>
              <Icon name="star-half" size={100} color="#f0f0f0" />
              <Text style={styles.illustrationText}>
                {isViewingMode
                  ? "Cảm ơn bạn đã đánh giá dịch vụ của chúng tôi"
                  : "Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ"}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 1,
  },
  optionCardViewed: {
    borderColor: "#4CAF50",
    borderWidth: 1,
    backgroundColor: "#f1f8e9",
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
  },
  illustrationContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    opacity: 0.7,
  },
  illustrationText: {
    textAlign: "center",
    fontSize: 14,
    color: "#777",
    marginTop: 10,
    fontStyle: "italic",
  },
});

export default FeedbackTypeSelectionSimple;
