import React from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import ViewField from "../../common/ViewField";
import Button from "../../common/Button";

const DateAppointmentSelection = ({
  selectedDepartment,
  selectedDoctor,
  currentDate,
  currentTime,
  setStep,
  canProceed,
  symptom,
  setSymptom,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Thời gian khám</Text>
        <ViewField
          label="Ngày khám"
          value={currentDate || "Chưa chọn ngày"}
          icon="calendar"
          onPress={() => setStep(2.1)}
          showArrow={true}
        />
        <ViewField
          label="Giờ khám"
          value={currentTime?.displayTime || "Chưa chọn giờ"}
          icon="time"
          onPress={() => setStep(2.2)}
          disabled={!currentDate}
          showArrow={true}
        />
      </View>
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Chọn thông tin khám</Text>
        <ViewField
          label="Khoa"
          value={selectedDepartment?.name || "Chưa chọn khoa"}
          icon="medkit"
          onPress={() => setStep(2.3)}
          disabled={!currentTime}
          showArrow={true}
        />
        <ViewField
          label="Bác sĩ"
          value={selectedDoctor?.doctorName || "Chưa chọn bác sĩ"}
          icon="person"
          onPress={() => setStep(2.4)}
          disabled={!selectedDepartment}
          showArrow={true}
        />
      </View>
      <View style={styles.priceSection}>
        <View style={styles.priceHeader}>
          <Icon name="document-text-outline" size={20} color="#0071CE" />
          <Text style={styles.priceSectionTitle}>Triệu Chứng</Text>
        </View>
        <View style={styles.priceItem}>
          <TextInput
            style={styles.symptomInput}
            placeholder="Vui lòng nhập triệu chứng (nếu có)"
            value={symptom}
            onChangeText={setSymptom}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
      {!canProceed() && (
        <View style={styles.warningContainer}>
          <Icon name="warning-outline" size={20} color="#ff9800" />
          <Text style={styles.warningText}>
            Vui lòng hoàn tất chọn ngày, giờ, khoa và bác sĩ để tiếp tục
          </Text>
        </View>
      )}
      <View style={styles.footer}>
        <Button
          title={canProceed() ? "Xác Nhận" : "Hoàn Tất Thông Tin"}
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
    backgroundColor: "#f7f7f7",
  },
  selectionSection: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 8,
    marginTop: 8,
    borderRadius: 12,
    padding: 10,
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
  priceSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
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
  symptomInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e3f2fd",
    minHeight: 48,
    textAlignVertical: "top",
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
    marginBottom: 50,
  },
});

export default DateAppointmentSelection;
