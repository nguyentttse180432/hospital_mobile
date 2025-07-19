import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Animated,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "../../common/Button";
import QRCode from "react-native-qrcode-svg";
import * as FileUtils from "../../../utils/fileUtils";

const AppointmentConfirmation = ({
  appointment,
  patientProfile,
  navigation,
  resetAppointment,
  appointmentCode,
  appointmentQueue,
  appointmentQueueUrl,
}) => {
  console.log(
    "[AppointmentConfirmation] Rendering with appointment:",
    appointment
  );
  console.log("[AppointmentConfirmation] Appointment queue:", appointmentQueue);
  console.log(
    "[AppointmentConfirmation] Appointment queue URL:",
    appointmentQueueUrl
  );

  const [processedFile, setProcessedFile] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in animation

  useEffect(() => {
    // Process appointmentQueueUrl if available
    if (appointmentQueueUrl) {
      const fileItem = {
        resultFieldLink: appointmentQueueUrl,
        fileName: "stt.pdf",
      };
      const processed = FileUtils.processTestResults([fileItem])[0];
      setProcessedFile(processed);
    }

    // Trigger fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appointmentQueueUrl]);

  const generateQueueNumber = () => {
    if (appointmentCode) {
      return appointmentCode;
    }
    if (!appointment?.date) return "N/A";
    const [day, month, year] = appointment.date.split("/");
    const dateStr = `${year.substr(-2)}${month}${day}`;
    const randomNum = Math.floor(Math.random() * 100);
    return `${dateStr}${randomNum.toString().padStart(3, "0")}`;
  };

  const openFile = async (fileItem) => {
    try {
      const fileUrl = FileUtils.getFileUrl(fileItem.resultFieldLink);

      if (FileUtils.isImageFile(fileItem.resultFieldLink)) {
        navigation.navigate("ImageViewer", {
          imageUrl: fileUrl,
          title: fileItem.fileName || "Hình ảnh lịch khám",
        });
      } else if (FileUtils.isPdfFile(fileItem.resultFieldLink)) {
        const canOpen = await Linking.canOpenURL(fileUrl);
        if (canOpen) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert("Lỗi", "Không thể mở file PDF");
        }
      } else {
        const canOpen = await Linking.canOpenURL(fileUrl);
        if (canOpen) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert("Lỗi", "Không thể mở file này");
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Lỗi", "Không thể mở file");
    }
  };

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

  const totalFee = (() => {
    const pkg = appointment?.packagePrice || 0;
    const add =
      appointment?.additionalServices?.reduce(
        (sum, s) => sum + (s.servicePrice || 0),
        0
      ) || 0;
    return pkg + add;
  })();

  const formatVietnamTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
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
            {(appointment?.numericalOrder || appointmentQueue) && (
              <View>
                <View style={styles.queueOrderRow}>
                  <Text style={styles.queueLabel}>Số thứ tự:</Text>
                  <View style={styles.queueOrderContainer}>
                    <Text style={styles.queueOrder}>
                      {appointment?.numericalOrder || appointmentQueue}
                    </Text>
                  </View>
                </View>
                <View>
                  {processedFile && (
                    <Text
                      style={styles.fileName}
                      onPress={() => openFile(processedFile)}
                    >
                      stt.pdf
                    </Text>
                  )}
                </View>
              </View>
            )}
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
          <View style={[styles.detailRow, styles.feeRow]}>
            <Text style={styles.detailLabel}>Tổng chi phí:</Text>
            <Text style={styles.feeValue}>
              {totalFee.toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>
        <Text style={styles.queueNote}>Vui lòng đến sớm 15 phút</Text>
      </View>
      <View style={[styles.buttonContainer, { marginBottom: 0 }]}>
        <Button
          title="Về Trang Chủ"
          onPress={() => {
            resetAppointment();
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
  ticketContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    padding: 14,
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
    paddingBottom: 10,
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
  queueOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  queueOrderContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f39c12",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 8,
  },
  queueOrder: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  queueNote: {
    fontSize: 12,
    color: "#f39c12",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
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
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    width: 110,
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
  fileName: {
    fontSize: 14,
    color: "#1e88e5",
    textDecorationLine: "underline",
  },
});

export default AppointmentConfirmation;
