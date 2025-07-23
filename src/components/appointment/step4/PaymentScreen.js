import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../../components/common/Button";
import VnpayMerchant from "react-native-vnpay-merchant";
import {
  getPaymentAppointmentUrl,
  getPaymentAppointmentResult,
} from "../../../services/payment";

const PaymentScreen = ({
  appointment,
  paymentMethod,
  setPaymentMethod,
  handleBack,
  canProceed,
  totalAmount,
  isSubmitting,
  handlePayment,
  setStep,
}) => {
  console.log("[PaymentScreen] Rendering with appointment:", appointment);

  useEffect(() => {
    const parseQueryParams = (url) => {
      // Bỏ qua URL không hợp lệ hoặc từ Expo
      if (
        !url ||
        !url.startsWith("com.hsms.app") ||
        url.includes("expo-development-client")
      ) {
        console.log("[DEEP LINK] Invalid or Expo URL, ignoring:", url);
        return {};
      }
      const query = url.split("?")[1];
      if (!query) {
        console.log("[DEEP LINK] No query params in URL:", url);
        return {};
      }
      const params = {};
      query.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        params[key] = decodeURIComponent((value || "").replace(/\+/g, " "));
      });
      if (!params.vnp_ResponseCode) {
        console.log("[DEEP LINK] No vnp_ResponseCode, ignoring:", params);
        return {};
      }
      return params;
    };

    const handleDeepLink = async ({ url }) => {
      if (!url) {
        console.log("[DEEP LINK] No URL provided");
        return;
      }
      console.log("[DEEP LINK] Handling URL:", url);
      const params = parseQueryParams(url);
      if (Object.keys(params).length === 0) {
        console.log("[DEEP LINK] No valid params parsed");
        return;
      }
      console.log("[DEEP LINK] Parsed params:", params);

      if (params.vnp_ResponseCode === "00") {
        try {
          const result = await getPaymentAppointmentResult(params);
          console.log("[VNPay] Payment result:", result);
          if (result.isSuccess) {
            console.log("Payment successful, moving to step 5");
            setStep(5);
          } else {
            Alert.alert(
              "Lỗi",
              "Thanh toán thành công nhưng không thể xác nhận."
            );
          }
        } catch (err) {
          console.error("[VNPay] Error:", err);
          Alert.alert(
            "Lỗi",
            "Không thể xác nhận thanh toán. Vui lòng thử lại."
          );
        }
      } else if (params.vnp_ResponseCode) {
        Alert.alert(
          "Thanh toán thất bại",
          `Mã lỗi: ${params.vnp_ResponseCode}`
        );
      }
    };

    // Kiểm tra URL ban đầu khi ứng dụng khởi động
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Lắng nghe sự kiện deep link
    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    // Lắng nghe sự kiện VNPay SDK
    const vnpayModule = NativeModules.VnpayMerchantModule;
    let listener;
    if (vnpayModule) {
      const eventEmitter = new NativeEventEmitter(vnpayModule);
      listener = eventEmitter.addListener("PaymentBack", (e) => {
        console.log("[VNPay SDK] PaymentBack:", JSON.stringify(e, null, 2));
        // Tự tạo deep link nếu SDK trả về responseCode
        if (e?.responseCode) {
          handleDeepLink({
            url: `com.hsms.app://payment?vnp_ResponseCode=${e.responseCode}`,
          });
        }
      });
    }

    return () => {
      linkingSubscription.remove();
      if (listener) listener.remove();
    };
  }, [setStep]);

  // Gộp logic thanh toán vào một hàm duy nhất
  const handlePay = async () => {
    if (paymentMethod === "VNPay") {
      const code = await handlePayment();
      if (!code) return;

      try {
        const paymentData = await getPaymentAppointmentUrl(code);
        console.log("[VNPay] Payment URL:", paymentData?.value);
        const paymentUrl = paymentData?.value;
        if (!paymentUrl) {
          Alert.alert("Lỗi", "Không lấy được URL thanh toán từ server!");
          return;
        }

        VnpayMerchant.show({
          isSandbox: true,
          scheme: "com.hsms.app",
          backAlert: "Bạn có chắc chắn trở lại không?",
          paymentUrl: paymentUrl,
          title: "Thanh toán",
          titleColor: "#E26F2C",
          beginColor: "#F06744",
          endColor: "#E26F2C",
          iconBackName: "ion_back",
        });
      } catch (error) {
        console.error("Lỗi khi lấy URL thanh toán:", error);
        Alert.alert("Lỗi", "Không thể thực hiện thanh toán. Vui lòng thử lại.");
      }
    } else if (paymentMethod === "Cash") {
      const code = await handlePayment();
      if (!code) return;
      setStep(5);
    } else {
      Alert.alert("Thông báo", "Phương thức thanh toán này chưa được hỗ trợ.");
    }
  };

  const totalFee = totalAmount || 0;
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === "MoMo" && styles.selectedPaymentOption,
        ]}
        onPress={() => setPaymentMethod("MoMo")}
        disabled={isSubmitting}
      >
        <Icon name="wallet" size={24} color="#d81b60" />
        <Text style={styles.paymentOptionText}>Ví điện tử MoMo</Text>
        {paymentMethod === "MoMo" && (
          <Icon name="checkmark-circle" size={24} color="#2ecc71" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === "VNPay" && styles.selectedPaymentOption,
        ]}
        onPress={() => setPaymentMethod("VNPay")}
        disabled={isSubmitting}
      >
        <Icon name="card" size={24} color="#007AFF" />
        <Text style={styles.paymentOptionText}>VNPay</Text>
        {paymentMethod === "VNPay" && (
          <Icon name="checkmark-circle" size={24} color="#2ecc71" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === "Cash" && styles.selectedPaymentOption,
        ]}
        onPress={() => setPaymentMethod("Cash")}
        disabled={isSubmitting}
      >
        <Icon name="cash" size={24} color="#2ecc71" />
        <Text style={styles.paymentOptionText}>Thanh toán tại quầy</Text>
        {paymentMethod === "Cash" && (
          <Icon name="checkmark-circle" size={24} color="#2ecc71" />
        )}
      </TouchableOpacity>
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
        <Text style={styles.totalAmount}>{totalFee.toLocaleString()} VNĐ</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Quay Lại"
          onPress={handleBack}
          secondary
          style={styles.halfButton}
          disabled={isSubmitting}
        />
        {isSubmitting ? (
          <View style={[styles.halfButton, styles.loadingButton]}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        ) : (
          <Button
            title="Thanh Toán"
            onPress={handlePay}
            disabled={!canProceed()}
            style={styles.halfButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedPaymentOption: {
    borderColor: "#1e88e5",
    borderWidth: 2,
    backgroundColor: "#f5f9ff",
  },
  paymentOptionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
    flex: 1,
  },
  totalSection: {
    backgroundColor: "#edf7fd",
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#1e88e5",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e88e5",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  halfButton: {
    flex: 0.48,
  },
  loadingButton: {
    backgroundColor: "#1e88e5",
    borderRadius: 8,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PaymentScreen;
