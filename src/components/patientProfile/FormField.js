import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const FormField = ({
  label,
  value,
  placeholder,
  required = false,
  onPress,
  onChangeText,
  editable = true,
  keyboardType = "default",
  iconName,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>

      <TouchableOpacity
        style={[styles.inputField, !editable && styles.selectField]}
        onPress={onPress}
        disabled={!onPress}
      >
        {editable ? (
          <TextInput
            style={styles.inputText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
          />
        ) : (
          <>
            <Text style={[styles.inputText, !value && styles.placeholder]}>
              {value || placeholder}
            </Text>
            {iconName !== "none" && (
              <Icon
                name={iconName || "chevron-forward"}
                size={18}
                color="#888"
                style={styles.selectIcon}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 15,
    flex: 1,
    color: "#333",
  },
  requiredAsterisk: {
    color: "red",
    marginLeft: 5,
    fontWeight: "bold",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  selectField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  inputText: {
    fontSize: 15,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  selectIcon: {
    position: "absolute",
    right: 12,
    top: 9,
  },
});

export default FormField;
