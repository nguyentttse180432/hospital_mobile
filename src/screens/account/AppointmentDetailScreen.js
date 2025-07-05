import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  getAppointmentByCode,
  getDoctorFeedback,
  getServiceFeedback,
} from "../../services/appointmentService";
import Button from "../../components/common/Button";
import ScreenContainer from "../../components/common/ScreenContainer";

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentCode, status, patientName } = route.params;

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState({
    hasDoctorFeedback: false,
    hasServiceFeedback: false,
    isLoading: true,
  });

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isLoading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchAppointmentDetails();
    });
    return unsubscribe;
  }, [navigation]);

  // Function to fetch feedback status from API
  const fetchFeedbackStatus = async () => {
    if (!appointmentCode || status !== "Completed") {
      setFeedbackStatus({
        hasDoctorFeedback: false,
        hasServiceFeedback: false,
        isLoading: false,
      });
      return;
    }

    try {
      setFeedbackStatus((prev) => ({ ...prev, isLoading: true }));

      // Get doctor feedback
      const doctorFeedbackResponse = await getDoctorFeedback(appointmentCode);
      const hasDoctorFeedback =
        doctorFeedbackResponse &&
        doctorFeedbackResponse.isSuccess &&
        doctorFeedbackResponse.value;

      // Get service feedback
      const serviceFeedbackResponse = await getServiceFeedback(appointmentCode);
      const hasServiceFeedback =
        serviceFeedbackResponse &&
        serviceFeedbackResponse.isSuccess &&
        serviceFeedbackResponse.value;

      setFeedbackStatus({
        hasDoctorFeedback: !!hasDoctorFeedback,
        hasServiceFeedback: !!hasServiceFeedback,
        isLoading: false,
      });

      console.log("Feedback status:", {
        hasDoctorFeedback: !!hasDoctorFeedback,
        hasServiceFeedback: !!hasServiceFeedback,
      });
    } catch (error) {
      console.error("Error fetching feedback status:", error);
      setFeedbackStatus({
        hasDoctorFeedback: false,
        hasServiceFeedback: false,
        isLoading: false,
      });
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointmentByCode(appointmentCode);
      if (response && response.isSuccess && response.value) {
        const appointmentData = {
          ...response.value,
          checkupRecordStatus: status || response.value.checkupRecordStatus,
        };
        setAppointment(appointmentData);
      } else {
        const appointmentData = {
          ...response,
          checkupRecordStatus: status || response.checkupRecordStatus,
        };
        setAppointment(appointmentData);
      }

      // Fetch feedback status if appointment is completed
      if (
        status === "Completed" ||
        response?.value?.checkupRecordStatus === "Completed" ||
        response?.checkupRecordStatus === "Completed"
      ) {
        await fetchFeedbackStatus();
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin lịch hẹn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
      case "Confirmed":
        return "#4299e1";
      case "Pending":
        return "#f59e0b";
      case "InProgress":
      case "CheckedIn":
        return "#7c3aed";
      case "Completed":
        return "#059669";
      case "Cancelled":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Scheduled":
        return "Đã đặt lịch";
      case "InProgress":
        return "Đang xử lý";
      case "Completed":
        return "Đã hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      case "Pending":
        return "Chờ xác nhận";
      case "Confirmed":
        return "Đã xác nhận";
      case "CheckedIn":
        return "Đã check-in";
      default:
        return "Chờ xác nhận";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return "checkmark-circle";
      case "Cancelled":
        return "close-circle";
      case "InProgress":
      case "CheckedIn":
        return "medical";
      case "Scheduled":
      case "Confirmed":
        return "calendar";
      case "Pending":
        return "time";
      default:
        return "time";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "Completed":
        return "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi";
      case "Cancelled":
        return "Lịch hẹn này đã bị hủy";
      case "InProgress":
        return "Lịch hẹn của bạn đang được xử lý";
      case "CheckedIn":
        return "Bạn đã check-in thành công, vui lòng chờ đến lượt";
      case "Scheduled":
      case "Confirmed":
        return "Vui lòng đến đúng giờ để được phục vụ tốt nhất";
      case "Pending":
        return "Lịch hẹn của bạn đang chờ xác nhận";
      default:
        return "Vui lòng đến đúng giờ để được phục vụ tốt nhất";
    }
  };

  const calculateTotalPrice = () => {
    let total = appointment?.packagePrice || 0;
    if (
      appointment?.additionalServices &&
      appointment.additionalServices.length > 0
    ) {
      appointment.additionalServices.forEach((service) => {
        total += service.servicePrice || service.price || 0;
      });
    }
    return total;
  };

  if (isLoading) {
    return (
      <ScreenContainer
        title="Chi tiết lịch hẹn"
        headerBackgroundColor="#4299e1"
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      >
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}
          >
            <Icon name="sync" size={48} color="#4299e1" />
          </Animated.View>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="Chi tiết lịch hẹn"
      headerBackgroundColor="#4299e1"
      leftComponent={
        <TouchableOpacity
          onPress={() => navigation.navigate("ExaminationMain")}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      }
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: getStatusColor(
                  appointment?.checkupRecordStatus || status
                ),
              },
            ]}
          >
            <Icon
              name={getStatusIcon(appointment?.checkupRecordStatus || status)}
              size={28}
              color="#fff"
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {getStatusText(appointment?.checkupRecordStatus || status)}
            </Text>
            <Text style={styles.statusDescription}>
              {getStatusDescription(appointment?.checkupRecordStatus || status)}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon
                name="calendar-outline"
                size={20}
                color="#4299e1"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Thời gian khám</Text>
                <Text style={styles.infoValue}>
                  {formatDate(appointment?.bookingDate)} -{" "}
                  {formatTime(appointment?.bookingDate)}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon
                name="person-outline"
                size={20}
                color="#4299e1"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Bệnh nhân</Text>
                <Text style={styles.infoValue}>
                  {patientName || "Không có thông tin"}
                </Text>
                {appointment?.patientPhone && (
                  <Text style={styles.infoSubValue}>
                    SĐT: {appointment.patientPhone}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon
                name="card-outline"
                size={20}
                color="#4299e1"
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Mã lịch hẹn</Text>
                <Text style={styles.infoValue}>#{appointmentCode}</Text>
              </View>
            </View>
            {appointment?.patientSymptom && (
              <View style={styles.infoRow}>
                <Icon
                  name="fitness-outline"
                  size={20}
                  color="#4299e1"
                  style={styles.infoIcon}
                />
                <View>
                  <Text style={styles.infoLabel}>Triệu chứng</Text>
                  <Text style={styles.infoValue}>
                    {appointment.patientSymptom}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Dịch vụ</Text>
          </View>

          <Text style={styles.serviceGroupTitle}>Gói khám</Text>
          <View style={styles.serviceRow}>
            <Icon
              name="medkit-outline"
              size={20}
              color="#4299e1"
              style={styles.serviceIcon}
            />
            <View style={styles.serviceNameContainer}>
              <Text style={[styles.serviceName, styles.packageName]}>
                {appointment?.packageName || "Không có thông tin"}
              </Text>
              {appointment?.packageCode && (
                <Text style={styles.serviceCode}>
                  Mã: {appointment.packageCode}
                </Text>
              )}
            </View>
            {appointment?.packagePrice && (
              <Text style={[styles.servicePrice, styles.packagePriceText]}>
                {appointment.packagePrice.toLocaleString("vi-VN")}
              </Text>
            )}
          </View>

          {appointment?.additionalServices &&
            appointment.additionalServices.length > 0 && (
              <>
                <View style={styles.serviceDivider} />
                <Text style={styles.serviceGroupTitle}>Dịch vụ bổ sung</Text>
                {appointment.additionalServices.map((service, index) => (
                  <View key={`additional-${index}`}>
                    <View style={styles.serviceRow}>
                      <Icon
                        name="add-circle-outline"
                        size={20}
                        color="#4299e1"
                        style={styles.serviceIcon}
                      />
                      <View style={styles.serviceNameContainer}>
                        <Text style={styles.serviceName}>
                          {service.serviceName || service.name}
                        </Text>
                        {service.serviceCode && (
                          <Text style={styles.serviceCode}>
                            Mã: {service.serviceCode.trim()}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.servicePrice}>
                        {service.servicePrice
                          ? `${service.servicePrice.toLocaleString("vi-VN")} `
                          : service.price
                          ? `${service.price.toLocaleString("vi-VN")} `
                          : ""}
                      </Text>
                    </View>
                    {index < appointment.additionalServices.length - 1 && (
                      <View style={styles.serviceDivider} />
                    )}
                  </View>
                ))}
              </>
            )}

          {appointment?.packagePrice && (
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Tổng tiền</Text>
              <Text style={styles.totalPriceValue}>
                {calculateTotalPrice().toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {status !== "Completed" &&
            status !== "Cancelled" &&
            appointment?.checkupRecordStatus !== "Completed" &&
            appointment?.checkupRecordStatus !== "Cancelled" && (
              <Button
                title="Hủy lịch hẹn"
                onPress={() =>
                  Alert.alert(
                    "Xác nhận",
                    "Bạn có chắc chắn muốn hủy lịch hẹn này?",
                    [
                      { text: "Không", style: "cancel" },
                      {
                        text: "Có, hủy lịch",
                        style: "destructive",
                        onPress: () =>
                          Alert.alert(
                            "Thông báo",
                            "Tính năng đang được phát triển"
                          ),
                      },
                    ]
                  )
                }
                style={styles.cancelButton}
              />
            )}
          {(status === "Completed" ||
            appointment?.checkupRecordStatus === "Completed") && (
            <Button
              title={
                feedbackStatus.isLoading
                  ? "Đang kiểm tra..."
                  : feedbackStatus.hasDoctorFeedback ||
                    feedbackStatus.hasServiceFeedback
                  ? "Xem đánh giá"
                  : "Đánh giá"
              }
              onPress={() => {
                navigation.navigate("FeedbackTypeSelection", {
                  appointmentCode: appointmentCode,
                  feedbackStatus: {
                    hasDoctorFeedback: feedbackStatus.hasDoctorFeedback,
                    hasServiceFeedback: feedbackStatus.hasServiceFeedback,
                    hasAllFeedbacks:
                      feedbackStatus.hasDoctorFeedback &&
                      feedbackStatus.hasServiceFeedback,
                  },
                  fromAppointmentDetail: true,
                  status: status || appointment?.checkupRecordStatus,
                  patientName: patientName,
                });
              }}
              style={[
                styles.feedbackButton,
                feedbackStatus.isLoading && styles.disabledButton,
              ]}
              disabled={feedbackStatus.isLoading}
            />
          )}
          <Button
            title="Tạo lịch hẹn mới"
            onPress={() => navigation.navigate("Đặt lịch")}
            style={[
              styles.newAppointmentButton,
              {
                marginTop:
                  (status !== "Completed" &&
                    status !== "Cancelled" &&
                    appointment?.checkupRecordStatus !== "Completed" &&
                    appointment?.checkupRecordStatus !== "Cancelled") ||
                  status === "Completed" ||
                  appointment?.checkupRecordStatus === "Completed"
                    ? 16
                    : 0,
              },
            ]}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4299e1",
    letterSpacing: 0.2,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    letterSpacing: 0.2,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
  },
  infoSubValue: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceCount: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceCountText: {
    fontSize: 12,
    color: "#4299e1",
    fontWeight: "500",
  },
  packageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
  },
  packageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  packageMeta: {
    flexDirection: "row",
    gap: 16,
  },
  packageCode: {
    fontSize: 13,
    color: "#6b7280",
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4299e1",
  },
  packagePriceText: {
    color: "#4299e1",
    fontWeight: "700",
  },
  serviceGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  serviceIcon: {
    marginRight: 12,
  },
  serviceNameContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  packageName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  serviceCode: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4299e1",
  },
  serviceDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 16,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4299e1",
  },
  actionsContainer: {
    marginVertical: 24,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 14,
  },
  feedbackButton: {
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingVertical: 14,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  newAppointmentButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
  },
});

export default AppointmentDetailScreen;
