import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const FeedbackTypeSelection = ({
  visible,
  onClose,
  onSelectType,
  appointmentCode,
}) => {
  const handleSelectType = (type) => {
    onSelectType(appointmentCode, type);
    onClose();
  };

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
            <Text style={styles.modalTitle}>Chọn loại đánh giá</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleSelectType("doctor")}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#e3f2fd" },
                ]}
              >
                <Icon name="medkit" size={32} color="#1976d2" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Đánh giá bác sĩ</Text>
                <Text style={styles.optionDescription}>
                  Đánh giá về chuyên môn, thái độ và cách chăm sóc của bác sĩ
                  điều trị
                </Text>
              </View>
              <Icon name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleSelectType("service")}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#e8f5e9" },
                ]}
              >
                <Icon name="business" size={32} color="#43a047" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Đánh giá dịch vụ</Text>
                <Text style={styles.optionDescription}>
                  Đánh giá về cơ sở vật chất, thời gian chờ, thái độ nhân viên
                  và quy trình khám
                </Text>
              </View>
              <Icon name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.illustrationContainer}>
              <Icon name="star-half" size={100} color="#f0f0f0" />
              <Text style={styles.illustrationText}>
                Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ
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

export default FeedbackTypeSelection;
