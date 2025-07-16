import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const VitalSignsDisplay = ({ serviceResult, fadeAnim, onCopyValue }) => {
  // Function to get status color
  const getStatusColor = (type, value) => {
    if (!value || value === "N/A") return "#666";

    switch (type) {
      case "temperature":
        if (value >= 36.1 && value <= 37.2) return "#2E7D32";
        if (value > 38.5) return "#D32F2F";
        return "#F57C00";
      case "spO2":
        if (value >= 95) return "#2E7D32";
        if (value < 90) return "#D32F2F";
        return "#F57C00";
      case "bmi":
        if (value >= 18.5 && value <= 24.9) return "#2E7D32";
        if (value > 30) return "#D32F2F";
        return "#F57C00";
      case "pulse":
        if (value >= 60 && value <= 100) return "#2E7D32";
        if (value > 120) return "#D32F2F";
        return "#F57C00";
      case "bloodPressure":
        const parts = value.split("/");
        if (parts.length !== 2) return "#666";
        const systolic = parseInt(parts[0]);
        const diastolic = parseInt(parts[1]);
        if (systolic <= 120 && diastolic <= 80) return "#2E7D32";
        if (systolic > 140 || diastolic > 90) return "#D32F2F";
        return "#F57C00";
      default:
        return "#666";
    }
  };

  // Get reference range text
  const getReferenceRange = (type) => {
    switch (type) {
      case "temperature":
        return "36.1-37.2°C";
      case "spO2":
        return "≥95%";
      case "bmi":
        return "18.5-24.9";
      case "pulse":
        return "60-100 bpm";
      case "bloodPressure":
        return "≤120/80 mmHg";
      default:
        return "";
    }
  };

  const VitalSignSummary = ({
    height,
    weight,
    bmi,
    temperature,
    spO2,
    bloodPressure,
    pulse,
  }) => {
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Icon name="pulse-outline" size={24} color="#1976D2" />
          <Text style={styles.summaryTitle}>Kết quả đo sinh hiệu</Text>
        </View>

        <View style={styles.summaryContent}>
          {/* Thông tin cơ bản */}
          {(height || weight || bmi) && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản:</Text>
              <View style={styles.sectionContent}>
                {height && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>Chiều cao:</Text>
                    <View style={styles.valueContainer}>
                      <Text style={styles.summaryValue}>{height} cm</Text>
                    </View>
                  </View>
                )}
                {weight && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>Cân nặng:</Text>
                    <View style={styles.valueContainer}>
                      <Text style={styles.summaryValue}>{weight} kg</Text>
                    </View>
                  </View>
                )}
                {bmi && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>BMI:</Text>
                    <View style={styles.valueContainer}>
                      <Text
                        style={[
                          styles.summaryValue,
                          { color: getStatusColor("bmi", bmi) },
                        ]}
                      >
                        {bmi.toFixed(2)}
                      </Text>
                      <Text style={styles.referenceText}>
                        {" "}
                        (BT: {getReferenceRange("bmi")})
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Sinh hiệu vital */}
          {(temperature || spO2 || bloodPressure || pulse) && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Sinh hiệu:</Text>
              <View style={styles.sectionContent}>
                {temperature && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>Nhiệt độ:</Text>
                    <View style={styles.valueContainer}>
                      <Text
                        style={[
                          styles.summaryValue,
                          { color: getStatusColor("temperature", temperature) },
                        ]}
                      >
                        {temperature}°C
                      </Text>
                      <Text style={styles.referenceText}>
                        {" "}
                        (BT: {getReferenceRange("temperature")})
                      </Text>
                    </View>
                  </View>
                )}
                {spO2 && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>SpO2:</Text>
                    <View style={styles.valueContainer}>
                      <Text
                        style={[
                          styles.summaryValue,
                          { color: getStatusColor("spO2", spO2) },
                        ]}
                      >
                        {spO2}%
                      </Text>
                      <Text style={styles.referenceText}>
                        {" "}
                        (BT: {getReferenceRange("spO2")})
                      </Text>
                    </View>
                  </View>
                )}
                {bloodPressure && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>Huyết áp:</Text>
                    <View style={styles.valueContainer}>
                      <Text
                        style={[
                          styles.summaryValue,
                          {
                            color: getStatusColor(
                              "bloodPressure",
                              bloodPressure
                            ),
                          },
                        ]}
                      >
                        {bloodPressure}
                      </Text>
                      <Text style={styles.referenceText}>
                        {" "}
                        (BT: {getReferenceRange("bloodPressure")})
                      </Text>
                    </View>
                  </View>
                )}
                {pulse && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBullet} />
                    <Text style={styles.labelText}>Nhịp tim:</Text>
                    <View style={styles.valueContainer}>
                      <Text
                        style={[
                          styles.summaryValue,
                          { color: getStatusColor("pulse", pulse) },
                        ]}
                      >
                        {pulse} bpm
                      </Text>
                      <Text style={styles.referenceText}>
                        {" "}
                        (BT: {getReferenceRange("pulse")})
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const NoteSection = ({ note }) => {
    if (!note) return null;

    return (
      <View style={styles.noteContainer}>
        <View style={styles.noteHeader}>
          <View style={styles.noteBullet} />
          <Text style={styles.noteTitle}>Ghi chú</Text>
        </View>
        <Text style={styles.noteText}>{note}</Text>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
      <VitalSignSummary
        height={serviceResult.height}
        weight={serviceResult.weight}
        bmi={serviceResult.bmi}
        temperature={serviceResult.temperature}
        spO2={serviceResult.spO2}
        bloodPressure={serviceResult.bloodPressure}
        pulse={serviceResult.pulse}
      />
      <NoteSection note={serviceResult.note} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 10,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  summaryContainer: {
    backgroundColor: "#F0F8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976D2",
    marginLeft: 8,
  },
  summaryContent: {
    gap: 16,
  },
  summarySection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 8,
  },
  sectionContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 8,
  },
  summaryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1976D2",
    marginRight: 12,
    marginTop: 7,
  },
  labelText: {
    fontSize: 14,
    color: "#555",
    minWidth: 75, // Fixed width for label alignment
    lineHeight: 20,
  },
  valueContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontWeight: "bold",
    minWidth: 50, // Ensure minimum width for value alignment
  },
  referenceText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  noteContainer: {
    backgroundColor: "#F0F8F0",
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
    borderRadius: 16,
    padding: 20,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2E7D32",
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  noteText: {
    fontSize: 14,
    color: "#1B5E20",
    lineHeight: 20,
  },
});

export default VitalSignsDisplay;
