import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const VitalSignSummary = ({ height, weight, bmi, bloodPressure, pulse }) => {
  return (
    <View style={styles.vitalSignSummaryContainer}>
      {height && weight && (
        <View style={styles.vitalSignSummaryRow}>
          <Icon name="body-outline" size={22} color="#4299e1" />
          <Text style={styles.vitalSignSummaryText}>
            Chiều cao:{" "}
            <Text style={styles.vitalSignSummaryValue}>{height} cm</Text>, Cân
            nặng: <Text style={styles.vitalSignSummaryValue}>{weight} kg</Text>
          </Text>
        </View>
      )}

      {bmi && (
        <View style={styles.vitalSignSummaryRow}>
          <Icon name="information-circle-outline" size={22} color="#4299e1" />
          <Text style={styles.vitalSignSummaryText}>
            BMI:{" "}
            <Text style={styles.vitalSignSummaryValue}>{bmi.toFixed(2)}</Text>
            {" - "}
            <Text
              style={[
                styles.vitalSignSummaryStatus,
                {
                  color:
                    bmi < 18.5
                      ? "#FF9800"
                      : bmi <= 24.9
                      ? "#4CAF50"
                      : bmi <= 29.9
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            >
              {bmi < 18.5
                ? "Thiếu cân"
                : bmi <= 24.9
                ? "Bình thường"
                : bmi <= 29.9
                ? "Thừa cân"
                : "Béo phì"}
            </Text>
          </Text>
        </View>
      )}

      {bloodPressure && (
        <View style={styles.vitalSignSummaryRow}>
          <Icon name="pulse-outline" size={22} color="#4299e1" />
          <Text style={styles.vitalSignSummaryText}>
            Huyết áp:{" "}
            <Text style={styles.vitalSignSummaryValue}>{bloodPressure}</Text>
            {pulse && (
              <>
                , Nhịp tim:{" "}
                <Text style={styles.vitalSignSummaryValue}>{pulse} bpm</Text>
              </>
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  vitalSignSummaryContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4299e1",
  },
  vitalSignSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vitalSignSummaryText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  vitalSignSummaryValue: {
    fontWeight: "bold",
    color: "#333",
  },
  vitalSignSummaryStatus: {
    fontWeight: "bold",
  },
});

export default VitalSignSummary;
