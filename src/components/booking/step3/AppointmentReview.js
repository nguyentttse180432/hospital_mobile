import { View, Text, StyleSheet, ScrollView } from "react-native";
import Button from "../../common/Button";

const AppointmentReview = ({
  price,
  serviceType,
  currentDate,
  currentTime,
  handleNext,
  selectedDoctor,
  selectedDepartment,
  selectedProfile,
  symptom,
}) => {
  // Construct appointment data from props
  const appointmentData = {
    date: currentDate,
    time: currentTime,
    doctor: selectedDoctor,
    department: selectedDepartment,
    symptom: symptom,
  };
  console.log("Appointment Data:", appointmentData);

  // Format date to Vietnamese format
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa chọn";
    try {
      const [day, month, year] = dateString.split("/");
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "Chưa cung cấp";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  // Check if all required fields are present
  const isComplete = () =>
    !!appointmentData.department &&
    !!appointmentData.doctor &&
    !!appointmentData.date &&
    !!appointmentData.time;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Patient Information Section */}
        {selectedProfile && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👤 Thông tin bệnh nhân</Text>
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>
                  {selectedProfile?.fullName || "Chưa cung cấp"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giới tính</Text>
                <Text style={styles.infoValue}>
                  {selectedProfile?.gender === "Male"
                    ? "Nam"
                    : selectedProfile?.gender === "Female"
                    ? "Nữ"
                    : "Chưa cung cấp"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày sinh</Text>
                <Text style={styles.infoValue}>
                  {selectedProfile?.dob
                    ? new Date(selectedProfile.dob).toLocaleDateString("vi-VN")
                    : "Chưa cung cấp"}
                </Text>
              </View>
              <View style={[styles.infoRow, styles.lastRow]}>
                <Text style={styles.infoLabel}>SĐT</Text>
                <Text style={styles.infoValue}>
                  {formatPhone(selectedProfile?.phone)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Appointment Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏥 Thông tin lịch khám</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khoa</Text>
              <Text style={styles.infoValue}>
                {appointmentData.department?.name || "Chưa chọn"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bác sĩ</Text>
              <Text style={styles.infoValue}>
                {appointmentData.doctor?.doctorName || "Chưa chọn"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian khám</Text>
              <Text style={styles.infoValue}>
                {appointmentData.date && appointmentData.time?.displayTime
                  ? `${formatDate(appointmentData.date)} - ${
                      appointmentData.time.displayTime
                    }`
                  : "Chưa chọn"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại khám</Text>
              <Text style={styles.infoValue}>
                {serviceType === "Khám VIP" ? "VIP" : "Thường"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giá</Text>
              <Text style={styles.infoValue}>
                {price
                  ? `${price.toLocaleString("vi-VN")} VNĐ`
                  : "Chưa xác định"}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Triệu chứng</Text>
              <Text style={styles.infoValue}>
                {appointmentData.symptom || "Chưa cung cấp"}
              </Text>
            </View>
          </View>
        </View>

        {/* Warning if incomplete */}
        {!isComplete() && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Vui lòng hoàn tất thông tin khoa, bác sĩ, ngày và giờ khám để tiếp
              tục
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Xác Nhận Đặt Lịch"
          onPress={handleNext}
          disabled={!isComplete()}
          style={[styles.confirmButton, { opacity: isComplete() ? 1 : 0.5 }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976d2",
  },
  infoContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    flex: 1.5,
    textAlign: "right",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#e65100",
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 50,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#1976d2",
  },
});

export default AppointmentReview;
