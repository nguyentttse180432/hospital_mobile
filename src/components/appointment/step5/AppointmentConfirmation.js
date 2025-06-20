import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../common/Button";
import QRCode from "react-native-qrcode-svg";

const AppointmentConfirmation = ({
  appointments,
  patientProfile,
  navigation,
  resetAppointment,
  appointmentCode,
}) => {
  // Calculate total price for an appointment
  const calculateAppointmentPrice = (appt) => {
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
    if (!appointments[0]?.date) return "N/A";
    const [day, month, year] = appointments[0]?.date.split("/");
    const dateStr = `${year.substr(-2)}${month}${day}`;
    const randomNum = Math.floor(Math.random() * 100);
    return `${dateStr}${randomNum.toString().padStart(3, "0")}`;
  };

  const queueNumber = generateQueueNumber();
  const qrData = JSON.stringify({
    code: queueNumber,
    patientName: patientProfile?.fullName,
    appointments: appointments.map((appt) => ({
      package: appt.package?.name,
      services: appt.services?.map((s) => s.name),
      date: appt.date,
      time: appt.time?.time,
      room: appt.time?.room,
    })),
    phone: patientProfile?.phone,
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.successHeader}>
        <Icon name="checkmark-circle" size={60} color="#2ecc71" />
        <Text style={styles.successTitle}>Đặt Lịch Thành Công!</Text>
        <Text style={styles.successSubtitle}>Phiếu khám bệnh của bạn</Text>
      </View>
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

        <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Họ và tên: {patientProfile?.fullName}
          </Text>
          <Text style={styles.infoText}>
            Giới tính: {patientProfile?.gender === "Male" ? "Nam" : "Nữ"}
          </Text>
          <Text style={styles.infoText}>
            Số điện thoại: {patientProfile?.phone}
          </Text>
          <Text style={styles.infoText}>
            Địa chỉ: {patientProfile?.address || "Không có"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Chi tiết đặt khám</Text>
        {appointments.map((appt, index) => (
          <View key={index} style={styles.appointmentDetails}>
            <Text style={styles.appointmentTitle}>Thông tin lịch khám</Text>

            {appt.package && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gói khám:</Text>
                <Text style={styles.detailValue}>{appt.package.name}</Text>
              </View>
            )}

            {appt.services && appt.services.length > 0 && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dịch vụ:</Text>
                  <Text style={styles.detailValue}>
                    {appt.services.length} dịch vụ
                  </Text>
                </View>
                {appt.services.map((service, sIndex) => (
                  <View key={sIndex} style={styles.serviceItem}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>
                      {service.price.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày khám:</Text>
              <Text style={styles.detailValue}>{appt.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giờ khám:</Text>
              <Text style={styles.detailValue}>{appt.time?.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phòng khám:</Text>
              <Text style={styles.detailValue}>
                {appt.time?.room || "Sẽ thông báo sau"}
              </Text>
            </View>

            {appt.reason?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lý do khám:</Text>
                <Text style={styles.detailValue}>{appt.reason}</Text>
              </View>
            )}

            <View style={[styles.detailRow, styles.feeRow]}>
              <Text style={styles.detailLabel}>Tổng chi phí:</Text>
              <Text style={styles.feeValue}>
                {calculateAppointmentPrice(appt).toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.importantNote}>
          <Icon name="information-circle" size={20} color="#f39c12" />
          <Text style={styles.noteText}>
            Vui lòng mang theo giấy tờ tùy thân và đến sớm 15 phút trước giờ hẹn
          </Text>
        </View>
      </View>
      <View style={[styles.buttonContainer, { marginBottom: 0 }]}>
        <Button
          title="Về Trang Chủ"
          onPress={() => {
            resetAppointment();
            navigation.navigate("Home");
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
    marginBottom: 20,
    paddingVertical: 16,
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
    padding: 16,
    marginBottom: 20,
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
    marginBottom: 16,
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
    marginBottom: 10,
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  appointmentDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e88e5",
    marginBottom: 12,
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
    flex: 2,
    textAlign: "right",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingLeft: 16,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
    color: "#555",
  },
  servicePrice: {
    fontSize: 13,
    color: "#0071CE",
  },
  feeRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e88e5",
    flex: 2,
    textAlign: "right",
  },
  importantNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef9e7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
    flex: 1,
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
