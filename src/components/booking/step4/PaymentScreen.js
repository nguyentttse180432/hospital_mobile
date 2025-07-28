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
  paymentMethod,
  setPaymentMethod,
  handleBack,
  canProceed,
  totalAmount,
  isSubmitting,
  handlePayment,
  setStep,
}) => {
  useEffect(() => {
    // Parse query parameters from URL
    const parseQueryParams = (url) => {
      const query = url.split("?")[1];
      const params = {};
      query?.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        params[key] = decodeURIComponent((value || "").replace(/\+/g, " "));
      });
      return params;
    };

    const handleDeepLink = async (event) => {
      console.log("[DEEP LINK] App opened with URL:", event.url);

      const params = parseQueryParams(event.url);
      console.log("[DEEP LINK] Parsed params:", params);

      if (params.vnp_ResponseCode === "00") {
        try {
          const result = await getPaymentAppointmentResult(params);
          console.log("[VNPay] Payment result from server:", result);

          if (result.isSuccess) {
            console.log("Payment successful, proceeding to confirmation step");
            setStep(5); // Move to confirmation step
          }
        } catch (err) {
          console.error(
            "[VNPay] Error fetching payment result:",
            err.response?.data
          );
        }
      } else if (params.vnp_ResponseCode) {
        console.log(
          "[DEEP LINK] Payment failed, code:",
          params.vnp_ResponseCode
        );
      }
    };

    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    // Native event listener for VNPay SDK
    let listener;
    const vnpayModule = NativeModules.VnpayMerchantModule;
    if (vnpayModule) {
      const eventEmitter = new NativeEventEmitter(vnpayModule);
      listener = eventEmitter.addListener("PaymentBack", (e) => {
        console.log("Sdk back! Full event data:", e);
      });
    }

    return () => {
      linkingSubscription.remove();
      if (listener) listener.remove();
    };
  }, [setStep]);

  const handlePay = async () => {
    if (paymentMethod === "VNPay") {
      // Call handlePayment to create appointment and get code
      const code = await handlePayment();
      if (!code) {
        console.error("Failed to create appointment");
        return;
      }

      // Get payment URL and open VNPay
      try {
        const paymentData = await getPaymentAppointmentUrl(code);
        const paymentUrl = paymentData?.value;
        if (!paymentUrl) {
          console.warn("Could not retrieve payment URL from server!");
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
          tmn_code: "OIL8C48D",
        });
      } catch (error) {
        console.error("Error fetching payment URL:", error);
        Alert.alert("Lỗi", "Không thể lấy URL thanh toán. Vui lòng thử lại.");
      }
    } else if (paymentMethod === "Cash") {
      // Call handlePayment to create appointment
      const code = await handlePayment();
      if (!code) {
        console.error("Failed to create appointment");
        return;
      }
      console.log("Cash payment, appointment created with code:", code);
      setStep(5); // Move to confirmation step
    } else {
      console.warn("Payment method not supported");
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
