import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const DateGenderRow = ({
  dateValue,
  onChangeDateValue,
  genderValue,
  onPressGender,
}) => {
  return (
    <View style={styles.container}>
      {/* Ngày sinh field */}
      <View style={styles.dateContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.fieldLabel}>Ngày sinh</Text>
          <Text style={styles.requiredAsterisk}>*</Text>
        </View>
        <TextInput
          style={styles.inputField}
          placeholder="Ngày / Tháng / Năm"
          placeholderTextColor="#999"
          value={dateValue}
          onChangeText={onChangeDateValue}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      {/* Giới tính field */}
      <View style={styles.genderContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.fieldLabel}>Giới tính</Text>
          <Text style={styles.requiredAsterisk}>*</Text>
        </View>
        <TouchableOpacity
          style={[styles.inputField, styles.selectField]}
          onPress={onPressGender}
        >
          <Text style={[styles.inputText, !genderValue && styles.placeholder]}>
            {genderValue || "Chọn giới tính"}
          </Text>
          <Icon
            name="chevron-forward"
            size={18}
            color="#888"
            style={styles.selectIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  genderContainer: {
    flex: 1,
    marginLeft: 8,
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
    paddingVertical: 12,
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
    top: 12,
  },
});

export default DateGenderRow;
