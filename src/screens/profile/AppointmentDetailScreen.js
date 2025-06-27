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
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAppointmentByCode } from "../../services/appointmentService";
import Button from "../../components/common/Button";

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentCode, status } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  // Effect to refresh appointment details when coming back from feedback screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Refresh appointment data when screen comes into focus
      fetchAppointmentDetails();
    });

    // Cleanup the listener on component unmount
    return unsubscribe;
  }, [navigation]);

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointmentByCode(appointmentCode);
      // Nếu response có cấu trúc { isSuccess, value, error }
      if (response && response.isSuccess && response.value) {
        // Sử dụng status từ params nếu có, nếu không thì lấy từ response
        const appointmentData = {
          ...response.value,
          // Ưu tiên sử dụng status từ params (nếu có)
          checkupRecordStatus: status || response.value.checkupRecordStatus,
        };
        setAppointment(appointmentData);
        console.log("Appointment details:", response);
      } else {
        // Nếu response không có cấu trúc như trên, có thể là cấu trúc cũ
        const appointmentData = {
          ...response,
          // Ưu tiên sử dụng status từ params (nếu có)
          checkupRecordStatus: status || response.checkupRecordStatus,
        };
        setAppointment(appointmentData);
        console.log("Appointment details (legacy format):", response);
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
        return "#1976d2"; // Xanh dương - đã xác nhận
      case "Pending":
        return "#ff9800"; // Cam - chờ xác nhận
      case "InProgress":
      case "CheckedIn":
        return "#9c27b0"; // Tím - đang tiến hành
      case "Completed":
        return "#4caf50"; // Xanh lá - hoàn thành
      case "Cancelled":
        return "#f44336"; // Đỏ - đã hủy
      default:
        return "#757575"; // Xám - không xác định
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
        return "calendar-outline";
      case "Pending":
        return "time-outline";
      default:
        return "time-outline";
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
        <Text style={styles.headerTitle}>Chi tiết lịch hẹn</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Appointment Status */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: getStatusColor(
                  appointment?.checkupRecordStatus || status || "Scheduled"
                ),
              },
            ]}
          >
            <Icon
              name={getStatusIcon(appointment?.checkupRecordStatus || status)}
              size={32}
              color="#fff"
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {getStatusText(
                appointment?.checkupRecordStatus || status || "Scheduled"
              )}
            </Text>
            <Text style={styles.statusDescription}>
              {getStatusDescription(appointment?.checkupRecordStatus || status)}
            </Text>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="calendar-outline" size={24} color="#1976d2" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Ngày khám</Text>
              <Text style={styles.detailValue}>
                {formatDate(appointment?.bookingDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="time-outline" size={24} color="#1976d2" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Giờ khám</Text>
              <Text style={styles.detailValue}>
                {formatTime(appointment?.bookingDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="medkit-outline" size={24} color="#1976d2" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Dịch vụ</Text>
              <Text style={styles.detailValue}>
                {appointment?.packageName || "Dịch vụ khám bệnh"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="location-outline" size={24} color="#1976d2" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Phòng khám</Text>
              <Text style={styles.detailValue}>
                {appointment?.room || "Chưa có thông tin"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="card-outline" size={24} color="#1976d2" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Mã lịch hẹn</Text>
              <Text style={styles.detailValue}>#{appointmentCode}</Text>
            </View>
          </View>

          {appointment?.packagePrice && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="cash-outline" size={24} color="#1976d2" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Giá gói khám</Text>
                  <Text style={styles.detailValue}>
                    {appointment.packagePrice.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
              </View>
            </>
          )}

          {appointment?.targetGender && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="person-outline" size={24} color="#1976d2" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Đối tượng</Text>
                  <Text style={styles.detailValue}>
                    {appointment.targetGender === "Male" ? "Nam" : "Nữ"}
                    {appointment.targetAge ? ` (${appointment.targetAge})` : ""}
                  </Text>
                </View>
              </View>
            </>
          )}

          {appointment?.patientSymptom && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="fitness-outline" size={24} color="#1976d2" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Triệu chứng</Text>
                  <Text style={styles.detailValue}>
                    {appointment.patientSymptom || "Không có"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Services List */}
        {appointment?.services?.services &&
          appointment.services.services.length > 0 && (
            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Các dịch vụ đã đặt</Text>

              {appointment.services.services.map((service, index) => (
                <View key={index}>
                  <View style={styles.serviceRow}>
                    <Icon
                      name="checkmark-circle"
                      size={20}
                      color="#4caf50"
                      style={styles.serviceIcon}
                    />
                    <Text style={styles.serviceName}>
                      {service.name || `Dịch vụ ${index + 1}`}
                    </Text>
                  </View>
                  {index < appointment.services.services.length - 1 && (
                    <View style={styles.serviceDivider} />
                  )}
                </View>
              ))}
            </View>
          )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Chỉ hiển thị nút "Hủy lịch hẹn" cho lịch hẹn chưa hoàn thành */}
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
                        onPress: () => {
                          // Implement cancel appointment logic
                          Alert.alert(
                            "Thông báo",
                            "Tính năng đang được phát triển"
                          );
                        },
                      },
                    ]
                  )
                }
                style={styles.cancelButton}
              />
            )}

          {/* Chỉ hiển thị nút "Đánh giá dịch vụ" cho lịch hẹn đã hoàn thành */}
          {(status === "Completed" ||
            appointment?.checkupRecordStatus === "Completed") && (
            <Button
              title={
                appointment?.feedbackId || appointment?.feedbackDoctorId
                  ? "Xem đánh giá"
                  : "Đánh giá"
              }
              onPress={() => {
                const hasDoctorFeedback =
                  appointment?.feedbackDoctorId !== null;
                const hasServiceFeedback = appointment?.feedbackId !== null;

                // Always navigate to the feedback type selection screen
                // This allows the user to choose which type of feedback to give
                // Using navigate, then the FeedbackTypeSelectionScreen will replace itself with FeedbackScreen
                navigation.navigate("FeedbackTypeSelection", {
                  appointmentCode: appointmentCode,
                  feedbackStatus: {
                    hasDoctorFeedback,
                    hasServiceFeedback,
                    hasAllFeedbacks: hasDoctorFeedback && hasServiceFeedback,
                  },
                  fromAppointmentDetail: true,
                });
              }}
              style={styles.feedbackButton}
            />
          )}

          {/* Nút "Tạo lịch hẹn mới" hiển thị ở tất cả các trạng thái */}
          <Button
            title="Tạo lịch hẹn mới"
            onPress={() => navigation.navigate("Appointment")}
            style={[
              styles.newAppointmentButton,
              // Chỉ thêm marginTop khi có nút khác ở trên
              ((status !== "Completed" &&
                status !== "Cancelled" &&
                appointment?.checkupRecordStatus !== "Completed" &&
                appointment?.checkupRecordStatus !== "Cancelled") ||
                status === "Completed" ||
                appointment?.checkupRecordStatus === "Completed") && {
                marginTop: 12,
              },
            ]}
          />
        </View>
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
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
  },
  detailCard: {
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailIconContainer: {
    width: 40,
    alignItems: "center",
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  serviceIcon: {
    marginRight: 10,
  },
  serviceName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  serviceDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 30,
  },
  actionsContainer: {
    marginVertical: 20,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  feedbackButton: {
    backgroundColor: "#4caf50",
    marginBottom: 12,
  },
  newAppointmentButton: {
    backgroundColor: "#1976d2",
  },
});

export default AppointmentDetailScreen;
