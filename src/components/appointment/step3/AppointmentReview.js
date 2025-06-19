import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Button from "../../common/Button";

const AppointmentReview = ({
  currentPackage,
  selectedServices,
  currentDate,
  currentTime,
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

  // Format date to Vietnamese format
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    try {
      const [day, month, year] = dateString.split("/");
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "Không có";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedProfile && (
          <View style={styles.patientInfoContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👤 Thông tin bệnh nhân</Text>
            </View>
            <View style={styles.patientInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>
                  {selectedProfile?.fullName ||
                    selectedProfile?.name ||
                    "Không có"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giới tính</Text>
                <Text style={styles.infoValue}>
                  {selectedProfile?.gender === "Male"
                    ? "Nam"
                    : selectedProfile?.gender === "Female"
                    ? "Nữ"
                    : "Không có"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày sinh</Text>
                <Text style={styles.infoValue}>
                  {selectedProfile?.dob
                    ? new Date(selectedProfile.dob).toLocaleDateString("vi-VN")
                    : "Không có"}
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

        {allAppointments.length === 0 ? (
          <View style={styles.noAppointmentsContainer}>
            <Text style={styles.noAppointmentsIcon}>📅</Text>
            <Text style={styles.noAppointments}>
              Chưa có lịch khám nào được chọn
            </Text>
            <Text style={styles.noAppointmentsSubtext}>
              Vui lòng quay lại để chọn dịch vụ và thời gian khám
            </Text>
          </View>
        ) : (
          allAppointments.map((appt, index) => (
            <View key={index} style={styles.appointmentContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏥 Thông tin lịch khám</Text>
              </View>

              <View style={styles.appointmentSummary}>
                {appt.package && (
                  <View style={styles.packageSection}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Gói khám</Text>
                      <Text style={styles.packageName}>
                        {appt.package.name}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Giá gói</Text>
                      <Text style={styles.packagePrice}>
                        {appt.package.price.toLocaleString("vi-VN")} VNĐ
                      </Text>
                    </View>
                  </View>
                )}

                {appt.services && appt.services.length > 0 && (
                  <View style={styles.servicesSection}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Dịch vụ khám</Text>
                      <Text style={styles.serviceCount}>
                        {appt.services.length} dịch vụ
                      </Text>
                    </View>
                    <View style={styles.servicesList}>
                      {appt.services.map((service, sIndex) => (
                        <View key={sIndex} style={styles.serviceItem}>
                          <View style={styles.serviceBullet} />
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={styles.servicePrice}>
                            {service.price.toLocaleString("vi-VN")} VNĐ
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.scheduleSection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ngày khám</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(appt.date)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Giờ khám</Text>
                    <Text style={styles.timeValue}>
                      {appt.time?.time || "Chưa chọn"}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phòng khám</Text>
                    <Text style={styles.roomValue}>
                      {appt.time?.room || "Sẽ thông báo sau"}
                    </Text>
                  </View>
                </View>
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng chi phí</Text>
                    <Text style={styles.totalValue}>
                      {calculateAppointmentPrice(appt).toLocaleString("vi-VN")}
                      VNĐ
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Xác Nhận Đặt Lịch"
          onPress={handleNext}
          disabled={allAppointments.length === 0}
          style={[
            styles.confirmButton,
            { opacity: allAppointments.length === 0 ? 0.5 : 1 },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976d2",
    marginBottom: 4,
  },
  patientInfoContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  patientInfo: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
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
    color: "#333",
    flex: 1.5,
    textAlign: "right",
    fontWeight: "500",
  },
  noAppointmentsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  noAppointmentsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noAppointments: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  noAppointmentsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  appointmentContainer: {
    marginBottom: 24,
  },
  appointmentSummary: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  packageSection: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  servicesSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scheduleSection: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    flex: 1,
  },
  packageName: {
    fontSize: 15,
    color: "#1976d2",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  packagePrice: {
    fontSize: 15,
    color: "#4caf50",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  serviceCount: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1.5,
    textAlign: "right",
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingLeft: 12,
  },
  serviceBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1976d2",
    marginRight: 8,
  },
  serviceName: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  timeValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  roomValue: {
    fontSize: 15,
    color: "#666",
    fontStyle: "italic",
    flex: 1.5,
    textAlign: "right",
  },
  totalSection: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976d2",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#1976d2",
  },
});

export default AppointmentReview;
