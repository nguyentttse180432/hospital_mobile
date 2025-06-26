import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  getAppointmentByCode,
  submitFeedback,
  getDoctorByCode,
} from "../../services/appointmentService";
import Button from "../../components/common/Button";

const FeedbackScreen = ({ route, navigation }) => {
  const { appointmentCode, feedbackType = "service" } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // For service feedback fields (only used if feedbackType === 'service')
  const [feedbackFields, setFeedbackFields] = useState({
    staffFriendliness: "Neutral",
    communicationClarity: "Neutral",
    questionWillingness: "Neutral",
    reasonableWaitTime: "Neutral",
    onTimeAppointment: "Neutral",
    clearProcedure: "Neutral",
    guidedThroughProcess: "Neutral",
    cleanFacility: "Neutral",
    modernEquipment: "Neutral",
    overallSatisfaction: "Neutral",
    recommendToOthers: "Neutral",
    additionalComments: "",
  });

  const spinValue = useRef(new Animated.Value(0)).current;

  // Hiệu ứng xoay liên tục
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isLoading, spinValue]);

  // Chuyển đổi giá trị spinValue thành độ xoay
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    fetchAppointmentDetails();

    // If we're rating a doctor, also fetch doctor information
    if (feedbackType === "doctor") {
      fetchDoctorDetails();
    }
  }, []);

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointmentByCode(appointmentCode);
      if (response && response.value) {
        setAppointment(response.value);
      } else {
        throw new Error("Invalid appointment data format");
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin lịch hẹn. Vui lòng thử lại sau."
      );
    } finally {
      if (feedbackType !== "doctor") {
        setIsLoading(false);
      }
    }
  };

  const fetchDoctorDetails = async () => {
    try {
      const response = await getDoctorByCode(appointmentCode);
      if (response && response.value) {
        setDoctor(response.value);
      } else {
        throw new Error("Invalid doctor data format");
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin bác sĩ. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    // Chỉ kiểm tra rating khi đánh giá bác sĩ
    if (feedbackType === "doctor" && rating === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá số sao");
      return;
    }

    try {
      setIsSubmitting(true);

      let feedbackData;

      if (feedbackType === "doctor") {
        // Format data for doctor feedback
        feedbackData = {
          code: appointmentCode,
          star: rating,
          detail: comment,
        };
      } else {
        // Format data for service feedback
        // Chỉ gửi các trường enum, không gửi comment text
        feedbackData = {
          code: appointmentCode,
          staffFriendliness: feedbackFields.staffFriendliness,
          communicationClarity: feedbackFields.communicationClarity,
          questionWillingness: feedbackFields.questionWillingness,
          reasonableWaitTime: feedbackFields.reasonableWaitTime,
          onTimeAppointment: feedbackFields.onTimeAppointment,
          clearProcedure: feedbackFields.clearProcedure,
          guidedThroughProcess: feedbackFields.guidedThroughProcess,
          cleanFacility: feedbackFields.cleanFacility,
          modernEquipment: feedbackFields.modernEquipment,
          overallSatisfaction: feedbackFields.overallSatisfaction,
          recommendToOthers: feedbackFields.recommendToOthers,
          // Đã loại bỏ trường additionalComments vì yêu cầu chỉ gửi các trường enum
        };
      }

      const response = await submitFeedback(
        appointmentCode,
        feedbackData,
        feedbackType
      );

      // Gọi callback để làm mới danh sách lịch hẹn (nếu có)
      if (route.params?.onFeedbackComplete) {
        route.params.onFeedbackComplete();
      }

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Icon
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#FFC107" : "#aaa"}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderFeedbackItem = (label, field) => {
    const options = [
      { value: "VeryBad", label: "Rất kém" },
      { value: "Bad", label: "Kém" },
      { value: "Neutral", label: "Bình thường" },
      { value: "Good", label: "Tốt" },
      { value: "Excellent", label: "Xuất sắc" },
    ];

    return (
      <View style={styles.feedbackItem}>
        <Text style={styles.feedbackItemLabel}>{label}</Text>
        <View style={styles.feedbackOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.feedbackOption,
                feedbackFields[field] === option.value &&
                  styles.feedbackOptionSelected,
              ]}
              onPress={() =>
                setFeedbackFields({
                  ...feedbackFields,
                  [field]: option.value,
                })
              }
            >
              <Text
                style={[
                  styles.feedbackOptionText,
                  feedbackFields[field] === option.value &&
                    styles.feedbackOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={{ transform: [{ rotate: spin }], marginBottom: 15 }}
        >
          <Icon name="sync" size={70} color="#1976d2" />
        </Animated.View>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {feedbackType === "doctor" ? "Đánh giá bác sĩ" : "Đánh giá dịch vụ"}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Appointment Summary */}
        <View style={styles.appointmentCard}>
          <Text style={styles.appointmentTitle}>Chi tiết lịch khám</Text>

          <View style={styles.appointmentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày khám:</Text>
              <Text style={styles.infoValue}>
                {formatDate(appointment?.bookingDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dịch vụ:</Text>
              <Text style={styles.infoValue}>
                {appointment?.packageName || "Dịch vụ khám bệnh"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã lịch hẹn:</Text>
              <Text style={styles.infoValue}>#{appointmentCode}</Text>
            </View>

            {feedbackType === "doctor" && doctor && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bác sĩ:</Text>
                  <Text style={styles.infoValue}>
                    {doctor?.doctorName || "Chưa xác định"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Khoa:</Text>
                  <Text style={styles.infoValue}>
                    {doctor?.departmentName || "Chưa xác định"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phòng:</Text>
                  <Text style={styles.infoValue}>
                    {doctor?.roomNumber || "Chưa xác định"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Rating Section - Only shown for doctor feedback */}
        {feedbackType === "doctor" && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Vui lòng đánh giá bác sĩ</Text>
            {renderStarRating()}
            <Text style={styles.ratingDescription}>
              {rating === 0 && "Chưa đánh giá"}
              {rating === 1 && "Rất không hài lòng"}
              {rating === 2 && "Không hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Hài lòng"}
              {rating === 5 && "Rất hài lòng"}
            </Text>
          </View>
        )}

        {/* Comment Section - Only shown for doctor feedback */}
        {feedbackType === "doctor" && (
          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>Nhận xét của bạn</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Service Feedback Specific Fields - Only shown for service feedback */}
        {feedbackType === "service" && (
          <View style={styles.serviceFeedbackSection}>
            <Text style={styles.sectionTitle}>Chi tiết đánh giá dịch vụ</Text>
            <Text style={styles.sectionSubtitle}>
              Vui lòng đánh giá các khía cạnh sau về dịch vụ bạn đã trải nghiệm
            </Text>

            {renderFeedbackItem("Thái độ nhân viên", "staffFriendliness")}
            {renderFeedbackItem(
              "Rõ ràng trong giao tiếp",
              "communicationClarity"
            )}
            {renderFeedbackItem(
              "Sẵn sàng giải đáp thắc mắc",
              "questionWillingness"
            )}
            {renderFeedbackItem("Thời gian chờ hợp lý", "reasonableWaitTime")}
            {renderFeedbackItem("Đúng giờ hẹn", "onTimeAppointment")}
            {renderFeedbackItem("Quy trình rõ ràng", "clearProcedure")}
            {renderFeedbackItem("Hướng dẫn tận tình", "guidedThroughProcess")}
            {renderFeedbackItem("Cơ sở vật chất sạch sẽ", "cleanFacility")}
            {renderFeedbackItem("Trang thiết bị hiện đại", "modernEquipment")}
            {renderFeedbackItem(
              "Mức độ hài lòng tổng thể",
              "overallSatisfaction"
            )}
            {renderFeedbackItem(
              "Sẽ giới thiệu cho người khác",
              "recommendToOthers"
            )}
          </View>
        )}

        {/* Submit Button */}
        <Button
          title={isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          onPress={handleSubmitFeedback}
          disabled={isSubmitting || (feedbackType === "doctor" && rating === 0)}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1976d2",
    paddingVertical: 15,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  rightPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  loadingIndicator: {
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  appointmentInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  ratingSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  starContainer: {
    padding: 5,
  },
  ratingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  commentSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
    minHeight: 120,
  },
  submitButton: {
    marginBottom: 40,
  },
  serviceFeedbackSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  feedbackItem: {
    marginBottom: 16,
  },
  feedbackItemLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  feedbackOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  feedbackOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
    minWidth: 60,
  },
  feedbackOptionSelected: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
  },
  feedbackOptionText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  feedbackOptionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FeedbackScreen;
