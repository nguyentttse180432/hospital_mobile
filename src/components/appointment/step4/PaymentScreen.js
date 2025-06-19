import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../../components/common/Button";

const PaymentScreen = ({
  appointments,
  paymentMethod,
  setPaymentMethod,
  handleNext,
  handleBack,
  canProceed,
  totalAmount,
  isSubmitting,
}) => {
  // Sử dụng số tiền đã được truyền vào hoặc mặc định là 0
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
            onPress={handleNext}
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
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
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
  orderSummary: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
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
