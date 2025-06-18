import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import ViewField from "../common/ViewField";
import Button from "../common/Button";

const AppointmentSelection = ({
  currentPackage,
  selectedServices,
  currentDate,
  currentTime,
  setStep,
  canProceed,
}) => {
  // Calculate total price from package and/or selected services
  const calculateTotalPrice = () => {
    let total = 0;
    if (currentPackage) {
      total += currentPackage.price;
    }

    if (selectedServices && selectedServices.length > 0) {
      total += selectedServices.reduce(
        (sum, service) => sum + service.price,
        0
      );
    }

    return total;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Chọn Thông Tin Khám</Text>

      <ViewField
        label="Gói khám"
        value={currentPackage?.name || "Không có"}
        icon="medkit"
        onPress={() => setStep(2.1)}
      />

      <ViewField
        label="Dịch vụ"
        value={
          selectedServices?.length > 0
            ? `${selectedServices.length} dịch vụ đã chọn`
            : "Chưa chọn dịch vụ"
        }
        icon="medical"
        onPress={() => setStep(2.2)}
      />

      <ViewField
        label="Ngày khám"
        value={currentDate}
        icon="calendar"
        onPress={() => setStep(2.3)}
        disabled={
          !currentPackage &&
          (!selectedServices || selectedServices.length === 0)
        }
      />

      <ViewField
        label="Giờ khám"
        value={currentTime?.time}
        icon="time"
        onPress={() => setStep(2.4)}
        disabled={!currentDate}
      />

      {(currentPackage ||
        (selectedServices && selectedServices.length > 0)) && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Tổng chi phí ước tính:</Text>
          <Text style={styles.priceValue}>
            {calculateTotalPrice().toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
      )}

      <Button
        title="Xác Nhận"
        onPress={() => setStep(2.5)}
        disabled={!canProceed()}
        style={{ marginTop: 16 }}
      />
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
  priceContainer: {
    backgroundColor: "#e6f0f9",
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  priceValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0071CE",
  },
  reasonContainer: {
    marginVertical: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  reasonInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  reasonIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  reasonInput: {
    flex: 1,
    height: 80,
    fontSize: 16,
    color: "#333",
  },
  characterCount: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 4,
  },
});

export default AppointmentSelection;
