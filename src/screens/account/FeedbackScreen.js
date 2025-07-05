import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  getAppointmentByCode,
  submitFeedback,
  getDoctorByCode,
  getDoctorFeedback,
  getServiceFeedback,
} from "../../services/appointmentService";
import Button from "../../components/common/Button";

const FeedbackScreenNew = ({ route, navigation }) => {
  const {
    appointmentCode,
    feedbackType = "service",
    isViewMode = false,
    status, // Save the status from route params
    patientName, // Save the patient name from route params
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // For service feedback
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
    recommendToOthers: true,
  });

  // Load all data
  useEffect(() => {
    console.log("FeedbackScreen loading with params:", route.params);
    // Log specifically status and patientName
    console.log("Status:", status, "PatientName:", patientName);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Get appointment details
      const appointmentResponse = await getAppointmentByCode(appointmentCode);
      if (appointmentResponse && appointmentResponse.value) {
        setAppointment(appointmentResponse.value);
      }

      // 2. Get doctor details if needed
      if (feedbackType === "doctor") {
        try {
          const doctorResponse = await getDoctorByCode(appointmentCode);
          if (doctorResponse && doctorResponse.value) {
            setDoctor(doctorResponse.value);
          }
        } catch (error) {
          console.log("Error fetching doctor:", error);
        }
      }

      // 3. Get existing feedback if in view mode
      if (isViewMode) {
        try {
          if (feedbackType === "doctor") {
            const feedbackResponse = await getDoctorFeedback(appointmentCode);
            if (feedbackResponse && feedbackResponse.value) {
              setExistingFeedback(feedbackResponse.value);
              setRating(feedbackResponse.value.star || 0);
              setComment(feedbackResponse.value.detail || "");
            }
          } else {
            const feedbackResponse = await getServiceFeedback(appointmentCode);
            if (feedbackResponse && feedbackResponse.value) {
              setExistingFeedback(feedbackResponse.value);
              // Update service feedback fields
              const fb = feedbackResponse.value;
              setFeedbackFields({
                staffFriendliness:
                  fb.staffFriendliness === "VeryBad"
                    ? "Bad"
                    : fb.staffFriendliness || "Neutral",
                communicationClarity:
                  fb.communicationClarity === "VeryBad"
                    ? "Bad"
                    : fb.communicationClarity || "Neutral",
                questionWillingness:
                  fb.questionWillingness === "VeryBad"
                    ? "Bad"
                    : fb.questionWillingness || "Neutral",
                reasonableWaitTime:
                  fb.reasonableWaitTime === "VeryBad"
                    ? "Bad"
                    : fb.reasonableWaitTime || "Neutral",
                onTimeAppointment:
                  fb.onTimeAppointment === "VeryBad"
                    ? "Bad"
                    : fb.onTimeAppointment || "Neutral",
                clearProcedure:
                  fb.clearProcedure === "VeryBad"
                    ? "Bad"
                    : fb.clearProcedure || "Neutral",
                guidedThroughProcess:
                  fb.guidedThroughProcess === "VeryBad"
                    ? "Bad"
                    : fb.guidedThroughProcess || "Neutral",
                cleanFacility:
                  fb.cleanFacility === "VeryBad"
                    ? "Bad"
                    : fb.cleanFacility || "Neutral",
                modernEquipment:
                  fb.modernEquipment === "VeryBad"
                    ? "Bad"
                    : fb.modernEquipment || "Neutral",
                overallSatisfaction:
                  fb.overallSatisfaction === "VeryBad"
                    ? "Bad"
                    : fb.overallSatisfaction || "Neutral",
                recommendToOthers:
                  fb.recommendToOthers !== undefined
                    ? fb.recommendToOthers
                    : true,
              });
            }
          }
        } catch (error) {
          console.log("Error fetching feedback:", error);
        }
      }
    } catch (error) {
      console.log("Error in loadData:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback
  const handleSubmit = async () => {
    if (feedbackType === "doctor" && rating === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá số sao");
      return;
    }

    try {
      setSubmitting(true);

      let feedbackData;
      if (feedbackType === "doctor") {
        feedbackData = {
          code: appointmentCode,
          star: rating,
          detail: comment,
        };
      } else {
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
        };
      }

      await submitFeedback(appointmentCode, feedbackData, feedbackType);

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!", [
        {
          text: "OK",
          onPress: () => {
            if (route.params?.fromAppointmentDetail) {
              navigation.navigate("AppointmentDetail", {
                appointmentCode: appointmentCode,
                status: status,
                patientName: patientName,
              });
            } else {
              navigation.navigate({
                name: "ProfileMain",
                params: { feedbackCompleted: true },
                merge: true,
              });
            }
          },
        },
      ]);
    } catch (error) {
      console.log("Error submitting feedback:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
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

  // Render star rating component
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !isViewMode && setRating(i)}
          style={styles.star}
          disabled={isViewMode}
        >
          <Icon
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#FFC107" : "#aaa"}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  // Render a service feedback item with options
  const renderFeedbackItem = (label, field) => {
    const options = [
      { value: "Bad", label: "Kém" },
      { value: "Neutral", label: "Bình thường" },
      { value: "Good", label: "Tốt" },
      { value: "Excellent", label: "Xuất sắc" },
    ];

    return (
      <View style={styles.feedbackItem}>
        <Text style={styles.feedbackLabel}>{label}</Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                feedbackFields[field] === option.value && styles.selectedOption,
              ]}
              onPress={() =>
                !isViewMode &&
                setFeedbackFields({
                  ...feedbackFields,
                  [field]: option.value,
                })
              }
              disabled={isViewMode}
            >
              <Text
                style={[
                  styles.optionText,
                  feedbackFields[field] === option.value &&
                    styles.selectedOptionText,
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

  // Render a boolean feedback item (Yes/No)
  const renderBooleanFeedbackItem = (label, field) => {
    const options = [
      { value: true, label: "Có" },
      { value: false, label: "Không" },
    ];

    return (
      <View style={styles.feedbackItem}>
        <Text style={styles.feedbackLabel}>{label}</Text>
        <View style={styles.booleanOptionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value.toString()}
              style={[
                styles.booleanOption,
                feedbackFields[field] === option.value &&
                  styles.selectedBooleanOption,
              ]}
              onPress={() =>
                !isViewMode &&
                setFeedbackFields({
                  ...feedbackFields,
                  [field]: option.value,
                })
              }
              disabled={isViewMode}
            >
              <Text
                style={[
                  styles.booleanOptionText,
                  feedbackFields[field] === option.value &&
                    styles.selectedBooleanOptionText,
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

  // Display no feedback screen if viewing but no feedback exists
  if (isViewMode && !existingFeedback && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Go back directly to the profile/appointment detail screen
              if (route.params?.fromAppointmentDetail) {
                navigation.navigate("AppointmentDetail", {
                  appointmentCode: appointmentCode,
                  status: status,
                  patientName: patientName,
                });
              } else {
                navigation.navigate("ProfileMain");
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {feedbackType === "doctor" ? "Đánh giá bác sĩ" : "Đánh giá dịch vụ"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.noFeedbackContainer}>
          <Icon name="alert-circle-outline" size={80} color="#757575" />
          <Text style={styles.noFeedbackTitle}>Không có đánh giá</Text>
          <Text style={styles.noFeedbackMessage}>
            {feedbackType === "doctor"
              ? "Bạn chưa đánh giá bác sĩ cho lịch hẹn này"
              : "Bạn chưa đánh giá dịch vụ cho lịch hẹn này"}
          </Text>

          <View style={styles.buttonGroup}>
            <Button
              title="Đánh giá ngay"
              onPress={() =>
                navigation.replace("Feedback", {
                  appointmentCode,
                  feedbackType,
                  isViewMode: false,
                })
              }
              style={{ marginBottom: 10 }}
            />{" "}
            <Button
              title="Quay lại"
              onPress={() => {
                // Go back directly to the profile/appointment detail screen
                if (route.params?.fromAppointmentDetail) {
                  navigation.navigate("AppointmentDetail", {
                    appointmentCode: appointmentCode,
                    status: status,
                    patientName: patientName,
                  });
                } else {
                  navigation.navigate("ProfileMain");
                }
              }}
              style={{ backgroundColor: "#757575" }}
            />
          </View>
        </View>
      </View>
    );
  }

  // Display loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Main feedback screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // Go back directly to the profile/appointment detail screen
            if (route.params?.fromAppointmentDetail) {
              navigation.navigate("AppointmentDetail", {
                appointmentCode: appointmentCode,
                status: status,
                patientName: patientName,
              });
            } else {
              navigation.navigate("ProfileMain");
            }
          }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isViewMode
            ? feedbackType === "doctor"
              ? "Xem đánh giá bác sĩ"
              : "Xem đánh giá dịch vụ"
            : feedbackType === "doctor"
            ? "Đánh giá bác sĩ"
            : "Đánh giá dịch vụ"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Appointment summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết lịch khám</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã lịch hẹn:</Text>
            <Text style={styles.infoValue}>#{appointmentCode}</Text>
          </View>

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
            </>
          )}
        </View>

        {/* Doctor specific feedback */}
        {feedbackType === "doctor" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {isViewMode ? "Đánh giá của bạn cho bác sĩ" : "Đánh giá bác sĩ"}
              </Text>

              {renderStars()}

              <Text style={styles.ratingText}>
                {rating === 0 && "Chưa đánh giá"}
                {rating === 1 && "Rất không hài lòng"}
                {rating === 2 && "Không hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Hài lòng"}
                {rating === 5 && "Rất hài lòng"}
              </Text>

              <Text style={styles.inputLabel}>Nhận xét của bạn</Text>
              <TextInput
                style={[styles.textInput, isViewMode && styles.disabledInput]}
                value={comment}
                onChangeText={(text) => !isViewMode && setComment(text)}
                placeholder="Nhận xét về bác sĩ..."
                multiline
                numberOfLines={4}
                editable={!isViewMode}
              />
            </View>
          </>
        )}

        {/* Service feedback */}
        {feedbackType === "service" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isViewMode
                ? "Đánh giá của bạn về dịch vụ"
                : "Đánh giá về dịch vụ"}
            </Text>

            {renderFeedbackItem("Thái độ nhân viên", "staffFriendliness")}
            {renderFeedbackItem("Giao tiếp rõ ràng", "communicationClarity")}
            {renderFeedbackItem("Sẵn sàng giải đáp", "questionWillingness")}
            {renderFeedbackItem("Thời gian chờ hợp lý", "reasonableWaitTime")}
            {renderFeedbackItem("Đúng giờ hẹn", "onTimeAppointment")}
            {renderFeedbackItem("Quy trình rõ ràng", "clearProcedure")}
            {renderFeedbackItem("Hướng dẫn tận tình", "guidedThroughProcess")}
            {renderFeedbackItem("Cơ sở vật chất sạch sẽ", "cleanFacility")}
            {renderFeedbackItem("Trang thiết bị hiện đại", "modernEquipment")}
            {renderFeedbackItem("Mức độ hài lòng", "overallSatisfaction")}
            {renderBooleanFeedbackItem(
              "Giới thiệu cho người khác",
              "recommendToOthers"
            )}
          </View>
        )}

        {/* Submit button - only in create mode */}
        {!isViewMode && (
          <Button
            title={submitting ? "Đang gửi..." : "Gửi đánh giá"}
            onPress={handleSubmit}
            disabled={submitting}
            style={{ marginBottom: 40, marginTop: 10 }}
          />
        )}

        {/* Close button - only in view mode */}
        {isViewMode && (
          <Button
            title="Đóng"
            onPress={() => {
              // Go back directly to the profile/appointment detail screen
              if (route.params?.fromAppointmentDetail) {
                navigation.navigate("AppointmentDetail", {
                  appointmentCode: appointmentCode,
                  status: status,
                  patientName: patientName,
                });
              } else {
                navigation.navigate("ProfileMain");
              }
            }}
            style={{
              backgroundColor: "#757575",
              marginBottom: 40,
              marginTop: 10,
            }}
          />
        )}
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
    backgroundColor: "#4299e1",
    paddingVertical: 15,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontWeight: "500",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  star: {
    padding: 5,
  },
  ratingText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 8,
    color: "#666",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: "#f9f9f9",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
    borderColor: "#e0e0e0",
  },
  feedbackItem: {
    marginBottom: 16,
  },
  feedbackLabel: {
    marginBottom: 8,
    color: "#666",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  option: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
    minWidth: 65,
  },
  selectedOption: {
    backgroundColor: "#4299e1",
    borderColor: "#4299e1",
  },
  optionText: {
    fontSize: 13,
    textAlign: "center",
    width: "100%",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  booleanOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  booleanOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedBooleanOption: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
  },
  booleanOptionText: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    width: "100%",
  },
  selectedBooleanOptionText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  noFeedbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    margin: 30,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
  },
  noFeedbackTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  noFeedbackMessage: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  buttonGroup: {
    width: "100%",
  },
});

export default FeedbackScreenNew;
