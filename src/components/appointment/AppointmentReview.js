import { View, Text, StyleSheet, ScrollView } from "react-native";
import Button from "../common/Button";

const AppointmentReview = ({
  currentPackage,
  selectedServices,
  currentDate,
  currentTime,
  currentReason,
  handleNext,
  selectedProfile,
}) => {
  // Combine appointments array with the current selection for display
  const allAppointments = [];

  if (
    (currentPackage || (selectedServices && selectedServices.length > 0)) &&
    currentDate &&
    currentTime
  ) {
    allAppointments.push({
      package: currentPackage,
      services: selectedServices,
      date: currentDate,
      time: currentTime,
      reason: currentReason,
    });
  }

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
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {selectedProfile && (
        <View style={styles.patientInfoContainer}>
          <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          <View style={styles.patientInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên:</Text>
              <Text style={styles.infoValue}>{selectedProfile.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giới tính:</Text>
              <Text style={styles.infoValue}>{selectedProfile.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày sinh:</Text>
              <Text style={styles.infoValue}>{selectedProfile.dob}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{selectedProfile.phone}</Text>
            </View>
          </View>
        </View>
      )}

      {allAppointments.length === 0 ? (
        <Text style={styles.noAppointments}>
          Chưa có lịch khám nào được chọn.
        </Text>
      ) : (
        allAppointments.map((appt, index) => (
          <View key={index} style={styles.appointmentSummary}>
            <Text style={styles.appointmentTitle}>Thông tin lịch khám</Text>

            {appt.package && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gói khám:</Text>
                <Text style={styles.summaryValue}>{appt.package.name}</Text>
              </View>
            )}

            {appt.services && appt.services.length > 0 && (
              <View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Dịch vụ:</Text>
                  <Text style={styles.summaryValue}>
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

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ngày khám:</Text>
              <Text style={styles.summaryValue}>{appt.date}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giờ khám:</Text>
              <Text style={styles.summaryValue}>{appt.time?.time}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phòng khám:</Text>
              <Text style={styles.summaryValue}>
                {appt.time?.room || "Sẽ thông báo sau"}
              </Text>
            </View>

            {appt.reason?.trim() && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lý do khám:</Text>
                <Text style={styles.summaryValue}>{appt.reason}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.feeRow]}>
              <Text style={styles.summaryLabel}>Tổng chi phí:</Text>
              <Text style={styles.feeValue}>
                {calculateAppointmentPrice(appt).toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
          </View>
        ))
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Tiếp Tục"
          onPress={handleNext}
          disabled={allAppointments.length === 0}
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
  patientInfoContainer: {
    marginBottom: 16,
  },
  patientInfo: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    flex: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  noAppointments: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
  appointmentSummary: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e88e5",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingLeft: 16,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
    color: "#555",
  },
  servicePrice: {
    fontSize: 14,
    color: "#0071CE",
  },
  feeRow: {
    marginTop: 8,
    borderBottomWidth: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  feeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e88e5",
    flex: 2,
    textAlign: "right",
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

export default AppointmentReview;
