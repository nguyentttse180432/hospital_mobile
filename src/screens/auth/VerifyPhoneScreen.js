import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtpToPhone, updateAccount } from "../../services/authService";
import ScreenContainer from "../../components/common/ScreenContainer";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const VerifyPhoneScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(0|\+84)(\d{9})$/;
    return phoneRegex.test(phone);
  };

  const sendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        "Lỗi",
        "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await sendOtpToPhone(phoneNumber);
      console.log(phoneNumber);

      if (response.isSuccess) {
        setOtpSent(true);
        Alert.alert(
          "Thành công",
          "Mã OTP đã được gửi đến số điện thoại của bạn"
        );
      } else {
        Alert.alert("Lỗi", response.error?.message || "Không thể gửi OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert("Lỗi", "Không thể gửi OTP, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndUpdateAccount = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    try {
      setLoading(true);

      // Get user data from storage
      const userData = JSON.parse(await AsyncStorage.getItem("user"));

      // Update account with new phone number and OTP
      const response = await updateAccount({
        accountId: userData.id,
        phoneNumber: phoneNumber,
        code: otp,
      });

      if (response.isSuccess) {
        // Update user data with the new phone number
        userData.phoneNumber = phoneNumber;
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        // Set phone as verified
        await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));

        Alert.alert("Thành công", "Xác minh số điện thoại thành công", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Main"),
          },
        ]);
      } else {
        Alert.alert("Lỗi", response.error?.message || "Xác minh thất bại");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Lỗi", "Xác minh OTP thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Xác minh số điện thoại</Text>
        <Text style={styles.description}>
          {!otpSent
            ? "Vui lòng nhập số điện thoại của bạn để tiếp tục"
            : "Nhập mã OTP đã được gửi đến số điện thoại của bạn"}
        </Text>

        {!otpSent ? (
          <>
            <Input
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <Button
              title="Gửi mã OTP"
              onPress={sendOtp}
              loading={loading}
              style={styles.button}
            />
          </>
        ) : (
          <>
            <Text style={styles.phoneText}>
              Mã OTP đã được gửi đến: {phoneNumber}
            </Text>
            <Input
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button
              title="Xác minh"
              onPress={verifyOtpAndUpdateAccount}
              loading={loading}
              style={styles.button}
            />
            <TouchableOpacity
              onPress={() => setOtpSent(false)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Thay đổi số điện thoại</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  phoneText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#555",
  },
  backButton: {
    marginTop: 15,
    alignItems: "center",
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
});

export default VerifyPhoneScreen;
