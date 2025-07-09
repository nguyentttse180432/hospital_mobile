import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Input from "../common/Input";
import Button from "../common/Button";

const IdCardStep = ({
  idCard,
  setIdCard,
  checkIdCardExists,
  loading,
  onScanPress,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Kiểm tra CCCD/CMND</Text>
      <Text style={styles.description}>Nhập số CCCD/CMND để tiếp tục</Text>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Nhập số CCCD/CMND"
          value={idCard}
          onChangeText={setIdCard}
          keyboardType="numeric"
          style={styles.input}
        />

        {onScanPress && (
          <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
            <Icon name="qr-code-outline" size={24} color="#4CAF50" />
            <Text style={styles.scanButtonText}>Quét mã</Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        title="Tiếp tục"
        onPress={checkIdCardExists}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    padding: 15,
    paddingTop: 5, // Giảm khoảng cách phía trên
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  input: {
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8f0",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  scanButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  button: {
    marginVertical: 10,
  },
});

export default IdCardStep;
