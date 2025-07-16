import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { getMedicationsByCheckupRecord } from "../../services/checkupRecordService";
import Button from "../../components/common/Button";
import ScreenContainer from "../../components/common/ScreenContainer";
import * as FileUtils from "../../utils/fileUtils";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getPaymentPrescriptionUrl,
  getPaymentPrescriptionResult,
} from "../../services/payment";
import VnpayMerchant from "react-native-vnpay-merchant";
import { NativeEventEmitter, NativeModules } from "react-native";

const PrescriptionScreen = ({ route, navigation }) => {
  const { checkupCode } = route.params;
  console.log("Checkup code:", checkupCode);

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (checkupCode) {
      setLoading(true);
      getMedicationsByCheckupRecord(checkupCode)
        .then((res) => {
          setPrescription(res.value);
        })
        .catch(() => Alert.alert("Lỗi", "Không thể tải đơn thuốc"))
        .finally(() => setLoading(false));
    }
  }, [checkupCode]);
  console.log("Prescription code:", prescription?.code);

  useEffect(() => {
    // Deep link handler for VNPay result
    const parseQueryParams = (url) => {
      const query = url.split("?")[1];
      const params = {};
      if (!query) return params;
      query.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        params[key] = decodeURIComponent((value || "").replace(/\+/g, " "));
      });
      return params;
    };

    const handleDeepLink = async (event) => {
      const params = parseQueryParams(event.url);
      if (params.vnp_ResponseCode === "00") {
        try {
          const result = await getPaymentPrescriptionResult(params);
          if (result?.value) {
            // Reload prescription data
            setLoading(true);
            getMedicationsByCheckupRecord(checkupCode)
              .then((res) => {
                setPrescription(res.value);
                if (res.value?.prescriptionStatus === "Paid") {
                  Alert.alert(
                    "Thành công",
                    "Đơn thuốc đã được thanh toán thành công!"
                  );
                }
              })
              .catch(() => Alert.alert("Lỗi", "Không thể tải đơn thuốc"))
              .finally(() => setLoading(false));
          }
        } catch (err) {
          Alert.alert("Lỗi", "Không xác nhận được kết quả thanh toán");
        }
      } else if (params.vnp_ResponseCode) {
        Alert.alert(
          "Thanh toán thất bại",
          `Mã lỗi: ${params.vnp_ResponseCode}`
        );
      }
    };

    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    // Native event listener (optional)
    let listener;
    const vnpayModule = NativeModules.VnpayMerchantModule;
    if (vnpayModule) {
      const eventEmitter = new NativeEventEmitter(vnpayModule);
      listener = eventEmitter.addListener("PaymentBack", (e) => {
        // Optional: handle SDK back
      });
    }

    return () => {
      linkingSubscription.remove();
      if (listener) listener.remove();
    };
  }, [checkupCode]);

  const handlePayment = () => {
    setShowPayment(true);
  };

  const handleSelectPayment = (method) => {
    setShowPayment(false);
    Alert.alert("Thanh toán", `Chọn thanh toán: ${method}`);
  };

  const handleOpenPdf = async () => {
    if (prescription?.resultLink) {
      try {
        const url = FileUtils.getFileUrl(prescription.resultLink);
        await Linking.openURL(url);
      } catch (e) {
        Alert.alert("Lỗi", "Không thể mở file PDF");
      }
    }
  };

  const handleVnpayPayment = async () => {
    if (!prescription?.code) return;
    try {
      const paymentData = await getPaymentPrescriptionUrl(prescription.code);
      console.log("[VNPay] Payment data:", paymentData.value);

      const paymentUrl = paymentData?.value;
      if (!paymentUrl) {
        Alert.alert("Lỗi", "Không lấy được URL thanh toán từ server!");
        return;
      }
      VnpayMerchant.show({
        isSandbox: true,
        scheme: "com.hospital.app",
        backAlert: "Bạn có chắc chắn trở lại không?",
        paymentUrl: paymentUrl,
        title: "Thanh toán",
        titleColor: "#E26F2C",
        beginColor: "#F06744",
        endColor: "#E26F2C",
        iconBackName: "ion_back",
        tmn_code: "OIL8C48D",
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể mở VNPay: " + error.message);
    }
  };

  return (
    <ScreenContainer
      title="Đơn Thuốc"
      onBack={() => navigation.goBack()}
      hasBottomTabs={false}
      containerStyle={styles.screenContainer}
    >
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải đơn thuốc...</Text>
          </View>
        ) : prescription ? (
          <>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={{ paddingBottom: 70 + insets.bottom }} // Increased padding to avoid overlap
            >
              <View style={styles.headerSection}>
                <Text style={styles.title}>Mã đơn: {prescription.code}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {prescription.prescriptionStatus === "Unpaid"
                      ? "Chưa thanh toán"
                      : "Đã thanh toán"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Ghi chú:</Text>
                <Text style={styles.infoText}>
                  {prescription.note || "Không có ghi chú"}
                </Text>
                <Text style={styles.infoLabel}>Tổng tiền:</Text>
                <Text style={styles.infoPrice}>
                  {prescription.price?.toLocaleString("vi-VN")} VNĐ
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Danh sách thuốc</Text>
              {prescription.prescriptionDetails.map((item) => (
                <View key={item.id} style={styles.medicineCard}>
                  <Text style={styles.medicineName}>{item.medicineName}</Text>
                  <View style={styles.medicineDetails}>
                    <Text style={styles.medicineInfo}>
                      Liều dùng: {item.morningDose}/{item.middayDose}/
                      {item.afternoonDose}/{item.nightDose}
                    </Text>
                    <Text style={styles.medicineInfo}>
                      Số ngày: {item.totalUsageDate}
                    </Text>
                    <Text style={styles.medicineInfo}>
                      Số lượng: {item.quantity}
                    </Text>
                    <Text style={styles.medicineInfo}>
                      Đơn giá: {item.unitPrice?.toLocaleString("vi-VN")} VNĐ
                    </Text>
                    <Text style={styles.medicineTotal}>
                      Thành tiền: {item.price?.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </View>
                </View>
              ))}

              {prescription.resultLink && (
                <TouchableOpacity
                  onPress={handleOpenPdf}
                  style={styles.pdfButton}
                >
                  <Icon
                    name="document-text-outline"
                    size={20}
                    color="#3b82f6"
                  />
                  <Text style={styles.pdfText}>Xem đơn thuốc PDF</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Fixed button container with proper positioning */}
            {prescription.prescriptionStatus === "Unpaid" && (
              <View
                style={[
                  styles.fixedButtonContainer,
                  { paddingBottom: insets.bottom },
                ]}
              >
                <Button
                  title="Thanh Toán Với VNPay"
                  onPress={handleVnpayPayment}
                  style={styles.payButton}
                  textStyle={styles.payButtonText}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Không có dữ liệu đơn thuốc</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    backgroundColor: "#f3f4f6",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 8,
  },
  infoPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3b82f6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginVertical: 12,
  },
  medicineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  medicineDetails: {
    gap: 4,
  },
  medicineInfo: {
    fontSize: 14,
    color: "#4b5563",
  },
  medicineTotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
    marginTop: 4,
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    marginVertical: 8,
  },
  pdfText: {
    color: "#3b82f6",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  payButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 14,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#4b5563",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 24,
    textAlign: "center",
  },
  paymentButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#1f2937",
    fontWeight: "500",
  },
  fixedButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    zIndex: 10,
  },
});

export default PrescriptionScreen;
