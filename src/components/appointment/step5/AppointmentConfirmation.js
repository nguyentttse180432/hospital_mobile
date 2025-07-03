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
    if (!appointment?.date) return "N/A";
    const [day, month, year] = appointment.date.split("/");
    const dateStr = `${year.substr(-2)}${month}${day}`;
    const randomNum = Math.floor(Math.random() * 100);
    return `${dateStr}${randomNum.toString().padStart(3, "0")}`;
  };

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

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.successHeader}>
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
          {appointment?.package && (
            <View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gói khám:</Text>
              </View>
              <View style={styles.packageRow}>
                <Text style={styles.packageName}>
                  {appointment.package.name}
                </Text>
                <Text style={styles.price}>
                  {appointment.package.price.toLocaleString("vi-VN")} 
                </Text>
              </View>
            </View>
          )}
          {appointment?.services && appointment.services.length > 0 && (
            <View style={styles.servicesContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Dịch vụ ({appointment.services.length}):
                </Text>
              </View>
              {appointment.services.map((service, sIndex) => (
                <View key={sIndex} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.price}>
                    {service.price.toLocaleString("vi-VN")} 
                  </Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian khám:</Text>
            <Text style={styles.detailValue}>
              {appointment?.time?.time}, {appointment?.date}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.feeRow]}>
            <Text style={styles.detailLabel}>Tổng chi phí:</Text>
            <Text style={styles.feeValue}>
              {calculateAppointmentPrice(appointment).toLocaleString("vi-VN")}
              
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.buttonContainer, { marginBottom: 0 }]}>
        <Button
          title="Về Trang Chủ"
          onPress={() => {
            resetAppointment();
            navigation.navigate("Main");
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
    padding: 8,
    marginBottom: 16,
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
    fontWeight: "600",
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
