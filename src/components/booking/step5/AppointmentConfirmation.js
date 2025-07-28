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
import Button from "../../common/Button";
import QRCode from "react-native-qrcode-svg";
import * as FileUtils from "../../../utils/fileUtils";

const AppointmentConfirmation = ({
  selectedDepartment,
  selectedDoctor,
  patientProfile,
  navigation,
  resetAppointment,
  appointmentCode,
  appointmentQueue,
  appointmentQueueUrl,
  currentDate,
  currentTime,
}) => {
  const [processedFile, setProcessedFile] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

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

  // Format date and time
  const formatDateTime = (dateString, timeObj) => {
    if (!dateString || !timeObj?.displayTime) return "-";
    try {
      const [day, month, year] = dateString.split("/");
      return `${timeObj.displayTime}, ${day}/${month}/${year}`;
    } catch {
      return "-";
    }
  };

  if (
    !appointmentCode ||
    !patientProfile ||
    !selectedDoctor ||
    !selectedDepartment
  ) {
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
              routes: [{ name: "Home" }],
            });
          }}
          style={{ width: 200 }}
        />
      </View>
    );
  }

  const qrData = JSON.stringify({
    code: appointmentCode,
    patientName: patientProfile?.fullName,
    department: selectedDepartment?.name,
    doctor: selectedDoctor?.fullName,
    queue: appointmentQueue,
    date: currentDate,
    time: currentTime?.time,
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View style={[styles.ticketContainer, { opacity: fadeAnim }]}>
        <View style={styles.qrSection}>
          <View style={styles.queueInfo}>
            <Text style={styles.queueLabel}>Mã đặt lịch:</Text>
            <Text style={styles.queueNumber}>{appointmentCode}</Text>
            {appointmentQueue && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.queueLabel}>Số thứ tự:</Text>
                <Text style={styles.queueNumber}>
                  {String(appointmentQueue).padStart(3, "0")}
                </Text>
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
            <Text style={styles.infoValue}>
              {patientProfile?.fullName || "Chưa cung cấp"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>
              {patientProfile?.gender === "Male"
                ? "Nam"
                : patientProfile?.gender === "Female"
                ? "Nữ"
                : "Chưa cung cấp"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>
              {patientProfile?.phone || "Chưa cung cấp"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>
              {patientProfile?.address || "Không có"}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Chi tiết đặt khám</Text>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Khoa:</Text>
            <Text style={styles.infoValue}>
              {selectedDepartment?.name || "Chưa chọn"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bác sĩ:</Text>
            <Text style={styles.infoValue}>
              {selectedDoctor?.doctorName || "Chưa chọn"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>
              {formatDateTime(currentDate, currentTime)}
            </Text>
          </View>
        </View>
        <Text style={styles.queueNote}>Vui lòng đến sớm 15 phút</Text>
      </Animated.View>
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
          style={styles.actionButton}
        />
        {processedFile && (
          <Button
            title="Tải file"
            onPress={() => openFile(processedFile)}
            style={styles.actionButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    minWidth: 140,
    maxWidth: 180,
    flexGrow: 1,
    alignSelf: "center",
    paddingHorizontal: 0,
  },
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
    padding: 10,
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
    textAlign: "start",
    fontWeight: "bold",
    color: "#1e88e5",
    marginBottom: 4,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    gap: 8,
    paddingBottom: 30,
  },
});

export default AppointmentConfirmation;
