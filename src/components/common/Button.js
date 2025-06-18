import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const Button = ({ title, onPress, secondary, disabled, style }) => (
  <TouchableOpacity
    style={[
      styles.button,
      secondary && styles.secondaryButton,
      disabled && styles.disabledButton,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={disabled ? 1 : 0.8}
  >
    <Text
      style={[
        styles.buttonText,
        secondary && styles.secondaryButtonText,
        disabled && styles.disabledButtonText,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1e88e5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#e0f7fa",
    borderWidth: 1,
    borderColor: "#1e88e5",
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#1e88e5",
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default Button;
