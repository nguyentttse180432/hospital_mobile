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
import { UpdatePrescriptionDetails } from "../../services/prescriptionService";
import VnpayMerchant from "react-native-vnpay-merchant";
import { NativeEventEmitter, NativeModules } from "react-native";

const PrescriptionScreen = ({ route, navigation }) => {
  const { checkupCode } = route.params;
  console.log("Checkup code:", checkupCode);

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (checkupCode) {
      setLoading(true);
      getMedicationsByCheckupRecord(checkupCode)
        .then((res) => {
          setPrescription(res.value);
          if (res.value?.prescriptionStatus !== "Paid") {
            const defaultSelected = res.value.prescriptionDetails
              .filter((item) => item.quantity <= item.medicineInventory)
              .map((item) => item.id);
            setSelectedIds(defaultSelected);
            console.log("Initial selectedIds:", defaultSelected);
          }
          console.log(
            "Prescription details:",
            JSON.stringify(res.value?.prescriptionDetails, null, 2)
          );
        })
        .catch(() =>
          Alert.alert("Lỗi", "Không thể tải đơn thuốc. Vui lòng thử lại sau.")
        )
        .finally(() => setLoading(false));
    }
  }, [checkupCode]);

  console.log("Prescription code:", prescription?.code);
  console.log("Current selectedIds:", selectedIds);

  useEffect(() => {
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

    const fetchPrescriptionWithRetry = async (
      code,
      retries = 5,
      delay = 1000
    ) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await getMedicationsByCheckupRecord(code);
          if (res?.value) return res;
        } catch (err) {
          if (i === retries - 1) throw err;
          console.log(`Retry ${i + 1}/${retries} for checkup code ${code}`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
      return null;
    };

    const handleDeepLink = async (event) => {
      console.log("[DEEP LINK] App opened with URL:", event.url);
      const params = parseQueryParams(event.url);
      console.log(
        "[DEEP LINK] Parsed params:",
        JSON.stringify(params, null, 2)
      );

      if (params.vnp_ResponseCode === "00") {
        try {
          const result = await getPaymentPrescriptionResult(params);
          console.log(
            "[VNPay] Payment result:",
            JSON.stringify(result, null, 2)
          );
          if (result?.value) {
            setLoading(true);
            const res = await fetchPrescriptionWithRetry(checkupCode);
            if (res?.value) {
              setPrescription(res.value);
              console.log(
                "Updated prescription details:",
                JSON.stringify(res.value?.prescriptionDetails, null, 2)
              );
              if (res.value?.prescriptionStatus === "Paid") {
                Alert.alert(
                  "Thành công",
                  "Đơn thuốc đã được thanh toán thành công!"
                );
              }
            } else {
              Alert.alert("Lỗi", "Không thể tải đơn thuốc sau nhiều lần thử");
            }
          }
        } catch (err) {
          console.error(
            "[VNPay] Error fetching payment result:",
            JSON.stringify(err.response?.data || err, null, 2)
          );
          Alert.alert("Lỗi", "Không xác nhận được kết quả thanh toán");
        } finally {
          setLoading(false);
        }
      } else if (params.vnp_ResponseCode) {
        Alert.alert(
          "Thanh toán thất bại",
          `Mã lỗi: ${params.vnp_ResponseCode}`
        );
      }
    };

    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    let listener;
    const vnpayModule = NativeModules.VnpayMerchantModule;
    if (vnpayModule) {
      const eventEmitter = new NativeEventEmitter(vnpayModule);
      listener = eventEmitter.addListener("PaymentBack", (e) => {
        console.log("[VNPay] PaymentBack event:", JSON.stringify(e, null, 2));
      });
    }

    return () => {
      linkingSubscription.remove();
      if (listener) listener.remove();
    };
  }, [checkupCode]);

  const handleOpenPdf = async () => {
    if (prescription?.resultLink) {
      try {
        const url = FileUtils.getFileUrl(prescription.resultLink);
        console.log("Opening PDF URL:", url);
        await Linking.openURL(url);
      } catch (e) {
        console.error("Error opening PDF:", e);
        Alert.alert("Lỗi", "Không thể mở file PDF");
      }
    }
  };

  const handleToggleMedicine = (id) => {
    setSelectedIds((prev) => {
      const newSelectedIds = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      console.log("Updated selectedIds:", newSelectedIds);
      return newSelectedIds;
    });
  };

  const selectedTotal =
    prescription?.prescriptionDetails
      ?.filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + (item.price || 0), 0) || 0;

  const handleVnpayPayment = async () => {
    if (!prescription?.code) {
      Alert.alert("Lỗi", "Không tìm thấy mã đơn thuốc!");
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một loại thuốc để thanh toán!");
      return;
    }

    try {
      setLoading(true);
      const notBuyItems = prescription.prescriptionDetails.filter(
        (item) =>
          item.quantity > item.medicineInventory ||
          !selectedIds.includes(item.id)
      );

      const buyItems = prescription.prescriptionDetails.filter((item) =>
        selectedIds.includes(item.id)
      );

      await Promise.all([
        ...notBuyItems.map((item) =>
          UpdatePrescriptionDetails(item.id, {
            id: item.id,
            quantityByPatient: 0,
            reasonChange:
              item.quantity > item.medicineInventory
                ? "Hết hàng"
                : "Không mua tại bệnh viện",
          })
        ),
        ...buyItems.map((item) =>
          UpdatePrescriptionDetails(item.id, {
            id: item.id,
            quantityByPatient: item.quantity,
            reasonChange: null,
          })
        ),
      ]);

      const paymentData = await getPaymentPrescriptionUrl(prescription.code);
      console.log(
        "[VNPay] Payment data:",
        JSON.stringify(paymentData.value, null, 2)
      );
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
      console.error("Payment error:", error);
      Alert.alert("Lỗi", "Không thể thực hiện thanh toán: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const hasOutOfStock = prescription?.prescriptionDetails?.some(
    (item) => item.quantity > item.medicineInventory
  );

  const allOutOfStock = prescription?.prescriptionDetails?.every(
    (item) => item.quantity > item.medicineInventory
  );

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
              contentContainerStyle={{ paddingBottom: 50 }}
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
              </View>

              <Text style={styles.sectionTitle}>Danh sách thuốc</Text>
              {prescription.prescriptionDetails.map((item) => {
                const outOfStock = item.quantity > item.medicineInventory;
                const isSelected = selectedIds.includes(item.id);
                const isBoughtAtHospital = item.quantityByPatient > 0;
                return (
                  <View key={item.id} style={styles.medicineCard}>
                    <View style={styles.medicineHeader}>
                      <Text style={styles.medicineName}>
                        {item.medicineName}
                      </Text>
                      {!outOfStock &&
                        prescription.prescriptionStatus === "Unpaid" && (
                          <TouchableOpacity
                            onPress={() => handleToggleMedicine(item.id)}
                            style={styles.checkboxContainer}
                          >
                            <Icon
                              name={
                                isSelected
                                  ? "checkbox-outline"
                                  : "square-outline"
                              }
                              size={22}
                              color={isSelected ? "#3b82f6" : "#6b7280"}
                            />
                          </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.medicineDetails}>
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Liều dùng:</Text>
                        <Text style={styles.value}>
                          {item.morningDose}/{item.middayDose}/
                          {item.afternoonDose}/{item.nightDose}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Số ngày:</Text>
                        <Text style={styles.value}>{item.totalUsageDate}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Số lượng:</Text>
                        <Text style={styles.value}>
                          {item.quantity} {item.medicinePackageUnit}
                        </Text>
                      </View>
                      {prescription.prescriptionStatus === "Unpaid" ? (
                        outOfStock ? (
                          <Text style={styles.outOfStockText}>
                            *Kho không đủ. Quý khách vui lòng ra bên ngoài mua
                          </Text>
                        ) : (
                          <>
                            <View style={styles.infoRow}>
                              <Text style={styles.label}>Đơn giá:</Text>
                              <Text style={styles.value}>
                                {isSelected
                                  ? item.unitPrice?.toLocaleString("vi-VN")
                                  : "0"}{" "}
                                VNĐ
                              </Text>
                            </View>
                            <View style={styles.infoRow}>
                              <Text style={styles.label}>Thành tiền:</Text>
                              <Text
                                style={[styles.value, styles.medicineTotal]}
                              >
                                {isSelected
                                  ? item.price?.toLocaleString("vi-VN")
                                  : "0"}{" "}
                                VNĐ
                              </Text>
                            </View>
                          </>
                        )
                      ) : (
                        <Text
                          style={[
                            styles.statusText,
                            isBoughtAtHospital
                              ? styles.boughtAtHospital
                              : styles.boughtOutside,
                          ]}
                        >
                          {isBoughtAtHospital
                            ? "*Mua tại bệnh viện"
                            : "*Khách hàng chọn mua ngoài"}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

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

            {prescription.prescriptionStatus === "Unpaid" && (
              <View
                style={[
                  styles.fixedButtonContainer,
                  { paddingBottom: insets.bottom },
                ]}
              >
                <View style={styles.totalPriceContainer}>
                  <Text style={styles.totalPriceLabel}>
                    Tổng tiền (đã chọn):
                  </Text>
                  <Text style={styles.totalPrice}>
                    {selectedTotal.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
                {allOutOfStock ? (
                  <Text style={styles.outOfStockText}>
                    Không thể thanh toán do tất cả thuốc đã hết hàng.
                  </Text>
                ) : (
                  <Button
                    title="Thanh Toán Với VNPay"
                    onPress={handleVnpayPayment}
                    style={[
                      styles.payButton,
                      selectedIds.length === 0 && styles.disabledButton,
                    ]}
                    textStyle={styles.payButtonText}
                    disabled={selectedIds.length === 0 || loading}
                  />
                )}
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
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  medicineDetails: {
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    width: 100,
  },
  value: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
  },
  medicineTotal: {
    fontWeight: "500",
    color: "#3b82f6",
  },
  outOfStockText: {
    fontSize: 12,
    color: "#dc2626",
    fontStyle: "italic",
    marginTop: 4,
  },
  boughtAtHospital: {
    fontSize: 12,
    color: "#3b82f6",
    fontStyle: "italic",
    marginTop: 4,
  },
  boughtOutside: {
    fontSize: 12,
    color: "#dc2626",
    fontStyle: "italic",
    marginTop: 4,
  },
  checkboxContainer: {
    padding: 8,
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
  disabledButton: {
    backgroundColor: "#9ca3af",
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
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
});

export default PrescriptionScreen;
