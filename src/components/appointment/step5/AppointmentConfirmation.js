import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../common/Button";
import QRCode from "react-native-qrcode-svg";

const AppointmentConfirmation = ({
  appointment,
  patientProfile,
  navigation,
  resetAppointment,
  appointmentCode,
}) => {
  console.log(
    "[AppointmentConfirmation] Rendering with appointment:",
    appointment
  );

  // Calculate total price for an appointment
  const calculateAppointmentPrice = (appt) => {
    if (!appt) return 0;
    let total = 0;
    if (appt.package) {
      total += appt.package.price;
    }
    if (appt.services && appt.services.length > 0) {
      total += appt.services.reduce((sum, service) => sum + service.price, 0);
    }
    return total;
  };
  const generateQueueNumber = () => {
    // Sử dụng mã code từ API nếu có
    if (appointmentCode) {
      return appointmentCode;
    }

    // Nếu không có mã code từ API, tạo mã tạm thời
    if (!appointment?.date) return "N/A";
    const [day, month, year] = appointment.date.split("/");
    const dateStr = `${year.substr(-2)}${month}${day}`;
    const randomNum = Math.floor(Math.random() * 100);
    return `${dateStr}${randomNum.toString().padStart(3, "0")}`;
  };

  // Nếu không có appointment, hiển thị thông báo
  if (!appointment) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#f44336",
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          Không có thông tin lịch khám!
        </Text>
        <Button
          title="Về Trang Chủ"
          onPress={() => {
            resetAppointment();
            navigation.reset({
              index: 0,
              routes: [{ name: "Trang chủ" }],
            });
          }}
          style={{ width: 200 }}
        />
      </View>
    );
  }

  const queueNumber = generateQueueNumber();

  const qrData = JSON.stringify({
    code: queueNumber,
    patientName: patientProfile?.fullName,
    appointment: {
      package: appointment?.package?.name,
      services: appointment?.services?.map((s) => s.name),
      date: appointment?.date,
      time: appointment?.time?.time,
      room: appointment?.time?.room,
    },
    phone: patientProfile?.phone,
  });

  // Tính tổng chi phí
  const totalFee = (() => {
    const pkg = appointment?.packagePrice || 0;
    const add =
      appointment?.additionalServices?.reduce(
        (sum, s) => sum + (s.servicePrice || 0),
        0
      ) || 0;
    return pkg + add;
  })();

  // Hàm format ngày giờ Việt Nam
  const formatVietnamTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    // Cộng thêm 7 tiếng cho UTC+7
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const pad = (n) => n.toString().padStart(2, "0");
    const hours = pad(vietnamTime.getHours());
    const minutes = pad(vietnamTime.getMinutes());
    const day = pad(vietnamTime.getDate());
    const month = pad(vietnamTime.getMonth() + 1);
    const year = vietnamTime.getFullYear();
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.ticketContainer}>
        <View style={styles.qrSection}>
          <View style={styles.queueInfo}>
            <Text style={styles.queueLabel}>Mã đặt lịch:</Text>
            <Text style={styles.queueNumber}>{queueNumber}</Text>
            <Text style={styles.queueNote}>Vui lòng đến sớm 15 phút</Text>
          </View>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={qrData}
              size={120}
              color="#333"
              backgroundColor="#fff"
            />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Thông tin người khám</Text>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{patientProfile?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>
              {patientProfile?.gender === "Male" ? "Nam" : "Nữ"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{patientProfile?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>
              {patientProfile?.address || "Không có"}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Chi tiết đặt khám</Text>
        <View style={styles.appointmentDetails}>
          {/* Gói khám */}
          {appointment?.packageName && (
            <View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gói khám:</Text>
                <Text style={styles.detailValue}>
                  {appointment.packageName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Giá gói:</Text>
                <Text style={styles.detailValue}>
                  {appointment.packagePrice?.toLocaleString("vi-VN")}
                </Text>
              </View>
            </View>
          )}
          {/* Dịch vụ bổ sung */}
          {appointment?.additionalServices &&
            appointment.additionalServices.length > 0 && (
              <View style={styles.servicesContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Dịch vụ bổ sung ({appointment.additionalServices.length}):
                  </Text>
                </View>
                {appointment.additionalServices.map((service, idx) => (
                  <View key={idx} style={styles.serviceItem}>
                    <Text style={styles.serviceName}>
                      {service.serviceName}
                    </Text>
                    <Text style={styles.price}>
                      {service.servicePrice?.toLocaleString("vi-VN")}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          {/* Thời gian */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian:</Text>
            <Text style={styles.detailValue}>
              {appointment?.date
                ? `${appointment.date}`
                : appointment?.bookingDate
                ? `${formatVietnamTime(appointment.bookingDate)}`
                : "-"}
            </Text>
          </View>
          {/* Tổng chi phí */}
          <View style={[styles.detailRow, styles.feeRow]}>
            <Text style={styles.detailLabel}>Tổng chi phí:</Text>
            <Text style={styles.feeValue}>
              {totalFee.toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.buttonContainer, { marginBottom: 0 }]}>
        <Button
          title="Về Trang Chủ"
          onPress={() => {
            resetAppointment();
            // Navigate to the main Home tab in the BottomTabNavigator
            navigation.reset({
              index: 0,
              routes: [{ name: "Trang chủ" }],
            });
          }}
          style={{ width: "100%" }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  successHeader: {
    alignItems: "center",
    paddingVertical: 5,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
    marginTop: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  ticketContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  qrCodeContainer: {
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 16,
  },
  queueLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  queueNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e88e5",
    marginBottom: 4,
  },
  queueNote: {
    fontSize: 12,
    color: "#f39c12",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 4,
    alignItems: "flex-start", // Change from center to flex-start to align at the top
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    width: 110, // Fixed width for labels
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  appointmentDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e88e5",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  servicesContainer: {
    marginTop: 4,
    marginBottom: 8,
    paddingTop: 4,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingLeft: 10,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
    color: "#444",
    flex: 1,
  },
  feeRow: {
    marginTop: 4,
    paddingTop: 8,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e88e5",
    flex: 2,
    textAlign: "right",
  },
  packageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingLeft: 10,
  },
  price: {
    fontSize: 13,
    fontWeight: "500",
  },
  packageName: {
    color: "#333",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  halfButton: {
    flex: 0.48,
  },
});

export default AppointmentConfirmation;
