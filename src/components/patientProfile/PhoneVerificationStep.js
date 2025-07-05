import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Input from "../common/Input";
import Button from "../common/Button";

const PhoneVerificationStep = ({
  otpSent,
  phoneNumber,
  setPhoneNumber,
  otp,
  setOtp,
  sendOtpToPhoneNumber,
  verifyOtpCode,
  loading,
  goBack,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Xác minh số điện thoại</Text>

      {!otpSent ? (
        <>
          <Text style={styles.description}>
            Vui lòng nhập số điện thoại để tiếp tục
          </Text>
          <Input
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Button
            title="Gửi mã OTP"
            onPress={sendOtpToPhoneNumber}
            loading={loading}
            style={styles.button}
          />
        </>
      ) : (
        <>
          <Text style={styles.description}>
            Nhập mã OTP đã được gửi đến số điện thoại {phoneNumber}
          </Text>
          <Input
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button
            title="Xác minh OTP"
            onPress={verifyOtpCode}
            loading={loading}
            style={styles.button}
          />
        </>
      )}

      <Button
        title="Quay lại"
        onPress={goBack}
        type="outline"
        style={styles.backButton}
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
  backButton: {
    marginVertical: 10,
  },
});

export default PhoneVerificationStep;
