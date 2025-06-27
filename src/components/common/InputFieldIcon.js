import React from "react";
import { TouchableOpacity, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const InputField = ({
  placeholder,
  value,
  onChangeText,
  editable = true,
  icon,
  onPress,
  disabled,
  multiline = false,
}) => (
  <TouchableOpacity
    style={[
      styles.inputContainer,
      onPress && styles.dropdown,
      disabled && styles.disabled,
    ]}
    onPress={onPress}
    disabled={disabled || !onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    {icon && (
      <Icon
        name={icon}
        size={20}
        color={disabled ? "#ccc" : "#666"}
        style={styles.icon}
      />
    )}
    <TextInput
      style={[
        styles.input,
        disabled && styles.disabledText,
        multiline && styles.multilineInput,
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={editable && !onPress}
      placeholderTextColor={disabled ? "#ccc" : "#999"}
      multiline={multiline}
    />
    {onPress && !disabled && (
      <Icon name="chevron-down" size={20} color="#666" />
    )}
  </TouchableOpacity>
);

export default InputField;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    elevation: 2,
  },
  dropdown: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
  },
  disabledText: {
    color: "#ccc",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
});
