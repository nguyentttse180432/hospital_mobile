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
  sendAppointmentFeedback,
  getAppointmentFeedback,
} from "../../services/appointmentService";
import Button from "../../components/common/Button";
import ScreenContainer from "../../components/common/ScreenContainer";
import colors from "../../constant/colors"; // Import colors from your constants

const FeedbackScreen = ({ route, navigation }) => {
  const { appointmentCode, patientName } = route.params;

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    code: appointmentCode,
    serviceStar: 5,
    serviceFeedbackDetail: "",
    doctorStar: 5,
    doctorFeedbackDetail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const res = await getAppointmentFeedback(appointmentCode);
        if (res && res.isSuccess && res.value) {
          setExistingFeedback(res.value);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [appointmentCode]);

  const handleRatingChange = (type, value) => {
    setFeedback({
      ...feedback,
      [type]: value,
    });
  };

  const handleCommentChange = (type, text) => {
    setFeedback({
      ...feedback,
      [type]: text,
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const response = await sendAppointmentFeedback(appointmentCode, feedback);

      Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (type) => {
    const stars = [];
    const fieldName = type === "service" ? "serviceStar" : "doctorStar";
    const currentRating = feedback[fieldName];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={`${type}-star-${i}`}
          onPress={() => handleRatingChange(fieldName, i)}
          style={styles.starContainer}
        >
          <Icon
            name={i <= currentRating ? "star" : "star-outline"}
            size={32}
            color={i <= currentRating ? "#f59e0b" : "#d1d5db"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <ScreenContainer title="Đánh giá" hasBottomTabs={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (existingFeedback) {
    return (
      <ScreenContainer
        title="Đánh giá"
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      >
        <ScrollView style={styles.container}>
          <View style={styles.infoContainer}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.appointmentCode}>
              Mã lịch hẹn: {appointmentCode}
            </Text>
          </View>
          {/* Hiển thị feedback đã gửi */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>Đánh giá dịch vụ</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon
                  key={i}
                  name={
                    i <= (existingFeedback.serviceStar || 0)
                      ? "star"
                      : "star-outline"
                  }
                  size={32}
                  color={
                    i <= (existingFeedback.serviceStar || 0)
                      ? "#f59e0b"
                      : "#d1d5db"
                  }
                  style={styles.starContainer}
                />
              ))}
              <Text style={styles.ratingText}>
                {existingFeedback.serviceStar}/5
              </Text>
            </View>
            {!!existingFeedback.serviceFeedbackDetail && (
              <Text style={styles.commentInput}>
                {existingFeedback.serviceFeedbackDetail}
              </Text>
            )}
          </View>
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>
              Đánh giá bác sĩ
              {existingFeedback.doctorName
                ? ` (${existingFeedback.doctorName})`
                : ""}
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon
                  key={i}
                  name={
                    i <= (existingFeedback.doctorStar || 0)
                      ? "star"
                      : "star-outline"
                  }
                  size={32}
                  color={
                    i <= (existingFeedback.doctorStar || 0)
                      ? "#f59e0b"
                      : "#d1d5db"
                  }
                  style={styles.starContainer}
                />
              ))}
              <Text style={styles.ratingText}>
                {existingFeedback.doctorStar}/5
              </Text>
            </View>
            {!!existingFeedback.doctorFeedbackDetail && (
              <Text style={styles.commentInput}>
                {existingFeedback.doctorFeedbackDetail}
              </Text>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="Đánh giá"
      leftComponent={
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      }
    >
      <ScrollView style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.appointmentCode}>
            Mã lịch hẹn: {appointmentCode}
          </Text>
        </View>

        {/* Đánh giá dịch vụ */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Đánh giá dịch vụ</Text>
          <View style={styles.ratingContainer}>
            {renderStars("service")}
            <Text style={styles.ratingText}>{feedback.serviceStar}/5</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Nhận xét về dịch vụ (không bắt buộc)"
            multiline
            numberOfLines={4}
            value={feedback.serviceFeedbackDetail}
            onChangeText={(text) =>
              handleCommentChange("serviceFeedbackDetail", text)
            }
          />
        </View>

        {/* Đánh giá bác sĩ */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Đánh giá bác sĩ</Text>
          <View style={styles.ratingContainer}>
            {renderStars("doctor")}
            <Text style={styles.ratingText}>{feedback.doctorStar}/5</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Nhận xét về bác sĩ (không bắt buộc)"
            multiline
            numberOfLines={4}
            value={feedback.doctorFeedbackDetail}
            onChangeText={(text) =>
              handleCommentChange("doctorFeedbackDetail", text)
            }
          />
        </View>

        <Button
          title={submitting ? "Đang gửi..." : "Gửi đánh giá"}
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={submitting}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4a5568",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  appointmentCode: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  feedbackSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  starContainer: {
    marginRight: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  commentInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.primaryBlue,
    marginVertical: 24,
    borderRadius: 8,
    paddingVertical: 14,
  },
});

export default FeedbackScreen;
