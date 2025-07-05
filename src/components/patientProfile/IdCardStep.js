import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Input from "../common/Input";
import Button from "../common/Button";

const IdCardStep = ({ idCard, setIdCard, checkIdCardExists, loading }) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Kiểm tra CCCD/CMND</Text>
      <Text style={styles.description}>Nhập số CCCD/CMND để tiếp tục</Text>

      <Input
        placeholder="Nhập số CCCD/CMND"
        value={idCard}
        onChangeText={setIdCard}
        keyboardType="numeric"
        style={styles.input}
      />

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
  button: {
    marginVertical: 10,
  },
});

export default IdCardStep;
