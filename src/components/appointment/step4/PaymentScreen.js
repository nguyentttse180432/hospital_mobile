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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../../components/common/Button";
import VnpayMerchant from "react-native-vnpay-merchant";
import { getPaymentAppointmentUrl, getPaymentAppointmentResult } from "../../../services/payment"; // Import hàm lấy URL thanh toán
import {getAppointmentByCode} from "../../../services/appointmentService"; // Import hàm lấy thông tin appointment

const PaymentScreen = ({
  appointment,
  appointmentCode,
  paymentMethod,
  setPaymentMethod,
  handleBack,
  canProceed,
  totalAmount,
  isSubmitting,
  handlePayment,
  setStep,
  setAppointment, // Thêm prop này để truyền dữ liệu appointment lên cha
}) => {
  
  useEffect(() => {
    // ✅ Hàm parse query chuẩn, xử lý + thành space
    const parseQueryParams = (url) => {
      const query = url.split("?")[1];
      const params = {};
      query.split("&").forEach((pair) => {
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
          // Lấy lại thông tin appointment từ code
          if (result.isSuccess) {
            const appointmentData = await getAppointmentByCode(appointmentCode);
            console.log("Appointment code:", appointmentCode);
            console.log("Appointment data from code:", appointmentData);
            if (appointmentData.value) {
              setAppointment(appointmentData.value);
            }
          }
          console.log("Payment successful, appointment data:", appointment);
          setStep && setStep(5); // Chuyển bước khi thanh toán thành công
        } catch (err) {
          console.error(
            "[VNPay] Error fetching payment result:",
            err.response.data
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

    // Native event listener (nếu có)
    let listener;
    const vnpayModule = NativeModules.VnpayMerchantModule;
    if (vnpayModule) {
      const eventEmitter = new NativeEventEmitter(vnpayModule);
      listener = eventEmitter.addListener("PaymentBack", (e) => {
        console.log("Sdk back! Full event data:", e);
        // Optional: xử lý SDK back
      });
    }

    return () => {
      linkingSubscription.remove();
      if (listener) listener.remove();
    };
  }, []);

  // Gộp logic thanh toán vào một hàm duy nhất
 const handlePay = async () => {
   if (paymentMethod === "VNPay") {
     // 1. Gọi API tạo appointment, lấy code
     const code = await handlePayment();
     if (!code) return; // Nếu lỗi thì dừng lại

     // 2. Gọi getPaymentUrl và mở VNPay
     try {
       const paymentData = await getPaymentAppointmentUrl(code);
       const paymentUrl = paymentData?.value;
       if (!paymentUrl) {
         console.warn("Không lấy được URL thanh toán từ server!");
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
       console.error("Lỗi khi lấy URL thanh toán:", error);
     }
   } else if (paymentMethod === "Cash") {
     // 1. Gọi handlePayment() để tạo appointment
     const code = await handlePayment();
     if (!code) {
       console.error("Không tạo được lịch hẹn!");
       return;
     }
     console.log("Appointment created successfully, code:", code);

     // 2. Lấy thông tin appointment từ code
     try {
       const appointmentData = await getAppointmentByCode(code);
       console.log("Appointment data:", appointmentData);
       if (appointmentData?.isSuccess) {
         // Cập nhật appointment trước khi chuyển bước
         await new Promise((resolve) => {
           setAppointment(appointmentData.value);
           resolve();
         });
         setStep(5); // Chuyển sang bước xác nhận sau khi appointment được cập nhật
       } else {
         console.error(
           "Không lấy được thông tin appointment:",
           appointmentData
         );
         Alert.alert(
           "Lỗi",
           "Không thể lấy thông tin lịch khám. Vui lòng thử lại."
         );
       }
     } catch (error) {
       console.error("Lỗi khi lấy thông tin appointment:", error);
       Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý thông tin lịch khám.");
     }
   } else {
     // Các phương thức khác (MoMo, ...)
     console.warn("Chưa hỗ trợ phương thức này");
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
    fontSize: 18,
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
