import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import ViewField from "../../common/ViewField";
import Button from "../../common/Button";

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

  const getServicesDisplayText = () => {
    if (!selectedServices || selectedServices.length === 0) {
      return "Chưa chọn dịch vụ";
    }

    if (selectedServices.length === 1) {
      return selectedServices[0].name;
    }

    return `${selectedServices.length} dịch vụ đã chọn`;
  };

  const getServicesSubtext = () => {
    if (!selectedServices || selectedServices.length === 0) {
      return null;
    }

    if (selectedServices.length > 1) {
      return selectedServices.map((service) => service.name).join(", ");
    }

    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Chọn dịch vụ </Text>

        <ViewField
          label="Gói khám"
          value={currentPackage?.name || "Chưa chọn gói khám"}
          subtext={currentPackage?.description}
          icon="medkit"
          onPress={() => setStep(2.1)}
          showArrow={true}
        />

        <ViewField
          label="Dịch vụ bổ sung"
          value={getServicesDisplayText()}
          subtext={getServicesSubtext()}
          icon="medical"
          onPress={() => setStep(2.2)}
          showArrow={true}
        />
      </View>

      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Thời gian khám</Text>

        <ViewField
          label="Ngày khám"
          value={currentDate || "Chưa chọn ngày"}
          icon="calendar"
          onPress={() => setStep(2.3)}
          disabled={
            !currentPackage &&
            (!selectedServices || selectedServices.length === 0)
          }
          showArrow={true}
        />

        <ViewField
          label="Giờ khám"
          value={currentTime?.time || "Chưa chọn giờ"}
          icon="time"
          onPress={() => setStep(2.4)}
          disabled={!currentDate}
          showArrow={true}
        />
      </View>

      {/* Price Summary */}
      {(currentPackage ||
        (selectedServices && selectedServices.length > 0)) && (
        <View style={styles.priceSection}>
          <View style={styles.priceHeader}>
            <Icon name="receipt-outline" size={20} color="#0071CE" />
            <Text style={styles.priceSectionTitle}>Tổng chi phí</Text>
          </View>

          {currentPackage && (
            <View style={styles.priceItem}>
              <Text style={styles.priceItemLabel}>
                Gói khám: {currentPackage.name}
              </Text>
              <Text style={styles.priceItemValue}>
                {currentPackage.price.toLocaleString("vi-VN")}
              </Text>
            </View>
          )}

          {selectedServices &&
            selectedServices.length > 0 &&
            selectedServices.map((service, index) => (
              <View key={index} style={styles.priceItem}>
                <Text style={styles.priceItemLabel}>
                  Dịch vụ: {service.name}
                </Text>
                <Text style={styles.priceItemValue}>
                  {service.price.toLocaleString("vi-VN")}
                </Text>
              </View>
            ))}

          <View style={styles.priceDivider} />

          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPriceValue}>
              {calculateTotalPrice().toLocaleString("vi-VN")} VNĐ
            </Text>
          </View>
        </View>
      )}

      {/* Incomplete Selection Warning */}
      {!canProceed() && (
        <View style={styles.warningContainer}>
          <Icon name="warning-outline" size={20} color="#ff9800" />
          <Text style={styles.warningText}>
            Vui lòng hoàn tất chọn dịch vụ, ngày và giờ khám để tiếp tục
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={canProceed() ? "Xác Nhận Đặt Lịch" : "Hoàn Tất Thông Tin"}
          onPress={() => setStep(3)}
          disabled={!canProceed()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  selectionSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  priceSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#e3f2fd",
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  priceSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0071CE",
    marginLeft: 8,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  priceItemLabel: {
    flex: 1,
    fontSize: 14,
    color: "#555",
  },
  priceItemValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0071CE",
  },
  priceNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#e65100",
    marginLeft: 8,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 30,
  },
});
export default AppointmentSelection;
