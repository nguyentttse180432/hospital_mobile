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
  getAppointmentFeedback,
} from "../../services/appointmentService";
import Button from "../../components/common/Button";
import ScreenContainer from "../../components/common/ScreenContainer";
import colors from "../../constant/colors"; // Import file colors.js mới

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentCode, status, patientName } = route.params;

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState({
    hasFeedback: false,
    isLoading: true,
  });
  const [showPrescription, setShowPrescription] = useState(false);

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

  // Hàm lấy trạng thái phản hồi từ API
  const fetchFeedbackStatus = async () => {
    if (!appointmentCode || status !== "Completed") {
      setFeedbackStatus({
        hasFeedback: false,
        isLoading: false,
      });
      return;
    }
    try {
      setFeedbackStatus((prev) => ({ ...prev, isLoading: true }));
      const feedbackResponse = await getAppointmentFeedback(appointmentCode);
      const hasFeedback =
        feedbackResponse &&
        feedbackResponse.isSuccess &&
        feedbackResponse.value !== null;
      setFeedbackStatus({
        hasFeedback,
        isLoading: false,
      });
      console.log("Trạng thái phản hồi:", { hasFeedback });
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái phản hồi:", error);
      setFeedbackStatus({
        hasFeedback: false,
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

      // Lấy trạng thái phản hồi nếu lịch hẹn đã hoàn thành
      if (
        status === "Completed" ||
        response?.value?.checkupRecordStatus === "Completed" ||
        response?.checkupRecordStatus === "Completed"
      ) {
        await fetchFeedbackStatus();
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin lịch hẹn:", error);
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
        return colors.primaryBlue; 
      case "Pending":
        return colors.warningYellow; 
      case "InProgress":
      case "CheckedIn":
        return colors.purple; 
      case "Completed":
        return colors.successGreen; 
      case "Cancelled":
        return colors.errorRed; 
      default:
        return colors.textGray;   
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
        onBack={() => navigation.navigate("ExaminationMain")}
      >
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}
          >
            <Icon name="sync" size={48} color={colors.primaryBlue} />
          </Animated.View>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="Chi tiết lịch hẹn"
      onBack={() => navigation.navigate("ExaminationMain")}
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
              color={colors.white}
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
                color={colors.primaryBlue}
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
                color={colors.primaryBlue}
                style={styles.infoIcon}
              />
              <View>
                <Text style={styles.infoLabel}>Người khám</Text>
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
                color={colors.primaryBlue}
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
                  color={colors.primaryBlue}
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
              color={colors.primaryBlue}
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
                        color={colors.primaryBlue}
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
            <>
              <Button
                title="Xem kết quả khám"
                onPress={() => {
                  navigation.navigate("CheckupResults", {
                    checkupCode: appointmentCode,
                    patientName: patientName,
                  });
                }}
                style={styles.viewResultsButton}
              />
              {/* Nút xem thuốc */}
              <Button
                title="Xem thuốc"
                onPress={() =>
                  navigation.navigate("PrescriptionScreen", {
                    checkupCode: appointmentCode,
                  })
                }
                style={[
                  styles.viewResultsButton,
                  { backgroundColor: colors.successGreen, marginTop: 10 },
                ]}
              />
              <Button
                title={
                  feedbackStatus.isLoading
                    ? "Đang kiểm tra..."
                    : feedbackStatus.hasFeedback
                    ? "Xem đánh giá"
                    : "Đánh giá"
                }
                onPress={() => {
                  navigation.navigate("FeedbackScreen", {
                    appointmentCode: appointmentCode,
                    patientName: patientName,
                  });
                }}
                style={[
                  styles.feedbackButton,
                  feedbackStatus.isLoading && styles.disabledButton,
                ]}
                disabled={feedbackStatus.isLoading}
              />
            </>
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
    backgroundColor: colors.lightGray, 
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primaryBlue,
    letterSpacing: 0.2,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGray,
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
    color: colors.textDarker,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textGray,
    lineHeight: 20,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDarker,
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
    color: colors.textGray,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textDarker,
  },
  infoSubValue: {
    fontSize: 13,
    color: colors.textGray,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceCount: {
    backgroundColor: colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceCountText: {
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: "500",
  },
  packageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray, 
    borderRadius: 8,
    padding: 12,
  },
  packageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.successGreen,
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
    color: colors.textDarker,
    marginBottom: 6,
  },
  packageMeta: {
    flexDirection: "row",
    gap: 16,
  },
  packageCode: {
    fontSize: 13,
    color: colors.textGray,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryBlue,
  },
  packagePriceText: {
    color: colors.primaryBlue,
    fontWeight: "700",
  },
  serviceGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMedium,
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
    color: colors.textDarker,
  },
  packageName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDarker,
  },
  serviceCode: {
    fontSize: 12,
    color: colors.textGray,
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryBlue,
  },
  serviceDivider: {
    height: 1,
    backgroundColor: colors.borderGray,
    marginVertical: 8,
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    marginTop: 16,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDarker,
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryBlue,
  },
  actionsContainer: {
    marginVertical: 24,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: colors.errorRed,
    borderRadius: 8,
    paddingVertical: 14,
  },
  feedbackButton: {
    backgroundColor: colors.successGreen,
    borderRadius: 8,
    paddingVertical: 14,
  },
  disabledButton: {
    backgroundColor: colors.gray,
    opacity: 0.7,
  },
  viewResultsButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 8,
    paddingVertical: 14,
  },
  newAppointmentButton: {
    backgroundColor: colors.primaryDarkBlue,
    borderRadius: 8,
    paddingVertical: 14,
  },
});

export default AppointmentDetailScreen;
