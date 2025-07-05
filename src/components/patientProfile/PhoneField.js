import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const PhoneField = ({ value, onChangeText }) => {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.fieldLabel}>Số điện thoại</Text>
        <Text style={styles.requiredAsterisk}>*</Text>
      </View>

      <View style={styles.phoneContainer}>
        <View style={styles.countryCodeContainer}>
          <Text style={styles.countryCode}>+84</Text>
        </View>

        <TextInput
          style={styles.phoneInput}
          placeholder="09xxxxxxx"
          placeholderTextColor="#999"
          value={value.replace(/^\+84/, "")}
          onChangeText={(text) => {
            const phoneNum = text.startsWith("0") ? text.substring(1) : text;
            onChangeText(`+84${phoneNum}`);
          }}
          keyboardType="phone-pad"
        />
      </View>
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
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#fff",
  },
  countryCodeContainer: {
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  countryCode: {
    fontSize: 15,
    color: "#333",
    paddingVertical: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    color: "#333",
  },
});

export default PhoneField;
