import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ViewField = ({ label, value, icon, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.viewContainer, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled || !onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.viewRow}>
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={disabled ? "#ccc" : "#1e88e5"}
          style={styles.icon}
        />
      )}
      <View style={styles.viewTextContainer}>
        <Text style={[styles.viewLabel, disabled && styles.disabledText]}>
          {label}
        </Text>
        <Text style={[styles.viewValue, disabled && styles.disabledText]}>
          {value || "Chưa chọn"}
        </Text>
      </View>
      {onPress && !disabled && (
        <Icon name="chevron-forward" size={20} color="#999" />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  viewContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  viewLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  viewValue: {
    fontSize: 14,
    color: "#333",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
  disabledText: {
    color: "#ccc",
  },
  icon: {
    marginRight: 8,
  },
});

export default ViewField;
