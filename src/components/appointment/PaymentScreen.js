import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../components/common/Button";

const PaymentScreen = ({
  appointments,
  paymentMethod,
  setPaymentMethod,
  handleNext,
  handleBack,
  canProceed,
}) => {
  // Calculate total fee
  const totalFee = appointments.reduce((sum, appt) => {
    const fee = parseInt(appt.specialty?.fee?.replace(/[^0-9]/g, "") || "0");
    return sum + fee;
  }, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Thanh Toán</Text>

      <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === "MoMo" && styles.selectedPaymentOption,
        ]}
        onPress={() => setPaymentMethod("MoMo")}
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
        />
        <Button
          title="Thanh Toán"
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.halfButton}
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
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  sectionTitle: {
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
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
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
});

export default PaymentScreen;
