import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

const Card = ({ children, onPress, selected, style, disabled }) => (
  <TouchableOpacity
    style={[
      styles.card,
      selected && styles.selectedCard,
      style,
      disabled && styles.disabled,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: "#1e88e5",
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
});

export default Card;
